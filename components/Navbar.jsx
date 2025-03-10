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
  });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-250 ${
        isScrolled ? "bg-black/70 backdrop:blur-md" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-9 py-4 sm:py-6">
        <div className="flex flex-wrap justify-between items-center max-width-6xl mx-auto">
          <div className="flex items-center">
            <Link href={"/"} className="flex items-center space-x-2">
              <MessageSquare className="w-10 h-10 text-blue-600" />
              <span className="text-xl sm:text-2xl font-bold text-white">
                SankPost AI
              </span>
            </Link>
          </div>

          <button
            className="sm:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
          <div
            className={`w-full sm:w-auto ${
              isMenuOpen
                ? "block bg-black/90 rounded-lg p-4 transition-transform transform translate-y-0"
                : "hidden"
            } sm:block mt-4 sm:mt-0 transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
              {["Pricing"].map((item) => (
                <Link
                  key={item}
                  href={`${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-white transition-colors py-2 sm:py-0 relative group"
                >
                  {item}
                  <span className="absolute rounded-xl left-0 right-0 bottom-0 h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
              ))}
              {userId && (
                <Link
                  href={"/generate"}
                  className="text-gray-300 hover:text-white transition-colors py-2 sm:py-0 relative group"
                >
                  Dashboard
                  <span className="absolute rounded-xl left-0 right-0 bottom-0 h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
              )}

              <SignedOut>
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex flex-row space-x-4">
                    <SignInButton mode="modal">
                      <button className="border border-blue-600 rounded-full text-gray-300 hover:text-white transition-colors px-4 py-2">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
                        Get Started
                      </button>
                    </SignUpButton>
                  </div>
                </div>
              </SignedOut>

              <SignedIn>
                <UserButton
                  appearance={{ elements: { avatarBox: "w-10 h-10" } }}
                ></UserButton>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
