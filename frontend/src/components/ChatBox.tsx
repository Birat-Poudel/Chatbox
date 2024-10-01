import { useState, useEffect, useRef } from "react";
import { X, Bot, Trash } from "lucide-react";
import Image from "next/image";
import ChatLogo from "@/assets/Chat.png"; // Replace with your logo
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { cn } from "@/lib/utils";

export default function ChatBox({ open, onClose }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat();

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <div className={cn("fixed bottom-0 right-0 z-10 w-full max-w-[400px] p-4 xl:right-36", open ? "block" : "hidden")}>
      <div className="flex flex-col h-[600px] rounded-lg border bg-white shadow-xl relative">
        {/* Header with Logo and Close Button */}
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
          {isLoading && lastMessageIsUser && (
            <ChatMessage message={{ role: "assistant", content: "Thinking..." }} />
          )}
          {error && (
            <ChatMessage message={{ role: "assistant", content: "Something went wrong. Please try again." }} />
          )}
          {!error && messages.length === 0 && (
            <div className="flex h-full items-center justify-center gap-3">
              {/* Placeholder or any content when there's no message */}
            </div>
          )}
        </div>

        {/* Footer with Input and Actions */}
        <div className="p-3 border-t bg-white">
            <div className="mb-2 flex justify-between text-sm overflow-x-auto whitespace-nowrap no-scrollbar scrollbar-w-0">
                <Button variant="link" className="text-sm rounded-md bg-gray-100 hover:no-underline mr-2">👋 What is Flow?</Button>
                <Button variant="link" className="text-sm rounded-md bg-gray-100 hover:no-underline mr-2">⚙️ Create Job Post</Button>
                <Button variant="link" className="text-sm rounded-md bg-gray-100 hover:no-underline mr-2">💸 Pricing</Button>
                <Button variant="link" className="text-sm rounded-md bg-gray-100 hover:no-underline mr-2">📄 FAQs</Button>
            </div>
        
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              ref={inputRef}
              className="flex-1 px-4 py-2 bg-gray-100 h-16 w-64 rounded-lg"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message: { role, content } }) {
  const isAiMessage = role === "assistant";

  return (
    <div className={cn("mb-3 flex items-center", isAiMessage ? "justify-start" : "justify-end")}>
      {isAiMessage && <Bot className="mr-2 shrink-0" />}
      <div className={cn("rounded-md px-4 py-2 max-w-xs", isAiMessage ? "bg-gray-200 text-gray-800" : "bg-blue-500 text-white")}>
        {content}
      </div>
    </div>
  );
}