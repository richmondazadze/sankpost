import React from "react";
import { Heart, MessageCircle, Send, Bookmark, Instagram } from "lucide-react";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { remarkGfm } from "remark-gfm";

// interface InstagramMockProps {
//   content: string;
// }

export const InstagramMock = ({ content, image }) => {
  // Extract hashtags from content
  const contentParts = content.split(/\n#/);
  const mainContent = contentParts[0];
  const hashtags = contentParts.slice(1).map((tag) => `#${tag}`);

  return (
    <div className="bg-white text-black rounded-xl overflow-hidden max-w-md mx-auto shadow-xl">
      {/* Header */}
      <div className="flex items-center p-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full mr-3 flex items-center justify-center">
          <Instagram className="w-4 h-4 text-white" />
        </div>
        <p className="font-semibold">Your Brand</p>
      </div>

      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {image ? (
          <img
            src={URL.createObjectURL(image)}
            alt="Instagram post"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Image Preview
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex justify-between mb-3">
          <div className="flex space-x-4">
            <button className="hover:text-red-500 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
            <button className="hover:text-blue-500 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="hover:text-blue-500 transition-colors">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button className="hover:text-black transition-colors">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ children }) => (
                <p className="leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-gray-600">{children}</em>
              ),
            }}
          >
            {mainContent}
          </ReactMarkdown>

          {/* Hashtags */}
          <div className="text-blue-500 text-sm">{hashtags.join(" ")}</div>
        </div>
      </div>
    </div>
  );
};
