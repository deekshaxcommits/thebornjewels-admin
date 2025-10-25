import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    domains: ['images.unsplash.com', 'i.pinimg.com', 'example.com', 'via.placeholder.com', 'the-born-jewels-assets.s3.ap-south-1.amazonaws.com'],
  },
};

export default nextConfig;
