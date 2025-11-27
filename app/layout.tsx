import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "./components/AppHeader";
import Footer from "./components/Footer";

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
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
        {/* header */}
        <AppHeader />

        {/* main site content grows to push footer to bottom */}
        <main className="grow">
          {children}
        </main>

        {/* rendered footer on server to avoid hydration mismatch with Date) */}
        <Footer />
      </body>
    </html>
  );
};