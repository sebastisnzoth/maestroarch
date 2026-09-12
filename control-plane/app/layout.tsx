import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "MaestroArch — Creador Arquitecto",
  description: "Describe una idea y MaestroArch construye, valida y entrega el MVP."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
