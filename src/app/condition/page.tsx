import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { brand, formation } from "@/lib/config/formation";
import { legal } from "@/lib/config/legal";
import { formatFcfa } from "@/lib/format";

export const metadata = {
  title: `Conditions d'utilisation — ${brand.name}`,
  description: `Conditions générales d'utilisation et de vente de la formation et de la plateforme ${brand.name}.`,
};

const mail = <a href={`mailto:${legal.email}`}>{legal.email}</a>;

const sections: LegalSection[] = [
  {
    id: "editeur",
    title: "Éditeur et objet",
    content: (
      <>
        <p>
          La plateforme {brand.name}, accessible à l&apos;adresse{" "}
          <a href={legal.siteUrl}>{legal.siteUrl.replace("https://", "")}</a>, est éditée par{" "}
          <strong>{legal.publisher}</strong>, {legal.legalForm.toLowerCase()} immatriculée sous l&apos;IFU{" "}
          <strong>{legal.ifu}</strong>, établie à {legal.address} (contact : {mail}).
        </p>
        <p>
          Les présentes conditions générales d&apos;utilisation et de vente (les « Conditions ») encadrent
          l&apos;inscription à la formation « {formation.title} », son paiement et l&apos;utilisation de la
          plateforme en ligne qui l&apos;accompagne. En cochant la case d&apos;acceptation lors de ton
          inscription, ou en utilisant la plateforme, tu acceptes ces Conditions sans réserve.
        </p>
      </>
    ),
  },
  {
    id: "service",
    title: "Description du service",
    content: (
      <>
        <p>{brand.name} propose :</p>
        <ul>
          <li>
            une <strong>formation présentielle</strong> de {formation.durationMonths} mois ({formation.startLabel} →{" "}
            {formation.endLabel}), le samedi ou le dimanche selon le créneau choisi, au lieu communiqué aux
            inscrits ;
          </li>
          <li>
            un <strong>espace apprenant en ligne</strong> : programme, ressources, quiz, dépôt de projets, suivi
            des paiements et avis ;
          </li>
          <li>
            une <strong>bibliothèque de ressources pédagogiques</strong> accessible avec des coins ;
          </li>
          <li>
            des <strong>outils d&apos;intelligence artificielle</strong> utilisés pendant la formation.
          </li>
        </ul>
        <p>
          Le programme, les dates et le lieu peuvent être ajustés pour des raisons pédagogiques ou
          d&apos;organisation ; tu en es alors informé par WhatsApp ou dans ton espace apprenant.
        </p>
      </>
    ),
  },
  {
    id: "inscription",
    title: "Inscription et compte",
    content: (
      <ul>
        <li>
          La formation est ouverte aux personnes âgées d&apos;au moins 18 ans. Un mineur ne peut
          s&apos;inscrire qu&apos;avec l&apos;autorisation de son représentant légal.
        </li>
        <li>
          Tu t&apos;engages à fournir des informations exactes (nom, e-mail, numéro WhatsApp) et à les tenir à
          jour. Le numéro WhatsApp est indispensable : c&apos;est par lui que passent les informations sur la
          formation.
        </li>
        <li>
          Ton compte est personnel. Tu es responsable de la confidentialité de ton mot de passe et ne dois pas
          partager ton accès avec une autre personne.
        </li>
        <li>
          Ta place est réservée dès la confirmation du paiement des frais d&apos;inscription, dans la limite
          des places disponibles par créneau.
        </li>
      </ul>
    ),
  },
  {
    id: "prix",
    title: "Prix et paiement",
    content: (
      <>
        <p>
          Le prix total de la formation est de <strong>{formatFcfa(formation.totalPrice)}</strong>, réglé
          comme suit :
        </p>
        <ul>
          <li>
            <strong>Frais d&apos;inscription</strong> : {formatFcfa(formation.registrationFee)}, payables à
            l&apos;inscription pour réserver ta place ;
          </li>
          {formation.installments.map((i) => (
            <li key={i.id}>
              <strong>{i.label}</strong> : {formatFcfa(i.amount)} — {i.due}
            </li>
          ))}
        </ul>
        <p>
          Les prix sont exprimés en francs CFA (XOF). Les paiements sont effectués en ligne via{" "}
          <strong>FedaPay</strong> (Mobile Money ou carte), qui en assure la sécurité ; un reçu est disponible
          dans ton espace apprenant pour chaque paiement validé. Les codes promotionnels éventuels ne sont ni
          cumulables ni échangeables contre de l&apos;argent.
        </p>
        <p>
          En cas de retard de paiement d&apos;une tranche, {brand.name} peut, après rappel resté sans effet,
          suspendre l&apos;accès à l&apos;espace apprenant et aux séances jusqu&apos;à régularisation.
        </p>
      </>
    ),
  },
  {
    id: "remboursement",
    title: "Annulation et remboursement",
    content: (
      <ul>
        <li>
          <strong>Les frais d&apos;inscription ({formatFcfa(formation.registrationFee)}) ne sont pas
          remboursables</strong> : ils servent à réserver ta place et à organiser la cohorte.
        </li>
        <li>
          Une tranche déjà payée n&apos;est pas remboursée si tu abandonnes la formation ou ne te présentes
          pas aux séances.
        </li>
        <li>
          <strong>Si {brand.name} annule la formation</strong>, ou la reporte et que tu ne souhaites pas suivre
          la nouvelle session, les sommes versées (y compris les frais d&apos;inscription) te sont remboursées
          intégralement dans un délai de 30 jours, par le moyen de paiement utilisé ou par Mobile Money.
        </li>
        <li>
          Toute demande liée à un paiement est à adresser à {mail}, en précisant la référence du reçu.
        </li>
      </ul>
    ),
  },
  {
    id: "coins",
    title: "Coins et ressources pédagogiques",
    content: (
      <>
        <ul>
          <li>
            Les <strong>coins</strong> sont des crédits internes qui donnent accès à des ressources de la
            bibliothèque pédagogique (modèles, kits, fichiers de travail). Un bonus de bienvenue peut être offert
            à l&apos;ouverture de ton portefeuille, et des coins supplémentaires peuvent être achetés via
            FedaPay.
          </li>
          <li>
            Les coins <strong>n&apos;ont aucune valeur monétaire</strong> : ils ne sont ni remboursables, ni
            échangeables contre de l&apos;argent, ni transférables à un autre compte.
          </li>
          <li>
            Les ressources débloquées te sont accessibles <strong>pour ton usage personnel
            d&apos;apprentissage</strong>, tant que la plateforme et la ressource restent disponibles. Elles
            restent la propriété de leurs auteurs respectifs.
          </li>
          <li>
            <strong>Il est interdit</strong> de revendre, redistribuer, publier ou partager ces ressources, en
            tout ou partie, en dehors de ton apprentissage personnel.
          </li>
          <li>
            Sur demande d&apos;un titulaire de droits, ou si une ressource ne peut plus être proposée,{" "}
            {brand.name} peut la retirer de la bibliothèque à tout moment.
          </li>
        </ul>
        <p>
          Si tu es titulaire de droits sur une ressource et souhaites son retrait, écris à {mail} : nous la
          retirons dans les meilleurs délais.
        </p>
      </>
    ),
  },
  {
    id: "ia",
    title: "Outils d'intelligence artificielle",
    content: (
      <ul>
        <li>
          Les outils d&apos;IA présentés pendant la formation (Cursor, Antigravity, Claude Code…) sont des
          services tiers soumis à leurs propres conditions d&apos;utilisation.
        </li>
        <li>
          Ces outils s&apos;appuient sur des modèles d&apos;IA tiers. Ses réponses peuvent être
          inexactes, incomplètes ou non sécurisées : <strong>tu dois relire et tester tout code généré</strong>{" "}
          avant de l&apos;utiliser, en particulier en production.
        </li>
        <li>
          N&apos;envoie jamais à une IA de mots de passe, de clés d&apos;API ou de données
          personnelles de tiers. Le fonctionnement de l&apos;assistant est décrit dans notre{" "}
          <Link href="/politique#ia">politique de confidentialité</Link>.
        </li>
        <li>
          Un usage abusif (contournement des limites, revente de l&apos;accès, usage automatisé massif) peut
          entraîner la suspension de l&apos;accès à l&apos;assistant.
        </li>
      </ul>
    ),
  },
  {
    id: "propriete",
    title: "Propriété intellectuelle",
    content: (
      <ul>
        <li>
          Les supports de cours, vidéos, exercices, codes d&apos;exemple, quiz, la marque {brand.name} et le
          site sont la propriété de {legal.publisher}. Ils te sont fournis pour ton usage personnel et ne
          peuvent être reproduits ou diffusés sans autorisation écrite.
        </li>
        <li>
          <strong>Tes projets t&apos;appartiennent.</strong> En les déposant sur la plateforme, tu autorises
          seulement {brand.name} à les consulter pour les évaluer et te faire un retour. Toute présentation
          publique d&apos;un projet (vitrine, réseaux sociaux) se fera uniquement avec ton accord.
        </li>
        <li>
          Les avis que tu publies peuvent être affichés sur le site après validation ; tu peux en demander le
          retrait à tout moment.
        </li>
      </ul>
    ),
  },
  {
    id: "conduite",
    title: "Règles de conduite",
    content: (
      <>
        <p>En utilisant {brand.name}, tu t&apos;engages à ne pas :</p>
        <ul>
          <li>partager ton compte ou les contenus de la formation avec des personnes non inscrites ;</li>
          <li>tenter d&apos;accéder aux comptes ou aux données d&apos;autres utilisateurs ;</li>
          <li>perturber le fonctionnement de la plateforme ou contourner ses mesures de sécurité ;</li>
          <li>
            utiliser les compétences, outils ou ressources acquis pour des activités illégales (fraude,
            arnaque, logiciels malveillants, atteinte aux droits d&apos;autrui) ;
          </li>
          <li>adopter un comportement irrespectueux envers les formateurs ou les autres apprenants.</li>
        </ul>
        <p>
          En cas de manquement, {brand.name} peut, après t&apos;avoir averti (sauf urgence), suspendre ou
          clôturer ton accès, sans remboursement des sommes déjà versées.
        </p>
      </>
    ),
  },
  {
    id: "responsabilite",
    title: "Responsabilité",
    content: (
      <ul>
        <li>
          {brand.name} s&apos;engage à mettre en œuvre tous les moyens raisonnables pour assurer une
          formation de qualité et une plateforme disponible. Il s&apos;agit d&apos;une obligation de moyens :
          nous ne pouvons garantir une disponibilité continue de la plateforme, ni un résultat commercial ou
          financier précis à l&apos;issue de la formation.
        </li>
        <li>
          {brand.name} n&apos;est pas responsable des interruptions dues aux prestataires tiers (paiement,
          hébergement, messagerie), à ta connexion internet ou à un cas de force majeure.
        </li>
        <li>
          Les projets, produits et services que tu crées et commercialises après la formation sont sous ta
          seule responsabilité.
        </li>
        <li>
          Rien dans ces Conditions ne limite les droits que la loi garantit aux consommateurs.
        </li>
      </ul>
    ),
  },
  {
    id: "donnees",
    title: "Données personnelles",
    content: (
      <p>
        Le traitement de tes données personnelles est décrit dans notre{" "}
        <Link href="/politique">politique de confidentialité</Link>, qui fait partie intégrante des présentes
        Conditions.
      </p>
    ),
  },
  {
    id: "modifications",
    title: "Modification des Conditions",
    content: (
      <p>
        {brand.name} peut modifier ces Conditions. La version applicable est celle publiée sur cette page à la
        date de ton inscription ou de ton achat. En cas de modification importante, tu en es informé par
        WhatsApp ou e-mail ; si tu la refuses, tu peux cesser d&apos;utiliser la plateforme, les paiements déjà
        effectués restant régis par la version en vigueur à leur date.
      </p>
    ),
  },
  {
    id: "droit",
    title: "Droit applicable et litiges",
    content: (
      <p>
        Les présentes Conditions sont soumises au <strong>droit béninois</strong>. En cas de difficulté, écris
        d&apos;abord à {mail} : nous cherchons toujours une solution amiable. À défaut d&apos;accord dans un
        délai de 30 jours, le litige sera porté devant les juridictions compétentes de Cotonou, sous réserve
        des règles impératives protégeant les consommateurs.
      </p>
    ),
  },
];

export default function ConditionPage() {
  return (
    <LegalPage
      kicker="Conditions"
      title="Conditions générales d'utilisation et de vente"
      intro={
        <p>
          Ces conditions expliquent ce que {brand.name} t&apos;apporte, ce que tu t&apos;engages à respecter,
          comment fonctionnent les paiements et les coins, et que faire en cas de souci. Lis-les avant de
          t&apos;inscrire.
        </p>
      }
      sections={sections}
      related={{ href: "/politique", label: "Politique de confidentialité" }}
    />
  );
}
