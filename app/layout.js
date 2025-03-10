import localFont from "next/font/local";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import { dark } from "@clerk/themes";
import { text } from "drizzle-orm/mysql-core";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "SankPost",
  description: "Your AI Powered Social Media Content Generator",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }} dynamic>
      <html lang="en">
        <body className={`${inter.className} bg-black text-white antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
