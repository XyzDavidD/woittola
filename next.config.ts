import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/fi", destination: "/", permanent: true },
      { source: "/patient-chairs", destination: "/catalogue/patient-chairs", permanent: true },
      { source: "/treatment-chairs", destination: "/catalogue/treatment-chairs", permanent: true },
      { source: "/face-protection", destination: "/catalogue/face-protection", permanent: true },
      { source: "/work-stools", destination: "/catalogue/work-stools", permanent: true },
      { source: "/zenso", destination: "/catalogue/patient-chairs", permanent: true },
      { source: "/mauro", destination: "/catalogue/patient-chairs", permanent: true },
      { source: "/fero", destination: "/products/fero-04208-ward-chair", permanent: true },
      { source: "/recrea-relax", destination: "/catalogue/treatment-chairs", permanent: true },
      { source: "/multiline", destination: "/catalogue/treatment-chairs", permanent: true },
      { source: "/dialysis-chair", destination: "/catalogue/treatment-chairs", permanent: true },
      { source: "/carisma-cleaning", destination: "/catalogue/treatment-chairs", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
