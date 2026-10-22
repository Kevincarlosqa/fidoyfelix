import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@electric-sql/pglite", "pglite-prisma-adapter"],
  // El modo demo lee las migraciones en tiempo de ejecución para crear la base en memoria.
  outputFileTracingIncludes: { "/**": ["./prisma/migrations/**/*.sql"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
