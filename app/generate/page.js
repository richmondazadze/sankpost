"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@nextui-org/react";
// import { Input } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// import rehypeRaw from "rehype-raw";

import { Loader2, Upload, Copy, Twitter, Instagram, Linkedin, Zap, X, Check, Clock } from "lucide-react";
// import ReactMarkdown from "react-markdown";
import { Navbar } from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { toast } from "sonner";
import Footer from "../../components/Footer";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  getUserPoints,
  saveGeneratedContent,
  updateUserPoints,
  getGeneratedContentHistory,
  createOrUpdateUser,
} from "../../utils/db/actions";
import { TwitterMock } from "../../components/social-mocks/TwitterMock";
import { InstagramMock } from "../../components/social-mocks/InstagramMock";
import { LinkedInMock } from "../../components/social-mocks/LinkedInMock";
import Link from "next/link";
import imageCompression from "browser-image-compression";

// Switched to OpenRouter server route; no direct SDK on client

const contentTypes = [
  { value: "twitter", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram Caption" },
  { value: "linkedin", label: "LinkedIn Post" },
];

const MAX_TWEET_LENGTH = 280;
const POINTS_PER_GENERATION = 5;
// Increased to 6MB raw file size (~8MB base64 in JSON). For larger images, prefer URL uploads.
const MAX_IMAGE_BYTES = 6_000_000;

// Define HistoryItem as a plain object structure
const HistoryItem = {
  id: 0,
  contentType: "",
  prompt: "",
  content: "",
  createdAt: new Date(),
};

// Add platform-specific prompt templates
const platformPrompts = {
  twitter: (
    basePrompt
  ) => `Create exactly 4 engaging and detailed tweets about: "${basePrompt}"

Rules:
- Generate exactly 4 independent tweets
- Each tweet should be between 200-270 characters
- Make each tweet informative and engaging
- Include meaningful details and insights
- No emojis or hashtags
- Keep it professional and insightful
- Each tweet should be complete and standalone

Format EXACTLY like this:

TWEET1: First complete tweet here
TWEET2: Second complete tweet here
TWEET3: Third complete tweet here
TWEET4: Fourth complete tweet here`,

  instagram: (
    basePrompt
  ) => `Generate an engaging Instagram caption for this image about: "${basePrompt}"

Rules:
- Create a captivating, ready-to-use caption
- Keep it authentic and engaging
- Include 3-4 relevant hashtags
- Maximum length: 2200 characters
- DO NOT include any analysis text or meta descriptions
- DO NOT start with image descriptions
- Focus on creating ONE clear, usable caption

Format the response EXACTLY like this:
CAPTION: [The actual caption text here]
HASHTAGS: [hashtags here]`,

  linkedin: (
    basePrompt
  ) => `Create one professional LinkedIn post for: "${basePrompt}"

The post should:
- Start with a compelling hook
- Use professional tone
- Include business insights
- Format with bullet points where relevant
- Use markdown for **bold** key points
- Include a professional call-to-action
- Maximum 3000 characters

Format with proper paragraph spacing and professional structure.`,
};

// Convert a Blob/File to a data URL for OpenRouter image_url content
const fileToDataUrl = async (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Compress an image in the browser to fit under a target byte size
// Strategy: scale down to maxWidth, then try JPEG qualities until under limit
const compressImageToLimit = async (file, {
  maxBytes = MAX_IMAGE_BYTES,
  maxWidth = 1600,
  minQuality = 0.5,
} = {}) => {
  try {
    // Try library first (handles multiple formats efficiently)
    const compressed = await imageCompression(file, {
      maxSizeMB: Math.max(0.2, maxBytes / (1024 * 1024)),
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      initialQuality: 0.85,
    });
    if (compressed && compressed.size <= maxBytes) return compressed;
    // Fallback: simple canvas-based downscale if still too large
    const imageBitmap = await createImageBitmap(compressed || file);
    const scale = Math.min(1, maxWidth / Math.max(imageBitmap.width, imageBitmap.height));
    const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
    let quality = 0.8;
    let blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    while (blob && blob.size > maxBytes && quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.1);
      blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    }
    return blob ?? (compressed || file);
  } catch (e) {
    // Fallback: return original if compression fails
    return file;
  }
};

const processInstagramContent = (content) => {
  const captionMatch = content.match(/CAPTION: ([\s\S]*?)(?=HASHTAGS:|$)/);
  const hashtagsMatch = content.match(/HASHTAGS: ([\s\S]*?)$/);

  const caption = captionMatch ? captionMatch[1].trim() : "";
  const hashtags = hashtagsMatch ? hashtagsMatch[1].trim() : "";

  return caption + "\n\n" + hashtags;
};

export default function GenerateContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [contentType, setContentType] = useState(contentTypes[0].value);
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [history, setHistory] = useState([]);
  const [copyStatus, setCopyStatus] = useState({});
  const [isPointsLoading, setIsPointsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [tone, setTone] = useState("neutral"); // neutral | friendly | formal | persuasive
  const [lengthPref, setLengthPref] = useState("medium"); // short | medium | long

  const fetchUserPoints = useCallback(async () => {
    if (user?.id) {
      setIsPointsLoading(true);
      const points = await getUserPoints(user.id);
      setUserPoints(points);
      if (points === 0) {
        const updatedUser = await createOrUpdateUser(
          user.id,
          user.emailAddresses[0].emailAddress,
          user.fullName || ""
        );
        if (updatedUser) {
          setUserPoints(updatedUser.points);
        }
      }
      setIsPointsLoading(false);
    }
  }, [user]);

  const fetchContentHistory = useCallback(async () => {
    if (user?.id) {
      setIsHistoryLoading(true);
      const contentHistory = await getGeneratedContentHistory(user.id);
      setHistory(contentHistory);
      setIsHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isSignedIn && user) {
      fetchUserPoints();
      fetchContentHistory();
    }
  }, [
    isLoaded,
    isSignedIn,
    user,
    router,
    fetchUserPoints,
    fetchContentHistory,
  ]);

  const handleGenerate = async () => {
    if (!user?.id || userPoints === null || userPoints < POINTS_PER_GENERATION) {
      alert("Not enough points.");
      return;
    }

    setIsLoading(true);
    try {
      if (contentType === "instagram" && !image) {
        alert("Please upload an image for Instagram content");
        setIsLoading(false);
        return;
      }

      const toneInstruction =
        tone === "neutral"
          ? ""
          : tone === "friendly"
          ? "\n- Use a friendly, approachable tone"
          : tone === "formal"
          ? "\n- Use a concise, formal tone"
          : "\n- Use a persuasive, marketing-ready tone";

      const lengthInstruction =
        lengthPref === "short"
          ? "\n- Keep the content concise"
          : lengthPref === "long"
          ? "\n- Provide more detail where helpful"
          : "";

      const promptText = platformPrompts[contentType](prompt) + toneInstruction + lengthInstruction;
      const imageDataUrl =
        contentType === "instagram" && image
          ? await fileToDataUrl(image)
          : null;

      const res = await fetch("/api/openrouter-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          imageDataUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const { text } = await res.json();

      if (contentType === "twitter") {
        const tweets = text
          .split(/TWEET\d+:\s*/)
          .filter((tweet) => tweet.trim())
          .map((tweet) => tweet.trim());
        setGeneratedContent(tweets);

        const savedContent = await saveGeneratedContent(
          user.id,
          JSON.stringify(tweets),
          prompt,
          contentType
        );
        if (savedContent) {
          setHistory((prev) => [savedContent, ...prev]);
          toast.success("Saved generated tweets to history");
        }
      } else {
        const cleaned = (text || "").trim();
        setGeneratedContent([cleaned]);
        const savedContent = await saveGeneratedContent(
          user.id,
          cleaned,
          prompt,
          contentType
        );
        if (savedContent) {
          setHistory((prev) => [savedContent, ...prev]);
          toast.success("Saved generated content to history");
        }
      }

      const updatedUser = await updateUserPoints(
        user.id,
        -POINTS_PER_GENERATION
      );
      if (updatedUser) setUserPoints(updatedUser.points);
    } catch (error) {
      console.error("Generation error:", error);
      setGeneratedContent(["An error occurred: " + (error.message || "Unknown error")]);
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // History interactions moved to /history page

  const copyToClipboard = (text, id = "default") => {
    navigator.clipboard.writeText(text);
    setCopyStatus((prev) => ({ ...prev, [id]: true }));

    // Reset the icon after 2 seconds
    setTimeout(() => {
      setCopyStatus((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const renderContent = () => {
    if (!generatedContent.length) return null;

    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Preview</h3>
        </div>
        {contentType === "twitter" ? (
          <TwitterMock content={generatedContent} />
        ) : contentType === "instagram" ? (
          <InstagramMock
            content={processInstagramContent(generatedContent[0])}
            image={image}
          />
        ) : contentType === "linkedin" ? (
          <LinkedInMock content={generatedContent[0]} />
        ) : null}
      </div>
    );
  };

  // mobile history drawer removed; view full history on /history

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Loader2 className="h-10 w-10 animate-spin" />
  //     </div>
  //   );
  // }

  //

  const handleImageUpload = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const isMobile = (typeof window !== "undefined" && window.innerWidth < 640) ||
        (typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      const isHeic = /heic|heif/i.test(file.type || "");
      const mobileTargetBytes = 3_000_000; // ~3MB
      const allowedBytes = isMobile ? Math.min(MAX_IMAGE_BYTES, mobileTargetBytes) : MAX_IMAGE_BYTES;
      const shouldCompress = isMobile || isHeic || file.size > allowedBytes;

      const processed = shouldCompress
        ? await compressImageToLimit(file, { maxBytes: allowedBytes, maxWidth: isMobile ? 1280 : 1600 })
        : file;

      if (processed.size > allowedBytes) {
        alert(`Image too large after compression. Please choose a smaller image (max ${(allowedBytes/1_000_000).toFixed(1)} MB).`);
        return;
      }
      setImage(processed);
    }
  };

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-950 min-h-screen text-white">
      <Navbar />
      {/* Spacer equal to navbar height */}
      <div className="h-16 md:h-20" aria-hidden />

      <div className="mx-auto mb-8 pt-4 grid max-w-[1400px] grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[auto_1fr] lg:px-8">
        {/* Persistent Sidebar on lg+ */}
        <Sidebar />

        <div className="grid grid-cols-1 gap-6">
          {/* Compact link to full history */}
          <div className="hidden lg:block">
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Browse your past generations</span>
              </div>
              <Button as={Link} href="/history" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                View History
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Points Display */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl transition-all duration-300 group-hover:blur-2xl" />
              <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl flex items-center justify-between transition-transform duration-300 hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className="relative">
                    <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
                    <div className="absolute inset-0 bg-yellow-400/20 blur-xl" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-400">Available Points</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {isPointsLoading ? "…" : userPoints}
                    </p>
                  </div>
                </div>
                <Button
                  as={Link}
                  href="/pricing"
                  className="group relative px-6 py-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative">Get More Points</span>
                </Button>
              </div>
            </div>

            {/* Content Generation Form */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl" />
              <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">
                    Content Type
                  </label>
                  <Button
                    onClick={() => {
                      setPrompt("");
                      setGeneratedContent([]);
                      setImage(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-700/50 text-sm text-gray-300 hover:bg-gray-600/50 transition-all duration-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50"
                  >
                    Clear All
                  </Button>
                </div>

                <Select
                  onValueChange={(value) => {
                    setContentType(value);
                    setPrompt("");
                    setGeneratedContent([]);
                  }}
                  defaultValue={contentType}
                >
                  <SelectTrigger className="w-full bg-gray-700/50 border border-gray-600/30 rounded-xl hover:border-gray-500/50 transition-all duration-300">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50">
                    {contentTypes.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="p-1.5 rounded-lg bg-gray-700/50 mr-2">
                            {type.value === "twitter" && (
                              <Twitter className="h-4 w-4 text-blue-400" />
                            )}
                            {type.value === "instagram" && (
                              <Instagram className="h-4 w-4 text-pink-400" />
                            )}
                            {type.value === "linkedin" && (
                              <Linkedin className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Prompt <span className="text-red-400">*</span>
                  </label>
                  <Textarea
            id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    required
                    className="w-full bg-gray-700/50 border border-gray-600/30 rounded-xl 
                    resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent 
                    transition-all duration-300 placeholder-gray-500 text-lg leading-6 
                    text-white caret-blue-400 selection:bg-blue-500/30
                    hover:border-gray-500/50 focus:bg-gray-800/50"
                    rows={4}
                    aria-required="true"
                    style={{
                      caretColor: "#60A5FA", // Explicit cursor color
                    }}
                  />
                  {!prompt && (
                    <p className="mt-2 text-sm text-red-400">
                      Please enter a prompt to generate content
                    </p>
                  )}
                </div>

                {/* Tone and length controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full rounded-md border border-gray-600/40 bg-gray-800/60 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="friendly">Friendly</option>
                      <option value="formal">Formal</option>
                      <option value="persuasive">Persuasive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Length
                    </label>
                    <select
                      value={lengthPref}
                      onChange={(e) => setLengthPref(e.target.value)}
                      className="w-full rounded-md border border-gray-600/40 bg-gray-800/60 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                </div>

                {contentType === "instagram" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-500 file:text-white
                        hover:file:bg-blue-600
                        file:cursor-pointer"
                    />
                    {image && (
                      <p className="mt-2 text-sm text-gray-400">
                        Selected: {image.name}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  id="generate-btn"
                  onClick={handleGenerate}
                  disabled={
                    isLoading ||
                    !prompt ||
                    userPoints === null ||
                    userPoints < POINTS_PER_GENERATION
                  }
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Content
                        <span className="ml-2 px-2 py-1 rounded-lg bg-blue-500/20 text-sm">
                          {POINTS_PER_GENERATION} points
                        </span>
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>

            {/* Single content display section */}
            <div className="mt-8">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </div>
        </div>

        {/* Mobile History CTA */}
        <Link
          href="/history"
          className="fixed bottom-20 right-4 p-3 rounded-full bg-blue-600 text-white lg:hidden shadow-lg hover:bg-blue-700 z-[90]"
          aria-label="View history"
        >
          <Clock className="h-5 w-5" />
        </Link>
      </div>
      <Footer />

      {/* Details panel moved to /history */}
    </div>
  );
}
