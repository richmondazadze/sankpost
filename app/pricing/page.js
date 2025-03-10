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
          className={`fixed inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4 transition-transform duration-300 transform scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-800 transition duration-300 ease-in-out"
              >
                <X size={24} />
              </button>
            </div>

            <form
              action="https://formspree.io/f/xleqklkl"
              method="post"
              // onSubmit={handleSubmit}
              className="space-y-6 bg-gradient-to-r from-gray-800 to-gray-300 p-4 rounded-lg shadow-lg"
            >
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <textarea
                placeholder="Requesting custom or premium subscription"
                value={message || "Requesting custom or premium subscription"}
                onChange={(e) => setMessage(e.target.value)}
                name="message"
                id="message"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                rows="4"
              />
              <button
                type="submit"
                disabled={isSending}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
              >
                {isSending ? "Sending..." : "Send Message"}
              </button>
            </form>
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
            Our payment integration is currently in the free testing phase. For
            payment processing, please use the following test card details:
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
