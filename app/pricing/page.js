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
    <div className="min-h-screen bg-black text-gray-100">
      <Navbar />
      <main className="container mx-auto px-8 py-20">
        <div className="mb-8 p-4 bg-red-100 text-red-800 rounded-lg max-w-6xl mx-auto">
          <h2 className="text-lg font-bold">
            Urgent Payment Integration Notice
          </h2>
          <p>
            {
              "Our payment integration is currently in the free testing phase. For payment processing, please use the following test card details:"
            }
          </p>
          <ul className="list-disc pl-5">
            <li>
              Card Number: <strong>4242 4242 4242 4242</strong>
            </li>
            <li>
              Expiration Date: <strong>Any future date</strong>
            </li>
            <li>
              Security Code: <strong>Any 3-digit code</strong>
            </li>
          </ul>
        </div>

        <h1 className="text-5xl font-bold mb-12 mt-20 text-center text-white">
          Pricing Plans
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className="p-8 rounded-lg border border-gray-800 flex flex-col"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">
                {plan.name}
              </h2>
              <p className="text-4xl font-bold mb-6 text-white">
                ${plan.price}
                <span className="text-lg font-normal text-gray-400">
                  /month
                </span>
              </p>
              <ul className="mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center mb-3 text-gray-300"
                  >
                    <CheckIcon className="w-5 h-5 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.name === "Enterprise" ? (
                <Button
                  onClick={handleContactUs}
                  className="w-full bg-white text-black hover:bg-gray-200"
                >
                  Contact Us
                </Button>
              ) : (
                <Button
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                  disabled={isLoading || !plan.priceId}
                  className="w-full bg-white text-black hover:bg-gray-200"
                >
                  {loadingPlanId === plan.priceId
                    ? "Processing..."
                    : "Choose Plan"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
