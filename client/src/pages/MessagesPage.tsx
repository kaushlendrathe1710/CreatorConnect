import { InstagramLayout } from "@/components/InstagramLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const { toast } = useToast();

  const { data: conversations = [], isLoading: loadingConversations } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<any[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/conversations/${selectedConversation}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessageInput("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedConversation) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  if (loadingConversations) {
    return (
      <InstagramLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </InstagramLayout>
    );
  }

  return (
    <InstagramLayout>
      <div className="h-[calc(100vh-64px)] flex border-l">
        {/* Conversations List */}
        <div className="w-96 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No messages yet
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = conversation.participants?.find(
                  (p: any) => p.userId !== conversation.currentUserId
                )?.user;
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 flex items-center gap-3 hover-elevate transition-colors ${
                      selectedConversation === conversation.id ? "bg-accent" : ""
                    }`}
                    data-testid={`conversation-${conversation.id}`}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUser?.profileImageUrl} />
                      <AvatarFallback>{otherUser?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{otherUser?.username || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage || "Start a conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your Messages</h3>
                <p className="text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Message Header */}
              <div className="p-4 border-b flex items-center gap-3">
                {conversations.find((c) => c.id === selectedConversation)?.participants?.map((p: any) => {
                  if (p.userId === conversations.find((c) => c.id === selectedConversation)?.currentUserId) return null;
                  return (
                    <div key={p.userId} className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={p.user?.profileImageUrl} />
                        <AvatarFallback>{p.user?.username?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{p.user?.username}</span>
                    </div>
                  );
                })}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <p className="text-center text-muted-foreground">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((message: any) => {
                    const isOwn = message.senderId === conversations.find((c) => c.id === selectedConversation)?.currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </InstagramLayout>
  );
}
