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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 border-[3px] border-black bg-[#facc15] px-5 py-3 text-sm font-black uppercase tracking-widest text-black brutal-shadow transition-transform hover:-translate-y-1 hover:-translate-x-1 lg:bottom-8 lg:right-8"
      >
        <MessageCircle className="h-5 w-5 stroke-[2.5px]" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[450px] sm:h-[500px] w-[calc(100vw-48px)] sm:w-[400px] flex-col overflow-hidden border-[3px] border-black bg-white brutal-shadow lg:bottom-8 lg:right-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[3px] border-black bg-[#ff99e6] px-4 py-3 brutal-shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 stroke-[2px] text-black" />
          <span className="text-base font-black uppercase tracking-widest text-black">AI Tutor</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-none border-[2px] border-black bg-white p-1 text-black brutal-shadow-sm transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5"
        >
          <X className="h-5 w-5 stroke-[3px]" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar bg-gray-50">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bot className="mb-4 h-12 w-12 text-black stroke-[1.5px] opacity-20" />
            <p className="text-sm font-black uppercase tracking-widest text-black mb-2">
              Ask me anything about this video!
            </p>
            <p className="text-xs font-bold text-gray-500 max-w-[200px] mx-auto leading-relaxed">
              I can explain concepts, answer questions, and help you understand the content.
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
                <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-white brutal-shadow-sm">
                  <Bot className="h-5 w-5 text-black stroke-[2px]" />
                </div>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-none border-[3px] border-black px-4 py-3 text-sm font-medium brutal-shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#ff8c00] text-black'
                  : 'bg-white text-black'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="mt-1 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-white brutal-shadow-sm">
                  <User className="h-5 w-5 text-black stroke-[2.5px]" />
                </div>
              </div>
            )}
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex gap-3">
            <div className="mt-1 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-white brutal-shadow-sm">
                <Bot className="h-5 w-5 text-black stroke-[2px]" />
              </div>
            </div>
            <div className="rounded-none border-[3px] border-black bg-white px-4 py-3 brutal-shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-black stroke-[3px]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t-[3px] border-black bg-white p-3 z-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-none border-[3px] border-black bg-white px-3 py-2 text-sm font-bold text-black outline-none placeholder-gray-500 brutal-shadow-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            className="rounded-none border-[3px] border-black bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="h-5 w-5 stroke-[2.5px]" />
          </button>
        </div>
      </form>
    </div>
  );
}
