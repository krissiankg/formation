"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { contact } from "@/lib/config/formation";
import { StudentProfileModal } from "@/components/espace/StudentProfileModal";
import type { CoinPack } from "@/lib/wallet/types";
import { COIN_PACKS } from "@/lib/wallet/types";
import { formatFcfa } from "@/lib/format";

interface StudentTopbarProps {
  student: {
    firstName: string;
    fullName: string;
    email: string;
    scheduleLabel: string;
    phone?: string;
    avatarUrl?: string | null;
  };
  onLogout: () => void;
  loggingOut?: boolean;
  onToggleMobile?: () => void;
  mobileOpen?: boolean;
}

export function StudentTopbar({
  student,
  onLogout,
  loggingOut,
  onToggleMobile,
  mobileOpen = false,
}: StudentTopbarProps) {
  const [currentUser, setCurrentUser] = useState(student);
  const [balance, setBalance] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [rechargeError, setRechargeError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  async function fetchWallet() {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance ?? 0);
      }
    } catch {
      // Ignorer si échec passager
    }
  }

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser((prev) => ({
          ...prev,
          fullName: data.fullName,
          firstName: data.fullName.trim().split(/\s+/)[0] || "Apprenant",
          email: data.email,
          phone: data.whatsapp,
          avatarUrl: data.avatarUrl,
        }));
        if (typeof data.balanceCoins === "number") {
          setBalance(data.balanceCoins);
        }
      }
    } catch {
      // Ignorer
    }
  }

  useEffect(() => {
    fetchWallet();
    fetchProfile();

    function handleWalletRefresh() {
      fetchWallet();
    }

    window.addEventListener("wallet-refresh", handleWalletRefresh);
    return () => window.removeEventListener("wallet-refresh", handleWalletRefresh);
  }, []);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleBuyPack(pack: CoinPack) {
    try {
      setLoadingPackId(pack.id);
      setRechargeError(null);

      const res = await fetch("/api/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || "Impossible d'initialiser le paiement.");
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      setRechargeError((err as Error).message || "Erreur de paiement.");
      setLoadingPackId(null);
    }
  }

  const initialLetter = currentUser.fullName.trim()[0]?.toUpperCase() || "A";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--neutral-50)_92%,transparent)] px-3 backdrop-blur-xl sm:px-6 lg:h-16">
        {/* Partie Gauche : Burger mobile + Salutation + Cohorte */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleMobile && (
            <button
              type="button"
              onClick={onToggleMobile}
              className="lg:hidden shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[color:var(--neutral-800)] shadow-2xs hover:bg-[color:var(--neutral-100)] transition cursor-pointer"
              aria-label="Ouvrir le menu de navigation"
            >
              <span className="text-sm leading-none">{mobileOpen ? "✕" : "☰"}</span>
              <span className="hidden xs:inline text-[11px]">{mobileOpen ? "Fermer" : "Menu"}</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 truncate">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-sm text-[color:var(--neutral-600)] truncate">
              Bonjour,{" "}
              <span className="font-semibold text-[color:var(--neutral-black)]">
                {currentUser.firstName}
              </span>
            </p>
          </div>

          <span className="hidden md:inline-block shrink-0 rounded-full border border-[color:var(--border)] bg-white px-2.5 py-0.5 font-mono text-[11px] font-medium text-[color:var(--neutral-600)] shadow-2xs">
            {currentUser.scheduleLabel}
          </span>
        </div>

        {/* Partie Droite : Coins Pill + Avatar Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Widget Coins Topbar */}
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-500/5 py-1 pl-2.5 sm:pl-3 pr-1 text-xs shadow-2xs">
            <span className="text-sm">🪙</span>
            <span className="font-display font-bold text-amber-950">
              {balance !== null ? balance : "—"}
            </span>
            <span className="hidden sm:inline text-[11px] font-medium text-amber-800">
              Coins
            </span>

            <button
              type="button"
              onClick={() => setRechargeModalOpen(true)}
              className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500 px-2 sm:px-2.5 py-0.5 sm:py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-xs hover:bg-amber-600 active:scale-95 transition cursor-pointer"
              title="Recharger des coins"
            >
              <span className="sm:hidden">+</span>
              <span className="hidden sm:inline">+ Recharger</span>
            </button>
          </div>

          {/* Séparateur discret */}
          <div className="h-5 w-px bg-[color:var(--border)] hidden sm:block" />

          {/* Menu Profil Déroulant (Dropdown) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full p-0.5 transition hover:ring-2 hover:ring-[color:var(--accent)]/30 cursor-pointer focus:outline-none"
              aria-expanded={dropdownOpen}
            >
              {/* Cercle Avatar */}
              <div className="relative size-8 sm:size-9 overflow-hidden rounded-full border border-[color:var(--border)] bg-white shadow-xs">
                {currentUser.avatarUrl ? (
                  <Image
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    width={36}
                    height={36}
                    className="size-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-[color:var(--accent-dark)] to-[color:var(--accent)] font-semibold text-xs text-white">
                    {initialLetter}
                  </div>
                )}
                {/* Point en ligne */}
                <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
              </div>

              {/* Petite flèche indicatrice */}
              <svg
                className={`size-3 text-[color:var(--neutral-400)] transition-transform duration-200 hidden sm:block ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu Popover Flottant */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-[color:var(--border)] bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 z-50">
                {/* Header profil */}
                <div className="rounded-xl bg-[color:var(--neutral-50)] p-3 border border-[color:var(--border)]/60">
                  <p className="truncate font-semibold text-xs text-[color:var(--neutral-black)]">
                    {currentUser.fullName}
                  </p>
                  <p className="truncate font-mono text-[10px] text-[color:var(--neutral-500)]">
                    {currentUser.email}
                  </p>
                  <div className="mt-2 flex items-center justify-between border-t border-[color:var(--border)]/60 pt-2">
                    <span className="text-[10px] text-[color:var(--neutral-500)]">Portefeuille :</span>
                    <span className="font-mono text-xs font-bold text-amber-700">
                      🪙 {balance ?? 0} Coins
                    </span>
                  </div>
                </div>

                {/* Liens du Menu */}
                <div className="mt-1 space-y-0.5 text-xs text-[color:var(--neutral-700)]">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-[color:var(--neutral-100)] cursor-pointer"
                  >
                    <span>✏️</span>
                    <span>Modifier mon profil</span>
                  </button>

                  <Link
                    href="/espace/paiements"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 transition hover:bg-[color:var(--neutral-100)]"
                  >
                    <span>💳</span>
                    <span>Mes paiements</span>
                  </Link>

                  <Link
                    href="/espace/avis"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 transition hover:bg-[color:var(--neutral-100)]"
                  >
                    <span>⭐</span>
                    <span>Mon avis & témoignage</span>
                  </Link>

                  <a
                    href={contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[color:var(--accent-darkest)] transition hover:bg-[color:var(--accent-lightest)]"
                  >
                    <span>💬</span>
                    <span>Assistance WhatsApp</span>
                  </a>
                </div>

                <div className="my-1 border-t border-[color:var(--border)]" />

                {/* Déconnexion */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                >
                  <span>🚪</span>
                  <span>{loggingOut ? "Déconnexion…" : "Se déconnecter"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Modification du profil */}
      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={{
          fullName: currentUser.fullName,
          email: currentUser.email,
          whatsapp: currentUser.phone || "",
          avatarUrl: currentUser.avatarUrl,
          scheduleLabel: currentUser.scheduleLabel,
        }}
        onUpdateSuccess={(updated) => {
          setCurrentUser((prev) => ({
            ...prev,
            fullName: updated.fullName,
            firstName: updated.fullName.trim().split(/\s+/)[0] || "Apprenant",
            phone: updated.whatsapp,
            avatarUrl: updated.avatarUrl,
          }));
        }}
      />

      {/* Modal Rechargement rapide des coins */}
      {rechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-600">
                  <span>🪙</span> Portefeuille Coins
                </div>
                <h3 className="font-display mt-2 text-xl font-bold text-[color:var(--neutral-black)]">
                  Recharger des Coins
                </h3>
                <p className="mt-1 text-xs text-[color:var(--neutral-600)]">
                  Débloque instantanément les templates UI8 et ressources ZIP. Paiement sécurisé FedaPay (MTN, Moov, Orange, Wave, Carte).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRechargeModalOpen(false)}
                className="rounded-lg p-1.5 text-[color:var(--neutral-400)] hover:bg-[color:var(--neutral-100)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
              <span className="text-xs text-amber-800">Solde actuel :</span>
              <span className="font-mono text-sm font-bold text-amber-900">
                {balance ?? 0} Coins 🪙
              </span>
            </div>

            {rechargeError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {rechargeError}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {COIN_PACKS.map((pack) => {
                const isLoading = loadingPackId === pack.id;
                return (
                  <div
                    key={pack.id}
                    className={`relative flex flex-col justify-between rounded-xl border p-4 transition ${
                      pack.popular
                        ? "border-amber-500 bg-amber-500/5 shadow-xs"
                        : "border-[color:var(--border)] bg-white hover:border-[color:var(--accent)]"
                    }`}
                  >
                    {pack.badge && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-white shadow-xs">
                        {pack.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">🪙</span>
                        <span className="font-display text-lg font-bold text-[color:var(--neutral-black)]">
                          {pack.coins} Coins
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-sm font-semibold text-[color:var(--accent-darkest)]">
                        {formatFcfa(pack.priceFcfa)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleBuyPack(pack)}
                      className={`mt-4 w-full rounded-lg py-2 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                        pack.popular
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-[color:var(--neutral-100)] text-[color:var(--neutral-800)] hover:bg-[color:var(--neutral-200)]"
                      }`}
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center gap-1">
                          <svg className="size-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Chargement...
                        </span>
                      ) : (
                        `Choisir ce pack`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
