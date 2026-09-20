import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";
const supabaseOrigin = (() => {
  try {
    return new URL(supabaseUrl).origin;
  } catch {
    return "https://*.supabase.co";
  }
})();

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' é necessário mesmo em produção: o App Router injeta o
  // payload de streaming de Server Components em <script> inline para
  // hidratar a página — sem isso, a hidratação falha silenciosamente e
  // nenhum componente client fica interativo (botões, formulários, upload).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  // blob: é necessário aqui (não só em img-src): o GLTFLoader do Three.js
  // extrai as texturas do .glb e as busca via fetch() em URLs blob: — sem
  // isso no connect-src, o navegador bloqueia esse fetch e a textura falha.
  `connect-src 'self' ${supabaseOrigin} https://api.mercadopago.com blob:`,
  "font-src 'self' https://fonts.gstatic.com",
  // O decoder Meshopt (compressão do modelo 3D) roda num Web Worker
  // instanciado a partir de um blob gerado pelo próprio bundle do app.
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
