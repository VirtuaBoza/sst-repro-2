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
};

export default nextConfig;
