export function PaymentStatusBadge({ paid }: { paid: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
        paid
          ? "bg-[#e8f5e9] text-[#2e5a36]"
          : "bg-[color:var(--accent-lightest)] text-[color:var(--accent-darkest)]"
      }`}
    >
      {paid ? "Payé" : "En attente"}
    </span>
  );
}
