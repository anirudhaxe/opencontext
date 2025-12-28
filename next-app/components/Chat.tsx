"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { DefaultChatTransport, generateId, UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "./chat/sidebar";
import { MessageList } from "./chat/messages";
import { MultimodalInput } from "./chat/multimodal-input";
import { JobsSection } from "./chat/jobs-section";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { X } from "lucide-react";

export default function Chat({
  id,
  initialMessages,
}: {
  id: string; // chatId
  initialMessages?: UIMessage[];
}) {
  const router = useRouter();

  const isChatTitleGenerated = useRef(
    initialMessages ? initialMessages?.length >= 2 : false,
  );

  const selectedJobRef = useRef<{ jobId: string; jobName: string }[]>([]);

  // const trpcUtils = trpc.useUtils();
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(id);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<
    { jobId: string; jobName: string }[]
  >([]);

  // Memoize setInput to prevent unnecessary re-renders
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  // track ref between re-renders
  useEffect(() => {
    selectedJobRef.current = selectedJobs;
  }, [selectedJobs]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], refetch } = trpc.chat.getChats.useQuery();

  const { messages, sendMessage, status, stop } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest({ messages, id }) {
        return {
          body: {
            message: messages[messages.length - 1],
            id,
            jobIds: selectedJobRef.current.map((job) => job.jobId),
          },
        };
      },
    }),
    onFinish: async ({ messages: newMessages }) => {
      if (isChatTitleGenerated.current === false && newMessages?.length >= 2) {
        generateChatTitle({
          messages: newMessages,
          chatId: id,
        });
        isChatTitleGenerated.current = true;
      } else {
        // await trpcUtils.chat.getChats.invalidate({ userId });
        await refetch();
      }
    },
  });

  const { mutate: mutateChatDeletion } = trpc.chat.deleteChat.useMutation({
    onSuccess: async () => {
      await refetch();
    },
  });

  const { mutate: generateChatTitle } = trpc.chat.generateChatTitle.useMutation(
    {
      onSuccess: async () => {
        await refetch();
      },
    },
  );

  const handleChatDeletion = useCallback(({ chatId }: { chatId: string }) => {
    mutateChatDeletion({
      chatId,
    });
  }, [mutateChatDeletion]);

  // scroll to bottom when messages populate
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSidebarNewChat = useCallback(() => {
    router.push(`/chat/${generateId()}`, { scroll: false });
  }, [router]);

  const handleThreadSelect = useCallback((threadId: string) => {
    setSelectedThreadId(threadId);
    router.push(`/chat/${threadId}`);
  }, [router]);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(!isDarkMode);
    // TODO: implement theme toggle
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-linear-to-br from-background via-background to-card">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNewChat={handleSidebarNewChat}
          threads={threads}
          selectedThreadId={selectedThreadId}
          onThreadSelect={handleThreadSelect}
          isUserMenuOpen={isUserMenuOpen}
          onUserMenuToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          isMobile={false}
          handleChatDeletion={handleChatDeletion}
        />
      </div>

      {/* Floating Sidebar Toggle Button - Shows when sidebar is collapsed */}
      {isSidebarCollapsed && (
        <Button
          onClick={() => setIsSidebarCollapsed(false)}
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute left-4 top-4 z-10 p-2 brand-hover rounded-lg transition-all duration-200 hover:scale-105 brand-shadow-sm brand-glass border border-border/50 cursor-pointer"
          title="Expand sidebar"
        >
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} />
            <line x1="9" y1="4" x2="9" y2="20" strokeWidth={2} />
          </svg>
        </Button>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          isCollapsed={false}
          onToggle={() => {}} // No-op for mobile - close by clicking outside
          onNewChat={handleSidebarNewChat}
          threads={threads}
          selectedThreadId={selectedThreadId}
          onThreadSelect={handleThreadSelect}
          isUserMenuOpen={isUserMenuOpen}
          onUserMenuToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          isMobile={true}
          handleChatDeletion={handleChatDeletion}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="ghost"
            size="icon"
            className="p-2 brand-hover rounded-lg transition-all duration-200 hover:scale-105"
          >
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} />
              <line x1="9" y1="4" x2="9" y2="20" strokeWidth={2} />
            </svg>
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          <MessageList messages={messages} messagesEndRef={messagesEndRef} />
        </div>

        {/* Selected Jobs Context */}
        {selectedJobs.length > 0 && (
          <div className="mx-auto flex w-full max-w-4xl px-2 md:px-4">
            <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-3 brand-shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Selected Context:
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedJobs.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedJobs([])}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted/50 p-0"
                  title="Clear all selected context"
                >
                  <X className="size-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedJobs.map((job) => (
                  <Badge
                    key={job.jobId}
                    variant="default"
                    className="text-xs flex items-center gap-1"
                  >
                    {(() => {
                      // show clipped name in the badge
                      const words = job.jobName.split(" ");
                      if (words.length <= 3) return job.jobName;
                      return words.slice(0, 3).join(" ") + "...";
                    })()}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setSelectedJobs((prev) =>
                          prev.filter(
                            (selectedJob) => selectedJob.jobId !== job.jobId,
                          ),
                        )
                      }
                      className="h-3 w-3 p-0 ml-1 hover:bg-primary-foreground/20 rounded-full shrink-0"
                    >
                      <X className="size-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="relative z-10 mx-auto flex w-full max-w-4xl gap-2 border-t border-border/50 bg-linear-to-t from-card via-card/80 to-transparent px-2 pb-3 md:px-4 md:pb-4 pt-2">
          <MultimodalInput
            input={input}
            setInput={handleInputChange}
            status={status}
            stop={stop}
            sendMessage={sendMessage}
          />
        </div>

        {/* Jobs Section */}
        <JobsSection
          selectedJobs={selectedJobs}
          onJobSelectionChange={setSelectedJobs}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
