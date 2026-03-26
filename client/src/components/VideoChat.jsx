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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 lg:bottom-8 lg:right-8"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
        }}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[450px] sm:h-[500px] w-[calc(100vw-48px)] sm:w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl lg:bottom-8 lg:right-8" style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: '0 8px 40px rgba(249, 115, 22, 0.08)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08), transparent)' }}>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-bold text-white">AI Tutor</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1 text-gray-400 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bot className="mb-3 h-10 w-10 text-amber-400/40" />
            <p className="text-sm text-gray-400">
              Ask me anything about this video!
            </p>
            <p className="mt-1 text-xs text-gray-500">
              I can explain concepts, answer questions, and help you understand the content.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="mt-1 shrink-0">
                <Bot className="h-5 w-5 text-amber-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'text-amber-100'
                  : 'bg-white/5 text-gray-300'
              }`}
              style={msg.role === 'user' ? { background: 'rgba(251, 146, 60, 0.15)' } : {}}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="mt-1 shrink-0">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex gap-2">
            <Bot className="mt-1 h-5 w-5 shrink-0 text-amber-400" />
            <div className="rounded-xl bg-white/5 px-3 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-white/[0.06] p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="input-field flex-1 !py-2"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            className="rounded-xl px-3 py-2 text-amber-400 transition-colors disabled:opacity-50"
            style={{ background: 'rgba(251, 146, 60, 0.15)' }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
