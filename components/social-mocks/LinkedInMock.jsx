import React from "react";
import { ThumbsUp, MessageSquare, Repeat, Send, Linkedin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CopyButton } from "./CopyButton";

// interface LinkedInMockProps {
//   content: string;
// }

export const LinkedInMock = ({ content }) => {
  if (!content) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <CopyButton text={content} label="Copy post" />
      </div>
      <div className="bg-white text-black rounded-xl p-6 max-w-2xl mx-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mr-3 flex items-center justify-center">
            <Linkedin className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold">Your Brand</p>
            <p className="text-gray-500 text-sm">Company • 1,234 followers</p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-gray-900">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-gray-600">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc ml-4 mb-4">{children}</ul>
              ),
              li: ({ children }) => <li className="mb-2">{children}</li>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Actions */}
        <div className="flex justify-between text-gray-500 border-t pt-4">
          <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-sm">Like</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Comment</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <Repeat className="w-5 h-5" />
            <span className="text-sm">Repost</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <Send className="w-5 h-5" />
            <span className="text-sm">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
