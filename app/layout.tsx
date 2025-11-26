import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flex Reviews Dashboard",
  description:
    "A complete reviews management workflow for Flex Living using Next.js, TypeScript, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
};