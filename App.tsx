
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  LogOut, 
  Search, 
  Bell, 
  Menu, 
  X,
  LayoutDashboard,
  ShieldCheck,
  Globe,
  MessageSquare,
  Landmark,
  Cross,
  Music,
  History,
  Sun,
  Moon,
  Lock,
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Star,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { Couple, RegistrationStatus, User, UserRole, ECCNotification } from './types';
import { storageService } from './services/storageService';
import Dashboard from './pages/Dashboard';
import CoupleList from './pages/CoupleList';
import RegistrationForm from './pages/RegistrationForm';
import ApprovalQueue from './pages/ApprovalQueue';
import Login from './pages/Login';
import ChatRoom from './pages/ChatRoom';
import RegionDirectory from './pages/RegionDirectory';
import SongDirectory from './pages/SongDirectory';
import EncounterHistory from './pages/EncounterHistory';
import EventsManager from './pages/EventsManager';
import Gallery from './pages/Gallery';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'couples' | 'register' | 'approval' | 'chat' | 'regions' | 'songs' | 'history' | 'events' | 'gallery'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [notifications, setNotifications] = useState<ECCNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('ecc_theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    refreshData();
    const savedUser = localStorage.getItem('ecc_session');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const freshUser = storageService.getUsers().find(u => u.id === parsedUser.id);
      setCurrentUser(freshUser || parsedUser);
      if (parsedUser.role === 'COUPLE_USER') {
        setActiveTab('chat');
      }
    }
    if (window.innerWidth >= 1024) setIsSidebarOpen(true);

    const interval = setInterval(() => {
      if (currentUser) {
        setNotifications(storageService.getNotifications(currentUser.id));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('ecc_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const refreshData = () => {
    setCouples(storageService.getCouples());
    if (currentUser) {
      setNotifications(storageService.getNotifications(currentUser.id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ecc_session');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigateTo = (tab: any) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const markNotificationRead = (id: string) => {
    storageService.markAsRead(id);
    setNotifications(storageService.getNotifications(currentUser!.id));
  };

  const isAuthorizedForRegistrationData = (user: User): boolean => {
    if (!user) return false;
    if (user.role === 'SPIRITUAL_DIRECTOR') return true;

    const authorizedRoles: UserRole[] = [
      'NATIONAL_COUNCIL', 'NATIONAL_COUPLE', 'REGIONAL_COUPLE',
      'ARCHDIOCESAN_COUPLE', 'SECTOR_COUPLE',
      'STAGE_1_TEAM', 'STAGE_2_TEAM', 'STAGE_3_TEAM'
    ];

    const hasRole = authorizedRoles.includes(user.role);
    const isTermValid = new Date() <= new Date(user.termEnd);

    return hasRole && isTermValid;
  };

  if (!currentUser) return <Login onLogin={(user) => setCurrentUser(user)} />;

  const isCouple = currentUser.role === 'COUPLE_USER';
  const isDirector = currentUser.role === 'SPIRITUAL_DIRECTOR';
  const hasAccessToData = isAuthorizedForRegistrationData(currentUser);
  const isTermExpired = !isDirector && !isCouple && new Date() > new Date(currentUser.termEnd);
  
  const pendingCount = couples.filter(c => c.status === RegistrationStatus.PENDING).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} overflow-x-hidden`}>
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-slate-950/40 z-[40] backdrop-blur-[2px] animate-fadeIn" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[50] w-72 bg-[#0f172a] text-white transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 border-r border-white/5 shadow-2xl lg:shadow-none`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1.5 rounded-2xl shadow-xl border border-amber-400 overflow-hidden shrink-0 transform transition-transform hover:scale-110">
                <img src="https://upload.wikimedia.org/wikipedia/pt/4/4e/Brasao_ECC.png" alt="ECC Logo" className="w-10 h-10 object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-black tracking-tighter text-white leading-none truncate">ECC BRASIL</h1>
                <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest mt-1">Portal Oficial</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
            {!isCouple && <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => navigateTo('dashboard')} />}
            
            <NavItem icon={<CalendarDays size={20}/>} label={isCouple ? "Agenda Paroquial" : "Eventos e Agenda"} active={activeTab === 'events'} onClick={() => navigateTo('events')} />

            <NavItem icon={<ImageIcon size={20}/>} label="Galeria de Memórias" active={activeTab === 'gallery'} onClick={() => navigateTo('gallery')} />

            {hasAccessToData && (
              <>
                <NavItem icon={<Users size={20}/>} label="Fichas de Inscritos" active={activeTab === 'couples'} onClick={() => navigateTo('couples')} />
                <NavItem icon={<History size={20}/>} label="Histórico Regional" active={activeTab === 'history'} onClick={() => navigateTo('history')} />
              </>
            )}

            {!isCouple && !isTermExpired && <NavItem icon={<UserPlus size={20}/>} label="Novo Registro" active={activeTab === 'register'} onClick={() => navigateTo('register')} />}
            
            <NavItem icon={<MessageSquare size={20}/>} label={isCouple ? "Dúvidas e Chat" : "Comunicação"} active={activeTab === 'chat'} onClick={() => navigateTo('chat')} />
            <NavItem icon={<Music size={20}/>} label="Cancioneiro ECC" active={activeTab === 'songs'} onClick={() => navigateTo('songs')} />
            
            {hasAccessToData && (
              <>
                <NavItem icon={<ShieldCheck size={20}/>} label="Homologações" active={activeTab === 'approval'} onClick={() => navigateTo('approval')} badge={pendingCount > 0 ? pendingCount : undefined} />
                <NavItem icon={<Landmark size={20}/>} label="Diretoria Regional" active={activeTab === 'regions'} onClick={() => navigateTo('regions')} />
              </>
            )}

            {isTermExpired && (
               <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-pulse">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">Mandato Expirado</p>
                  <p className="text-[8px] text-slate-400 font-medium text-center mt-1">Contate o Diretor Espiritual para renovação de vigência.</p>
               </div>
            )}
          </nav>

          <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
            <div className="flex items-center space-x-3 p-3 mb-4 rounded-2xl bg-white/5 border border-white/5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${isDirector ? 'bg-amber-500 text-[#0f172a]' : isCouple ? 'bg-indigo-500' : 'bg-slate-500'}`}>
                {isDirector ? <Star size={20} fill="currentColor" /> : currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-none">{currentUser.name}</p>
                <p className="text-[8px] text-amber-400 font-bold uppercase truncate mt-1 tracking-wider">{currentUser.role.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group">
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`h-16 lg:h-20 transition-colors duration-300 border-b flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-3 lg:hidden ${isSidebarOpen ? 'hidden' : 'block'} ${theme === 'dark' ? 'text-slate-200' : 'text-slate-600'}`}>
              <Menu size={24} />
            </button>
            <h2 className="text-sm lg:text-xl font-black tracking-tight uppercase">
              {activeTab === 'dashboard' && 'Portal Eclesiástico'}
              {activeTab === 'couples' && 'Fichas de Casais'}
              {activeTab === 'register' && 'Novo Registro'}
              {activeTab === 'history' && 'Histórico de Atuações'}
              {activeTab === 'approval' && 'Homologações Pendentes'}
              {activeTab === 'chat' && (isCouple ? 'Suporte ao Casal' : 'Canais de Coordenação')}
              {activeTab === 'songs' && 'Cancioneiro'}
              {activeTab === 'events' && 'Agenda Arquidiocesana'}
              {activeTab === 'gallery' && 'Galeria de Memórias'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
             {isTermExpired ? (
               <div className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                  <Clock size={16}/>
                  <span className="text-[10px] font-black uppercase tracking-widest">Mandato Vencido</span>
               </div>
             ) : (
               <div className="hidden md:flex flex-col items-end">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">{currentUser.parish}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Fim da Vigência: {new Date(currentUser.termEnd).toLocaleDateString()}</p>
              </div>
             )}
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2.5 rounded-xl transition-all relative ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setIsNotificationsOpen(false)} />
                  <div className={`absolute right-0 mt-4 w-80 lg:w-96 rounded-[2rem] shadow-2xl border z-[70] animate-scaleUp overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="p-6 border-b flex items-center justify-between dark:border-slate-800">
                      <h3 className="text-sm font-black uppercase tracking-widest">Notificações</h3>
                      <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-5 border-b last:border-0 transition-colors cursor-pointer ${!n.read ? (theme === 'dark' ? 'bg-indigo-500/5' : 'bg-indigo-50') : ''} ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-xl shrink-0 ${n.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                {n.type === 'SUCCESS' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-black uppercase tracking-tight mb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{n.title}</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                                <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center text-slate-400">
                          <Bell size={32} className="mx-auto mb-3 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma notificação</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'dashboard' && <Dashboard couples={couples} onRefresh={refreshData} isDark={theme === 'dark'} currentUser={currentUser} />}
            
            {activeTab === 'couples' && (
              hasAccessToData ? 
                <CoupleList couples={couples} onRefresh={refreshData} isDark={theme === 'dark'} /> : 
                <AccessDenied isDark={theme === 'dark'} reason={isTermExpired ? "Mandato Expirado" : "Acesso Restrito"} />
            )}
            
            {activeTab === 'history' && (
              hasAccessToData ? 
                <EncounterHistory isDark={theme === 'dark'} /> : 
                <AccessDenied isDark={theme === 'dark'} reason={isTermExpired ? "Mandato Expirado" : "Acesso Restrito"} />
            )}

            {activeTab === 'events' && <EventsManager isDark={theme === 'dark'} currentUser={currentUser} />}

            {activeTab === 'gallery' && <Gallery isDark={theme === 'dark'} currentUser={currentUser} />}

            {activeTab === 'register' && !isCouple && !isTermExpired && <RegistrationForm onComplete={() => { navigateTo('couples'); refreshData(); }} isDark={theme === 'dark'} />}
            {activeTab === 'approval' && hasAccessToData && <ApprovalQueue couples={couples.filter(c => c.status === RegistrationStatus.PENDING)} onRefresh={refreshData} isDark={theme === 'dark'} />}
            
            {activeTab === 'chat' && <ChatRoom currentUser={currentUser} isDark={theme === 'dark'} />}
            
            {activeTab === 'regions' && hasAccessToData && <RegionDirectory isDark={theme === 'dark'} />}
            {activeTab === 'songs' && <SongDirectory isDark={theme === 'dark'} />}
          </div>
        </div>
      </main>
    </div>
  );
};

const AccessDenied = ({ isDark, reason }: { isDark: boolean, reason?: string }) => (
  <div className={`flex flex-col items-center justify-center py-32 text-center animate-fadeIn ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
    <div className="p-8 bg-red-500/10 rounded-full mb-6">
      <Lock size={64} className="text-red-500" />
    </div>
    <h2 className="text-3xl font-black tracking-tight mb-2">{reason || 'Acesso Restrito'}</h2>
    <p className="text-slate-500 max-w-md text-sm font-medium">
      {reason === "Mandato Expirado" 
        ? "Sua vigência de coordenação encerrou. O acesso às fichas de casais é restrito a coordenadores ativos conforme diretrizes do ECC."
        : "Estas informações são confidenciais e acessíveis apenas às Equipes Dirigentes e Conselhos ativos."}
    </p>
  </div>
);

const NavItem = ({ icon, label, active, onClick, badge }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
  >
    <div className="flex items-center space-x-3">
      <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>{icon}</span>
      <span className="text-sm tracking-wide text-left">{label}</span>
    </div>
    {badge && <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${active ? 'bg-white text-indigo-600' : 'bg-indigo-50 text-white'}`}>{badge}</span>}
  </button>
);

export default App;
