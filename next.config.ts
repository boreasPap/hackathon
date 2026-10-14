import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No floating Next.js badge over the sidebar logo; errors still show.
  devIndicators: false,
  // The sprite route spawns ffmpeg-static's binary and draws labels with a bundled font;
  // keep the package's path intact and ship both files with the function.
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/eachlabs/sprite": [
      "./node_modules/ffmpeg-static/ffmpeg",
      "./node_modules/dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf",
    ],
  },
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
