import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "IUBI GE21",
  description: "Collect soil samples on field.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">      
      <body className={cn(inter.className, "bg-zinc-200 text-zinc-900")}>
        {children}
      </body>
    </html>
  );
}
