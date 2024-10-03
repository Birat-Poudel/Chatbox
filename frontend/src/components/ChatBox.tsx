import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import ChatLogo from "@/assets/Chat.png";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    id: "0",
    content: "Hi! I am your AI assistant. Ask me anything about this website!",
  },
];

async function* getMessageResponse(messages: Message[]): AsyncGenerator<string> {
  const response = await fetch("http://127.0.0.1:8000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!response.body) {
    yield "No response received";
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let aiMessageContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const textChunk = decoder.decode(value, { stream: true });
    for (const char of textChunk) {
      aiMessageContent += char
      yield aiMessageContent
      await new Promise((resolve) => setTimeout(resolve, 0.1))
    }
  }
}

type ChatBoxProps = {
  open: boolean;
  onClose: () => void; 
};

export default function ChatBox({ open, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : initialMessages;
  });

  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const userMessage: Message = {
      id: messages.length.toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: (messages.length + 1).toString(),
        role: "assistant",
        content: "", 
      },
    ]);
    setInput("");
    setIsTyping(true); 

    const currMessages = [...messages, userMessage];
    const aiMessageId = (messages.length + 1).toString();

    let aiMessageContent = "";
    for await (const chunk of getMessageResponse(currMessages)) {
      aiMessageContent = chunk;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: aiMessageContent } : msg
        )
      );
    }

    setIsTyping(false); 
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.currentTarget.value);
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 z-10 w-full max-w-[400px] p-4 xl:right-36",
        open ? "block" : "hidden"
      )}
    >
      <div className="flex flex-col h-[600px] rounded-lg border bg-white shadow-xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-white rounded-t-lg drop-shadow-md">
          <div className="flex items-center">
            <Image src={ChatLogo} alt="Logo" width={40} height={40} />
            <h2 className="ml-2 font-bold font-sans text-xl">Flow</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-red-600">
            <X size={24} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3" ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage message={message} key={message.id} />
          ))}
          {isTyping && (
            <div className="italic text-gray-500 text-sm mt-2 ml-5">
              Assistant is typing...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-white">
          <div className="mb-2 flex justify-between text-sm overflow-x-auto whitespace-nowrap no-scrollbar scrollbar-w-0">
                <Button variant="link" className="text-sm rounded-md bg-gray-200 hover:no-underline mr-2">👋 What is Flow?</Button>
                <Button variant="link" className="text-sm rounded-md bg-gray-200 hover:no-underline mr-2">⚙️ Create Job Post</Button>
                <Button variant="link" className="text-sm rounded-md bg-gray-200 hover:no-underline mr-2">💸 Pricing</Button>
                <Button variant="link" className="text-sm rounded-md bg-gray-200 hover:no-underline mr-2">📄 FAQs</Button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              ref={inputRef}
              className="flex-1 px-4 py-2 bg-gray-200 h-16 w-64 rounded-lg"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message: { role, content } }: { message: Message }) {
  const isAiMessage = role === "assistant";

  return content ? (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAiMessage ? "justify-start" : "justify-end"
      )}
    >
      {isAiMessage &&         
        <Image
          src={ChatLogo}
          alt="AI Logo"
          width={50}
          height={50}
          className="mr-2 shrink-0"
        />}
      <div
        className={cn(
          "rounded-md px-4 py-2 max-w-xs",
          isAiMessage ? "bg-gray-200 text-gray-800" : "bg-blue-500 text-white"
        )}
      >
        {content}
      </div>
    </div>
  ) : null; 
}
