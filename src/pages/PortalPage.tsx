import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Chat, ChatMessage } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User as UserIcon, Bot, Calendar, Pill, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export default function PortalPage() {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = { id: 'u1', name: 'Dr. Thorne', avatar: 'https://i.pravatar.cc/150?u=u1' };
  const { data: chats } = useQuery<{ items: Chat[] }>({
    queryKey: ["chats"],
    queryFn: () => api<{ items: Chat[] }>("/api/chats"),
  });
  const activeChatId = chats?.items[0]?.id;
  const { data: messages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["messages", activeChatId],
    queryFn: () => api<ChatMessage[]>(`/api/chats/${activeChatId}/messages`),
    enabled: !!activeChatId,
    refetchInterval: 3000,
  });
  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      api<ChatMessage>(`/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id, text })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeChatId] });
      // Simulate AI thinking and response
      setTimeout(() => setIsTyping(true), 500);
      setTimeout(() => {
        api<ChatMessage>(`/api/chats/${activeChatId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            userId: 'aura-bot',
            text: "I've analyzed the patient's record. Vital signs are within the normal range for post-op. Recommend continuing the Lisinopril as prescribed. Should I flag any specific fluctuations for your next round?"
          })
        }).then(() => {
          setIsTyping(false);
          queryClient.invalidateQueries({ queryKey: ["messages", activeChatId] });
        });
      }, 2500);
    }
  });
  const handleSend = () => {
    if (!inputText.trim() || sendMutation.isPending) return;
    sendMutation.mutate(inputText.trim());
    setInputText("");
  };
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-16rem)] min-h-[600px]">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Portal</h2>
            <p className="text-xs text-muted-foreground font-medium">Internal Secure Communication</p>
          </div>
          <Card className="shadow-soft border-border bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                <Calendar className="w-4 h-4 text-medical-blue" /> Next Care Meeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-medical-blue border">
                <p className="text-sm font-bold text-slate-900">Multidisciplinary Review</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase">Today • 2:00 PM • Room 402</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                <Pill className="w-4 h-4 text-medical-stable" /> Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between items-center text-xs border-b pb-2">
                <span className="font-semibold text-slate-700">Refill Request</span>
                <Badge className="bg-medical-urgent/10 text-medical-urgent border-none h-4 px-1.5 text-[9px]">HIGH</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Lab Results Pending</span>
                <Badge className="bg-medical-observation/10 text-medical-observation border-none h-4 px-1.5 text-[9px]">WAIT</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-3 shadow-soft flex flex-col overflow-hidden h-full border-border bg-white">
          <CardHeader className="border-b bg-white py-4 shadow-sm relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-medical-blue flex items-center justify-center shadow-primary">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Ask Aura</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-medical-stable animate-pulse" />
                  <span className="text-[10px] text-medical-stable font-bold uppercase tracking-tighter">
                    AI Clinical Assistant Online
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-slate-50/30">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                {/* System Message */}
                <div className="flex justify-center">
                  <span className="bg-slate-200/50 text-slate-500 text-[9px] font-bold uppercase py-1 px-3 rounded-full border border-slate-200/60">
                    Encryption Active • HIPAA Compliant Session
                  </span>
                </div>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row-reverse" : "")}>
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                        <div className="w-48 h-12 bg-slate-200 rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {messages?.map((msg) => {
                      const isMe = msg.userId === currentUser.id;
                      const isBot = msg.userId === 'aura-bot';
                      return (
                        <div key={msg.id} className={cn("flex gap-3 items-start", isMe ? "flex-row-reverse" : "")}>
                          <Avatar className={cn("w-9 h-9 shadow-sm border border-slate-100 shrink-0", isMe ? "rounded-lg" : "rounded-xl")}>
                            <AvatarImage src={isMe ? currentUser.avatar : undefined} />
                            <AvatarFallback className={isMe ? "bg-slate-200 text-slate-600" : "bg-medical-blue text-white"}>
                              {isBot ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                            isMe ? "bg-medical-blue text-white rounded-tr-none shadow-primary" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                          )}>
                            <p className="font-medium">{msg.text}</p>
                            <span className={cn("text-[9px] block mt-2 font-bold opacity-60 uppercase tracking-tighter", isMe ? "text-right" : "")}>
                              {format(msg.ts, "h:mm a")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex gap-3 items-start">
                        <Avatar className="w-9 h-9 rounded-xl shadow-sm border border-slate-100 shrink-0 bg-medical-blue text-white">
                          <Bot className="w-5 h-5" />
                        </Avatar>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                          <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-white relative z-10">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Ask Aura about a patient's clinical history or lab trends..."
                  className="bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-medical-blue py-6 px-5 rounded-xl"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={sendMutation.isPending || !inputText.trim() || isTyping}
                  className="bg-medical-blue hover:bg-medical-blue/90 text-white shrink-0 shadow-primary w-12 h-12 rounded-xl"
                >
                  {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}