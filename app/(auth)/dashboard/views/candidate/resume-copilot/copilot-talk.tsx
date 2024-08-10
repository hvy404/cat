import React, { useState, useEffect, useRef, useCallback, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Send, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChat, Message as AIMessage } from "ai/react";
import ReactMarkdown from "react-markdown";
import EnhancedViewMorePanel from "./enhanced-view-more-panel";
import { NextStep } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/types";
import cranium from "./cranium";
import { useUser } from "@clerk/nextjs";

interface ExtendedAIMessage extends AIMessage {
  nextStep?: NextStep;
}

interface CopilotTalkProps {
  isOpen: boolean;
  onClose: () => void;
  nextSteps: NextStep[];
  builderSession: string;
}

const CopilotTalk: React.FC<CopilotTalkProps> = ({
  isOpen,
  onClose,
  nextSteps,
  builderSession,
}) => {
  const { user: clerkUser } = useUser();
  const userId = clerkUser?.publicMetadata?.cuid as string | undefined;

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [viewMoreOpen, setViewMoreOpen] = useState<string | null>(null);
  const [isMessageComplete, setIsMessageComplete] = useState(false);
  const [localMessages, setLocalMessages] = useState<ExtendedAIMessage[]>([]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
  } = useChat({
    experimental_prepareRequestBody: ({ messages }) => {
      return messages[messages.length - 1].content;
    },
    api: "/api/hey-coach",
    headers: {
      "Content-Type": "application/json",
      "Magic-Rail": builderSession,
      "Magic-Gate": userId!,
    },
    onFinish: () => setIsMessageComplete(true),
  });

  const addNextStepMessages = useCallback(() => {
    const newNextStepMessages = nextSteps
      .filter((step) => !messages.some((msg) => msg.content === step.message))
      .map(
        (step): ExtendedAIMessage => ({
          id: `nextstep-${Date.now()}-${Math.random()}`,
          content: step.message,
          role: "assistant",
          nextStep: step,
        })
      );

    if (newNextStepMessages.length > 0) {
      setMessages((prevMessages) => [...prevMessages, ...newNextStepMessages]);
    }
  }, [nextSteps, messages, setMessages]);

  useEffect(() => {
    addNextStepMessages();
  }, [nextSteps, addNextStepMessages]);

  const handleStoreToLocal = () => {
    setLocalMessages(messages);
    setIsMessageComplete(false);
  }

  const handleCraniumChatHistory = () => {
    cranium(builderSession, userId!, {
      cacheKeyType: "chat",
      items: localMessages,
    });
  };
  
  useEffect(() => {
    if (isMessageComplete)
      handleStoreToLocal();
    handleCraniumChatHistory();
  }, [isMessageComplete]);


  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    setLineCount(e.target.value.split("\n").length);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        !viewMoreOpen
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose, viewMoreOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleEditStart = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditText(content);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };

  const handleEditSave = (id: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === id ? { ...msg, content: editText } : msg
      )
    );
    setEditingMessageId(null);
    setEditText("");
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleViewMore = (id: string) => {
    setViewMoreOpen(viewMoreOpen === id ? null : id);
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!userId) {
    return <div>You must be logged in.</div>;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-4 right-4 flex items-end space-x-4 z-50">
          <AnimatePresence>
            {viewMoreOpen && (
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="rounded-lg shadow-2xl overflow-hidden"
                style={{ width: "300px", height: "calc(100vh - 2rem)" }}
              >
                <EnhancedViewMorePanel
                  message={
                    (messages.find((msg) => msg.id === viewMoreOpen) as any)
                      ?.nextStep
                  }
                  onClose={() => setViewMoreOpen(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={chatRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="rounded-lg shadow-2xl overflow-hidden bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg"
            style={{ width: "400px", height: "calc(100vh - 2rem)" }}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-400">
                <h2 className="text-xl font-bold text-white">Talent</h2>
                <Button
                  onClick={() => {
                    setViewMoreOpen(null);
                    onClose();
                  }}
                  variant="link"
                  size="sm"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <X size={24} />
                </Button>
              </div>
              <div
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto p-4 rounded"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "assistant" ? "justify-start" : "justify-end"
                    } mb-4`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-lg ${
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800"
                      } shadow-md`}
                    >
                      {editingMessageId === msg.id ? (
                        <div className="w-full">
                          <textarea
                            value={editText}
                            onChange={handleEditChange}
                            className="w-full mb-2 p-2 bg-white bg-opacity-20 rounded resize-none overflow-hidden text-inherit font-inherit focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{
                              minHeight: "1.5em",
                              maxHeight: "150px",
                            }}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleEditSave(msg.id)}
                              variant="ghost"
                              size="sm"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={handleEditCancel}
                              variant="ghost"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <ReactMarkdown
                            className="text-sm break-words whitespace-pre-wrap markdown-content"
                            components={{
                              p: ({ node, ...props }) => <p {...props} />,
                              h1: ({ node, ...props }) => (
                                <h1 className="text-xl font-bold" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2
                                  className="text-lg font-semibold"
                                  {...props}
                                />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul
                                  className="list-disc list-inside"
                                  {...props}
                                />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol
                                  className="list-decimal list-inside"
                                  {...props}
                                />
                              ),
                              code: ({ node, ...props }) => (
                                <code
                                  className="bg-gray-100 rounded px-1"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>

                          {msg.role === "user" && (
                            <div className="w-full flex justify-end mt-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() =>
                                        handleEditStart(msg.id, msg.content)
                                      }
                                      variant="ghost"
                                      size="sm"
                                      className="p-1"
                                    >
                                      <Edit2 size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-white text-xs bg-black border-none">
                                    <p>Edit message</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                          {msg.role === "assistant" &&
                            (msg as any).nextStep && (
                              <div className="mt-2">
                                <Button
                                  onClick={() => handleViewMore(msg.id)}
                                  variant="link"
                                  size="sm"
                                  className="text-white hover:text-blue-200 transition-colors duration-200"
                                >
                                  {viewMoreOpen === msg.id ? (
                                    <ChevronRight size={16} className="mr-1" />
                                  ) : (
                                    <ChevronDown size={16} className="mr-1" />
                                  )}
                                  {viewMoreOpen === msg.id
                                    ? "Hide Details"
                                    : "View Next Steps"}
                                </Button>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex items-center relative"
              >
                <div className="w-full relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={(
                      e: React.KeyboardEvent<HTMLTextAreaElement>
                    ) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }}
                    placeholder="Type your message..."
                    className="w-full p-2 pr-12 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded-lg resize-none overflow-hidden placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[40px] max-h-[120px] pb-6"
                  />
                  {lineCount <= 2 && (
                    <span className="absolute bottom-1 left-2 text-xs text-gray-400 pb-1">
                      Shift+Return for new line
                    </span>
                  )}
                  <Button
                    type="submit"
                    size="icon"
                    // Disable if isLoading is true
                    disabled={isLoading}
                    className="absolute right-2 top-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CopilotTalk;
