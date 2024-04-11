/** @type {import('next').NextConfig} */
const nextConfig = {
  //experimental: {
  //  serverComponentsExternalPackages: ["pdf-parse", "pdf2json"],
  //  outputFileTracingIncludes: {
  //    "/*": ["./cache/**/*"],
  //  },
  //},
  webpack: (config) => {
    //// See https://webpack.js.org/configuration/resolve/#resolvealias
    // config.resolve.alias = {
    //  ...config.resolve.alias,
    //  sharp$: false,
    //  "onnxruntime-node$": false,
    //};
    return config;
  },
};

export default nextConfig;
