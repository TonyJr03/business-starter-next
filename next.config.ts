import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Habilita forbidden() y unauthorized() como funciones de interrupción
    // de autorización (análogas a notFound()). Necesario para app/forbidden.tsx.
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage — imágenes de productos, logos, etc.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Picsum Photos — imágenes placeholder de desarrollo/demo
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
