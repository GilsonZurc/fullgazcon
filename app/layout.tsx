import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fullgazcon - Simulados de Concursos",
  description: "Simulados inteligentes por concurso, banca e status",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
