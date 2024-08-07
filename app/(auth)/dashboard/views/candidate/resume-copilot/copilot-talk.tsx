import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChat, Message as AIMessage } from "ai/react";

interface NextStep {
  message: string;
  suggestion: string;
  reasoning: string;
}

interface CopilotTalkProps {
  isOpen: boolean;
  onClose: () => void;
  nextSteps: NextStep[];
  setNextSteps: React.Dispatch<React.SetStateAction<NextStep[]>>;
}

const CopilotTalk: React.FC<CopilotTalkProps> = ({
  isOpen,
  onClose,
  nextSteps,
  setNextSteps,
}) => {
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      api: "/api/hey-coach",
    });

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  const addNextStepMessages = useCallback(() => {
    const newNextStepMessages = nextSteps
      .filter((step) => !messages.some((msg) => msg.content === step.message))
      .map(
        (step): AIMessage => ({
          id: `nextstep-${Date.now()}-${Math.random()}`,
          content: step.message,
          role: "assistant",
        })
      );

    if (newNextStepMessages.length > 0) {
      setMessages((prevMessages) => [...prevMessages, ...newNextStepMessages]);
    }
  }, [nextSteps, messages, setMessages]);

  useEffect(() => {
    addNextStepMessages();
  }, [nextSteps, addNextStepMessages]);

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
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
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
  }, [isOpen, onClose]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={chatRef}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed bottom-4 right-4 rounded-lg shadow-2xl overflow-hidden z-50 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg"
          style={{ width: "400px", height: "calc(100vh - 2rem)" }}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-400">
              <h2 className="text-xl font-bold text-white">Talent</h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <X size={24} />
              </Button>
            </div>
            <div className="flex-grow overflow-y-auto mb-4 p-4 rounded">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "assistant" ? "justify-start" : "justify-end"
                  } mb-4`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
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
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>
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
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
                  className="absolute right-2 top-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  <Send size={16} />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CopilotTalk;
