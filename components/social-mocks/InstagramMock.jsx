import React from "react";
import { Heart, MessageCircle, Send, Bookmark, Instagram } from "lucide-react";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { remarkGfm } from "remark-gfm";
import { CopyButton } from "./CopyButton";

// interface InstagramMockProps {
//   content: string;
// }

export const InstagramMock = ({ content, image }) => {
  if (!content) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <CopyButton text={content} label="Copy caption" />
      </div>
      <div className="bg-white rounded-xl overflow-hidden max-w-[468px] mx-auto shadow-xl">
        <div className="flex items-center p-3 border-b">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">YB</span>
          </div>
          <span className="ml-2 font-semibold text-sm text-gray-900">
            Your Brand
          </span>
        </div>

        {image && (
          <div className="aspect-square relative">
            <img
              src={URL.createObjectURL(image)}
              alt="Instagram content"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex space-x-4">
              <svg
                className="w-6 h-6 text-gray-800 hover:text-red-500 cursor-pointer transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <svg
                className="w-6 h-6 text-gray-800 hover:text-gray-600 cursor-pointer transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <svg
                className="w-6 h-6 text-gray-800 hover:text-gray-600 cursor-pointer transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <svg
              className="w-6 h-6 text-gray-800 hover:text-gray-600 cursor-pointer transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-900">
              <span className="font-semibold mr-1">Your Brand</span>
              {content.split("\n\n").map((part, index) => (
                <span key={index}>
                  {part}
                  {index === 0 && <br />}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">1 HOUR AGO</p>
          </div>
        </div>
      </div>
    </div>
  );
};
