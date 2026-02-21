import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ["@mui/material", "@mui/icons-material"],
};

export default nextConfig;
