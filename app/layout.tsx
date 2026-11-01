import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:
    "CHANFRO · Otimizar cortes retangulares numa chapa, respeitando serra e rotação",
  description:
    "Otimizar cortes retangulares numa chapa, respeitando serra e rotação",
  metadataBase: new URL("https://chanfro-gustapaz.starrylinen.chatgpt.site"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "CHANFRO",
    description:
      "Otimizar cortes retangulares numa chapa, respeitando serra e rotação",
    type: "website",
    locale: "pt_BR",
  },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
