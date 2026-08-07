import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 后台表单支持图片上传(默认 1MB 不够)
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
