import { NextResponse } from "next/server";
import { getSessionEnrollment } from "@/lib/auth/session";
import { COIN_PACKS, calculateCoinsPriceFcfa } from "@/lib/wallet/types";
import { createFedapayTransaction } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const student = await getSessionEnrollment();
  if (!student) {
    return NextResponse.json({ error: "Connexion requise pour acheter des coins" }, { status: 401 });
  }

  try {
    const body = await request.json();

    let coins = 0;
    let priceFcfa = 0;
    let packId = "custom";

    if (body.customCoins !== undefined && body.customCoins !== null) {
      const parsedCoins = Math.floor(Number(body.customCoins));
      if (isNaN(parsedCoins) || parsedCoins < 10) {
        return NextResponse.json(
          { error: "Le montant minimum de recharge est de 10 coins." },
          { status: 400 }
        );
      }
      if (parsedCoins % 10 !== 0) {
        return NextResponse.json(
          { error: "Les recharges de coins se font uniquement par tranches de 10 coins (10, 20, 30, ...)." },
          { status: 400 }
        );
      }
      coins = parsedCoins;
      priceFcfa = calculateCoinsPriceFcfa(coins);
      packId = `custom_${coins}`;
    } else if (body.packId) {
      const requestedPackId = String(body.packId ?? "").trim();
      const pack = COIN_PACKS.find((p) => p.id === requestedPackId);
      if (!pack) {
        return NextResponse.json({ error: "Pack de coins invalide" }, { status: 400 });
      }
      coins = pack.coins;
      priceFcfa = pack.priceFcfa;
      packId = pack.id;
    } else {
      return NextResponse.json(
        { error: "Veuillez choisir un pack ou indiquer un nombre de coins." },
        { status: 400 }
      );
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "forgeia.guelichweb.store";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const callbackUrl = `${proto}://${host}/espace/ressources?recharge=success&pack=${coins}`;

    const names = student.fullName.trim().split(/\s+/);
    const firstname = names[0] || "Apprenant";
    const lastname = names.slice(1).join(" ") || "FORGEIA";

    const tx = await createFedapayTransaction({
      amount: priceFcfa,
      description: `Recharge ${coins} Coins FORGEIA — ${student.fullName}`,
      customer: {
        firstname,
        lastname,
        email: student.email,
        phone: student.whatsapp,
      },
      callbackUrl,
      customMetadata: {
        type: "coins_purchase",
        packId,
        enrollmentId: student.id,
        coins: String(coins),
      },
    });

    return NextResponse.json({
      paymentUrl: tx.paymentUrl,
      id: tx.id,
      coins,
      amount: priceFcfa,
    });
  } catch (err) {
    console.error("[Wallet Recharge Error]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Erreur lors de l'initialisation du paiement FedaPay" },
      { status: 500 }
    );
  }
}
