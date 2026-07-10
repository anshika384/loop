import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOOP | AI Customer Feedback Intelligence Platform",
  description: "Turn scattered customer feedback from support tickets, app reviews, surveys, sales notes, and community posts into ranked, evidence-backed product decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-obsidian-bg text-slate-100">
        {children}
      </body>
    </html>
  );
}
