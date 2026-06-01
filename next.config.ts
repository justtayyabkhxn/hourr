import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
};
module.exports = {
  allowedDevOrigins: ["192.168.68.115"],
};
export default nextConfig;
