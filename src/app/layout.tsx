import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Proxy",
    template: "%s | Proxy",
  },
  description: "Operational command center for autonomous commerce execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[var(--background)] text-[var(--text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
