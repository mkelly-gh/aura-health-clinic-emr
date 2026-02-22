import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Chat, ChatMessage, Patient } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, ShieldCheck, Search, Loader2, User, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
export default function PortalPage() {
  const [inputText, setInputText] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = { id: 'u1', name: 'Dr. Thorne' };
  const { data: chats } = useQuery<{ items: Chat[] }>({
    queryKey: ["chats"],
    queryFn: () => api<{ items: Chat[] }>("/api/chats"),
  });
  const activeChat = chats?.items[0];
  const { data: patient } = useQuery<Patient>({
    queryKey: ["patient", activeChat?.patientId],
    queryFn: () => api<Patient>(`/api/patients/${activeChat?.patientId}`),
    enabled: !!activeChat?.patientId,
  });
  const { data: serverMessages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["messages", activeChat?.id],
    queryFn: () => api<ChatMessage[]>(`/api/chats/${activeChat?.id}/messages`),
    enabled: !!activeChat?.id,
    refetchInterval: 5000,
  });
  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      api<{ userMsg: ChatMessage, aiMsg: ChatMessage }>(`/api/chats/${activeChat?.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ userId: currentUser.id, text })
      }),
    onMutate: async (newText) => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: ChatMessage = {
        id: tempId,
        chatId: activeChat?.id || '',
        userId: currentUser.id,
        text: newText,
        ts: Date.now()
      };
      setOptimisticMessages(prev => [...prev, optimisticMsg]);
      setInputText("");
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      return { tempId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeChat?.id] });
      setOptimisticMessages([]);
    },
    onError: () => {
      setOptimisticMessages([]);
    }
  });
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [serverMessages, optimisticMessages]);
  const combinedMessages = [...(serverMessages ?? []), ...optimisticMessages];
  const QUICK_PROMPTS = [
    "Summarize current vitals",
    "Check medication adherence",
    "Explain latest lab results",
    "Review surgical history"
  ];
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() && !sendMutation.isPending) {
      sendMutation.mutate(inputText.trim());
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 animate-fade-in h-[calc(100vh-64px)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
        <div className="lg:col-span-1 space-y-6 hidden lg:block overflow-y-auto pr-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ask Aura</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Clinical Intelligence</p>
          </div>
          <Card className="border-border shadow-soft bg-white">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-medical-blue" /> Active Context
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {patient && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                      <AvatarImage src={patient.avatarUrl} />
                      <AvatarFallback>{patient.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate text-slate-900">{patient.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{patient.mrn}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Suggested Inquiries</p>
            {QUICK_PROMPTS.map(p => (
              <Button
                key={p}
                variant="outline"
                className="w-full justify-start text-[11px] font-bold text-slate-600 hover:text-medical-blue hover:bg-medical-blue/5 border-slate-200 rounded-xl h-auto py-3"
                onClick={() => setInputText(p)}
                disabled={sendMutation.isPending}
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 text-medical-blue" /> {p}
              </Button>
            ))}
          </div>
        </div>
        <Card className="lg:col-span-3 border-border shadow-soft flex flex-col bg-white overflow-hidden">
          <CardHeader className="border-b flex flex-row items-center justify-between py-4 px-6 shrink-0 z-50 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center shadow-primary"><Bot className="w-6 h-6 text-white" /></div>
              <div>
                <CardTitle className="text-lg font-bold">Aura-3.8b Instructor</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-medical-stable animate-pulse" />
                  <span className="text-[10px] font-bold text-medical-stable uppercase tracking-tighter">Record-Aware Active</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-slate-50/30">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8 max-w-4xl mx-auto">
                {combinedMessages.map((msg) => {
                  const isMe = msg.userId === currentUser.id;
                  const isBot = msg.userId === 'aura-bot';
                  return (
                    <div key={msg.id} className={cn("flex gap-4 items-start", isMe ? "flex-row-reverse" : "animate-in slide-in-from-left-2")}>
                      <Avatar className={cn("w-10 h-10 border-2 border-white shadow-sm shrink-0", isMe ? "rounded-lg" : "rounded-xl")}>
                        <AvatarFallback className={isMe ? "bg-slate-200 text-slate-600" : "bg-medical-blue text-white"}>
                          {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm leading-relaxed",
                        isMe ? "bg-medical-blue text-white rounded-tr-none shadow-primary" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                      )}>
                        <p className={cn("font-medium", isBot && "font-sans whitespace-pre-line")}>
                          {msg.text.split(/(\[.*?\])/).map((part, i) =>
                            part.startsWith('[') ? <strong key={i} className="text-medical-blue">{part}</strong> : part
                          )}
                        </p>
                        <span className={cn("text-[9px] font-bold block mt-2 opacity-50 uppercase tracking-tighter", isMe ? "text-right" : "")}>
                          {format(msg.ts, "h:mm a")}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {sendMutation.isPending && (
                  <div className="flex gap-4 items-start">
                    <Avatar className="w-10 h-10 rounded-xl bg-medical-blue text-white flex items-center justify-center shrink-0">
                      <Bot className="w-6 h-6" />
                    </Avatar>
                    <div className="bg-white border p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-medical-blue" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aura is analyzing clinical history...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} className="h-4" />
              </div>
            </ScrollArea>
            <div className="p-4 bg-white border-t z-10">
              <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  placeholder="Query clinical trends, medications, or historical patterns..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-medical-blue py-6 px-6 rounded-xl text-sm font-medium"
                  disabled={sendMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim() || sendMutation.isPending}
                  className="bg-medical-blue hover:bg-medical-blue/90 text-white shadow-primary h-12 w-12 rounded-xl shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}