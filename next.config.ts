import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Preview-only: forward browser → Supabase traffic through this site (see src/lib/supabase/config.ts).
    if (process.env.NEXT_PUBLIC_SUPABASE_PROXY !== "1" || !process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
    return [{ source: "/supabase-proxy/:path*", destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*` }];
  },
};

export default nextConfig;
