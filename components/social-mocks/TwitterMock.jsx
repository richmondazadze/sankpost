import React, { useState } from "react";
import {
  Twitter,
  Heart,
  MessageCircle,
  Repeat,
  Share,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import "./TwitterMock.css";

export const TwitterMock = ({ content }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ensure content is an array of strings
  const tweets = Array.isArray(content) ? content : [content];
  const currentTweet = tweets[currentIndex];

  if (!tweets.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">
          Post {currentIndex + 1} of {tweets.length}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          disabled={currentIndex === 0}
          className="p-2 rounded-full hover:bg-gray-700/50 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-[500px] w-full mx-auto">
          <div className="bg-black border border-gray-800 rounded-xl p-4">
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full mr-3 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">Your Brand</p>
                <p className="text-gray-500 text-sm">@yourbrand</p>
              </div>
            </div>

            <p className="text-[15px] leading-normal text-white mb-4 whitespace-pre-line">
              {currentTweet}
            </p>

            <div className="flex justify-between text-gray-500 max-w-[425px]">
              <button className="hover:text-blue-400 transition-colors flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">0</span>
              </button>
              <button className="hover:text-green-400 transition-colors flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                <span className="text-xs">0</span>
              </button>
              <button className="hover:text-pink-600 transition-colors flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="text-xs">0</span>
              </button>
              <button className="hover:text-blue-400 transition-colors">
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          disabled={currentIndex === tweets.length - 1}
          className="p-2 rounded-full hover:bg-gray-700/50 transition-colors disabled:opacity-50"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
