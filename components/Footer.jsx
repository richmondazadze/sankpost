"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaGithub, FaLinkedin, FaGlobe, FaTimes, FaTwitter } from "react-icons/fa";

const Footer = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const toggleTerms = () => setIsTermsOpen(!isTermsOpen);
  const togglePrivacy = () => setIsPrivacyOpen(!isPrivacyOpen);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsTermsOpen(false);
        setIsPrivacyOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const Modal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 overflow-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 shadow-2xl transition-all duration-300 border border-gray-700/50 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-700/50 transition-colors duration-200"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>

          {/* Modal Header */}
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {title}
          </h2>

          {/* Modal Content */}
          <div className="prose prose-invert max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            {content}
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <footer className="relative mt-20">
      {/* Decorative top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black text-white">
        {/* soft glow decorations */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12">
          

          {/* Main grid (2 columns on mobile) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-2">
              <h4 className="text-lg font-semibold">Sankpost AI</h4>
              <p className="mt-2 text-sm text-gray-400 max-w-md">Your AI powered social media copilot. Craft thoughtful posts, captions and updates that resonate with your audience.</p>
              {/* Social links */}
              <div className="mt-4 flex items-center gap-3">
                {[{
                  icon: <FaGithub className="w-4 h-4" />, href: "https://github.com/richmondazadze", label: "GitHub"
                },{
                  icon: <FaLinkedin className="w-4 h-4" />, href: "https://www.linkedin.com/in/richmond-azadze/", label: "LinkedIn"
                },{
                  icon: <FaTwitter className="w-4 h-4" />, href: "https://twitter.com/", label: "Twitter"
                },{
                  icon: <FaGlobe className="w-4 h-4" />, href: "https://richmondazadze.me/", label: "Portfolio"
                }].map((s)=> (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                     className="group p-2 rounded-md border border-gray-700/60 bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                    <span className="text-gray-400 group-hover:text-blue-400">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="col-span-1">
              <h5 className="text-sm font-semibold text-gray-200">Product</h5>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li><Link href="/generate" className="hover:text-gray-200">Generate</Link></li>
                <li><Link href="/history" className="hover:text-gray-200">History</Link></li>
                <li><Link href="/pricing" className="hover:text-gray-200">Pricing</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="col-span-1">
              <h5 className="text-sm font-semibold text-gray-200">Legal</h5>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={toggleTerms} className="hover:text-gray-200">Terms & Conditions</button>
                </li>
                <li>
                  <button onClick={togglePrivacy} className="hover:text-gray-200">Privacy Policy</button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Sankpost AI. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-gray-800/60 px-2 py-1 border border-gray-700/50">Next.js</span>
              <span className="rounded-full bg-gray-800/60 px-2 py-1 border border-gray-700/50">Clerk</span>
              <span className="rounded-full bg-gray-800/60 px-2 py-1 border border-gray-700/50">Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isTermsOpen}
        onClose={toggleTerms}
        title="Terms and Conditions"
        content={
          <>
            <p className="mb-4">
              <strong>Introduction:</strong> These terms and conditions govern
              your use of our application. By using our application, you accept
              these terms in full. If you disagree with any part of these terms,
              you must not use our application.
            </p>
            <p className="mb-4">
              <strong>License to Use Application:</strong> Unless otherwise
              stated, we or our licensors own the intellectual property rights
              in the application and material on the application. Subject to the
              license below, all these intellectual property rights are
              reserved.
            </p>
            <p className="mb-4">
              <strong>Acceptable Use:</strong> You must not use our application
              in any way that causes, or may cause, damage to the application or
              impairment of the availability or accessibility of the
              application.
            </p>
            <p className="mb-4">
              <strong>Limitations of Liability:</strong> We will not be liable
              to you in respect of any losses arising out of any event or events
              beyond our reasonable control.
            </p>
            <p className="mb-4">
              <strong>Changes to Terms:</strong> We may revise these terms from
              time to time. Revised terms will apply to the use of our
              application from the date of the publication of the revised terms
              on our application.
            </p>
            <p className="mb-4">
              <strong>Governing Law:</strong> These terms will be governed by
              and construed in accordance with the laws of your jurisdiction.
            </p>
          </>
        }
      />

      <Modal
        isOpen={isPrivacyOpen}
        onClose={togglePrivacy}
        title="Privacy Policy"
        content={
          <>
            <p className="mb-4">
              <strong>Introduction:</strong> This privacy policy explains how we
              collect, use, and protect your information when you use our
              application.
            </p>
            <p className="mb-4">
              <strong>Information We Collect:</strong> We may collect personal
              information such as your name, email address, and usage data when
              you use our application.
            </p>
            <p className="mb-4">
              <strong>How We Use Your Information:</strong> We use your
              information to provide and maintain our application, notify you
              about changes, and allow you to participate in interactive
              features.
            </p>
            <p className="mb-4">
              <strong>Data Security:</strong> We take the security of your data
              seriously and implement appropriate measures to protect your
              personal information.
            </p>
            <p className="mb-4">
              <strong>Changes to This Privacy Policy:</strong> We may update our
              privacy policy from time to time. We will notify you of any
              changes by posting the new privacy policy on this page.
            </p>
            <p className="mb-4">
              <strong>Contact Us:</strong> If you have any questions about this
              privacy policy, please contact us at your email address.
            </p>
          </>
        }
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
