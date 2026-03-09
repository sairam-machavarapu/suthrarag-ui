import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NextAuthProvider from "@/components/NextAuthProvider";
import { Toaster } from 'sonner';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Suthra AI Assistant",
  description: "Enterprise grade AI assistant dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          {children}
          <Toaster richColors position="bottom-right" theme="dark" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
