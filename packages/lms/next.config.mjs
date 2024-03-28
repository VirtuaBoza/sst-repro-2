/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "titlepeek.follettsoftware.com",
        pathname: "/v2/images",
        protocol: "https",
      },
    ],
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(wav|mp3)$/i,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
