/** @type {import('next').NextConfig} */
import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // Nota: Se você estiver usando o Next.js 13.4 ou superior, o appDir já é o padrão e essa linha pode ser removida.
  },
};

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWA(nextConfig);
