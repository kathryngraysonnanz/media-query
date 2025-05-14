/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  basePath: '/media-query', 
  assetPrefix: '/media-query/', 
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
