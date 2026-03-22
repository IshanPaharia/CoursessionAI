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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 lg:bottom-8 lg:right-8"
      >
        <MessageCircle className="h-5 w-5" />
        Ask AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl shadow-purple-500/10 lg:bottom-8 lg:right-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#111118] px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-400" />
          <span className="text-sm font-semibold text-white">AI Tutor</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1 text-gray-400 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bot className="mb-3 h-10 w-10 text-purple-400/50" />
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
                <Bot className="h-5 w-5 text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-500/20 text-purple-100'
                  : 'bg-white/5 text-gray-300'
              }`}
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
            <Bot className="mt-1 h-5 w-5 shrink-0 text-purple-400" />
            <div className="rounded-xl bg-white/5 px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-white/5 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border border-white/10 bg-[#111118] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            className="rounded-lg bg-purple-500/20 px-3 py-2 text-purple-400 transition-colors hover:bg-purple-500/30 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
