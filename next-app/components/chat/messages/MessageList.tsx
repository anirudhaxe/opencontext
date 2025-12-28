"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { UIMessage } from "ai";
import { memo } from "react";
import { Message } from "./Message";
import Image from "next/image";

interface MessageListProps {
  messages: UIMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function MessageListComponent({ messages, messagesEndRef }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <Card className="w-12 h-12 rounded-full brand-gradient flex items-center justify-center mb-4 brand-shadow animate-pulse">
            <Image
              src="/logo.png"
              alt="opencontext-logo"
              width={25}
              height={25}
            />
          </Card>
          <h2 className="text-xl font-semibold mb-2 bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Start a conversation
          </h2>
          <p className="text-muted-foreground">
            Ask me anything! I can help you with questions, tasks, and provide
            information on various topics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="h-full min-w-0">
        <div className="divide-y divide-border/30 w-full">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </ScrollArea>
  );
}

export const MessageList = memo(MessageListComponent);
