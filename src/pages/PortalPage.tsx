import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Chat, ChatMessage, User } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User as UserIcon, Bot, Calendar, Pill, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export default function PortalPage() {
  const [inputText, setInputText] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  // For simulation, we assume Dr. Thorne is the current clinician (u1)
  const currentUser = { id: 'u1', name: 'Dr. Thorne' };
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
      // Simulate AI/Doctor response after user sends message
      setTimeout(() => {
        api<ChatMessage>(`/api/chats/${activeChatId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ userId: 'u2', text: "I've reviewed your latest clinical report. Everything looks stable, but please continue the current regimen. Do you have specific concerns about your medication?" })
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)] animate-fade-in">
      <div className="lg:col-span-1 space-y-6">
        <h2 className="text-2xl font-bold">Patient Portal</h2>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-medical-blue" /> Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-secondary/50 rounded-lg border-l-4 border-medical-blue">
              <p className="text-sm font-semibold">Regular Checkup</p>
              <p className="text-xs text-muted-foreground">Oct 24, 2023 • 10:00 AM</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
              <Pill className="w-4 h-4 text-medical-stable" /> Active Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Lisinopril 10mg</span>
              <span className="text-xs text-muted-foreground">Once Daily</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Metformin 500mg</span>
              <span className="text-xs text-muted-foreground">Twice Daily</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-medical-urgent" /> Recent Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2">
              Discharge Summary.pdf
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card className="lg:col-span-2 shadow-soft flex flex-col overflow-hidden h-full">
        <CardHeader className="border-b bg-white py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-medical-blue flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Ask Aura</CardTitle>
              <p className="text-xs text-medical-stable font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-medical-stable animate-pulse" /> Clinician Online
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row-reverse" : "")}>
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                      <div className="w-32 h-10 bg-muted rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                messages?.map((msg) => {
                  const isMe = msg.userId === currentUser.id;
                  return (
                    <div key={msg.id} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", isMe ? "bg-accent" : "bg-medical-blue")}>
                        {isMe ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      <div className={cn("max-w-[80%] rounded-2xl p-3 shadow-sm", isMe ? "bg-medical-blue text-white rounded-tr-none" : "bg-secondary text-foreground rounded-tl-none")}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <span className={cn("text-2xs block mt-1 opacity-70", isMe ? "text-right" : "")}>
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
                className="bg-secondary border-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button size="icon" type="submit" disabled={sendMutation.isPending || !inputText.trim()} className="bg-medical-blue hover:bg-medical-blue/90 text-white shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}