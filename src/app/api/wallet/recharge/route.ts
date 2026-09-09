import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { COIN_PACKS } from "@/lib/wallet/types";
import { createFedapayTransaction } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const student = await getSessionEnrollment();
  if (!student) {
    return NextResponse.json({ error: "Connexion requise pour acheter des coins" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const packId = String(body.packId ?? "").trim();
    const pack = COIN_PACKS.find((p) => p.id === packId);

    if (!pack) {
      return NextResponse.json({ error: "Pack de coins invalide" }, { status: 400 });
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "forgeia.guelichweb.store";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const callbackUrl = `${proto}://${host}/espace/ressources?recharge=success&pack=${pack.coins}`;

    const names = student.fullName.trim().split(/\s+/);
    const firstname = names[0] || "Apprenant";
    const lastname = names.slice(1).join(" ") || "FORGEIA";

    const tx = await createFedapayTransaction({
      amount: pack.priceFcfa,
      description: `Recharge ${pack.coins} Coins FORGEIA — ${student.fullName}`,
      customer: {
        firstname,
        lastname,
        email: student.email,
        phone: student.whatsapp,
      },
      callbackUrl,
      customMetadata: {
        type: "coins_purchase",
        packId: pack.id,
        enrollmentId: student.id,
        coins: String(pack.coins),
      },
    });

    return NextResponse.json({
      paymentUrl: tx.paymentUrl,
      id: tx.id,
      coins: pack.coins,
      amount: pack.priceFcfa,
    });
  } catch (err) {
    console.error("[Wallet Recharge Error]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Erreur lors de l'initialisation du paiement FedaPay" },
      { status: 500 }
    );
  }
}
