import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { brand } from "@/lib/config/formation";
import { legal } from "@/lib/config/legal";

export const metadata = {
  title: `Politique de confidentialité — ${brand.name}`,
  description: `Comment ${brand.name} (${legal.publisher}) collecte, utilise et protège tes données personnelles.`,
};

const mail = (
  <a href={`mailto:${legal.email}`}>{legal.email}</a>
);

const sections: LegalSection[] = [
  {
    id: "responsable",
    title: "Qui est responsable de tes données",
    content: (
      <>
        <p>
          Le responsable du traitement de tes données personnelles est <strong>{legal.publisher}</strong>,{" "}
          {legal.legalForm.toLowerCase()} immatriculée sous l&apos;IFU <strong>{legal.ifu}</strong>, établie à{" "}
          {legal.address}, qui édite la plateforme {brand.name} accessible à l&apos;adresse{" "}
          <a href={legal.siteUrl}>{legal.siteUrl.replace("https://", "")}</a>.
        </p>
        <p>Pour toute question relative à tes données : {mail}.</p>
        <p>
          Cette politique est établie conformément à la loi n° 2017-20 du 20 avril 2018 portant Code du
          numérique en République du Bénin (livre consacré à la protection des données à caractère personnel)
          et, lorsque tu résides dans l&apos;Union européenne, au Règlement (UE) 2016/679 (RGPD).
        </p>
      </>
    ),
  },
  {
    id: "donnees",
    title: "Les données que nous collectons",
    content: (
      <>
        <ul>
          <li>
            <strong>Inscription</strong> : nom complet, adresse e-mail, numéro WhatsApp, créneau choisi (samedi
            ou dimanche) et, le cas échéant, le code promo utilisé.
          </li>
          <li>
            <strong>Compte apprenant</strong> : mot de passe (conservé uniquement sous forme chiffrée et
            irréversible) et photo de profil si tu en ajoutes une.
          </li>
          <li>
            <strong>Paiements</strong> : montants, échéances, statut et références des transactions. Les
            paiements sont traités par FedaPay : nous ne voyons ni ne conservons jamais tes codes Mobile Money
            ou numéros de carte.
          </li>
          <li>
            <strong>Suivi pédagogique</strong> : progression dans le programme, tâches réalisées, réponses et
            résultats aux quiz, projets que tu déposes et avis que tu rédiges.
          </li>
          <li>
            <strong>Portefeuille de coins</strong> : solde, historique des achats et des ressources débloquées.
          </li>
          <li>
            <strong>Données techniques</strong> : adresse IP, type de navigateur, pages demandées et horodatage,
            enregistrés dans les journaux de nos serveurs pour assurer la sécurité et le bon fonctionnement du
            service.
          </li>
        </ul>
        <p>
          Nous ne collectons aucune donnée sensible (santé, religion, opinions politiques…) et ne te demandons
          jamais de pièce d&apos;identité.
        </p>
      </>
    ),
  },
  {
    id: "finalites",
    title: "Pourquoi nous les utilisons",
    content: (
      <ul>
        <li>
          <strong>Gérer ton inscription et ta formation</strong> (réservation de ta place, accès à l&apos;espace
          apprenant, suivi de ta progression, quiz, projets) — base légale : exécution du contrat qui nous lie.
        </li>
        <li>
          <strong>Encaisser et suivre tes paiements</strong>, émettre tes reçus — base légale : exécution du
          contrat et obligations légales comptables.
        </li>
        <li>
          <strong>Te contacter</strong> par WhatsApp (et, si nécessaire, par e-mail) au sujet de ta formation (confirmation,
          rappels d&apos;échéance, nouveaux contenus, horaires) — base légale : exécution du contrat.
        </li>
        <li>
          <strong>Publier ton avis</strong> sur le site : en déposant un avis, tu acceptes qu&apos;il soit
          affiché après validation, avec ton prénom et l&apos;initiale de ton nom — base légale : ton
          consentement, que tu peux retirer à tout moment en demandant son retrait.
        </li>
        <li>
          <strong>Faire fonctionner les services d&apos;IA de la plateforme</strong> — base légale :
          exécution du contrat.
        </li>
        <li>
          <strong>Sécuriser la plateforme</strong>, prévenir la fraude et corriger les erreurs — base légale :
          notre intérêt légitime.
        </li>
      </ul>
    ),
  },
  {
    id: "destinataires",
    title: "Qui reçoit tes données",
    content: (
      <>
        <p>
          Tes données sont accessibles uniquement à l&apos;équipe {brand.name} habilitée et aux prestataires
          techniques suivants, qui ne les traitent que pour notre compte :
        </p>
        <ul>
          <li>
            <strong>FedaPay</strong> (Bénin) — traitement des paiements Mobile Money et carte.
          </li>
          <li>
            <strong>Amazon Web Services</strong> (région Paris, France) — hébergement de l&apos;application et
            des fichiers.
          </li>
          <li>
            <strong>OVHcloud</strong> (Canada) — hébergement de la base de données.
          </li>
          <li>
            <strong>WhatsApp (Meta)</strong> et <strong>Telegram</strong> — envoi des notifications liées à ta
            formation.
          </li>
          <li>
            <strong>Google</strong> — stockage de la bibliothèque de ressources pédagogiques (Google Drive).
          </li>
          <li>
            <strong>NVIDIA</strong> et les fournisseurs de modèles d&apos;IA qu&apos;il héberge — génération des
            réponses des services d&apos;IA de la plateforme.
          </li>
        </ul>
        <p>
          <strong>Nous ne vendons ni ne louons jamais tes données</strong>, et nous ne les utilisons pas à des
          fins publicitaires.
        </p>
      </>
    ),
  },
  {
    id: "transferts",
    title: "Transferts hors du Bénin",
    content: (
      <p>
        Certains de nos prestataires sont situés hors du Bénin (France, Canada, États-Unis). Ces transferts sont
        nécessaires pour te fournir le service. Nous choisissons des prestataires reconnus qui s&apos;engagent
        contractuellement à protéger tes données et à appliquer des mesures de sécurité adaptées
        (chiffrement, contrôle des accès).
      </p>
    ),
  },
  {
    id: "conservation",
    title: "Combien de temps nous les gardons",
    content: (
      <ul>
        <li>
          <strong>Compte et suivi pédagogique</strong> : pendant toute la durée de ta formation et de ton accès
          à l&apos;espace apprenant, puis 3 ans après ta dernière activité.
        </li>
        <li>
          <strong>Paiements et reçus</strong> : 10 ans, au titre des obligations comptables.
        </li>
        <li>
          <strong>Inscriptions non finalisées</strong> (frais d&apos;inscription jamais payés) : 12 mois.
        </li>
        <li>
          <strong>Journaux techniques</strong> : 30 jours.
        </li>
      </ul>
    ),
  },
  {
    id: "droits",
    title: "Tes droits",
    content: (
      <>
        <p>Tu disposes à tout moment des droits suivants sur tes données :</p>
        <ul>
          <li>
            <strong>Accès</strong> : savoir quelles données nous détenons sur toi et en obtenir une copie.
          </li>
          <li>
            <strong>Rectification</strong> : corriger des données inexactes.
          </li>
          <li>
            <strong>Effacement</strong> : demander la suppression de tes données, sauf celles que la loi nous
            oblige à conserver (comme les pièces de paiement).
          </li>
          <li>
            <strong>Opposition et retrait du consentement</strong> : par exemple, demander le retrait de ton avis
            publié.
          </li>
          <li>
            <strong>Portabilité</strong> : recevoir tes données dans un format lisible.
          </li>
        </ul>
        <p>
          Pour exercer ces droits, écris à {mail} depuis l&apos;adresse e-mail de ton compte. Nous te répondons
          dans un délai d&apos;un mois.
        </p>
        <p>
          Si tu estimes que tes droits ne sont pas respectés, tu peux introduire une réclamation auprès de
          l&apos;<strong>Autorité de Protection des Données à caractère Personnel (APDP)</strong> du Bénin ou, si
          tu résides dans l&apos;Union européenne, auprès de l&apos;autorité de protection des données de ton
          pays.
        </p>
      </>
    ),
  },
  {
    id: "google",
    title: "Données issues des services Google",
    content: (
      <>
        <p>
          {brand.name} utilise l&apos;API Google Drive pour proposer aux apprenants une bibliothèque de
          ressources pédagogiques. L&apos;accès est autorisé <strong>uniquement par l&apos;administrateur de
          la plateforme</strong>, sur son propre compte Google, en <strong>lecture seule</strong>
          (<code>drive.readonly</code>) : la plateforme se contente de rechercher, lister et transmettre les
          fichiers de cette bibliothèque. Les apprenants n&apos;ont jamais à connecter leur propre compte
          Google.
        </p>
        <p>
          Les données obtenues via les API Google ne sont pas utilisées à des fins publicitaires, ne sont pas
          vendues, ne sont pas utilisées pour entraîner des modèles d&apos;intelligence artificielle et ne sont
          transmises à des tiers que dans la mesure nécessaire au fonctionnement de cette bibliothèque.
        </p>
        <p lang="en">
          {brand.name}&apos;s use and transfer of information received from Google APIs to any other app will
          adhere to{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </>
    ),
  },
  {
    id: "ia",
    title: "Services d'IA de la plateforme",
    content: (
      <p>
        Lorsque tu utilises un service d&apos;IA de la plateforme, le code et les instructions que tu lui envoies
        transitent par notre passerelle puis sont transmis à des modèles d&apos;IA hébergés par nos
        fournisseurs, uniquement pour générer la réponse demandée. <strong>N&apos;y envoie jamais de mots de
        passe, de clés d&apos;API ou de données personnelles de tiers.</strong> Nous n&apos;utilisons pas ton
        code pour entraîner des modèles.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <p>
        La plateforme utilise uniquement des <strong>cookies strictement nécessaires</strong> : un cookie de
        session pour te garder connecté à ton espace apprenant (<code>forge_session</code>) et, pour
        l&apos;équipe, un cookie de session d&apos;administration. Ils ne servent à aucun suivi publicitaire ni
        à aucune mesure d&apos;audience, et ne nécessitent donc pas ton consentement préalable.
      </p>
    ),
  },
  {
    id: "securite",
    title: "Sécurité",
    content: (
      <p>
        Nous protégeons tes données par des mesures techniques et organisationnelles adaptées : connexions
        chiffrées (HTTPS), mots de passe chiffrés de manière irréversible, secrets stockés dans des coffres
        dédiés, accès à la base de données restreint et surveillance du service. Aucun système n&apos;étant
        infaillible, nous te notifierons dans les meilleurs délais en cas de violation de données susceptible
        de t&apos;affecter.
      </p>
    ),
  },
  {
    id: "mineurs",
    title: "Mineurs",
    content: (
      <p>
        La formation s&apos;adresse aux personnes âgées de 18 ans et plus. Un mineur ne peut s&apos;inscrire
        qu&apos;avec l&apos;autorisation de son représentant légal, qui peut exercer les droits décrits
        ci-dessus en son nom.
      </p>
    ),
  },
  {
    id: "modifications",
    title: "Modifications de cette politique",
    content: (
      <p>
        Nous pouvons faire évoluer cette politique, notamment si le service change. La date de dernière mise à
        jour figure en haut de cette page. En cas de changement important, nous t&apos;en informerons par
        e-mail ou WhatsApp avant son entrée en vigueur. Les conditions d&apos;utilisation du service sont
        décrites dans nos <Link href="/condition">conditions d&apos;utilisation</Link>.
      </p>
    ),
  },
];

export default function PolitiquePage() {
  return (
    <LegalPage
      kicker="Confidentialité"
      title="Politique de confidentialité"
      intro={
        <p>
          Chez {brand.name}, tes données servent à une seule chose : te former dans de bonnes conditions. Cette
          page explique, simplement, quelles données nous collectons, pourquoi, avec qui nous les partageons et
          comment exercer tes droits.
        </p>
      }
      sections={sections}
      related={{ href: "/condition", label: "Conditions d'utilisation" }}
    />
  );
}
