"use client";

import { useState, useEffect } from "react";
import { FaGithub, FaLinkedin, FaGlobe, FaTimes } from "react-icons/fa";

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
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500/20 to-transparent" />

      <div className="bg-gradient-to-b from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Main footer content */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-8">
            {/* Developer info section */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400 tracking-wider mb-1">
                  <i>Developed By</i>
                </p>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Richmond Kofi Azadze
                </h3>
              </div>

              {/* Social links */}
              <div className="flex space-x-3">
                {[
                  {
                    icon: <FaGithub className="w-5 h-5" />,
                    href: "https://github.com/richmondazadze",
                    label: "GitHub",
                  },
                  {
                    icon: <FaLinkedin className="w-5 h-5" />,
                    href: "https://www.linkedin.com/in/richmond-azadze/",
                    label: "LinkedIn",
                  },
                  {
                    icon: <FaGlobe className="w-5 h-5" />,
                    href: "https://richmondazadze.me/",
                    label: "Portfolio",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    <div className="text-gray-400 group-hover:text-blue-400 transition-colors duration-300">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Vertical Divider - Only visible on md and up */}
            <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-gray-700 to-transparent mx-4" />

            {/* Links section */}
            <div className="flex flex-col items-center md:items-end space-y-2">
              <button
                onClick={toggleTerms}
                className="text-gray-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 text-sm"
              >
                Terms & Conditions
              </button>
              <button
                onClick={togglePrivacy}
                className="text-gray-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 text-sm"
              >
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-gray-800/50 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SankPost AI. All rights reserved.
            </p>
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
