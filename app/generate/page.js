"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import rehypeRaw from "rehype-raw";

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
} from "lucide-react";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
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

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const contentTypes = [
  { value: "twitter", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram Caption" },
  { value: "linkedin", label: "LinkedIn Post" },
];

const MAX_TWEET_LENGTH = 280;
const POINTS_PER_GENERATION = 5;

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
  ) => `Create one perfect Instagram caption for: "${basePrompt}"

The caption should:
- Start with a strong hook
- Use strategic line breaks for readability
- Include 3-5 relevant emojis
- Add 5-7 targeted hashtags at the end
- Be visually formatted with markdown
- Include a clear call-to-action
- Maximum 2200 characters

Format with proper spacing and sections.`,

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
    if (
      !genAI ||
      !user?.id ||
      userPoints === null ||
      userPoints < POINTS_PER_GENERATION
    ) {
      alert("Not enough points or API key not set.");
      return;
    }

    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const promptText = platformPrompts[contentType](prompt);
      const result = await model.generateContent([{ text: promptText }]);
      const generatedText = result.response.text();

      if (contentType === "twitter") {
        // Split into individual tweets
        const tweets = generatedText
          .split(/TWEET\d+:\s*/)
          .filter((tweet) => tweet.trim())
          .map((tweet) => tweet.trim());

        setGeneratedContent(tweets);

        // Save content
        const savedContent = await saveGeneratedContent(
          user.id,
          JSON.stringify(tweets),
          prompt,
          contentType
        );

        if (savedContent) {
          setHistory((prevHistory) => [savedContent, ...prevHistory]);
        }
      } else {
        // Handle other content types...
        setGeneratedContent([generatedText.trim()]);

        const savedContent = await saveGeneratedContent(
          user.id,
          generatedText.trim(),
          prompt,
          contentType
        );

        if (savedContent) {
          setHistory((prevHistory) => [savedContent, ...prevHistory]);
        }
      }

      // Update points
      const updatedUser = await updateUserPoints(
        user.id,
        -POINTS_PER_GENERATION
      );
      if (updatedUser) {
        setUserPoints(updatedUser.points);
      }
    } catch (error) {
      console.error("Generation error:", error);
      setGeneratedContent(["An error occurred: " + error.message]);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderContentMock = () => {
    if (generatedContent.length === 0) return null;

    switch (contentType) {
      case "twitter":
        return <TwitterMock content={generatedContent} />;
      case "instagram":
        return <InstagramMock content={generatedContent[0]} image={image} />;
      case "linkedin":
        return <LinkedInMock content={generatedContent[0]} />;
      default:
        return null;
    }
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
      setImage(event.target.files[0]);
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
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Upload Image
                    </label>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="group cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-xl text-sm font-medium hover:bg-gray-600/50 hover:border-gray-500/50 transition-all duration-300"
                      >
                        <Upload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Upload Image</span>
                      </label>
                      <span className="text-sm text-gray-400">
                        {image ? image.name : "No image selected"}
                      </span>
                    </div>
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

            {/* Generated Content Display */}
            {(selectedHistoryItem || generatedContent.length > 0) && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur-xl" />
                <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl space-y-4">
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {selectedHistoryItem ? "History Item" : "Generated Content"}
                  </h2>

                  {contentType === "twitter" ? (
                    <div className="space-y-4">
                      {(selectedHistoryItem
                        ? JSON.parse(selectedHistoryItem.content)
                        : generatedContent
                      ).map((tweet, index) => (
                        <div
                          key={index}
                          className="group relative bg-gray-700/50 backdrop-blur-sm border border-gray-600/30 p-4 rounded-xl hover:border-blue-500/30 transition-all duration-300"
                        >
                          <p className="text-white mb-2">{tweet}</p>
                          <div className="flex justify-between items-center text-gray-400 text-xs mt-2">
                            <span className="px-2 py-1 rounded-lg bg-gray-600/50">
                              {tweet.length}/{MAX_TWEET_LENGTH}
                            </span>
                            <Button
                              onClick={() => copyToClipboard(tweet)}
                              className="group p-2 rounded-lg bg-gray-600/50 hover:bg-gray-500/50 text-white transition-all duration-300 hover:scale-105"
                            >
                              <Copy className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-700/50 backdrop-blur-sm border border-gray-600/30 p-4 rounded-xl hover:border-blue-500/30 transition-all duration-300">
                      <p className="text-white">
                        {selectedHistoryItem
                          ? selectedHistoryItem.content
                          : generatedContent[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview Section */}
            {generatedContent.length > 0 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl" />
                <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 rounded-xl transition-all duration-300 hover:border-gray-600/50">
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                    Preview
                  </h2>
                  <div className="transform transition-all duration-300 hover:scale-[1.01]">
                    {renderContentMock()}
                  </div>
                </div>
              </div>
            )}
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
