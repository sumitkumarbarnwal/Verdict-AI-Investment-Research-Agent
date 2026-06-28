/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output bundles only the files needed to run the app.
  // Required for Docker / Render deployment.
  output: "standalone",
};

module.exports = nextConfig;
