"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage, fetchChatHistory, ChatMessageResponse, fetchUserProfile } from "@/lib/api";
import type { Product } from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  productIds?: number[];
}

const WELCOME_CONTENT =
  "Xin chào! 👋 Mình là trợ lý GlowSkin AI. Mình có thể giúp bạn tìm sản phẩm, kiểm tra đơn hàng hoặc tư vấn làm đẹp. Bạn cần giúp gì nào?";

const QUICK_REPLIES = [
  "Tìm sản phẩm bán chạy",
  "Tư vấn chăm sóc da",
  "Kiểm tra đơn hàng",
  "Chính sách bảo hành",
];

function ChatProductCard({ id }: { id: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/api").then(api => {
      api.fetchProductById(id)
        .then(setProduct)
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    });
  }, [id]);

  if (loading) return <div className="w-32 h-44 bg-muted/20 animate-pulse rounded-xl flex-shrink-0" />;
  if (!product) return null;

  return (
    <a
      href={`/product/${product.slug}`}
      className="flex-shrink-0 w-32 bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={product.images[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badges.includes("sale") && (
          <span className="absolute top-1 left-1 bg-red-500 text-[8px] text-white px-1 rounded-sm font-bold">SALE</span>
        )}
      </div>
      <div className="p-2 space-y-0.5">
        <h4 className="text-[10px] font-bold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
        <p className="text-[9px] text-primary font-bold">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
        </p>
      </div>
    </a>
  );
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_CONTENT,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rate limiting
  const messageTimestamps = useRef<number[]>([]);
  const RATE_LIMIT_MAX = 5;
  const RATE_LIMIT_WINDOW_MS = 30_000;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Unified function to refresh auth and history
  const refreshChatState = useCallback(async (forceHistoryLoad = false) => {
    try {
      // Check latest profile
      await fetchUserProfile();

      const prevLoggedIn = isLoggedIn;
      setIsLoggedIn(true);

      // Load history if opened AND (not loaded OR just logged in OR forced)
      if (isOpen && (!historyLoaded || !prevLoggedIn || forceHistoryLoad)) {
        setIsTyping(true);
        try {
          const rawHistory = await fetchChatHistory();
          // LIMIT: Only load the last 10 messages (5 pairs)
          const history = rawHistory.slice(-3);

          if (history && history.length > 0) {
            const mappedMessages: Message[] = [];
            history.forEach((h: ChatMessageResponse) => {
              mappedMessages.push({
                id: `user-${h.id}`,
                role: "user",
                content: h.message,
                timestamp: new Date(h.createdAt),
              });
              mappedMessages.push({
                id: `bot-${h.id}`,
                role: "assistant",
                content: h.response,
                timestamp: new Date(h.createdAt),
                productIds: h.productIds ? h.productIds.split(',').map(Number) : undefined
              });
            });
            setMessages(mappedMessages);
          } else {
            // Logged in but no history: show welcome only
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content: WELCOME_CONTENT,
                timestamp: new Date(),
              },
            ]);
          }
          setHistoryLoaded(true);
        } catch (e) {
          console.error("Failed to fetch history:", e);
        } finally {
          setIsTyping(false);
        }
      }
    } catch (error) {
      // Guest or Session expired
      const prevLoggedIn = isLoggedIn;
      setIsLoggedIn(false);
      setHistoryLoaded(false);

      // If we just logged out or messages are empty, reset to welcome
      if (prevLoggedIn || messages.length <= 1) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: WELCOME_CONTENT,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [isOpen, isLoggedIn, historyLoaded, messages.length]);

  // Handle Event for Real-time Auth Synchronization
  useEffect(() => {
    const handleAuthChange = () => {
      refreshChatState(true);
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [refreshChatState]);

  // Initial setup & Greeting timer
  useEffect(() => {
    setIsMounted(true);
    // Silent initial check for tooltips etc.
    fetchUserProfile()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));

    const timer = setTimeout(() => setShowTooltip(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus & Refresh on Open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setShowTooltip(false);
      refreshChatState();
    }
  }, [isOpen, refreshChatState]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Rate limiting
      const now = Date.now();
      messageTimestamps.current = messageTimestamps.current.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
      if (messageTimestamps.current.length >= RATE_LIMIT_MAX) {
        const waitSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - messageTimestamps.current[0])) / 1000);
        setMessages(prev => [...prev, {
          id: `rate-${Date.now()}`,
          role: "assistant",
          content: `⏳ Bạn đang hỏi quá nhanh! Vui lòng chờ **${waitSec} giây** trước khi gửi tiếp nhé!`,
          timestamp: new Date(),
        }]);
        return;
      }
      messageTimestamps.current.push(now);

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        let replyContent = "";
        let productIds: number[] | undefined = undefined;

        if (!isLoggedIn) {
          if (trimmed === "Tìm sản phẩm bán chạy") {
            try {
              const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
              const res = await fetch(`${apiBase}/api/public/product/best-sellers?limit=3`);
              const bestSellers = await res.json();
              if (bestSellers && bestSellers.length > 0) {
                replyContent = "Dưới đây là các sản phẩm được yêu thích nhất tại GlowSkin:\n\n";
                bestSellers.forEach((p: any, i: number) => {
                  replyContent += `${i + 1}. **${p.productName}** — Đã bán: ${p.totalQuantity} sản phẩm\n`;
                });
                replyContent += "\n💡 **Đăng nhập** để nhận tư vấn AI cá nhân hóa!";
              } else replyContent = "Hiện chưa có dữ liệu sản phẩm bán chạy.";
            } catch { replyContent = "Rất tiếc, mình thiếu dữ liệu lúc này."; }
          } else if (trimmed === "Tư vấn chăm sóc da") {
            replyContent = "Gợi ý quy trình GlowSkin cơ bản:\n- Sữa rửa mặt\n- Cân bằng\n- Đặc trị\n- Dưỡng ẩm\n\n⚠️ Đăng nhập để AI tư vấn theo loại da của bạn!";
          } else if (trimmed === "Kiểm tra đơn hàng") {
            replyContent = "Vui lòng **Đăng nhập** để kiểm tra trạng thái đơn hàng của bạn nhé! 📦";
          } else if (trimmed === "Chính sách bảo hành") {
            replyContent = "**Chính sách GlowSkin:**\n- 100% Chính hãng\n- Đổi trả 7 ngày\n- Hoàn tiền 200%\n- FreeShip >300k";
          } else {
            replyContent = "Vui lòng **Đăng nhập** để trò chuyện với AI của GlowSkin! 🛒\nHãy thử các gợi ý bên dưới nhé 👇";
          }
        } else {
          // Send chat with truncated history for context
          const chatHistory = messages
            .filter(m => m.id !== "welcome")
            .slice(-6) // Last 6 messages
            .map(m => ({ role: m.role, content: m.content }));

          const result = await sendChatMessage(trimmed, chatHistory);
          replyContent = result.response;
          if (result.product_ids && result.product_ids.length > 0) {
            productIds = result.product_ids;
          }
        }

        const botId = `bot-${Date.now()}`;
        setMessages(prev => [...prev, {
          id: botId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          productIds
        }]);
        
        // Start streaming effect
        setIsTyping(false);
        let i = 0;
        const chunkSize = 2;
        const intervalId = setInterval(() => {
          i += chunkSize;
          if (i > replyContent.length) i = replyContent.length;
          
          setMessages(prev => prev.map(msg => {
            if (msg.id === botId) {
              return { ...msg, content: replyContent.slice(0, i) };
            }
            return msg;
          }));
          
          if (i >= replyContent.length) {
            clearInterval(intervalId);
          }
        }, 15);

      } catch (error) {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Lỗi kết nối. Vui lòng thử lại sau!",
          timestamp: new Date(),
        }]);
        setIsTyping(false);
      }
    },
    [isLoggedIn, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  if (!isMounted) return null;

  return (
    <>
      <div
        className={cn(
          "fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] max-h-[min(600px,calc(100vh-10rem))] rounded-3xl border border-white/20 bg-card/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary via-primary/90 to-primary/80">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-none">GlowSkin Assistant</h3>
              <p className="text-white/70 text-xs mt-1">Sẵn sàng hỗ trợ bạn 24/7</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:rotate-90"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-transparent custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-white/80 dark:bg-slate-800/80 border border-white/20 text-foreground rounded-bl-none"
                )}
              >
                <div className="markdown-content">
                  {msg.content.split('\n').map((line, i) => {
                    let formattedLine = line
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>');
                    if (line.trim().startsWith('- ')) {
                      return <li key={i} dangerouslySetInnerHTML={{ __html: formattedLine.replace('- ', '') }} className="ml-4 list-disc" />;
                    }
                    return <p key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} className={cn(line.trim() === "" ? "h-2" : "mb-1")} />;
                  })}
                </div>

                {/* Product Cards Rendering */}
                {msg.productIds && msg.productIds.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {msg.productIds.map(id => (
                      <ChatProductCard key={id} id={id} />
                    ))}
                  </div>
                )}

                <span className={cn("block text-[10px] mt-1.5 opacity-60", msg.role === "user" ? "text-right" : "text-left")}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 border border-white/20 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-5 py-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-t border-white/10 relative group">
          <div className="flex flex-row overflow-x-auto gap-2 pb-2 custom-scrollbar flex-nowrap mask-gradient">
            {QUICK_REPLIES.map((text) => (
              <button
                key={text}
                onClick={() => handleQuickReply(text)}
                className="flex-shrink-0 whitespace-nowrap text-xs px-4 py-2 rounded-full border border-primary/20 bg-white/50 dark:bg-slate-800/50 text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-t border-white/10">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi trợ lý GlowSkin..."
              className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl pl-5 pr-12 py-3.5 text-sm shadow-inner outline-none ring-1 ring-black/5 focus:ring-primary/40 transition-all placeholder:text-muted-foreground"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={cn(
                "absolute right-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                input.trim() && !isTyping ? "bg-primary text-white shadow-lg" : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" suppressHydrationWarning>
        {showTooltip && !isOpen && (
          <div className="bg-white dark:bg-slate-800 border border-border shadow-xl rounded-2xl px-4 py-2.5 mb-2 animate-in fade-in slide-in-from-right-4 duration-500 relative mr-2">
            <p className="text-sm font-medium pr-4">Bạn cần hỗ trợ gì không? 👋</p>
            <button onClick={() => setShowTooltip(false)} className="absolute top-1 right-1 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-border rotate-45" />
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group relative",
            isOpen ? "bg-slate-100 text-slate-600" : "bg-primary text-white"
          )}
        >
          {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-gradient {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
      `}</style>
    </>
  );
}
