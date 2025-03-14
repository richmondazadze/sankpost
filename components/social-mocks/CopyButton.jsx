import { useState } from "react";
import { Copy, Check } from "lucide-react";

export const CopyButton = ({ text, label = "Copy" }) => {
  const [copyStatus, setCopyStatus] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors text-white"
    >
      <div className="relative w-4 h-4">
        <div
          className={`absolute inset-0 transform transition-all duration-300 ${
            copyStatus ? "opacity-0 scale-50" : "opacity-100 scale-100"
          }`}
        >
          <Copy className="w-4 h-4" />
        </div>
        <div
          className={`absolute inset-0 transform transition-all duration-300 ${
            copyStatus ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <Check className="w-4 h-4 text-green-400" />
        </div>
      </div>
      <span className="text-sm">{copyStatus ? "Copied!" : label}</span>
    </button>
  );
};
