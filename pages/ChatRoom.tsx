
import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Map, User, Hash, MessageSquare, ShieldCheck, Heart, UserCircle, HelpCircle, BadgeCheck, MessageCircle } from 'lucide-react';
import { ChatMessage, User as UserType, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface ChatRoomProps {
  currentUser: UserType;
  isDark?: boolean;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ currentUser, isDark }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState<'ADMIN' | 'SUPPORT'>('SUPPORT');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDirigente = currentUser.role !== 'COUPLE_USER';

  useEffect(() => {
    const loadMessages = () => {
      const allMsgs = storageService.getMessages();
      // Casais veem apenas o canal de suporte. Dirigentes veem os dois.
      if (!isDirigente) {
        setActiveRoom('SUPPORT');
      }
      setMessages(allMsgs);
    };
    loadMessages();
    const interval = setInterval(loadMessages, 3000); 
    return () => clearInterval(interval);
  }, [isDirigente]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeRoom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderParish: currentUser.parish,
      senderRegion: currentUser.region,
      content: newMessage,
      timestamp: new Date().toISOString(),
      room: activeRoom
    };

    storageService.sendMessage(message);
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const filteredMessages = messages.filter(m => m.room === activeRoom);

  return (
    <div className={`flex flex-col h-[calc(100vh-180px)] rounded-[2.5rem] shadow-xl border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      
      {/* Chat Header com Seleção de Canal */}
      <div className={`px-6 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl shadow-lg ${activeRoom === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'}`}>
            {activeRoom === 'ADMIN' ? <Hash size={24} /> : <MessageCircle size={24} />}
          </div>
          <div>
            <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {activeRoom === 'ADMIN' ? 'Coordenação Nacional' : 'Central de Dúvidas e Suporte'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Atendimento Online • {currentUser.parish}
            </p>
          </div>
        </div>

        {isDirigente && (
          <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <button 
              onClick={() => setActiveRoom('SUPPORT')}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${activeRoom === 'SUPPORT' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400'}`}
            >
              <HelpCircle size={14}/>
              <span>Suporte</span>
            </button>
            <button 
              onClick={() => setActiveRoom('ADMIN')}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${activeRoom === 'ADMIN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              <ShieldCheck size={14}/>
              <span>Coordenação</span>
            </button>
          </div>
        )}
      </div>

      {/* Área de Mensagens */}
      <div ref={scrollRef} className={`flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/30'}`}>
        {filteredMessages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser.id;
          const isMsgDirigente = msg.senderRole !== 'COUPLE_USER';
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col space-y-1`}>
                
                {!isMe && (
                  <div className="flex items-center space-x-2 mb-1 px-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isMsgDirigente ? 'text-indigo-500' : 'text-amber-600'}`}>
                      {msg.senderName}
                    </span>
                    {isMsgDirigente && <BadgeCheck size={12} className="text-indigo-500" />}
                    <span className="text-[8px] font-bold text-slate-400 uppercase">• {msg.senderParish}</span>
                  </div>
                )}

                <div className={`p-4 rounded-3xl shadow-sm text-sm leading-relaxed relative ${
                  isMe 
                    ? (isDark ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100') 
                    : (isDark ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none')
                }`}>
                  {msg.content}
                  
                  {/* Etiqueta de Função da Mensagem */}
                  <div className={`absolute -bottom-2 ${isMe ? 'right-2' : 'left-2'} text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                    isMsgDirigente 
                      ? (isDark ? 'bg-indigo-900 border-indigo-700 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600') 
                      : (isDark ? 'bg-amber-900 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-600')
                  }`}>
                    {msg.senderRole.replace(/_/g, ' ')}
                  </div>
                </div>

                <span className="text-[8px] text-slate-400 font-bold px-2 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {filteredMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
            {activeRoom === 'ADMIN' ? <ShieldCheck size={48}/> : <HelpCircle size={48}/>}
            <div>
              <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">Inicie uma conversa</p>
              <p className="text-slate-400 text-[10px] font-medium mt-1">
                {activeRoom === 'ADMIN' 
                  ? 'Canal exclusivo para tomada de decisões entre dirigentes.' 
                  : 'Casais e equipes podem enviar suas dúvidas aqui.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Área de Input */}
      <div className={`p-6 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
        <form onSubmit={handleSendMessage} className="relative flex items-center space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={activeRoom === 'ADMIN' ? "Mensagem para a coordenação..." : "Tire sua dúvida com a coordenação..."}
              className={`w-full pl-6 pr-14 py-4 rounded-2xl shadow-sm outline-none transition-all font-medium text-sm ${
                isDark 
                  ? 'bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500' 
                  : 'bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500'
              }`}
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white rounded-xl shadow-lg transition-all active:scale-95 ${activeRoom === 'ADMIN' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-500 hover:bg-amber-600'}`}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-3 text-center">
           Acesso Restrito: Suas mensagens são registradas para fins de auditoria eclesiástica.
        </p>
      </div>
    </div>
  );
};

export default ChatRoom;
