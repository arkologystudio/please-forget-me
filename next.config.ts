import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */


const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    },
  },
};

export default nextConfig;
