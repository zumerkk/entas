/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@entec/ui', '@entec/shared'],
    output: 'standalone',
};

module.exports = nextConfig;
