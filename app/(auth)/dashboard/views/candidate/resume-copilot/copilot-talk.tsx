import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  text: string;
  id: number;
  sender: "bot" | "user";
}

const initialMessages: Message[] = [
  {
    text: "Hello!",
    id: 1,
    sender: "bot",
  },
  {
    text: "How can I help you with your resume today?",
    id: 2,
    sender: "bot",
  },
];

interface MessageBubbleProps {
  message: Message;
  isEditing: boolean;
  editText: string;
  onEditStart: () => void;
  onEditChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isEditing,
  editText,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
}) => {
  const isBot = message.sender === "bot";
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.style.height = "auto";
      editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editText]);

  const handleEditKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEditSave();
    }
  };

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isBot
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800"
        } shadow-md`}
      >
        {isEditing ? (
          <div className="w-full">
            <textarea
              ref={editTextareaRef}
              value={editText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                onEditChange(e as unknown as ChangeEvent<HTMLInputElement>)
              }
              onKeyDown={handleEditKeyDown}
              className="w-full mb-2 p-2 bg-white bg-opacity-20 rounded resize-none overflow-hidden text-inherit font-inherit focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                minHeight: "1.5em",
                maxHeight: "150px",
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={onEditSave} variant="ghost" size="sm">
                Save
              </Button>
              <Button onClick={onEditCancel} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.text}
            </p>
            {!isBot && (
              <div className="w-full flex justify-end mt-2">
                <Button
                  onClick={onEditStart}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <Edit2 size={16} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    setLineCount(e.target.value.split("\n").length);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc as unknown as EventListener);
      document.addEventListener(
        "mousedown",
        handleOutsideClick as unknown as EventListener
      );
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener(
        "keydown",
        handleEsc as unknown as EventListener
      );
      document.removeEventListener(
        "mousedown",
        handleOutsideClick as unknown as EventListener
      );
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() !== "") {
      setChatMessages([
        ...chatMessages,
        { text: inputMessage, id: Date.now(), sender: "user" },
      ]);
      setInputMessage("");
    }
  };

  const handleEditStart = (id: number, text: string) => {
    setEditingMessageId(id);
    setEditText(text);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const handleEditSave = (id: number) => {
    const messageIndex = chatMessages.findIndex((msg) => msg.id === id);
    if (messageIndex !== -1) {
      const updatedMessages = [...chatMessages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        text: editText,
      };

      // Remove all messages after the edited message
      setChatMessages(updatedMessages.slice(0, messageIndex + 1));
    }
    setEditingMessageId(null);
    setEditText("");
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg z-40 transition-all duration-300 ease-in-out hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </Button>

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
                <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <X size={24} />
                </Button>
              </div>
              <div className="flex-grow overflow-y-auto mb-4 p-4 rounded">
                {chatMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isEditing={editingMessageId === msg.id}
                    editText={editText}
                    onEditStart={() => handleEditStart(msg.id, msg.text)}
                    onEditChange={handleEditChange}
                    onEditSave={() => handleEditSave(msg.id)}
                    onEditCancel={handleEditCancel}
                  />
                ))}
              </div>
              <form
                onSubmit={handleSendMessage}
                className="flex items-center relative"
              >
                <div className="w-full relative">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
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
                    size={"icon"}
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
    </>
  );
};

export default CustomChatbot;
