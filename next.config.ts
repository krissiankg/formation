import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compression native Next.js
  compress: true,

  // Optimisation automatique des formats et cache des images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 jours de cache
  },

  // Désactiver les source maps en production pour alléger les bundles
  productionBrowserSourceMaps: false,
};

export default nextConfig;
