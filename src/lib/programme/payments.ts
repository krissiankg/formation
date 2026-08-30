import { formation } from "@/lib/config/formation";
import type { Enrollment, PaymentKind } from "@/lib/types";
import { formatFcfa } from "@/lib/format";

const paymentOrder: PaymentKind[] = ["registration", "start", "month1", "month3"];

const paymentLabels: Record<PaymentKind, string> = {
  registration: "Inscription",
  start: formation.installments[0].label,
  month1: formation.installments[1].label,
  month3: formation.installments[2].label,
};

export type PaymentDisplayItem = {
  kind: PaymentKind;
  label: string;
  amount: string;
  status: "payé" | "à venir" | "planifié";
};

export function getPaymentSchedule(enrollment: Enrollment): PaymentDisplayItem[] {
  const sorted = [...enrollment.payments].sort(
    (a, b) => paymentOrder.indexOf(a.kind) - paymentOrder.indexOf(b.kind),
  );

  let foundNext = false;

  return sorted.map((payment) => {
    let status: PaymentDisplayItem["status"];
    if (payment.status === "paid") {
      status = "payé";
    } else if (!foundNext) {
      status = "à venir";
      foundNext = true;
    } else {
      status = "planifié";
    }

    return {
      kind: payment.kind,
      label: paymentLabels[payment.kind],
      amount: formatFcfa(payment.amount),
      status,
    };
  });
}

export function getNextPayment(enrollment: Enrollment) {
  const schedule = getPaymentSchedule(enrollment);
  return schedule.find((p) => p.status === "à venir") ?? null;
}
