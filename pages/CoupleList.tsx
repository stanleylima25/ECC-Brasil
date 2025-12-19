
import React, { useState } from 'react';
import { Couple, RegistrationStatus, ECCStage, EncounterRecord } from '../types';
import { storageService } from '../services/storageService';
import { 
  Search, MapPin, Phone, Globe, Filter, CloudDownload, Map, 
  X, User, Users, Heart, Calendar, Star, Utensils, BookOpen, 
  Coffee, Shield, Mic2, Users2, Info, FileText, Printer, Mail,
  Landmark, PenTool, Layout, ClipboardList, Quote, Book, Monitor,
  Award, Anchor, ImageIcon, Clock, CheckCircle2, ChevronRight, Briefcase,
  ShieldCheck
} from 'lucide-react';

interface CoupleListProps {
  couples: Couple[];
  onRefresh: () => void;
  isDark?: boolean;
}

const CoupleList: React.FC<CoupleListProps> = ({ couples, onRefresh, isDark }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [selectedCouple, setSelectedCouple] = useState<Couple | null>(null);
  const [viewingQuadrante, setViewingQuadrante] = useState<string | null>(null);

  const filtered = couples.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = c.husband.name.toLowerCase().includes(searchLower) ||
                         c.wife.name.toLowerCase().includes(searchLower) ||
                         c.parish.toLowerCase().includes(searchLower) ||
                         c.region.toLowerCase().includes(searchLower) ||
                         c.city.toLowerCase().includes(searchLower);
    const matchesState = filterState === '' || c.state === filterState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-3xl shadow-sm border flex flex-col md:flex-row gap-4 items-center transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar Casal (Nome, Paróquia ou Cidade...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors duration-300 ${isDark ? 'bg-slate-800 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 text-slate-900'}`}
          />
        </div>
        <select 
          value={filterState} 
          onChange={(e) => setFilterState(e.target.value)}
          className={`px-4 py-3 border-none rounded-2xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 w-full md:w-auto ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-600'}`}
        >
          <option value="">Todos os Estados</option>
          {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all w-full md:w-auto">
          <CloudDownload size={20} />
          <span>Sincronizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map(couple => (
          <div key={couple.id} className={`p-5 rounded-3xl shadow-sm border flex space-x-4 items-start hover:shadow-md transition-all group ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex -space-x-4 shrink-0 mt-1">
              <img src={couple.husband.photoBase64 || 'https://picsum.photos/100/100'} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-800 object-cover bg-slate-100 shadow-sm" alt="Ele" />
              <img src={couple.wife.photoBase64 || 'https://picsum.photos/101/101'} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-800 object-cover bg-slate-100 shadow-sm" alt="Ela" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <h3 className={`text-lg font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{couple.husband.name} & {couple.wife.name}</h3>
                  {couple.isEngaged && <div className="p-1 bg-indigo-100 rounded-full text-indigo-600" title="Casal Engajado"><Heart size={10} fill="currentColor" /></div>}
                </div>
                <span className={`px-2 py-1 text-[10px] font-black rounded-lg ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>{couple.state}</span>
              </div>
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-indigo-600 font-semibold flex items-center">
                  <Globe size={12} className="mr-1"/> {couple.parish}
                </p>
                <p className="text-[10px] text-slate-400 font-medium flex items-center">
                  <Award size={10} className="mr-1"/> {couple.encounters.length} etapas registradas
                </p>
              </div>
              <div className={`mt-4 pt-3 border-t flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex space-x-1">
                  {couple.encounters.map(e => (
                    <span key={e.id} className={`w-2 h-2 rounded-full ${e.stage === ECCStage.FIRST ? 'bg-emerald-500' : e.stage === ECCStage.SECOND ? 'bg-blue-500' : 'bg-amber-500'}`} title={`${e.stage} - Encontro ${e.number}`}></span>
                  ))}
                </div>
                <button 
                  onClick={() => setSelectedCouple(couple)}
                  className="text-indigo-600 text-[10px] font-black hover:underline opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider"
                >
                  Abrir Prontuário Completo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCouple && (
        <div className="fixed inset-0 z-[100] bg-black/80 md:bg-[#0f172a]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-fadeIn">
          <div className={`w-full max-w-6xl h-full max-h-[92vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-slideUp transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            {/* Header da Ficha */}
            <div className={`p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 border-b ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center space-x-8">
                <div className="flex -space-x-8">
                  <img src={selectedCouple.husband.photoBase64 || ''} className="w-20 h-20 lg:w-28 lg:h-28 rounded-3xl border-4 border-white dark:border-slate-800 object-cover shadow-2xl" alt="Marido" />
                  <img src={selectedCouple.wife.photoBase64 || ''} className="w-20 h-20 lg:w-28 lg:h-28 rounded-3xl border-4 border-white dark:border-slate-800 object-cover shadow-2xl" alt="Esposa" />
                </div>
                <div>
                  <h2 className={`text-2xl lg:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCouple.husband.name} & {selectedCouple.wife.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="px-3 py-1 bg-amber-500 text-slate-900 text-[10px] font-black rounded-full uppercase tracking-widest">Homologado</span>
                    <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest flex items-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><MapPin size={14} className="mr-1.5 text-indigo-500"/> {selectedCouple.parish}</span>
                    <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-widest flex items-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><Globe size={14} className="mr-1.5 text-indigo-500"/> Setor: {selectedCouple.sectorName || '---'}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => window.print()} className={`p-4 rounded-2xl transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-600 hover:text-indigo-600 shadow-sm border border-slate-100'}`}><Printer size={20}/></button>
                <button onClick={() => setSelectedCouple(null)} className="p-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-xl shadow-red-500/20"><X size={20}/></button>
              </div>
            </div>

            {/* Conteúdo do Prontuário */}
            <div className={`flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Coluna de Dados Básicos */}
                <div className="lg:col-span-4 space-y-10">
                  <section>
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6 flex items-center">
                      <User size={14} className="mr-2" /> Informações de Contato
                    </h4>
                    <div className="space-y-6">
                       <ContactItem label="WhatsApp Marido" value={selectedCouple.husband.phone} isDark={isDark} />
                       <ContactItem label="WhatsApp Esposa" value={selectedCouple.wife.phone} isDark={isDark} />
                       <ContactItem label="WhatsApp do Casal" value={selectedCouple.phone} isDark={isDark} />
                       <ContactItem label="Endereço" value={selectedCouple.address} isDark={isDark} />
                       <ContactItem label="E-mail" value={selectedCouple.email} isDark={isDark} />
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6 flex items-center">
                      <Heart size={14} className="mr-2" /> Vida Eclesiástica
                    </h4>
                    <div className={`p-6 rounded-[2rem] border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-indigo-50 border-indigo-100'}`}>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Engajamento Atual</p>
                       <p className={`text-sm font-black leading-tight ${isDark ? 'text-slate-100' : 'text-indigo-900'}`}>
                         {selectedCouple.isEngaged ? selectedCouple.pastoralGroup : 'Em discernimento / Sem pastoral ativa'}
                       </p>
                       {selectedCouple.weddingDate && (
                         <div className="mt-4 pt-4 border-t border-indigo-200/30 flex items-center">
                            <Calendar size={14} className="mr-2 text-indigo-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Casamento: {new Date(selectedCouple.weddingDate).toLocaleDateString()}</span>
                         </div>
                       )}
                    </div>
                  </section>
                </div>

                {/* Coluna de Histórico de Serviço - O QUE FOI SOLICITADO */}
                <div className="lg:col-span-8 space-y-10">
                   <div className="flex items-center justify-between">
                     <h4 className={`text-2xl font-black flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        <Award className="mr-3 text-amber-500" size={24} fill="currentColor" />
                        Prontuário de Atuação no ECC
                     </h4>
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                       {selectedCouple.encounters.length} Encontros Compartilhados
                     </span>
                   </div>

                   <div className="relative pl-8 space-y-8">
                     {/* Linha da Timeline */}
                     <div className={`absolute left-0 top-2 bottom-2 w-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

                     {selectedCouple.encounters.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((enc, idx) => (
                       <div key={enc.id} className="relative group animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                         {/* Ponto da Timeline */}
                         <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} ${enc.stage === ECCStage.FIRST ? 'text-emerald-500' : enc.stage === ECCStage.SECOND ? 'text-indigo-500' : 'text-amber-500'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                         </div>

                         <div className={`p-6 lg:p-8 rounded-[2.5rem] border shadow-sm transition-all hover:shadow-md ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                              <div className="flex items-center space-x-4">
                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${enc.stage === ECCStage.FIRST ? 'bg-emerald-500/10 text-emerald-600' : enc.stage === ECCStage.SECOND ? 'bg-indigo-500/10 text-indigo-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                  {enc.stage} • {enc.number}º ECC
                                </div>
                                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <Calendar size={14} className="mr-1.5" />
                                  {new Date(enc.date).toLocaleDateString()}
                                </div>
                              </div>
                              {enc.quadranteBase64 && (
                                <button onClick={() => setViewingQuadrante(enc.quadranteBase64 || null)} className="flex items-center space-x-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-[9px] font-black uppercase hover:bg-amber-500/20 transition-all">
                                  <ImageIcon size={14}/>
                                  <span>Visualizar Quadrante</span>
                                </button>
                              )}
                            </div>

                            <div className={`p-5 rounded-2xl border-l-4 ${enc.specificRoleInEncounter ? (isDark ? 'bg-indigo-500/5 border-indigo-500' : 'bg-indigo-50 border-indigo-500') : (isDark ? 'bg-emerald-500/5 border-emerald-500' : 'bg-emerald-50 border-emerald-500')}`}>
                               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Trabalho Realizado no Encontro</p>
                               <div className="flex items-center text-sm font-black italic">
                                 {enc.specificRoleInEncounter ? (
                                   <><PenTool size={16} className="mr-3 text-indigo-500" /> {enc.specificRoleInEncounter}</>
                                 ) : (
                                   <><Users size={16} className="mr-3 text-emerald-500" /> Participaram como Encontristas</>
                                 )}
                               </div>
                            </div>
                            
                            {(enc.theme || enc.motto) && (
                               <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {enc.theme && <p className="text-[10px] text-slate-400 italic"><b>Tema:</b> {enc.theme}</p>}
                                  {enc.motto && <p className="text-[10px] text-slate-400 italic"><b>Lema:</b> {enc.motto}</p>}
                               </div>
                            )}
                         </div>
                       </div>
                     ))}

                     {selectedCouple.encounters.length === 0 && (
                       <div className="py-20 text-center opacity-30">
                         <ClipboardList size={48} className="mx-auto mb-4 text-slate-300" />
                         <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Sem histórico de etapas compartilhado</p>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </div>

            {/* Footer da Ficha */}
            <div className={`p-6 border-t flex items-center justify-between ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center space-x-3">
                <ShieldCheck size={20} className="text-indigo-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ficha de Registro Homologada • ECC Brasil • {new Date().getFullYear()}</p>
              </div>
              <button onClick={() => setSelectedCouple(null)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Fechar Prontuário</button>
            </div>
          </div>
        </div>
      )}

      {/* Visualização de Quadrante em Tela Cheia */}
      {viewingQuadrante && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col animate-fadeIn" onClick={() => setViewingQuadrante(null)}>
          <div className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-md">
            <h3 className="text-white font-black uppercase tracking-widest text-sm">Visualização do Quadrante Oficial</h3>
            <button className="p-2 text-white bg-white/10 rounded-full"><X size={24}/></button>
          </div>
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <img src={viewingQuadrante} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Quadrante" />
          </div>
        </div>
      )}
    </div>
  );
};

const ContactItem = ({ label, value, isDark }: any) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{value || 'Não informado'}</span>
  </div>
);

export default CoupleList;
