import { describe, expect, it } from "vitest";
import { validateInscription } from "@/lib/types";

// L'inscription ne demande plus de mot de passe : l'apprenant le crée quand le formateur valide sa préinscription.
const body = {
  fullName: "Awa Kossou",
  email: "awa@example.com",
  whatsapp: "01 66 36 87 05",
  schedule: "saturday",
  acceptTerms: true,
};

describe("validateInscription", () => {
  it("accepts a registration without password", () => {
    expect(validateInscription(body)).toEqual({
      data: {
        fullName: "Awa Kossou",
        email: "awa@example.com",
        whatsapp: "01 66 36 87 05",
        schedule: "saturday",
        acceptTerms: true,
      },
    });
  });

  it("ignores a password sent by an old version of the form", () => {
    expect(validateInscription({ ...body, password: "court" }).data).not.toHaveProperty("password");
  });

  it("still requires the terms to be accepted", () => {
    expect(validateInscription({ ...body, acceptTerms: false }).error).toBe("Tu dois accepter les conditions");
  });
});
