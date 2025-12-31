import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  /* Enable webpack for next-pwa compatibility by silencing turbopack check or we use --webpack in script */
};

export default withPWA(nextConfig);
