/**
 * Origine publique (ex. "https://forgeia.guelichweb.store") telle que vue par le visiteur.
 *
 * Derrière CloudFront → ALB, `x-forwarded-proto` vaut "http" (protocole CloudFront → ALB) :
 * on privilégie donc `cloudfront-forwarded-proto`, qui porte le protocole du visiteur.
 */
export function getPublicOrigin(request: Request, fallbackHost?: string): string {
  const url = new URL(request.url);
  const proto =
    request.headers.get("cloudfront-forwarded-proto") ||
    request.headers.get("x-forwarded-proto") ||
    "https";
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    fallbackHost ||
    url.host;
  return `${proto}://${host}`;
}
