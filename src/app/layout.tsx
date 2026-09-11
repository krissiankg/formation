import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/config/formation";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const heading = Orbitron({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://forgeia.guelichweb.store"),
  title: `${brand.name} — ${brand.tagline}`,
  description: brand.shortDescription,
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.shortDescription,
    url: "https://forgeia.guelichweb.store",
    siteName: "FORGEIA",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FORGEIA — Formation Présentielle IA Cotonou",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.shortDescription,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-color.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      style={{ ["--font-logo" as any]: "var(--font-heading)" }}
      className={`${body.variable} ${heading.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col mesh-bg">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
