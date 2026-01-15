/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@pizzaria/db", "@pizzaria/validators"],
};

module.exports = nextConfig;

