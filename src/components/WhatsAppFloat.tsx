import { contact } from "@/lib/config/formation";

export function WhatsAppFloat() {
  return (
    <a
      href={contact.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp pour plus de renseignements"
      className="wa-float fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_rgba(37,211,102,0.45)] transition hover:bg-[#1ebe57] hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <span className="wa-float-ring" aria-hidden />
      <WhatsAppIcon className="relative z-[1] size-7" />
    </a>
  );
}

export function WhatsAppLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={contact.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.139-1.688-.87-1.948-.967-.261-.097-.451-.139-.64.139-.189.276-.73.967-.895 1.165-.164.198-.329.223-.606.075-.277-.149-1.17-.431-2.229-1.374-.824-.735-1.38-1.642-1.542-1.919-.162-.276-.017-.426.122-.563.125-.123.277-.32.415-.48.139-.159.185-.276.277-.46.093-.184.046-.345-.023-.484-.069-.139-.64-1.542-.877-2.112-.23-.553-.464-.478-.64-.487l-.545-.01c-.184 0-.48.069-.73.345-.251.276-.958.936-.958 2.283 0 1.347.982 2.649 1.119 2.831.137.183 1.933 2.95 4.681 4.137.654.282 1.165.45 1.563.576.657.208 1.255.179 1.728.109.527-.079 1.688-.69 1.927-1.356.238-.666.238-1.236.166-1.355-.072-.119-.265-.189-.562-.328zm-5.421 6.318h-.003a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
