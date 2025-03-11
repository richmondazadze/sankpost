"use client";

import Link from "next/link";
import { Menu, MenuIcon, MessageSquare, X } from "lucide-react";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedOut,
  SignedIn,
  useAuth,
} from "@clerk/nextjs";
import { useState, useEffect } from "react";

export function Navbar() {
  const { userId } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-xl transition-all duration-300 group-hover:blur-2xl" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SankPost AI
              </span>
            </Link>
          </div>

          <button
            className="sm:hidden relative w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800/50 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>

          <div
            className={`w-full sm:w-auto ${
              isMenuOpen
                ? "block absolute top-full left-0 right-0 bg-gray-900/95 border-b border-gray-800/50 backdrop-blur-xl shadow-xl"
                : "hidden"
            } sm:block sm:static sm:bg-transparent sm:border-none sm:shadow-none transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 p-4 sm:p-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0 mb-4 sm:mb-0">
                {["Pricing"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="relative group text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    <span className="relative z-10">{item}</span>
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                  </Link>
                ))}
                {userId && (
                  <Link
                    href="/generate"
                    className="relative group text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                  </Link>
                )}
              </div>

              <SignedOut>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <SignInButton mode="modal">
                    <button className="w-full sm:w-auto px-6 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full sm:w-auto px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="flex justify-center sm:justify-start py-4 sm:py-0">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "w-10 h-10 rounded-lg overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/50 transition-colors duration-300",
                        userButtonPopulator:
                          "hover:opacity-80 transition-opacity duration-300",
                      },
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
