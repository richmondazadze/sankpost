import {
  ArrowRightIcon,
  CheckCircleIcon,
  InstagramIcon,
  Link,
  LinkedinIcon,
  RocketIcon,
  SparklesIcon,
  TrendingUpIcon,
  TwitterIcon,
  ZapIcon,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Button } from "@nextui-org/react";
import Footer from "../components/Footer";

import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import AuthButtons from "../components/AuthButtons";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-950 text-gray-100 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 relative pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 animate-float">
            <SparklesIcon className="w-8 h-8 text-yellow-400/30 filter blur-[1px]" />
          </div>
          <div className="absolute top-40 right-20 animate-float animation-delay-2000">
            <ZapIcon className="w-10 h-10 text-blue-400/30 filter blur-[1px]" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-float animation-delay-1000">
            <div className="w-3 h-3 rounded-full bg-purple-400/30 filter blur-[2px]" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float animation-delay-3000">
            <div className="w-2 h-2 rounded-full bg-blue-400/30 filter blur-[2px]" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center py-24 lg:py-32 relative">
          <div className="relative inline-block mb-6">
            <RocketIcon className="w-16 h-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mx-auto animate-float" />
            <div className="absolute inset-0 bg-purple-500/20 filter blur-xl animate-pulse" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-x">
              AI-Powered Social Media
            </span>
            <br />
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Content Generator
            </span>
          </h1>

          <p className="text-xl mb-10 text-gray-300/90 max-w-2xl mx-auto leading-relaxed">
            Create engaging content for Twitter, Instagram, and LinkedIn with
            cutting-edge AI technology.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <AuthButtons userId={userId} />
            <Button
              as="a"
              href="#features"
              className="group relative px-8 py-3 rounded-lg text-lg transition-all duration-300 ease-out hover:scale-105 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-600"
            >
              <span className="relative z-10 flex items-center gap-2 text-gray-300 group-hover:text-white">
                Learn More
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20" id="features">
          <h2 className="text-3xl font-bold mb-16 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Supercharge Your Social Media Presence
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {[
              {
                title: "Twitter Threads",
                icon: <TwitterIcon className="w-10 h-10 mb-4" />,
                description:
                  "Generate compelling Twitter threads that engage your audience and boost your reach.",
                gradient: "from-blue-500/20 to-blue-600/20",
                iconColor: "text-blue-400",
              },
              {
                title: "Instagram Captions",
                icon: <InstagramIcon className="w-10 h-10 mb-4" />,
                description:
                  "Create catchy captions for your Instagram posts that increase engagement and followers.",
                gradient: "from-pink-500/20 to-purple-600/20",
                iconColor: "text-pink-400",
              },
              {
                title: "LinkedIn Posts",
                icon: <LinkedinIcon className="w-10 h-10 mb-4" />,
                description:
                  "Craft professional content for your LinkedIn network to establish thought leadership.",
                gradient: "from-blue-600/20 to-blue-700/20",
                iconColor: "text-blue-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-lg transition-all duration-300 ease-out hover:scale-[1.02]"
              >
                <div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
                />
                <div className="absolute inset-0 rounded-lg bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" />
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`${feature.iconColor} transition-transform group-hover:scale-110`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 my-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl" />
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <SvgBackground />
          </div>

          <div className="relative z-10 px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Why Choose Our AI Content Generator?
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                "Save time and effort on content creation",
                "Consistently produce high-quality posts",
                "Increase engagement across all platforms",
                "Stay ahead of social media trends",
                "Customize content to match your brand voice",
                "Scale your social media presence effortlessly",
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 rounded-full bg-green-500/10">
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl filter blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Ready to revolutionize your social media strategy?
            </h2>
            <AuthButtons userId={userId} />
            <p className="mt-6 text-gray-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              No credit card required
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const SvgBackground = () => (
  <svg
    className="absolute w-full h-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid-pattern)" />
    <defs>
      <pattern
        id="grid-pattern"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 10 0 L 0 0 0 10"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.5"
        />
      </pattern>
    </defs>
  </svg>
);
