import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Plus_Jakarta_Sans, Orbitron } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/config/formation";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const heading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const logoFont = Orbitron({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
  description: brand.shortDescription,
  icons: {
    icon: [
      { url: "/logo-color.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/logo-color.png",
    apple: "/logo-color.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${body.variable} ${heading.variable} ${mono.variable} ${logoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col mesh-bg">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
