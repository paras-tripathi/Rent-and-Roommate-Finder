import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { getSocket } from '../lib/socket';
import { Message } from '../types';
import { format } from 'date-fns';

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: chatRoom } = useQuery({
    queryKey: ['chatRoom', roomId],
    queryFn: () => chatAPI.getRoom(roomId!).then(r => r.data),
    enabled: !!roomId,
  });

  useEffect(() => {
    if (!roomId) return;
    chatAPI.getMessages(roomId).then(r => setMessages(r.data.messages || r.data));
  }, [roomId]);

  useEffect(() => {
    if (!token || !roomId) return;
    const socket = getSocket(token);
    socket.emit('join:room', roomId);
    
    socket.on('message:new', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      socket.emit('message:seen', { chatRoomId: roomId });
    });
    
    socket.on('typing:start', (data: any) => {
      if (data.userId !== user?.id) setTypingUser(data.name);
    });
    
    socket.on('typing:stop', (data: any) => {
      if (data.userId !== user?.id) setTypingUser(null);
    });
    
    socket.on('message:seen', () => {
      // Mark my sent messages as seen in UI
      setMessages(prev =>
        prev.map(m => m.senderId === user?.id ? { ...m, seenAt: new Date().toISOString() } : m)
      );
    });
    
    socket.emit('message:seen', { chatRoomId: roomId });
    
    return () => {
      socket.emit('leave:room', roomId);
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('message:seen');
    };
  }, [token, roomId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSend = () => {
    if (!input.trim() || !token) return;
    const socket = getSocket(token);
    socket.emit('message:send', { chatRoomId: roomId, content: input.trim() });
    setInput('');
    socket.emit('typing:stop', roomId);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!token) return;
    const socket = getSocket(token);
    socket.emit('typing:start', roomId);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing:stop', roomId), 2000);
  };

  const otherParticipant = chatRoom?.participants?.find((p: any) => p.id !== user?.id);
  const listingTitle = chatRoom?.interest?.listing?.title || 'Chat';

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Chat header */}
        <div className="card p-4 mb-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={20} /></button>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-violet-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{otherParticipant?.name?.charAt(0) || '?'}</span>
          </div>
          <div>
            <p className="font-semibold">{otherParticipant?.name || 'Loading...'}</p>
            <p className="text-xs text-dark-400">{listingTitle}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 card p-4 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-dark-400 text-sm">Start the conversation! 👋</div>
          )}
          {messages.map((msg: Message) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-dark-100 rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1 text-xs text-dark-400 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                    {isMine && (msg.seenAt ? <CheckCheck size={12} className="text-primary-400" /> : <Check size={12} />)}
                  </div>
                </div>
              </div>
            );
          })}
          {typingUser && (
            <div className="flex justify-start">
              <div className="bg-dark-100 dark:bg-dark-800 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-dark-400">{typingUser} is typing</span>
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => <div key={i} className="w-1 h-1 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="card p-3 flex gap-3">
          <input
            id="chat-message-input"
            type="text"
            className="input flex-1"
            placeholder="Type a message..."
            value={input}
            onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button id="send-message-btn" onClick={handleSend} disabled={!input.trim()} className="btn-primary px-4 disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
