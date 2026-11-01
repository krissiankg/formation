import { describe, expect, it } from "vitest";
import { validateInscription } from "@/lib/types";

const body = {
  fullName: "Awa Kossou",
  email: "awa@example.com",
  whatsapp: "01 66 36 87 05",
  schedule: "saturday",
  acceptTerms: true,
  password: "motdepasse1",
  passwordConfirm: "motdepasse1",
};

describe("validateInscription", () => {
  it("refuses a password shorter than 8 characters", () => {
    expect(validateInscription({ ...body, password: "court", passwordConfirm: "court" }).error).toBe(
      "Le mot de passe doit contenir au moins 8 caractères.",
    );
  });

  it("refuses two different passwords", () => {
    expect(validateInscription({ ...body, passwordConfirm: "motdepasse2" }).error).toBe(
      "Les deux mots de passe ne correspondent pas.",
    );
  });

  it("keeps the password of a valid registration", () => {
    expect(validateInscription(body).data?.password).toBe("motdepasse1");
  });
});
