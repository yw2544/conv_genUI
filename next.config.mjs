import withSerwistInit from "@serwist/next";

const mode = process.env.BUILD_MODE ?? "export";
console.log("[Next] build mode", mode);

const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";
console.log("[Next] build with chunk: ", !disableChunk);

// const cspHeader = `
//     default-src * 'self';
//     frame-src *;
//     script-src * 'self' 'unsafe-eval' 'unsafe-inline';
//     worker-src * 'self';
//     connect-src * 'self' blob: data: https: http:;
//     style-src * 'self' 'unsafe-inline';
//     img-src * 'self' blob: data: https:;
//     font-src * 'self';
//     object-src *'none';
//     base-uri 'self';
//     form-action 'self';
//     frame-ancestors *;
//     upgrade-insecure-requests;
// `;
const cspHeader = `
    default-src * blob: data: 'unsafe-inline' 'unsafe-eval';
    script-src * blob: data: 'unsafe-inline' 'unsafe-eval';
    style-src * blob: data: 'unsafe-inline';
    img-src * blob: data:;
    font-src * blob: data:;
    frame-src * blob: data:;  
    worker-src * blob: data:;
    object-src *;
    media-src *;
    connect-src *;
    form-action *;
    frame-ancestors *;  
    upgrade-insecure-requests;
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.resolve.fallback = {
      child_process: false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
        // by next.js will be dropped. Doesn't make much sense, but how it is
        fs: false, // the solution
        module: false,
        perf_hooks: false,
      };
    }

    return config;
  },
  output: mode,
  images: {
    unoptimized: mode === "export",
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

// const CorsHeaders = [
//   { key: "Access-Control-Allow-Credentials", value: "true" },
//   { key: "Access-Control-Allow-Origin", value: "*" },
//   {
//     key: "Access-Control-Allow-Methods",
//     value: "*",
//   },
//   {
//     key: "Access-Control-Allow-Headers",
//     value: "*",
//   },
//   {
//     key: "Access-Control-Max-Age",
//     value: "86400",
//   },
// ];
const CorsHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },  // 允许任何域名访问
  { key: "Access-Control-Allow-Methods", value: "*" }, // 允许所有请求方法
  { key: "Access-Control-Allow-Headers", value: "*" }, // 允许所有请求头
  { key: "Access-Control-Max-Age", value: "86400" },
  { key: "Vary", value: "Origin" },
];

// if (mode !== "export") {
//   nextConfig.headers = async () => {
//     return [
//       {
//         source: "/api/:path*",
//         headers: CorsHeaders,
//       },
//       {
//         source: "/(.*)",
//         headers: [
//           {
//             key: "Content-Security-Policy",
//             value: cspHeader.replace(/\n/g, ""),
//           },
//           {
//             key: "Content-Security-Policy-Report-Only",
//             value: cspHeader.replace(/\n/g, ""),
//           },
//         ],
//       },
//     ];
//   };
// }

if (mode !== "export") {
  nextConfig.headers = async () => {
    return [
      {
        source: "/api/:path*",
        headers: CorsHeaders,
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
          
        ],
      },
    ];
  };
}

export default withSerwistInit({
  swSrc: "app/worker/service-worker.ts",
  swDest: "public/sw.js",
})(nextConfig);
