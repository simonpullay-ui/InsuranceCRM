import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolicyFlow CRM",
  description: "A simple CRM for life insurance agents to manage pipelines, dials, scripts, and texting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-950 antialiased">{children}</body>
    </html>
  );
}
