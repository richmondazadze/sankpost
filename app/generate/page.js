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
  { value: "twitter", label: "Twitter Thread" },
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
      console.log("Starting content generation...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      console.log("Model initialized");

      let promptText = `Generate high-quality ${contentType} content focused on "${prompt}". Ensure the content is engaging, contextually relevant, and tailored to the platform's best practices to maximize audience impact.`;

      let parts = [{ text: promptText }];

      if (contentType === "instagram" && image) {
        try {
          console.log("Processing image...");
          const imageData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              try {
                const base64Data = reader.result.split(",")[1];
                resolve(base64Data);
              } catch (error) {
                reject(error);
              }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(image);
          });
          console.log("Image processed successfully");

          parts.push({
            inlineData: {
              data: imageData,
              mimeType: image.type,
            },
          });

          console.log("Parts array created:", parts.length, "items");
        } catch (imageError) {
          console.error("Error processing image:", imageError);
          throw new Error(`Failed to process image: ${imageError.message}`);
        }
      }

      console.log("Generating content...");
      const result = await model.generateContent(parts);
      console.log("Content generated successfully");

      const generatedText = result.response.text();
      console.log("Response text extracted");

      let content;
      if (contentType === "twitter") {
        content = generatedText
          .split("\n\n")
          .filter((tweet) => tweet.trim() !== "");
      } else {
        content = [generatedText];
      }

      setGeneratedContent(content);

      // Update points
      const updatedUser = await updateUserPoints(
        user.id,
        -POINTS_PER_GENERATION
      );
      if (updatedUser) {
        setUserPoints(updatedUser.points);
      }

      // Save generated content
      const savedContent = await saveGeneratedContent(
        user.id,
        content.join("\n\n"),
        prompt,
        contentType
      );
      if (savedContent) {
        setHistory((prevHistory) => [savedContent, ...prevHistory]);
      }
    } catch (error) {
      console.error("Detailed error in content generation:", {
        error: error,
        message: error.message,
        stack: error.stack,
      });
      setGeneratedContent([
        "An error occurred while generating content: " + error.message,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (item) => {
    setSelectedHistoryItem(item);
    setContentType(item.contentType);
    setPrompt(item.prompt);
    setGeneratedContent(
      item.contentType === "twitter"
        ? item.content.split("\n\n")
        : [item.content]
    );
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
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
      <Navbar />
      <div className="container mx-auto px-4 mb-8 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 mt-14 lg:grid-cols-3 gap-8">
          {/* Left sidebar - History */}
          <div className="hidden lg:block">
            <div
              className="lg:col-span-1 bg-gray-800 rounded-2xl p-6 h-[calc(100vh-12rem)] overflow-y-auto"
              style={{
                scrollbarWidth: "thin" /* For Firefox */,
                scrollbarColor:
                  "#4b5563 #1f2937" /* thumb color and track color */,
              }}
            >
              {/* Custom styles for WebKit browsers */}
              <style jsx>{`
                .lg\\:col-span-1::-webkit-scrollbar {
                  width: 8px; /* Width of the scrollbar */
                }
                .lg\\:col-span-1::-webkit-scrollbar-track {
                  background: #1f2937; /* Track color */
                }
                .lg\\:col-span-1::-webkit-scrollbar-thumb {
                  background-color: #4b5563; /* Thumb color */
                  border-radius: 10px; /* Rounded corners for the thumb */
                }
                .lg\\:col-span-1::-webkit-scrollbar-thumb:hover {
                  background-color: #6b7280; /* Thumb color on hover */
                }
              `}</style>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-400">
                  History
                </h2>
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => handleHistoryItemClick(item)}
                  >
                    <div className="flex items-center mb-2">
                      {item.contentType === "twitter" && (
                        <Twitter className="mr-2 h-5 w-5 text-blue-400" />
                      )}
                      {item.contentType === "instagram" && (
                        <Instagram className="mr-2 h-5 w-5 text-pink-400" />
                      )}
                      {item.contentType === "linkedin" && (
                        <Linkedin className="mr-2 h-5 w-5 text-blue-600" />
                      )}
                      <span className="text-sm font-medium">
                        {item.contentType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      {item.prompt}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 mt-2">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Points display */}
            <div className="bg-gray-800 p-6 rounded-2xl flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Available Points</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {userPoints !== null ? userPoints : "Loading..."}
                  </p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-full transition-colors">
                <Link href="/pricing">Get More Points</Link>
              </Button>
            </div>

            {/* Content generation form */}
            <div className="bg-gray-800 p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Content Type
                </label>
                <Button
                  onClick={() => {
                    setPrompt("");
                    setGeneratedContent([]);
                    setSelectedHistoryItem(null);
                    setImage(null);
                  }}
                  className="text-sm bg-blue-600 text-white hover:text-blue-600 hover:bg-white"
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
                <SelectTrigger className="w-full bg-gray-700 border-none rounded-xl">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800">
                  {contentTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="hover:bg-gray-600"
                    >
                      <div className="flex items-center">
                        {type.value === "twitter" && (
                          <Twitter className="mr-2 h-4 w-4 text-blue-400" />
                        )}
                        {type.value === "instagram" && (
                          <Instagram className="mr-2 h-4 w-4 text-pink-400" />
                        )}
                        {type.value === "linkedin" && (
                          <Linkedin className="mr-2 h-4 w-4 text-blue-600" />
                        )}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium mb-2 text-gray-300"
                >
                  Prompt
                </label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-900 border-none rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-100 caret-blue-500 transition duration-200 text-lg leading-6"
                  tabIndex={0}
                />
              </div>

              {contentType === "instagram" && (
                <div>
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
                      className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-700 rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors"
                    >
                      <Upload className="mr-2 h-5 w-5" />
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  `Generate Content (${POINTS_PER_GENERATION} points)`
                )}
              </Button>
            </div>

            {/* Generated content display */}
            {(selectedHistoryItem || generatedContent.length > 0) && (
              <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
                <h2 className="text-2xl font-semibold text-blue-400">
                  {selectedHistoryItem ? "History Item" : "Generated Content"}
                </h2>
                {contentType === "twitter" ? (
                  <div className="space-y-4">
                    {(selectedHistoryItem
                      ? selectedHistoryItem.content.split("\n\n")
                      : generatedContent
                    ).map((tweet, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 p-4 rounded-xl relative"
                      >
                        <ReactMarkdown
                          className="prose prose-invert max-w-none mb-2 text-sm"
                          rehypePlugins={[rehypeRaw]}
                        >
                          {tweet}
                        </ReactMarkdown>
                        <div className="flex justify-between items-center text-gray-400 text-xs mt-2">
                          <span>
                            {tweet.length}/{MAX_TWEET_LENGTH}
                          </span>
                          <Button
                            onClick={() => copyToClipboard(tweet)}
                            className="bg-gray-600 hover:bg-gray-500 text-white rounded-full p-2 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700 p-4 rounded-xl">
                    <ReactMarkdown
                      className="prose prose-invert max-w-none text-sm"
                      rehypePlugins={[rehypeRaw]}
                    >
                      {selectedHistoryItem
                        ? selectedHistoryItem.content
                        : generatedContent[0]}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {/* Content preview */}
            {generatedContent.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                  Preview
                </h2>
                {renderContentMock()}
              </div>
            )}
          </div>
        </div>

        {/* Floating button for mobile view */}
        <button
          onClick={toggleModal}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition lg:hidden"
        >
          <Clock className="h-6 w-6 text-blue-400" />
        </button>

        {/* Modal for history */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div
              className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-md max-h-[80vh] overflow-y-auto"
              style={{
                scrollbarWidth: "thin" /* For Firefox */,
                scrollbarColor:
                  "#4b5563 #1f2937" /* thumb color and track color */,
              }}
            >
              {/* Custom styles for WebKit browsers */}
              <style jsx>{`
                .overflow-y-auto::-webkit-scrollbar {
                  width: 8px; /* Width of the scrollbar */
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                  background: #1f2937; /* Track color */
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                  background-color: #4b5563; /* Thumb color */
                  border-radius: 10px; /* Rounded corners for the thumb */
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                  background-color: #6b7280; /* Thumb color on hover */
                }
              `}</style>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-blue-400">
                  History
                </h2>
                <button onClick={toggleModal} className="text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => {
                      handleHistoryItemClick(item);
                      toggleModal();
                    }}
                  >
                    <div className="flex items-center mb-2">
                      {item.contentType === "twitter" && (
                        <Twitter className="mr-2 h-5 w-5 text-blue-400" />
                      )}
                      {item.contentType === "instagram" && (
                        <Instagram className="mr-2 h-5 w-5 text-pink-400" />
                      )}
                      {item.contentType === "linkedin" && (
                        <Linkedin className="mr-2 h-5 w-5 text-blue-600" />
                      )}
                      <span className="text-sm font-medium">
                        {item.contentType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      {item.prompt}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 mt-2">
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
