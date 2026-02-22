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
import { Send, User as UserIcon, Bot, Calendar, Pill, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export default function PortalPage() {
  const [inputText, setInputText] = useState("");
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
      setTimeout(() => {
        api<ChatMessage>(`/api/chats/${activeChatId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            userId: 'aura-bot',
            text: "I've reviewed your latest clinical report. Everything looks stable, but please continue the current regimen. Do you have specific concerns about your medication?"
          })
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["messages", activeChatId] });
        });
      }, 2000);
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
  }, [messages]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-16rem)] min-h-[500px]">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Portal</h2>
          <Card className="shadow-soft border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                <Calendar className="w-4 h-4 text-medical-blue" /> Upcoming Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-medical-blue border">
                <p className="text-sm font-bold text-slate-900">Regular Checkup</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Oct 24, 2023 • 10:00 AM</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                <Pill className="w-4 h-4 text-medical-stable" /> Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="font-semibold text-slate-700">Lisinopril 10mg</span>
                <Badge variant="outline" className="text-[9px] uppercase">Once Daily</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-700">Metformin 500mg</span>
                <Badge variant="outline" className="text-[9px] uppercase">Twice Daily</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                <FileText className="w-4 h-4 text-medical-urgent" /> Quick Downloads
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Button variant="ghost" className="w-full justify-start text-sm h-auto py-3 px-0 hover:bg-transparent hover:text-medical-blue font-semibold">
                <FileText className="w-4 h-4 mr-2 opacity-50" /> Discharge Summary.pdf
              </Button>
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-2 shadow-soft flex flex-col overflow-hidden h-full border-border">
          <CardHeader className="border-b bg-white py-4 shadow-sm relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center shadow-primary">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Ask Aura</CardTitle>
                <p className="text-[10px] text-medical-stable font-bold uppercase flex items-center gap-1.5 tracking-tighter">
                  <span className="w-1.5 h-1.5 rounded-full bg-medical-stable animate-pulse" /> Clinician Secure Connection
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-slate-50/50">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row-reverse" : "")}>
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                        <div className="w-32 h-10 bg-slate-200 rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  messages?.map((msg) => {
                    const isMe = msg.userId === currentUser.id;
                    const isBot = msg.userId === 'aura-bot';
                    return (
                      <div key={msg.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                        <Avatar className="w-8 h-8 rounded-lg shadow-sm">
                          <AvatarImage src={isMe ? currentUser.avatar : isBot ? '' : `https://i.pravatar.cc/150?u=${msg.userId}`} />
                          <AvatarFallback className={isMe ? "bg-slate-200" : "bg-medical-blue text-white"}>
                            {isBot ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "max-w-[85%] rounded-2xl p-4 shadow-soft text-sm leading-relaxed",
                          isMe ? "bg-medical-blue text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                        )}>
                          <p>{msg.text}</p>
                          <span className={cn("text-[9px] block mt-2 font-bold opacity-60 uppercase tracking-tighter", isMe ? "text-right" : "")}>
                            {format(msg.ts, "p")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-white">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Ask about your record or diagnosis..."
                  className="bg-slate-100 border-none focus-visible:ring-1 focus-visible:ring-medical-blue"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={sendMutation.isPending || !inputText.trim()}
                  className="bg-medical-blue hover:bg-medical-blue/90 text-white shrink-0 shadow-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}