import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No floating Next.js badge over the sidebar logo; errors still show.
  devIndicators: false,
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
