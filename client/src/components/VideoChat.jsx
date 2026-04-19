import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Bot, User } from 'lucide-react';
import { useChatHistory, useSendMessage } from '../hooks/useChat';

export default function VideoChat({ videoId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { data: messages = [], isLoading } = useChatHistory(isOpen ? videoId : null);
  const sendMessage = useSendMessage(videoId);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || sendMessage.isPending) return;
    sendMessage.mutate(message.trim());
    setMessage('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 border border-outline-variant bg-surface text-on-surface px-4 py-3 rounded-full shadow-lg transition-transform hover:-translate-y-1 lg:bottom-8 lg:right-8"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden md:inline text-sm font-semibold tracking-wide">Ask AI Tutor</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[calc(100vw-32px)] sm:w-[400px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-2xl lg:bottom-8 lg:right-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-4 py-3 z-10">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wide text-on-surface">AI Tutor</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-md p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar bg-surface text-sm">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-10 text-center h-full">
            <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center mb-4 text-on-surface-variant">
              <Bot className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-on-surface mb-2">
              Ask me anything about this video
            </p>
            <p className="text-xs font-medium text-on-surface-variant max-w-[200px] mx-auto leading-relaxed">
              I can explain concepts, answer questions, and help you understand the content better.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="mt-1 shrink-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container border border-outline-variant text-on-surface">
                  <Bot className="h-4 w-4" />
                </div>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-on-primary rounded-tr-sm'
                  : 'bg-surface-container text-on-surface border border-outline-variant rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex gap-3 justify-start">
            <div className="mt-1 shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container border border-outline-variant text-on-surface">
                <Bot className="h-4 w-4" />
              </div>
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-outline-variant bg-surface-container px-4 py-2.5 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-outline-variant bg-surface p-3 z-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-full border border-outline-variant bg-surface-container px-4 py-2.5 text-sm font-medium text-on-surface outline-none placeholder-on-surface-variant transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-50 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
