
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Plus, MapPin, Edit2, Trash2, Clock, 
  Award, Shield, BookOpen, ImageIcon, X, Save, 
  CheckCircle2, Info, ChevronRight, Users, Heart, PenTool, 
  ClipboardList, Search, Bell, Star, CheckSquare, LogOut,
  UserCheck, UserX, Clock4
} from 'lucide-react';
import { ECCEvent, ECCStage, ParishCoordinatingTeam, User, EventAttendee } from '../types';
import { storageService } from '../services/storageService';

interface EventsManagerProps {
  isDark?: boolean;
  currentUser: User;
}

const EventsManager: React.FC<EventsManagerProps> = ({ isDark, currentUser }) => {
  const [events, setEvents] = useState<ECCEvent[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingAttendees, setViewingAttendees] = useState<{eventId: string, attendees: EventAttendee[]} | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ECCEvent['type']>('ENCONTRO');
  const [stage, setStage] = useState<ECCStage | 'GERAL'>(ECCStage.FIRST);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [theme, setTheme] = useState('');
  const [motto, setMotto] = useState('');
  const [status, setStatus] = useState<ECCEvent['status']>('PLANEJADO');
  const [quadranteBase64, setQuadranteBase64] = useState<string | null>(null);
  
  // Coordinating team (Os 5)
  const [casalMontagem, setCasalMontagem] = useState('');
  const [casalFicha, setCasalFicha] = useState('');
  const [casalFinanca, setCasalFinanca] = useState('');
  const [casalRecepcao, setCasalRecepcao] = useState('');
  const [casalPosEncontro, setCasalPosEncontro] = useState('');

  const isDirigente = currentUser.role !== 'COUPLE_USER';
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    setEvents(storageService.getEvents().sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const existingEvent = editingId ? events.find(ev => ev.id === editingId) : null;
    const event: ECCEvent = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      title, type, stage, startDate, endDate, location, theme, motto, status, quadranteBase64: quadranteBase64 || undefined,
      coordinatingTeam: { casalMontagem, casalFicha, casalFinanca, casalRecepcaoPalestra: casalRecepcao, casalPosEncontro },
      attendees: existingEvent?.attendees || []
    };
    storageService.saveEvent(event);
    loadEvents();
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este evento da agenda oficial?')) {
      storageService.deleteEvent(id);
      loadEvents();
    }
  };

  const handleSubscription = (eventId: string, isSubscribed: boolean) => {
    if (isSubscribed) {
      storageService.unsubscribeFromEvent(eventId, currentUser.id);
    } else {
      storageService.subscribeToEvent(eventId, currentUser.id);
    }
    loadEvents();
  };

  const handleApproveAttendee = (eventId: string, userId: string, status: 'APPROVED' | 'REJECTED') => {
    storageService.updateAttendeeStatus(eventId, userId, status, currentUser.role.replace(/_/g, ' '));
    loadEvents();
    // Atualizar visualização do modal se aberto
    const updatedEvent = storageService.getEvents().find(e => e.id === eventId);
    if (updatedEvent) {
      setViewingAttendees({ eventId: updatedEvent.id, attendees: updatedEvent.attendees || [] });
    }
  };

  const startEdit = (e: ECCEvent) => {
    setEditingId(e.id);
    setTitle(e.title);
    setType(e.type);
    setStage(e.stage);
    setStartDate(e.startDate);
    setEndDate(e.endDate);
    setLocation(e.location);
    setTheme(e.theme || '');
    setMotto(e.motto || '');
    setStatus(e.status);
    setQuadranteBase64(e.quadranteBase64 || null);
    
    setCasalMontagem(e.coordinatingTeam?.casalMontagem || '');
    setCasalFicha(e.coordinatingTeam?.casalFicha || '');
    setCasalFinanca(e.coordinatingTeam?.casalFinanca || '');
    setCasalRecepcao(e.coordinatingTeam?.casalRecepcaoPalestra || '');
    setCasalPosEncontro(e.coordinatingTeam?.casalPosEncontro || '');
    
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTitle('');
    setType('ENCONTRO');
    setStage(ECCStage.FIRST);
    setStartDate('');
    setEndDate('');
    setLocation('');
    setTheme('');
    setMotto('');
    setStatus('PLANEJADO');
    setQuadranteBase64(null);
    setCasalMontagem('');
    setCasalFicha('');
    setCasalFinanca('');
    setCasalRecepcao('');
    setCasalPosEncontro('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setQuadranteBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Eventos e Agenda</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            {isDirigente ? 'Planejamento e Registro de Atividades Oficiais' : 'Agenda de Encontros e Reuniões da Paróquia'}
          </p>
        </div>
        {isDirigente && (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <Plus size={20} />
            <span className="text-xs uppercase tracking-widest">Novo Evento</span>
          </button>
        )}
      </div>

      {isAdding && isDirigente && (
        <div className={`p-8 lg:p-12 rounded-[3rem] shadow-2xl border animate-slideUp overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-10">
             <div className="flex items-center space-x-3">
               <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Calendar size={24}/></div>
               <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{editingId ? 'Editar Registro' : 'Lançar Novo Evento'}</h3>
             </div>
             <button onClick={resetForm} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
          </div>

          <form onSubmit={handleSave} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Seção 1: Informações Básicas */}
              <div className="space-y-6">
                <InputField label="Título do Evento" value={title} onChange={setTitle} placeholder="Ex: 42º ECC - 1ª Etapa" required isDark={isDark} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className={`w-full px-4 py-3 border rounded-xl outline-none font-bold text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100'}`}>
                      <option value="ENCONTRO">Encontro (Fim de Semana)</option>
                      <option value="PALESTRA">Palestra / Formação</option>
                      <option value="ESPIRITUALIDADE">Espiritualidade</option>
                      <option value="REUNIAO">Reunião de Equipe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Etapa</label>
                    <select value={stage} onChange={e => setStage(e.target.value as any)} className={`w-full px-4 py-3 border rounded-xl outline-none font-bold text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100'}`}>
                      <option value={ECCStage.FIRST}>1ª Etapa</option>
                      <option value={ECCStage.SECOND}>2ª Etapa</option>
                      <option value={ECCStage.THIRD}>3ª Etapa</option>
                      <option value="GERAL">Geral (Todas as Etapas)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Data Início" type="date" value={startDate} onChange={setStartDate} required isDark={isDark} />
                  <InputField label="Data Término" type="date" value={endDate} onChange={setEndDate} required isDark={isDark} />
                </div>

                <InputField label="Localização" icon={<MapPin size={14}/>} value={location} onChange={setLocation} placeholder="Paróquia, Centro de Pastoral..." required isDark={isDark} />
              </div>

              {/* Seção 2: Identidade do Encontro */}
              <div className="space-y-6">
                <InputField label="Tema do Encontro" icon={<BookOpen size={14}/>} value={theme} onChange={setTheme} isDark={isDark} />
                <InputField label="Lema (Citação Bíblica)" icon={<PenTool size={14}/>} value={motto} onChange={setMotto} isDark={isDark} />
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Anexar Quadrante Oficial (Se houver)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-32 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${quadranteBase64 ? 'border-amber-500 bg-amber-500/5' : 'border-slate-300 hover:border-indigo-400'} ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
                  >
                    {quadranteBase64 ? (
                      <div className="flex items-center space-x-3">
                         <ImageIcon className="text-amber-500" size={24}/>
                         <span className="text-xs font-black text-amber-500 uppercase">Quadrante Carregado</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="text-slate-300 mb-2" size={32} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload do Arquivo</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status Atual</label>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      {['PLANEJADO', 'REALIZADO', 'CANCELADO'].map(s => (
                        <button 
                          key={s} type="button" 
                          onClick={() => setStatus(s as any)}
                          className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${status === s ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                </div>
              </div>
            </div>

            {/* Seção 3: Equipe Dirigente (Os 5) */}
            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
               <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6 flex items-center">
                 <Users size={16} className="mr-2" /> Equipe Dirigente Responsável (Os 5)
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <MiniInputField label="Montagem" value={casalMontagem} onChange={setCasalMontagem} isDark={isDark} />
                  <MiniInputField label="Fichas" value={casalFicha} onChange={setCasalFicha} isDark={isDark} />
                  <MiniInputField label="Finanças" value={casalFinanca} onChange={setCasalFinanca} isDark={isDark} />
                  <MiniInputField label="Rec. Palestra" value={casalRecepcao} onChange={setCasalRecepcao} isDark={isDark} />
                  <MiniInputField label="Pós-Encontro" value={casalPosEncontro} onChange={setCasalPosEncontro} isDark={isDark} />
               </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t dark:border-slate-800">
               <button type="button" onClick={resetForm} className="px-8 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
               <button type="submit" className="px-12 py-4 bg-[#0f172a] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center space-x-3">
                 <Save size={18}/>
                 <span>{editingId ? 'Atualizar Evento' : 'Homologar na Agenda'}</span>
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Eventos */}
      <div className="grid grid-cols-1 gap-6">
        {events.map((event) => {
          const attendeeObj = event.attendees?.find(a => a.userId === currentUser.id);
          const isSubscribed = !!attendeeObj;
          const statusAttendee = attendeeObj?.status;
          const attendeesCount = event.attendees?.length || 0;
          const pendingAttendeesCount = event.attendees?.filter(a => a.status === 'PENDING').length || 0;

          return (
            <div key={event.id} className={`p-6 lg:p-10 rounded-[2.5rem] shadow-sm border transition-all hover:shadow-md group flex flex-col lg:flex-row gap-8 items-start ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              {/* Bloco de Data */}
              <div className="flex flex-col items-center justify-center shrink-0 w-full lg:w-32 py-6 px-4 rounded-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{new Date(event.startDate).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                 <span className="text-4xl font-black my-1">{new Date(event.startDate).getDate()}</span>
                 <span className="text-[10px] font-bold opacity-80">{new Date(event.startDate).getFullYear()}</span>
              </div>

              {/* Informações Principais */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${event.status === 'REALIZADO' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                     {event.status}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                     {event.type} • {event.stage}
                  </span>
                  {isDirigente && attendeesCount > 0 && (
                    <button 
                      onClick={() => setViewingAttendees({ eventId: event.id, attendees: event.attendees || [] })}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center transition-all ${pendingAttendeesCount > 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'}`}
                    >
                      <Users size={12} className="mr-1.5" />
                      {attendeesCount} Inscritos {pendingAttendeesCount > 0 && `(${pendingAttendeesCount} pendentes)`}
                    </button>
                  )}
                </div>
                
                <h4 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{event.title}</h4>
                
                <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <div className="flex items-center"><MapPin size={16} className="mr-2 text-indigo-500"/> {event.location}</div>
                  <div className="flex items-center"><Clock size={16} className="mr-2 text-indigo-500"/> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</div>
                </div>

                {event.theme && (
                  <div className={`p-5 rounded-2xl border-l-4 border-amber-500 ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
                     <p className="text-[8px] font-black text-amber-600 uppercase mb-1">Tema e Lema do Encontro</p>
                     <p className={`text-sm font-black italic ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{event.theme}</p>
                     <p className="text-xs text-slate-500 mt-1 italic opacity-80">"{event.motto}"</p>
                  </div>
                )}

                {/* Botão de Inscrição para Casais */}
                {!isDirigente && event.status === 'PLANEJADO' && (
                  <div className="flex flex-col space-y-3">
                    <button 
                      onClick={() => handleSubscription(event.id, !!isSubscribed)}
                      className={`mt-4 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center space-x-3 transition-all active:scale-95 ${
                        isSubscribed 
                        ? 'bg-red-50 text-red-500 border border-red-100' 
                        : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                      }`}
                    >
                      {isSubscribed ? <LogOut size={16}/> : <CheckSquare size={16}/>}
                      <span>{isSubscribed ? 'Cancelar Minha Inscrição' : 'Inscrever Meu Casal'}</span>
                    </button>
                    {isSubscribed && (
                      <div className={`flex items-center space-x-2 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl border ${
                        statusAttendee === 'APPROVED' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                        statusAttendee === 'REJECTED' ? 'bg-red-50 text-red-500 border-red-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {statusAttendee === 'APPROVED' ? <CheckCircle2 size={14}/> : 
                         statusAttendee === 'REJECTED' ? <UserX size={14}/> : 
                         <Clock4 size={14} className="animate-spin" />}
                        <span>
                          {statusAttendee === 'APPROVED' ? 'Sua participação foi homologada pela coordenação' : 
                           statusAttendee === 'REJECTED' ? 'Sua inscrição não foi aprovada' : 
                           'Aguardando homologação da coordenação paroquial'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ações e Equipe Dirigente */}
              <div className="w-full lg:w-72 shrink-0 space-y-4">
                 <div className={`p-5 rounded-[2rem] border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                      <Users size={14} className="mr-2"/> Os 5 Responsáveis
                   </p>
                   <div className="space-y-1.5">
                     <MiniTeamDisplay label="Montagem" name={event.coordinatingTeam?.casalMontagem} />
                     <MiniTeamDisplay label="Fichas" name={event.coordinatingTeam?.casalFicha} />
                     <MiniTeamDisplay label="Finanças" name={event.coordinatingTeam?.casalFinanca} />
                   </div>
                 </div>

                 {isDirigente && (
                   <div className="flex space-x-2">
                     <button onClick={() => startEdit(event)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[10px] uppercase transition-all border dark:border-slate-700 flex items-center justify-center space-x-2">
                        <Edit2 size={14}/>
                        <span>Editar</span>
                     </button>
                     <button onClick={() => handleDelete(event.id)} className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-900/30">
                        <Trash2 size={18}/>
                     </button>
                   </div>
                 )}
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="py-32 text-center opacity-20">
            <ClipboardList size={64} className="mx-auto mb-4" />
            <p className="text-xl font-black uppercase tracking-[0.3em]">Agenda Vazia</p>
            <p className="text-xs font-bold uppercase mt-2">Nenhum evento programado no momento</p>
          </div>
        )}
      </div>

      {/* Modal de Homologação de Inscritos */}
      {viewingAttendees && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 animate-fadeIn">
          <div className={`w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-scaleUp ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
             <div className={`p-8 border-b flex items-center justify-between ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center space-x-3">
                   <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Users size={20}/></div>
                   <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Homologar Casais</h3>
                </div>
                <button onClick={() => setViewingAttendees(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X/></button>
             </div>
             <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
                {viewingAttendees.attendees.length > 0 ? (
                  viewingAttendees.attendees.map(attendee => {
                    const user = storageService.getUsers().find(u => u.id === attendee.userId);
                    return (
                      <div key={attendee.userId} className={`p-5 rounded-2xl border transition-all ${
                        attendee.status === 'APPROVED' ? 'border-emerald-200 bg-emerald-500/5' : 
                        attendee.status === 'REJECTED' ? 'border-red-200 bg-red-500/5' : 
                        (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100')
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${isDark ? 'bg-indigo-600' : 'bg-indigo-500'}`}>
                                 {user?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                 <p className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{user?.name || 'Usuário Desconhecido'}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.parish || 'Paróquia não informada'}</p>
                              </div>
                           </div>
                           <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                             attendee.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                             attendee.status === 'REJECTED' ? 'bg-red-500 text-white' : 
                             'bg-amber-500 text-white animate-pulse'
                           }`}>
                             {attendee.status === 'PENDING' ? 'Pendente' : attendee.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                           </div>
                        </div>

                        {attendee.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproveAttendee(viewingAttendees.eventId, attendee.userId, 'REJECTED')}
                              className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-2"
                            >
                              <UserX size={14}/>
                              <span>Rejeitar</span>
                            </button>
                            <button 
                              onClick={() => handleApproveAttendee(viewingAttendees.eventId, attendee.userId, 'APPROVED')}
                              className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
                            >
                              <UserCheck size={14}/>
                              <span>Homologar</span>
                            </button>
                          </div>
                        )}

                        {attendee.status !== 'PENDING' && (
                           <button 
                             onClick={() => handleApproveAttendee(viewingAttendees.eventId, attendee.userId, 'PENDING' as any)}
                             className="w-full py-2 text-slate-400 font-bold text-[8px] uppercase tracking-widest hover:text-indigo-600 transition-all"
                           >
                             Alterar Decisão
                           </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-400 font-bold py-10">Nenhum casal inscrito ainda.</p>
                )}
             </div>
             <div className={`p-6 border-t flex justify-end ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <button onClick={() => setViewingAttendees(null)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Concluir Homologações</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, icon, value, onChange, placeholder, required, isDark, type = "text" }: any) => (
  <div className="w-full">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
      {icon && <span className="mr-2 text-indigo-500">{icon}</span>}
      {label}
    </label>
    <input 
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      className={`w-full px-4 py-3 border rounded-xl outline-none font-bold text-xs transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:ring-1 focus:ring-indigo-500' : 'bg-slate-50 border-slate-100 focus:ring-1 focus:ring-indigo-500'}`}
    />
  </div>
);

const MiniInputField = ({ label, value, onChange, isDark }: any) => (
  <div>
    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</label>
    <input 
      type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Nome do Casal"
      className={`w-full px-3 py-2 border rounded-lg outline-none font-bold text-[10px] ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
    />
  </div>
);

const MiniTeamDisplay = ({ label, name }: any) => (
  <div className="flex justify-between items-center text-[9px]">
    <span className="text-slate-400 font-bold uppercase tracking-tighter">{label}:</span>
    <span className="font-black text-indigo-600 truncate max-w-[120px]">{name || 'Pendente'}</span>
  </div>
);

export default EventsManager;
