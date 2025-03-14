"use client";

import { Button } from "@nextui-org/react";
import { CheckIcon, X } from "lucide-react";
import { Navbar } from "../../components/Navbar.jsx";
import Footer from "../../components/Footer";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

const pricingPlans = [
  {
    name: "Basic",
    price: "9",
    priceId: "price_1QQAL6Cl3kD9W7JTvXcqQOmL",
    features: [
      "50 AI-generated posts per month",
      "Email support",
      "Earn 100 points",
    ],
  },
  {
    name: "Pro",
    price: "29",
    priceId: "price_1QQAN3Cl3kD9W7JTUcfqCph0",
    features: [
      "100 AI-generated posts per month",
      "Priority email support",
      "Earn 500 points",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceId: null,
    features: ["Unlimited AI-generated posts", "24/7 support and consultation"],
  },
];

const Modal = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(isOpen);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowModal(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (error) {
      console.error("Error sending email:", error);
      setSuccess(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-left shadow-xl transition-all duration-300 border border-gray-700/50 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - Positioned absolutely */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors duration-200"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Contact Us
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Fill out the form below and we'll get back to you shortly
              </p>
            </div>

            {/* Form */}
            <form
              action="https://formspree.io/f/xleqklkl"
              method="post"
              className="space-y-4"
            >
              {/* Name Input */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-gray-300"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  placeholder="Tell us what you're looking for"
                  value={message || "Requesting custom or premium subscription"}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows="4"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full mt-6 relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 group disabled:opacity-70"
              >
                {isSending ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Sending...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Send Message</span>
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-gray-500 mt-4">
              Your information is secure and will never be shared.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function PricingPage() {
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubscribe = async (priceId) => {
    if (!isSignedIn) {
      return;
    }

    setLoadingPlanId(priceId);
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user?.id,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      );
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
      setLoadingPlanId(null);
    }
  };

  const handleContactUs = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-400 to-blue-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Scale your social media presence with our AI-powered content
            generation
          </p>
        </div>

        <div className="relative mb-12 mx-4 md:mx-auto max-w-4xl">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 backdrop-blur-sm rounded-2xl" />

          {/* Content container */}
          <div className="relative p-6 md:p-8 border border-red-500/20 rounded-2xl bg-gray-900/40">
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Test Payment Notice
              </h2>
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-6 text-sm md:text-base">
              Our payment integration is currently in testing phase. Please use
              the following test card details for any transactions:
            </p>

            {/* Card details grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: "Card Number",
                  value: "4242 4242 4242 4242",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Expiration Date",
                  value: "Any future date",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Security Code",
                  value: "Any 3 digits",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  ),
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col space-y-2 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-red-500/30 transition-colors duration-300"
                >
                  <div className="flex items-center gap-2 text-gray-400">
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <p className="font-mono text-red-400 font-medium">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                These details are for testing purposes only. No real charges
                will be made.
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mt-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative transform hover:scale-105 transition-all duration-300 ${
                index === 1 ? "md:-mt-4 md:mb-4" : ""
              }`}
            >
              {/* Popular badge */}
              {index === 1 && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Card */}
              <div
                className={`h-full p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border ${
                  index === 1
                    ? "border-blue-500/50 shadow-2xl shadow-blue-500/20"
                    : "border-gray-800/50"
                } flex flex-col`}
              >
                {/* Plan Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {plan.name}
                  </h2>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="ml-2 text-gray-400">/month</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-8 flex-grow space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start space-x-3 text-gray-300"
                    >
                      <div className="flex-shrink-0 w-5 h-5 mt-1">
                        <div className="w-full h-full rounded-full bg-blue-500/20 flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-blue-400" />
                        </div>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {plan.name === "Enterprise" ? (
                  <button
                    onClick={handleContactUs}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Contact Us
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      plan.priceId && handleSubscribe(plan.priceId)
                    }
                    disabled={isLoading || !plan.priceId}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 
                      ${
                        index === 1
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                          : "bg-white text-gray-900 hover:bg-gray-100"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                    `}
                  >
                    {loadingPlanId === plan.priceId ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Choose Plan"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info Section */}
        <div className="mt-20 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Need More Information?
            </h2>
            <p className="text-gray-400 mb-6">
              Our team is here to help you choose the right plan for your needs
            </p>
            <button
              onClick={handleContactUs}
              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              <span>Contact Support</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>
      <Footer />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
