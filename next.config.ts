import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serveur autonome minimal pour l'image Docker (ECS Fargate)
  output: "standalone",

  // Compression native Next.js
  compress: true,

  // Optimisation automatique des formats et cache des images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 jours de cache
  },

  // Désactiver les source maps en production pour alléger les bundles
  productionBrowserSourceMaps: false,

  // Passerelle IA : ia.guelichweb.store/v1/... (URL intégrée à l'extension FORGEIA CODE) est servie
  // par les routes /api/ia/v1/... de l'application.
  async rewrites() {
    const iaHost = [{ type: "host" as const, value: "ia.guelichweb.store" }];
    return {
      beforeFiles: [
        { source: "/v1/:path*", has: iaHost, destination: "/api/ia/v1/:path*" },
        { source: "/chat/completions", has: iaHost, destination: "/api/ia/v1/chat/completions" },
        { source: "/models", has: iaHost, destination: "/api/ia/v1/models" },
        { source: "/health", has: iaHost, destination: "/api/ia/v1/health" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
