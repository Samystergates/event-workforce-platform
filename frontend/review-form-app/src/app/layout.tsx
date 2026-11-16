 import type { Metadata } from "next";
  import { Inter } from "next/font/google";
  import "./globals.css";
  import { Toaster } from "@/components/ui/toaster";

  const inter = Inter({ subsets: ["latin"] });

  export const metadata: Metadata = {
    title: "Review Form App",
    description: "Service Provider Review Form",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <main className="min-h-screen bg-background p-4">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
          <Toaster />
        </body>
      </html>
    );
  }
