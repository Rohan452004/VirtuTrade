import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";

const QUICK_PROMPTS = [
  "What is risk-reward ratio in trading?",
  "Difference between market and limit order?",
  "How should beginners manage position size?",
];

const formatInlineBold = (text) => {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
};

const renderFormattedMessage = (text) => {
  const lines = String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const elements = [];
  let bullets = [];

  const flushBullets = () => {
    if (bullets.length > 0) {
      elements.push(
        <ul key={`bullets-${elements.length}`} className="list-disc pl-5 space-y-1 mt-1">
          {bullets.map((bullet, index) => (
            <li key={index} className="leading-relaxed">
              {formatInlineBold(bullet)}
            </li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("* ")) {
      bullets.push(line.slice(2));
    } else if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
    } else {
      flushBullets();
      elements.push(
        <p key={`line-${idx}`} className="leading-relaxed">
          {formatInlineBold(line)}
        </p>
      );
    }
  });

  flushBullets();
  return elements;
};

const AiChatbot = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! Ask me general trading questions (risk management, order types, market basics).",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const containerClasses = useMemo(
    () =>
      theme === "dark"
        ? "bg-gray-900 border-gray-700"
        : "bg-white border-gray-200",
    [theme]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_WEB_URL}/api/assistant/chat`,
        { question: trimmed }
      );

      const answer =
        response.data?.answer ||
        "I could not generate a response right now. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } catch (error) {
      const errorText =
        error.response?.data?.message || "Failed to contact AI assistant.";
      setMessages((prev) => [...prev, { role: "bot", text: errorText }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    if (isLoading) return;
    setQuestion(prompt);
  };

  return (
    <div className="fixed right-4 bottom-20 lg:bottom-4 z-50 max-w-[calc(100vw-1rem)]">
      {isOpen ? (
        <div
          className={`w-[21rem] sm:w-[23rem] h-[460px] sm:h-[500px] border rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm ${containerClasses}`}
        >
          <div
            className={`flex items-center justify-between px-4 py-2.5 border-b ${
              theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div>
              <h3 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                AI Trading Assistant
              </h3>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Educational only, not financial advice
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`text-lg ${
                theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ×
            </button>
          </div>

          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto p-3 space-y-2.5 ${
              theme === "dark" ? "bg-gray-900" : "bg-white"
            }`}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-sm whitespace-pre-wrap max-w-[88%] ${
                  msg.role === "user"
                    ? "ml-auto bg-emerald-600 text-white"
                    : theme === "dark"
                      ? "mr-auto bg-gray-800 text-gray-100 border border-gray-700"
                      : "mr-auto bg-gray-100 text-gray-900 border border-gray-200"
                }`}
              >
                {msg.role === "bot" ? renderFormattedMessage(msg.text) : msg.text}
              </div>
            ))}
            {isLoading && (
              <div
                className={`mr-10 p-3 rounded-xl text-sm flex items-center gap-2 ${
                  theme === "dark"
                    ? "bg-gray-800 text-gray-100 border border-gray-700"
                    : "bg-gray-100 text-gray-900 border border-gray-200"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:120ms]" />
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse [animation-delay:240ms]" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          <div
            className={`p-3 border-t ${
              theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-thin">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="Ask about trading basics..."
                maxLength={500}
                className={`flex-1 text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 ${
                  theme === "dark"
                    ? "bg-gray-700 text-white placeholder-gray-400"
                    : "bg-white text-gray-900 placeholder-gray-500 border border-gray-300"
                }`}
              />
              <button
                onClick={handleAsk}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-md font-medium shrink-0"
              >
                Send
              </button>
            </div>
            <div className={`mt-1 text-[11px] ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
              {question.length}/500
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white rounded-full px-4 py-3 shadow-xl text-sm font-semibold"
        >
          AI Assistant
        </button>
      )}
    </div>
  );
};

export default AiChatbot;
