import { useState } from "react";
import ChatBox from "./ChatBox";
import Image from "next/image";
import Chat from "@/assets/Chat.png";
import React from "react";

export default function ChatButton() {
  const [chatBoxOpen, setChatBoxOpen] = useState(false);

  const handleImageClick = () => {
    setChatBoxOpen(prev => !prev);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4"> {/* Position the image */}
        <Image
          onClick={handleImageClick}
          src={Chat}
          alt="Chat button"
          width={100}
          height={100}
          className="cursor-pointer"
        />
      </div>
      {chatBoxOpen && <ChatBox open={chatBoxOpen} onClose={() => setChatBoxOpen(false)} />}
    </>
  );
}
