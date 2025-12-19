
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Star, Users, MapPin, Search, Book, Quote, 
  Monitor, Coffee, Shield, Utensils, BookOpen, Mic2, 
  Landmark, Info, Layout, ClipboardList, User, ChevronRight,
  Users2, ShoppingCart, Heart, Anchor, Award, ImageIcon, X, Clock
} from 'lucide-react';
import { Couple, EncounterRecord, ECCStage } from '../types';
import { storageService } from '../services/storageService';

interface EncounterHistoryProps {
  isDark?: boolean;
}

const EncounterHistory: React.FC<EncounterHistoryProps> = ({ isDark }) => {
  const [encounters, setEncounters] = useState<EncounterRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingQuadrante, setViewingQuadrante] = useState<string | null>(null);

  useEffect(() => {
    const couples = storageService.getCouples();
    const allEncountersMap = new Map<string, EncounterRecord>();
    
    couples.forEach(couple => {
      couple.encounters.forEach(enc => {
        const key = `${enc.stage}-${enc.number}-${enc.date}`;
        if (!allEncountersMap.has(key)) {
          allEncountersMap.set(key, enc);
        }
      });
    });

    setEncounters(Array.from(allEncountersMap.values()).sort((a, b) => b.number - a.number));
  }, []);

  const filtered = encounters.filter(e => 
    e.theme?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.number.toString().includes(searchTerm) ||
    e.motto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por Número, Tema ou Lema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500' : 'bg-white border-slate-200'}`}
          />
        </div>
        <div className={`px-6 py-2 border rounded-2xl transition-colors ${isDark ? 'bg-amber-500/10 border-amber-900/30' : 'bg-amber-50 border-amber-100'}`}>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-center">Encontros Registrados</p>
          <p className={`text-xl font-black text-center ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{encounters.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filtered.map((enc) => (
          <div key={enc.id} className={`rounded-[2.5rem] shadow-sm border overflow-hidden hover:shadow-md transition-all group ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className={`p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-900 text-white'}`}>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-amber-500 rounded-3xl flex flex-col items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-[10px] font-black uppercase leading-none">ECC</span>
                  <span className="text-2xl font-black">{enc.number}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{enc.stage}</h3>
                  <div className="flex items-center space-x-3 mt-1 text-slate-400">
                    <span className="flex items-center text-amber-400 text-xs font-bold uppercase tracking-widest">
                      <Calendar size={14} className="mr-1"/> {new Date(enc.date).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className="text-xs font-bold uppercase tracking-widest">Homologado</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {enc.quadranteBase64 && (
                  <button onClick={() => setViewingQuadrante(enc.quadranteBase64 || null)} className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-xl font-black text-[10px] uppercase hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
                    <ImageIcon size={14}/>
                    <span>Ver Quadrante</span>
                  </button>
                )}
                <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Registro Digital</p>
                  <p className="text-[10px] font-bold text-emerald-400 flex items-center"><Users size={12} className="mr-1"/> Documentação Integrada</p>
                </div>
              </div>
            </div>

            <div className={`px-8 py-6 border-b grid grid-cols-1 md:grid-cols-2 gap-8 ${isDark ? 'bg-amber-500/5 border-slate-800' : 'bg-amber-50/50 border-slate-100'}`}>
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl shadow-sm text-emerald-600 border transition-colors ${isDark ? 'bg-slate-900 border-emerald-900/30' : 'bg-white border-emerald-100'}`}><Book size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Tema Central</p>
                  <p className={`text-sm font-black uppercase italic ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{enc.theme || '---'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl shadow-sm text-amber-600 border transition-colors ${isDark ? 'bg-slate-900 border-amber-900/30' : 'bg-white border-amber-100'}`}><Quote size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Lema Bíblico</p>
                  <p className={`text-sm font-medium italic leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>"{enc.motto || '---'}"</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                  <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        <Award size={14} className="mr-2 text-indigo-500" /> Equipe Dirigente (Os 5)
                    </h4>
                    {(enc.coordinatingTeam?.termStart || enc.coordinatingTeam?.termEnd) && (
                        <div className="flex items-center space-x-1 text-[8px] font-black text-indigo-400 uppercase bg-indigo-500/5 px-2 py-1 rounded">
                            <Clock size={10}/>
                            <span>{enc.coordinatingTeam.termStart ? new Date(enc.coordinatingTeam.termStart).getFullYear() : '?'} - {enc.coordinatingTeam.termEnd ? new Date(enc.coordinatingTeam.termEnd).getFullYear() : '?'}</span>
                        </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <TeamItem label="Casal Montagem" name={enc.coordinatingTeam?.casalMontagem} isDark={isDark} />
                    <TeamItem label="Casal Ficha" name={enc.coordinatingTeam?.casalFicha} isDark={isDark} />
                    <TeamItem label="Casal Finanças" name={enc.coordinatingTeam?.casalFinanca} isDark={isDark} />
                    <TeamItem label="C. Recepção Palestra" name={enc.coordinatingTeam?.casalRecepcaoPalestra} isDark={isDark} />
                    <TeamItem label="Casal Pós-Encontro" name={enc.coordinatingTeam?.casalPosEncontro} isDark={isDark} />
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-3 flex items-center dark:border-slate-800">
                    <Users size={14} className="mr-2 text-amber-500" /> Coordenação das Equipes de Trabalho
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <WorkTeamItem icon={<Anchor size={12}/>} label="Coordenador Geral" name={enc.teams?.coordenadorGeral} isDark={isDark} />
                    <WorkTeamItem icon={<Layout size={12}/>} label="Casal Sala" name={enc.teams?.sala} isDark={isDark} />
                    <WorkTeamItem icon={<Coffee size={12}/>} label="Casal Cafezinho" name={enc.teams?.cafezinho} isDark={isDark} />
                    <WorkTeamItem icon={<Utensils size={12}/>} label="Casal Cozinha" name={enc.teams?.cozinha} isDark={isDark} />
                    <WorkTeamItem icon={<Shield size={12}/>} label="Ordem e Limpeza" name={enc.teams?.ordemLimpeza} isDark={isDark} />
                    <WorkTeamItem icon={<Heart size={12}/>} label="Casal Visitação" name={enc.teams?.visitacao} isDark={isDark} />
                    <WorkTeamItem icon={<BookOpen size={12}/>} label="Círculo de Estudo" name={enc.teams?.circuloEstudo} isDark={isDark} />
                    <WorkTeamItem icon={<ShoppingCart size={12}/>} label="Casal Compras" name={enc.teams?.compras} isDark={isDark} />
                    <WorkTeamItem icon={<ClipboardList size={12}/>} label="Secretaria" name={enc.teams?.secretaria} isDark={isDark} />
                    <WorkTeamItem icon={<Mic2 size={12}/>} label="Liturgia" name={enc.teams?.liturgia} isDark={isDark} />
                    <WorkTeamItem icon={<Monitor size={12}/>} label="Som e Projeção" name={enc.teams?.somProjecao} isDark={isDark} />
                    <WorkTeamItem icon={<User size={12}/>} label="Rec. Palestrante" name={enc.teams?.recepcaoPalestrante} isDark={isDark} />
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest px-8 border-t transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <span>Diretório Nacional Consolidado • Equipes ECC</span>
              <span className="flex items-center text-indigo-500">Homologado pela Intranet <ChevronRight size={10} className="ml-1"/></span>
            </div>
          </div>
        ))}
      </div>

      {/* Visualização do Quadrante */}
      {viewingQuadrante && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col animate-fadeIn" onClick={() => setViewingQuadrante(null)}>
          <div className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-md">
            <div className="flex items-center space-x-3">
               <ImageIcon className="text-amber-500" size={24}/>
               <h3 className="text-white font-black uppercase tracking-widest text-sm">Quadrante Oficial do Encontro</h3>
            </div>
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X/></button>
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-10 flex items-center justify-center">
            <img src={viewingQuadrante} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" alt="Quadrante Grande" />
          </div>
        </div>
      )}
    </div>
  );
};

const TeamItem = ({ label, name, isDark }: any) => (
  <div className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    <span className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{name || '---'}</span>
  </div>
);

const WorkTeamItem = ({ icon, label, name, isDark }: any) => (
  <div className={`flex items-center space-x-3 p-3 border rounded-xl shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50' : 'bg-white border-slate-100 hover:border-amber-200'}`}>
    <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{label}</p>
      <p className={`text-[10px] font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{name || '---'}</p>
    </div>
  </div>
);

export default EncounterHistory;
