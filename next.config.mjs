/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/media-query', 
  assetPrefix: '/media-query/', 
};

export default nextConfig;
