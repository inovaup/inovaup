import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desligado de propósito (decisão D-14): evita misturar dados de usuários em cache.
  // Não use "use cache" em código que lida com dados de pessoas.
  cacheComponents: false,
};

export default nextConfig;
