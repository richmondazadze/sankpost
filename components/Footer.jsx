"use client";

import { useState, useEffect } from "react";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

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
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const Modal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white text-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-4 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div className="max-h-[60vh] overflow-y-auto pr-4">{content}</div>
          <button
            onClick={onClose}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-300 hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-6">
      <div className="container mx-auto px-6 flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <span className="text-lg font-semibold">
            Developed by{" "}
            <b>
              <em>Richmond Kofi Azadze</em>
            </b>
          </span>
          <div className="flex space-x-4">
            <a
              href="https://github.com/richmondazadze"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform transform hover:scale-110 border border-white rounded-full p-2"
            >
              <FaGithub className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/richmond-azadze/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform transform hover:scale-110 border border-white rounded-full p-2"
            >
              <FaLinkedin className="w-6 h-6" />
            </a>
            <a
              href="https://richmondazadze.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform transform hover:scale-110 border border-white rounded-full p-2"
            >
              <FaGlobe className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={toggleTerms}
            className="text-gray-300 hover:text-white transition-colors duration-300"
          >
            Terms and Conditions
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={togglePrivacy}
            className="text-gray-300 hover:text-white transition-colors duration-300"
          >
            Privacy Policy
          </button>
        </div>
      </div>

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
    </footer>
  );
};

export default Footer;
