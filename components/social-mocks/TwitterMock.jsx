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
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export const TwitterMock = ({ content }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTweet = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
  };

  const prevTweet = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + content.length) % content.length
    );
  };

  return (
    <div className="flex items-center justify-between max-w-md mx-auto overflow-hidden">
      <button
        onClick={prevTweet}
        disabled={content.length <= 1}
        className="arrow-button"
      >
        <ArrowLeft size={24} />
      </button>
      <div className="flex-1 mx-2 relative">
        <div className="bg-white text-black rounded-lg p-4 w-full">
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
              <div>
                <p className="font-bold">Your Name</p>
                <p className="text-gray-500">@yourhandle</p>
              </div>
            </div>
            <ReactMarkdown
              className="prose prose-invert max-w-none text-sm"
              rehypePlugins={[rehypeRaw]}
            >
              {content[currentIndex]}
            </ReactMarkdown>
            <div className="flex justify-between mt-3 text-gray-500">
              <MessageCircle size={18} />
              <Repeat size={18} />
              <Heart size={18} />
              <Share size={18} />
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={nextTweet}
        disabled={content.length <= 1}
        className="arrow-button"
      >
        <ArrowRight size={24} />
      </button>
    </div>
  );
};
