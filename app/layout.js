import localFont from "next/font/local";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import GlobalToaster from "../components/Toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
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
        <body className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}>
          {/* Global UI */}
          <GlobalToaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
