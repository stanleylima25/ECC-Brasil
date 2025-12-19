
import React, { useState, useEffect } from 'react';
// Added X to the lucide-react imports
import { Shield, User, Star, Plus, Map, Search, Edit2, Users, Heart, ClipboardList, Calendar, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { ApostolicRegion, ECCStage, StageLeader } from '../types';
import { storageService } from '../services/storageService';

const RegionDirectory: React.FC<{isDark?: boolean}> = ({isDark}) => {
  const [regions, setRegions] = useState<ApostolicRegion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [spiritual, setSpiritual] = useState('');
  const [regional, setRegional] = useState('');
  const [national, setNational] = useState('');
  const [archdiocesan, setArchdiocesan] = useState('');
  const [state, setState] = useState('SP');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');
  const [stageLeaders, setStageLeaders] = useState<StageLeader[]>([
    { stage: ECCStage.FIRST, coupleNames: '', teamName: '', termStart: '', termEnd: '' },
    { stage: ECCStage.SECOND, coupleNames: '', teamName: '', termStart: '', termEnd: '' },
    { stage: ECCStage.THIRD, coupleNames: '', teamName: '', termStart: '', termEnd: '' }
  ]);

  useEffect(() => {
    setRegions(storageService.getApostolicRegions());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRegion: ApostolicRegion = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name,
      spiritualDirector: spiritual,
      regionalDirector: regional,
      nationalDirector: national,
      archdiocesanCouple: archdiocesan,
      stageLeaders,
      state,
      termStart,
      termEnd
    };
    storageService.saveApostolicRegion(newRegion);
    setRegions(storageService.getApostolicRegions());
    resetForm();
  };

  const updateStageLeader = (index: number, field: keyof StageLeader, value: string) => {
    const updated = [...stageLeaders];
    updated[index] = { ...updated[index], [field]: value };
    setStageLeaders(updated);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setSpiritual('');
    setRegional('');
    setNational('');
    setArchdiocesan('');
    setState('SP');
    setTermStart('');
    setTermEnd('');
    setStageLeaders([
      { stage: ECCStage.FIRST, coupleNames: '', teamName: '', termStart: '', termEnd: '' },
      { stage: ECCStage.SECOND, coupleNames: '', teamName: '', termStart: '', termEnd: '' },
      { stage: ECCStage.THIRD, coupleNames: '', teamName: '', termStart: '', termEnd: '' }
    ]);
  };

  const startEdit = (reg: ApostolicRegion) => {
    setEditingId(reg.id);
    setName(reg.name);
    setSpiritual(reg.spiritualDirector);
    setRegional(reg.regionalDirector);
    setNational(reg.nationalDirector);
    setArchdiocesan(reg.archdiocesanCouple || '');
    setState(reg.state);
    setTermStart(reg.termStart || '');
    setTermEnd(reg.termEnd || '');
    setStageLeaders(reg.stageLeaders || [
      { stage: ECCStage.FIRST, coupleNames: '', teamName: '', termStart: '', termEnd: '' },
      { stage: ECCStage.SECOND, coupleNames: '', teamName: '', termStart: '', termEnd: '' },
      { stage: ECCStage.THIRD, coupleNames: '', teamName: '', termStart: '', termEnd: '' }
    ]);
    setIsAdding(true);
  };

  const filtered = regions.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar Região Apostólica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white'}`}
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Nova Região Apostólica</span>
        </button>
      </div>

      {isAdding && (
        <div className={`p-8 rounded-[2.5rem] shadow-xl border animate-slideUp transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-indigo-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-xl font-black flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <Edit2 className="mr-2 text-indigo-600" size={20} />
              {editingId ? 'Editar Diretoria' : 'Cadastrar Diretoria da Região'}
            </h3>
            <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InputField label="Nome da Região" value={name} onChange={setName} placeholder="Ex: Região Leste 1" required isDark={isDark} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Estado" value={state} onChange={setState} placeholder="UF" required isDark={isDark} />
                  <InputField label="Diretor Nacional" value={national} onChange={setNational} placeholder="Nome do Diretor" required isDark={isDark} />
                </div>
                <InputField label="Diretor Espiritual" value={spiritual} onChange={setSpiritual} placeholder="Bispo ou Padre" required isDark={isDark} />
              </div>
              <div className="space-y-4">
                <InputField label="Diretor Regional (Casal)" value={regional} onChange={setRegional} placeholder="Nome do Casal" required isDark={isDark} />
                <InputField label="Casal Arquidiocesano" value={archdiocesan} onChange={setArchdiocesan} placeholder="Nome do Casal Arquidiocesano" required isDark={isDark} />
                
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-indigo-50/30 border-indigo-100'}`}>
                   <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center"><Clock size={12} className="mr-1.5"/> Vigência de Trabalho Regional</p>
                   <div className="grid grid-cols-2 gap-4">
                      <InputField label="Início Vigência" type="date" value={termStart} onChange={setTermStart} isDark={isDark} />
                      <InputField label="Fim Vigência" type="date" value={termEnd} onChange={setTermEnd} isDark={isDark} />
                   </div>
                </div>
              </div>
            </div>

            <div className={`pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <ClipboardList className="mr-2" size={16} />
                Casais Dirigentes das Etapas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stageLeaders.map((leader, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{leader.stage}</p>
                      <Users size={14} className="text-slate-400" />
                    </div>
                    
                    <InputField 
                      label="Casal Dirigente" 
                      value={leader.coupleNames} 
                      onChange={(val: string) => updateStageLeader(idx, 'coupleNames', val)} 
                      placeholder="Nome do Casal" 
                      isDark={isDark}
                    />
                    
                    <InputField 
                      label="Nome da Equipe" 
                      value={leader.teamName} 
                      onChange={(val: string) => updateStageLeader(idx, 'teamName', val)} 
                      placeholder="Ex: Equipe de Apoio" 
                      isDark={isDark}
                    />

                    <div className="grid grid-cols-2 gap-2 pt-2">
                       <MiniInput 
                          label="Início" 
                          type="date" 
                          value={leader.termStart || ''} 
                          onChange={(val: string) => updateStageLeader(idx, 'termStart', val)} 
                          isDark={isDark} 
                       />
                       <MiniInput 
                          label="Fim" 
                          type="date" 
                          value={leader.termEnd || ''} 
                          onChange={(val: string) => updateStageLeader(idx, 'termEnd', val)} 
                          isDark={isDark} 
                       />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={resetForm} className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">Cancelar</button>
              <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center space-x-2">
                 <Save size={18} />
                 <span>Salvar Diretoria</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {filtered.map(region => (
          <div key={region.id} className={`rounded-[2.5rem] shadow-sm border overflow-hidden hover:shadow-md transition-all group ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-3xl shadow-sm ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Map size={28} />
                  </div>
                  <div>
                    <h4 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{region.name}</h4>
                    <div className="flex items-center space-x-2 flex-wrap gap-2 mt-1">
                        <span className="text-xs font-black uppercase text-indigo-400 tracking-widest">{region.state} • Brasil</span>
                        {(region.termStart || region.termEnd) && (
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border flex items-center ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                <Clock size={12} className="mr-1.5"/> 
                                Vigência Regional: {region.termStart ? new Date(region.termStart).toLocaleDateString() : '?'} - {region.termEnd ? new Date(region.termEnd).toLocaleDateString() : '?'}
                            </span>
                        )}
                    </div>
                  </div>
                </div>
                <button onClick={() => startEdit(region)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all md:opacity-0 group-hover:opacity-100 border border-transparent hover:border-indigo-100">
                  <Edit2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <DirectorCard icon={<Star size={14} className="text-amber-500"/>} title="Nacional" name={region.nationalDirector} isDark={isDark} />
                <DirectorCard icon={<Shield size={14} className="text-blue-500"/>} title="Espiritual" name={region.spiritualDirector} isDark={isDark} />
                <DirectorCard icon={<User size={14} className="text-emerald-500"/>} title="Regional" name={region.regionalDirector} isDark={isDark} />
                <DirectorCard icon={<Heart size={14} className="text-red-500"/>} title="Arquidiocesano" name={region.archdiocesanCouple} isDark={isDark} />
              </div>

              <div className={`pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                   <Users size={14} className="mr-2" /> Liderança de Etapas e Equipes
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {region.stageLeaders?.map((leader, i) => (
                    <div key={i} className={`p-5 rounded-2xl border transition-all hover:border-indigo-300 ${isDark ? 'bg-indigo-900/10 border-indigo-900/50' : 'bg-indigo-50/30 border-indigo-100/50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 bg-indigo-600 text-white text-[8px] font-black rounded uppercase tracking-wider">{leader.stage}</span>
                        {(leader.termStart || leader.termEnd) && (
                          <div className="flex items-center text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                             <Clock size={10} className="mr-1"/> 
                             {leader.termStart ? new Date(leader.termStart).getFullYear() : '?'} - {leader.termEnd ? new Date(leader.termEnd).getFullYear() : '?'}
                          </div>
                        )}
                      </div>
                      <p className={`text-sm font-black leading-tight mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{leader.coupleNames || 'Não informado'}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter italic">Equipe: {leader.teamName || 'N/A'}</p>
                      
                      {(leader.termStart || leader.termEnd) && (
                        <div className="mt-3 pt-3 border-t border-indigo-500/10 text-[8px] text-slate-500 font-bold uppercase tracking-widest text-center">
                           Mandato Específico da Etapa
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={`px-8 py-3 border-t flex justify-between items-center text-[9px] font-bold uppercase tracking-widest ${isDark ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
               <span>Estrutura Institucional Homologada</span>
               <span className="text-indigo-600">ECC Brasil • {new Date().getFullYear()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, required, isDark, type = "text" }: any) => (
  <div className="w-full">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      required={required}
      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100'}`}
    />
  </div>
);

const MiniInput = ({ label, value, onChange, type = "text", isDark }: any) => (
  <div className="w-full">
    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className={`w-full px-2 py-1.5 border rounded-lg outline-none text-[10px] font-bold transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
    />
  </div>
);

const DirectorCard = ({ icon, title, name, isDark }: any) => (
  <div className={`flex items-center space-x-3 p-3 rounded-2xl border transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
    <div className={`p-2.5 rounded-xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{title}</p>
      <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{name || '---'}</p>
    </div>
  </div>
);

const Save = ({ size }: { size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);

export default RegionDirectory;
