
import React, { useState, useEffect } from 'react';
import { Couple, RegistrationStatus, User, SpiritualMessage } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Globe, Users, ShieldCheck, Zap, Heart, MessageSquare, PenTool, Send, X, Star, Clock, UserCheck, Calendar, Landmark } from 'lucide-react';
import { storageService } from '../services/storageService';

interface DashboardProps {
  couples: Couple[];
  onRefresh: () => void;
  isDark?: boolean;
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ couples, isDark, currentUser, onRefresh }) => {
  const [spiritualMessages, setSpiritualMessages] = useState<SpiritualMessage[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [extendingUserId, setExtendingUserId] = useState<string | null>(null);
  const [newTermDate, setNewTermDate] = useState('');

  const isDirector = currentUser.role === 'SPIRITUAL_DIRECTOR';
  const approved = couples.filter(c => c.status === RegistrationStatus.APPROVED);

  useEffect(() => {
    setSpiritualMessages(storageService.getSpiritualMessages());
    if (isDirector) {
      setAllUsers(storageService.getUsers());
    }
  }, [isDirector]);

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const msg: SpiritualMessage = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: currentUser.id,
      authorName: currentUser.name,
      title: newTitle,
      content: newContent,
      createdAt: new Date().toISOString(),
      category: 'REFLEXAO'
    };

    storageService.saveSpiritualMessage(msg);
    setSpiritualMessages([msg, ...spiritualMessages]);
    setNewTitle('');
    setNewContent('');
    setIsPosting(false);
  };

  const handleExtendTerm = (userId: string) => {
    if (!newTermDate) return;
    storageService.updateUserTerm(userId, new Date(newTermDate).toISOString());
    setAllUsers(storageService.getUsers());
    setExtendingUserId(null);
    setNewTermDate('');
    onRefresh();
    alert("Vigência estendida com sucesso!");
  };

  const lastMessage = spiritualMessages[0];
  const expiredUsers = allUsers.filter(u => u.role !== 'SPIRITUAL_DIRECTOR' && u.role !== 'COUPLE_USER' && new Date() > new Date(u.termEnd));

  const stateDistribution = approved.reduce((acc: any, curr) => {
    acc[curr.state] = (acc[curr.state] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(stateDistribution).map(s => ({
    name: s,
    casais: stateDistribution[s]
  })).sort((a, b) => b.casais - a.casais);

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn">
      {/* Bloco Palavra do Pastor com Brasão */}
      <div className={`relative overflow-hidden p-8 lg:p-12 rounded-[3rem] border-4 ${isDark ? 'bg-slate-900 border-amber-900/30' : 'bg-white border-amber-100'} shadow-2xl`}>
        <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <img src="https://upload.wikimedia.org/wikipedia/pt/4/4e/Brasao_ECC.png" alt="Marca D'água" className="w-64 h-64 object-contain" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-6">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border-2 border-amber-400 overflow-hidden shrink-0">
                 <img src="https://upload.wikimedia.org/wikipedia/pt/4/4e/Brasao_ECC.png" alt="Brasão Cabeçalho" className="w-14 h-14 object-contain" />
               </div>
               <div>
                 <h2 className={`text-2xl lg:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Palavra do Diretor Espiritual</h2>
                 <p className="text-amber-600 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center">
                    <Star size={12} className="mr-1.5" fill="currentColor"/> Mensagem Oficial da Arquidiocese
                 </p>
               </div>
            </div>
            {isDirector && (
              <button 
                onClick={() => setIsPosting(true)}
                className="px-8 py-3 bg-[#0f172a] text-white dark:bg-amber-500 dark:text-[#0f172a] rounded-2xl font-black flex items-center space-x-2 transition-all shadow-xl active:scale-95"
              >
                <PenTool size={18}/>
                <span className="text-xs uppercase tracking-widest">Publicar Reflexão</span>
              </button>
            )}
          </div>

          {lastMessage ? (
            <div className="animate-fadeIn">
              <h3 className={`text-xl font-black mb-3 ${isDark ? 'text-amber-400' : 'text-indigo-900'}`}>{lastMessage.title}</h3>
              <p className={`text-sm lg:text-lg font-serif italic leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                "{lastMessage.content}"
              </p>
              <div className="flex items-center space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
                   <Star size={18} fill="currentColor" />
                </div>
                <div>
                   <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{lastMessage.authorName}</p>
                   <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(lastMessage.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center opacity-30">
               <p className="font-black uppercase tracking-[0.3em] text-sm">Aguardando mensagem pastoral...</p>
            </div>
          )}
        </div>
      </div>

      {/* Painel de Gestão de Mandatos */}
      {isDirector && expiredUsers.length > 0 && (
        <div className={`p-8 rounded-[2.5rem] border-2 border-red-500/20 shadow-xl animate-fadeIn ${isDark ? 'bg-red-950/10' : 'bg-red-50'}`}>
           <div className="flex items-center space-x-3 mb-8">
              <Clock className="text-red-500" size={24}/>
              <div>
                <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Mandatos Vencidos</h3>
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Ação Necessária: Novos casais ou extensão de vigência</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiredUsers.map(user => (
                <div key={user.id} className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{user.name}</p>
                      <p className="text-[8px] text-indigo-500 font-black uppercase tracking-widest">{user.role.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded uppercase">Expirado</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-[9px] text-slate-400 font-bold uppercase flex items-center"><Landmark size={12} className="mr-1"/> {user.parish}</p>
                    <p className="text-[9px] text-red-400 font-bold uppercase flex items-center"><Calendar size={12} className="mr-1"/> Vencimento: {new Date(user.termEnd).toLocaleDateString()}</p>
                  </div>

                  {extendingUserId === user.id ? (
                    <div className="space-y-3 animate-fadeIn">
                       <input 
                         type="date" 
                         value={newTermDate} 
                         onChange={e => setNewTermDate(e.target.value)}
                         className={`w-full px-4 py-2 rounded-xl text-xs font-bold outline-none border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                       />
                       <div className="flex gap-2">
                          <button onClick={() => setExtendingUserId(null)} className="flex-1 py-2 text-[8px] font-black uppercase text-slate-400">Cancelar</button>
                          <button onClick={() => handleExtendTerm(user.id)} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase">Homologar</button>
                       </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setExtendingUserId(user.id)}
                      className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      Estender Vigência
                    </button>
                  )}
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SummaryCard 
          icon={<Globe className={isDark ? "text-blue-400" : "text-blue-600"}/>} 
          label="Casais Inscritos" 
          value={approved.length} 
          color={isDark ? "bg-blue-500/10" : "bg-blue-50"} 
          isDark={isDark}
        />
        <SummaryCard 
          icon={<Users className={isDark ? "text-emerald-400" : "text-emerald-600"}/>} 
          label="Paróquias Ativas" 
          value={new Set(approved.map(c => c.parish)).size} 
          color={isDark ? "bg-emerald-500/10" : "bg-emerald-50"} 
          isDark={isDark}
        />
        <SummaryCard 
          icon={<ShieldCheck className={isDark ? "text-amber-400" : "text-amber-600"}/>} 
          label="Lideranças Ativas" 
          value={allUsers.filter(u => u.role !== 'COUPLE_USER').length} 
          color={isDark ? "bg-amber-500/10" : "bg-amber-50"} 
          isDark={isDark}
        />
        <SummaryCard 
          icon={<MessageSquare className={isDark ? "text-purple-400" : "text-purple-600"}/>} 
          label="Interações de Fé" 
          value={storageService.getMessages().length} 
          color={isDark ? "bg-purple-500/10" : "bg-purple-50"} 
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className={`lg:col-span-2 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg lg:text-xl font-black mb-6 lg:mb-8 tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Presença Paroquial</h3>
          <div className="h-[250px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 8, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b'}} 
                />
                <Tooltip 
                  cursor={{fill: isDark ? '#0f172a' : '#f8fafc'}} 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="casais" fill={isDark ? "#d97706" : "#f59e0b"} radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden ${isDark ? 'bg-indigo-950 border border-indigo-900/50' : 'bg-[#1e293b]'} text-white`}>
          <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-10 translate-y-10 scale-150 rotate-12">
            <img src="https://upload.wikimedia.org/wikipedia/pt/4/4e/Brasao_ECC.png" alt="Card Logo" className="w-40 h-40 object-contain" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg lg:text-xl font-black mb-2 tracking-tight">Monitoramento Eclesiástico</h3>
            <p className="text-slate-400 text-xs lg:text-sm leading-relaxed">Gestão centralizada de fichas, mandatos e eventos oficiais da família ECC em conformidade com as diretrizes diocesanas.</p>
          </div>
          <div className="mt-6 lg:mt-8 space-y-3 relative z-10">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total na Base</span>
              <span className="text-emerald-400 text-xs font-black">{couples.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mandatos Vigentes</span>
              <span className="text-blue-400 text-xs font-black">{allUsers.filter(u => u.role !== 'COUPLE_USER' && new Date() <= new Date(u.termEnd)).length}</span>
            </div>
          </div>
          <button className="w-full py-4 mt-8 bg-amber-600 rounded-xl lg:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:scale-95 relative z-10">
            Exportar Relatório Consolidado
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color, isDark }: any) => (
  <div className={`p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] shadow-sm border transition-colors duration-300 flex items-center lg:block ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
    <div className={`w-10 h-10 lg:w-12 lg:h-12 ${color} rounded-xl lg:rounded-2xl flex items-center justify-center mb-0 lg:mb-4 mr-4 lg:mr-0 shrink-0`}>{icon}</div>
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
      <p className="text-xl lg:text-3xl font-black mt-0 lg:mt-1">{value}</p>
    </div>
  </div>
);

export default Dashboard;
