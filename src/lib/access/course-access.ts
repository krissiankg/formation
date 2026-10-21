import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import type { CurriculumModule, StudentProgress } from "@/lib/programme/types";
import type { Enrollment } from "@/lib/types";

/**
 * Accès à la formation, par module (ordre du module) :
 * - préinscription payée (2 500 F)  → module 0 « Avant de commencer »
 * - 1re tranche payée (30 000 F)     → + module 1 « Mois 1 »
 * - solde payé (47 500 F)            → toute la formation
 * Le choix de l'admin (accès complet / bloqué) est prioritaire sur les paiements.
 */
export type CourseAccess = {
  /** Ordre du dernier module accessible (-1 = aucun, Infinity = tous). */
  maxModuleSort: number;
  /** Libellé court de l'accès effectif (affiché dans l'admin). */
  label: string;
  /** Vrai si l'accès vient d'un choix de l'admin. */
  overridden: boolean;
  blocked: boolean;
};

function isPaid(enrollment: Pick<Enrollment, "payments">, kind: string) {
  return enrollment.payments.some((p) => p.kind === kind && p.status === "paid");
}

export function getCourseAccess(enrollment: Pick<Enrollment, "payments" | "accessOverride">): CourseAccess {
  if (enrollment.accessOverride === "blocked") {
    return { maxModuleSort: -1, label: "Accès bloqué", overridden: true, blocked: true };
  }
  if (enrollment.accessOverride === "full") {
    return { maxModuleSort: Infinity, label: "Accès complet (forcé)", overridden: true, blocked: false };
  }
  if (isPaid(enrollment, "month1")) {
    return { maxModuleSort: Infinity, label: "Toute la formation", overridden: false, blocked: false };
  }
  if (isPaid(enrollment, "start")) {
    return { maxModuleSort: 1, label: "Mois 1 ouvert", overridden: false, blocked: false };
  }
  if (isPaid(enrollment, "registration")) {
    return { maxModuleSort: 0, label: "Avant de commencer", overridden: false, blocked: false };
  }
  return { maxModuleSort: -1, label: "Inscription à finaliser", overridden: false, blocked: false };
}

export function canAccessModule(access: CourseAccess, moduleSortOrder: number) {
  return moduleSortOrder <= access.maxModuleSort;
}

/** Message affiché sur un module verrouillé : ce qui le débloquera. */
export function moduleLockMessage(access: CourseAccess, moduleSortOrder: number): string {
  if (access.blocked) return "Accès suspendu — contacte le formateur.";
  const [start, balance] = formation.installments;
  if (access.maxModuleSort < 0) {
    return `Se débloque après le paiement de la préinscription (${formatFcfa(formation.registrationFee)}).`;
  }
  if (moduleSortOrder <= 1 && start) {
    return `Se débloque après le paiement de la 1re tranche (${formatFcfa(start.amount)}).`;
  }
  return balance
    ? `Se débloque après le paiement du solde (${formatFcfa(balance.amount)}).`
    : "Se débloque après le paiement de la formation.";
}

/** Verrouille dans la progression les modules non couverts par l'accès (leçons comprises). */
export function applyCourseAccess(progress: StudentProgress, access: CourseAccess): StudentProgress {
  const modules: CurriculumModule[] = progress.modules.map((mod) =>
    canAccessModule(access, mod.sortOrder)
      ? mod
      : {
          ...mod,
          status: "locked",
          lockMessage: moduleLockMessage(access, mod.sortOrder),
          lessons: mod.lessons.map((l) => ({ ...l, status: "locked" })),
        },
  );
  const currentModule =
    modules.find((m) => m.id === progress.currentModule?.id && !m.lockMessage) ??
    modules.find((m) => !m.lockMessage && m.status !== "completed") ??
    null;
  return { ...progress, modules, currentModule };
}
