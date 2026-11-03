import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental: {
        // allow tour image uploads up to 5MB (default limit is 1MB)
        serverActions: {bodySizeLimit: "6mb"},
    },
    eslint: {
        // style rules (import order etc.) shouldn't block deploys
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;