import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Topbar from "@/components/topbar/Topbar";

export const metadata: Metadata = {
  title: "MacrOS",
  description: "Registra tus entrenamientos y progreso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Topbar/>
        {children}
        <Navbar/>
      </body>
    </html>
  );
}
