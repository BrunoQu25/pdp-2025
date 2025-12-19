import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para AWS Amplify
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
