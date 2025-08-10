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

import {
  Loader2,
  Upload,
  Copy,
  Twitter,
  Instagram,
  Linkedin,
  Clock,
  Zap,
  X,
  Check,
} from "lucide-react";
// import ReactMarkdown from "react-markdown";
import { Navbar } from "../../components/Navbar";
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

// Switched to OpenRouter server route; no direct SDK on client

const contentTypes = [
  { value: "twitter", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram Caption" },
  { value: "linkedin", label: "LinkedIn Post" },
];

const MAX_TWEET_LENGTH = 280;
const POINTS_PER_GENERATION = 5;
const MAX_IMAGE_BYTES = 2_000_000; // ~2MB cap for data URL payloads

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

// Convert a File to a data URL for OpenRouter image_url content
const fileToDataUrl = async (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});

  const fetchUserPoints = useCallback(async () => {
    if (user?.id) {
      console.log("Fetching points for user:", user.id);
      const points = await getUserPoints(user.id);
      console.log("Fetched points:", points);
      setUserPoints(points);
      if (points === 0) {
        console.log("User has 0 points. Attempting to create/update user.");
        const updatedUser = await createOrUpdateUser(
          user.id,
          user.emailAddresses[0].emailAddress,
          user.fullName || ""
        );
        console.log("Updated user:", updatedUser);
        if (updatedUser) {
          setUserPoints(updatedUser.points);
        }
      }
    }
  }, [user]);

  const fetchContentHistory = useCallback(async () => {
    if (user?.id) {
      const contentHistory = await getGeneratedContentHistory(user.id);
      setHistory(contentHistory);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isSignedIn && user) {
      console.log("User loaded:", user);
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

      const promptText = platformPrompts[contentType](prompt);
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
        if (savedContent) setHistory((prev) => [savedContent, ...prev]);
      } else {
        const cleaned = (text || "").trim();
        setGeneratedContent([cleaned]);
        const savedContent = await saveGeneratedContent(
          user.id,
          cleaned,
          prompt,
          contentType
        );
        if (savedContent) setHistory((prev) => [savedContent, ...prev]);
      }

      const updatedUser = await updateUserPoints(
        user.id,
        -POINTS_PER_GENERATION
      );
      if (updatedUser) setUserPoints(updatedUser.points);
    } catch (error) {
      console.error("Generation error:", error);
      setGeneratedContent(["An error occurred: " + (error.message || "Unknown error")]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (item) => {
    setSelectedHistoryItem(item);
    setContentType(item.contentType);
    setPrompt(item.prompt);

    if (item.contentType === "twitter") {
      try {
        const parsedContent = JSON.parse(item.content);
        setGeneratedContent(
          Array.isArray(parsedContent) ? parsedContent : [[item.content]]
        );
      } catch (e) {
        // Fallback for older content format
        const tweets = item.content
          .split("\n\n")
          .filter((tweet) => tweet.trim());
        setGeneratedContent([tweets]);
      }
    } else {
      setGeneratedContent([item.content]);
    }
  };

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

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Loader2 className="h-10 w-10 animate-spin" />
  //     </div>
  //   );
  // }

  //

  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > MAX_IMAGE_BYTES) {
        alert("Image too large. Please upload an image under 2MB.");
        return;
      }
      setImage(file);
    }
  };

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="container mx-auto px-4 mb-8 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 mt-14 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - History */}
          <div className="hidden lg:block">
            <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 h-[calc(100vh-12rem)] overflow-y-auto transition-all duration-300 hover:border-gray-600/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  History
                </h2>
                <Clock className="h-6 w-6 text-blue-400" />
              </div>

              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    onClick={() => handleHistoryItemClick(item)}
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors">
                        {item.contentType === "twitter" && (
                          <Twitter className="h-4 w-4 text-blue-400" />
                        )}
                        {item.contentType === "instagram" && (
                          <Instagram className="h-4 w-4 text-pink-400" />
                        )}
                        {item.contentType === "linkedin" && (
                          <Linkedin className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        {item.contentType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors truncate">
                      {item.prompt}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-2 group-hover:text-gray-400 transition-colors">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
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
                      {userPoints !== null ? userPoints : "Loading..."}
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
                      setSelectedHistoryItem(null);
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
                    setSelectedHistoryItem(null);
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

        {/* Mobile History Button */}
        <button
          onClick={toggleModal}
          className="fixed bottom-4 right-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 lg:hidden hover:scale-110 z-50"
        >
          <Clock className="h-6 w-6 text-white" />
        </button>

        {/* Mobile History Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={toggleModal}
            />
            <div className="absolute inset-4 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  History
                </h2>
                <button
                  onClick={toggleModal}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                </button>
              </div>

              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:border-blue-500/30"
                    onClick={() => {
                      handleHistoryItemClick(item);
                      toggleModal();
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-lg bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors">
                        {item.contentType === "twitter" && (
                          <Twitter className="h-4 w-4 text-blue-400" />
                        )}
                        {item.contentType === "instagram" && (
                          <Instagram className="h-4 w-4 text-pink-400" />
                        )}
                        {item.contentType === "linkedin" && (
                          <Linkedin className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        {item.contentType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors truncate">
                      {item.prompt}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-2 group-hover:text-gray-400 transition-colors">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
