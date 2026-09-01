import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SovereignGuard | The Authorization Firewall for AI Agents",
  description:
    "SovereignGuard creates a hard cryptographic and policy authorization boundary between autonomous AI agents and irreversible real-world contract execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060606] text-neutral-100 min-h-screen antialiased selection:bg-yellow-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
