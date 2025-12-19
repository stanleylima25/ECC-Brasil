
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, MapPin, Phone, User, Plus, Trash2, ShieldCheck, 
  Globe, Map, Users, ChevronDown, ChevronUp, Star, Coffee, 
  Shield, BookOpen, Utensils, Mic2, Users2, FileText, Upload, X,
  Info, Landmark, ClipboardList, PenTool, Layout, Calendar,
  Quote, Book, Monitor, AlertCircle, Heart, Award, Anchor, ShoppingCart, 
  Search, Eye, ImageIcon, Clock, Loader2, Navigation, Briefcase, Mail
} from 'lucide-react';
import { ECCStage, RegistrationStatus, Couple, EncounterRecord, EncounterTeams, ECCDocument, ParishCoordinatingTeam } from '../types';
import { storageService } from '../services/storageService';
import { GoogleGenAI } from "@google/genai";

interface RegistrationFormProps {
  onComplete: () => void;
  isDark?: boolean;
}

const STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onComplete, isDark }) => {
  const [step, setStep] = useState(1);
  
  // Dados do Marido
  const [husbandName, setHusbandName] = useState('');
  const [husbandPhoto, setHusbandPhoto] = useState<string | null>(null);
  const [husbandPhone, setHusbandPhone] = useState('');
  const [husbandEmail, setHusbandEmail] = useState('');
  const [husbandOccupation, setHusbandOccupation] = useState('');

  // Dados da Esposa
  const [wifeName, setWifeName] = useState('');
  const [wifePhoto, setWifePhoto] = useState<string | null>(null);
  const [wifePhone, setWifePhone] = useState('');
  const [wifeEmail, setWifeEmail] = useState('');
  const [wifeOccupation, setWifeOccupation] = useState('');

  const [address, setAddress] = useState('');
  const [couplePhone, setCouplePhone] = useState('');
  const [coupleEmail, setCoupleEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [parish, setParish] = useState('');
  const [region, setRegion] = useState('');
  const [sectorName, setSectorName] = useState('');
  const [sectorCouple, setSectorCouple] = useState('');
  const [sectorTermStart, setSectorTermStart] = useState('');
  const [sectorTermEnd, setSectorTermEnd] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [isEngaged, setIsEngaged] = useState(false);
  const [pastoralGroup, setPastoralGroup] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [encounters, setEncounters] = useState<EncounterRecord[]>([]);
  const [documents, setDocuments] = useState<ECCDocument[]>([]);
  const [expandedEncounter, setExpandedEncounter] = useState<string | null>(null);

  // Estados de Busca de Endereço
  const [cep, setCep] = useState('');
  const [addressDescription, setAddressDescription] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const fileInputRefHusband = useRef<HTMLInputElement>(null);
  const fileInputRefWife = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailError) setEmailError(null);
  }, [coupleEmail]);

  const validateEmail = (): boolean => {
    const trimmedEmail = coupleEmail.toLowerCase().trim();
    if (!trimmedEmail) return true;
    const couples = storageService.getCouples();
    const duplicate = couples.find(c => c.email.toLowerCase().trim() === trimmedEmail);
    if (duplicate) {
      setEmailError("Este e-mail do casal já está registrado.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 2 && !validateEmail()) return;
    if (step < 3) setStep(step + 1);
  };

  const searchCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setIsSearchingAddress(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setAddress(`${data.logradouro}${data.bairro ? ', ' + data.bairro : ''}`);
        setCity(data.localidade);
        setState(data.uf);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const searchDescription = async () => {
    if (!addressDescription.trim()) return;
    setIsSearchingAddress(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Extraia os detalhes do endereço brasileiro para esta descrição: "${addressDescription}". Retorne APENAS um JSON com os campos: logradouro, bairro, cidade, estado (sigla).`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { tools: [{ googleMaps: {} }] },
      });
      const jsonMatch = response.text.match(/\{.*\}/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.logradouro) setAddress(`${data.logradouro}${data.bairro ? ', ' + data.bairro : ''}`);
        if (data.cidade) setCity(data.cidade);
        if (data.estado && STATES.includes(data.estado.toUpperCase())) setState(data.estado.toUpperCase());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleQuadranteUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateEncounter(id, 'quadranteBase64', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addEncounter = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newEncounter: EncounterRecord = {
      id, stage: ECCStage.FIRST, number: encounters.length + 1,
      date: new Date().toISOString().split('T')[0], theme: '', motto: '', specificRoleInEncounter: '',
      coordinatingTeam: { casalMontagem: '', casalFicha: '', casalFinanca: '', casalRecepcaoPalestra: '', casalPosEncontro: '' },
      teams: { sala: '', cafezinho: '', cozinha: '', ordemLimpeza: '', visitacao: '', circuloEstudo: '', compras: '', coordenadorGeral: '', secretaria: '', liturgia: '', somProjecao: '', recepcaoPalestrante: '' }
    };
    setEncounters([...encounters, newEncounter]);
    setExpandedEncounter(id);
  };

  const updateEncounter = (id: string, field: keyof EncounterRecord, value: any) => {
    setEncounters(encounters.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const updateParishCoordinatingTeam = (id: string, field: keyof ParishCoordinatingTeam, value: string) => {
    setEncounters(encounters.map(e => e.id === id ? { 
      ...e, coordinatingTeam: { ...(e.coordinatingTeam || { casalMontagem: '', casalFicha: '', casalFinanca: '', casalRecepcaoPalestra: '', casalPosEncontro: '' }), [field]: value }
    } : e));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) { setStep(2); return; }
    const newCouple: Couple = {
      id: Math.random().toString(36).substr(2, 9),
      husband: { name: husbandName, photoBase64: husbandPhoto, phone: husbandPhone, email: husbandEmail, occupation: husbandOccupation },
      wife: { name: wifeName, photoBase64: wifePhoto, phone: wifePhone, email: wifeEmail, occupation: wifeOccupation },
      address, phone: couplePhone, email: coupleEmail.trim(), parish, region, city, state, isEngaged, weddingDate,
      sectorName, sectorCouple, sectorTermStart, sectorTermEnd,
      pastoralGroup: isEngaged ? pastoralGroup : 'Nenhum',
      encounters, documents, status: RegistrationStatus.PENDING,
      createdAt: new Date().toISOString(), synced: false
    };
    storageService.saveCouple(newCouple);
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className={`rounded-[2rem] lg:rounded-[2.5rem] shadow-xl border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex border-b overflow-x-auto custom-scrollbar ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 min-w-[120px] py-4 lg:py-5 text-center text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] border-b-4 transition-all ${step === s ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400'}`}>
              Passo {s} <span className="hidden sm:inline">{s === 1 ? 'Cônjuges' : s === 2 ? 'Localização/Social' : 'Caminhada ECC'}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-5 lg:p-10 space-y-8 lg:space-y-12">
          {step === 1 && (
            <div className="space-y-12 animate-fadeIn">
              <div className="text-center">
                <h2 className={`text-2xl lg:text-3xl font-black tracking-tighter ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>Dados dos Cônjuges</h2>
                <p className="text-slate-400 text-[10px] font-medium mt-1 uppercase tracking-widest">Identificação individual para o banco de talentos paroquial</p>
              </div>
              
              <div className="space-y-12">
                {/* Seção Marido */}
                <div className={`p-6 rounded-[2.5rem] border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <PhotoUploadField label="Marido" value={husbandName} photo={husbandPhoto} onChange={setHusbandName} onPhoto={setHusbandPhoto} inputRef={fileInputRefHusband} onUpload={handlePhotoUpload} isDark={isDark} />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <InputField label="Profissão/Atividade" icon={<Briefcase size={14}/>} value={husbandOccupation} onChange={setHusbandOccupation} isDark={isDark} />
                      <InputField label="WhatsApp Marido" icon={<Phone size={14}/>} value={husbandPhone} onChange={setHusbandPhone} placeholder="(00) 00000-0000" isDark={isDark} />
                      <div className="sm:col-span-2">
                        <InputField label="E-mail Marido" icon={<Mail size={14}/>} value={husbandEmail} onChange={setHusbandEmail} placeholder="marido@exemplo.com" isDark={isDark} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção Esposa */}
                <div className={`p-6 rounded-[2.5rem] border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <PhotoUploadField label="Esposa" value={wifeName} photo={wifePhoto} onChange={setWifeName} onPhoto={setWifePhoto} inputRef={fileInputRefWife} onUpload={handlePhotoUpload} isDark={isDark} />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <InputField label="Profissão/Atividade" icon={<Briefcase size={14}/>} value={wifeOccupation} onChange={setWifeOccupation} isDark={isDark} />
                      <InputField label="WhatsApp Esposa" icon={<Phone size={14}/>} value={wifePhone} onChange={setWifePhone} placeholder="(00) 00000-0000" isDark={isDark} />
                      <div className="sm:col-span-2">
                        <InputField label="E-mail Esposa" icon={<Mail size={14}/>} value={wifeEmail} onChange={setWifeEmail} placeholder="esposa@exemplo.com" isDark={isDark} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 lg:space-y-8 animate-fadeIn">
              <div className="text-center">
                <h2 className={`text-2xl lg:text-3xl font-black tracking-tighter ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>Contatos e Localização do Casal</h2>
              </div>

              <div className={`p-6 border rounded-[2rem] space-y-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Navigation className="text-indigo-500" size={18} />
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Busca Automática de Endereço</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex space-x-2">
                    <input type="text" placeholder="CEP 00000-000" value={cep} onChange={(e) => setCep(e.target.value)} className={`flex-1 px-4 py-3 border rounded-xl outline-none text-xs font-bold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white'}`} />
                    <button type="button" onClick={searchCep} className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"><Search size={18} /></button>
                  </div>
                  <div className="flex space-x-2">
                    <input type="text" placeholder="Ou descreva o local..." value={addressDescription} onChange={(e) => setAddressDescription(e.target.value)} className={`flex-1 px-4 py-3 border rounded-xl outline-none text-xs font-bold ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white'}`} />
                    <button type="button" onClick={searchDescription} className="px-4 bg-amber-500 text-slate-900 rounded-xl hover:bg-amber-600 transition-all"><MapPin size={18} /></button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <InputField label="Paróquia Principal" icon={<Globe size={16}/>} value={parish} onChange={setParish} required isDark={isDark} />
                <InputField label="Data do Matrimônio Religioso" type="date" icon={<Heart size={16}/>} value={weddingDate} onChange={setWeddingDate} isDark={isDark} />
                <InputField label="WhatsApp do Casal" icon={<Phone size={16}/>} value={couplePhone} onChange={setCouplePhone} required isDark={isDark} />
                <InputField label="E-mail Oficial do Casal" icon={<Mail size={16}/>} value={coupleEmail} onChange={setCoupleEmail} required error={emailError} isDark={isDark} />
                <div className="md:col-span-2">
                  <InputField label="Endereço Residencial Completo" icon={<MapPin size={16}/>} value={address} onChange={setAddress} required isDark={isDark} />
                </div>
              </div>

              <div className={`p-6 border rounded-[2rem] space-y-4 ${isDark ? 'bg-indigo-500/5 border-indigo-900/30' : 'bg-indigo-50/50 border-indigo-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}><Heart className="text-indigo-600" size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Engajamento Pastoral</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">O casal trabalha em alguma pastoral atualmente?</p>
                    </div>
                  </div>
                  <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <button type="button" onClick={() => setIsEngaged(true)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${isEngaged ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Sim</button>
                    <button type="button" onClick={() => { setIsEngaged(false); setPastoralGroup(''); }} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${!isEngaged ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Não</button>
                  </div>
                </div>
                {isEngaged && <InputField label="Em qual(is) pastoral(is)?" icon={<Users2 size={16}/>} value={pastoralGroup} onChange={setPastoralGroup} placeholder="Ex: Batismo, Liturgia, Dízimo..." required isDark={isDark} />}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center">
                <h2 className={`text-2xl lg:text-3xl font-black tracking-tighter ${isDark ? 'text-slate-100' : 'text-[#0f172a]'}`}>Caminhada no ECC</h2>
                <p className="text-slate-400 text-[10px] font-medium mt-1 uppercase tracking-widest">Histórico de serviço e participações</p>
              </div>

              <div className="space-y-4">
                {encounters.map((enc) => (
                  <div key={enc.id} className={`border rounded-3xl overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedEncounter(expandedEncounter === enc.id ? null : enc.id)}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ${isDark ? 'bg-indigo-600 text-white' : 'bg-[#0f172a] text-white'}`}>{enc.stage.charAt(0)}</div>
                        <span className={`text-xs font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{enc.stage} • {enc.number}º ECC</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setEncounters(encounters.filter(x => x.id !== enc.id)); }} className="text-red-400 p-2"><Trash2 size={16}/></button>
                    </div>
                    {expandedEncounter === enc.id && (
                      <div className="p-6 border-t space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <MiniSelect label="Etapa" value={enc.stage} onChange={(v) => updateEncounter(enc.id, 'stage', v as ECCStage)} options={Object.values(ECCStage)} isDark={isDark}/>
                           <MiniInput label="Data" type="date" value={enc.date} onChange={(v) => updateEncounter(enc.id, 'date', v)} isDark={isDark}/>
                           <div className="sm:col-span-2">
                              <MiniInput label="Minha Função Principal neste Encontro" icon={<PenTool size={14}/>} value={enc.specificRoleInEncounter || ''} onChange={(v) => updateEncounter(enc.id, 'specificRoleInEncounter', v)} placeholder="Ex: Trabalhamos na Cozinha / Coordenamos Equipe de Sala" isDark={isDark}/>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addEncounter} className={`w-full py-6 border-2 border-dashed rounded-3xl flex items-center justify-center space-x-2 font-black text-[10px] uppercase ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                  <Plus size={20} /> <span>Adicionar Etapa Realizada</span>
                </button>
              </div>
            </div>
          )}

          <div className={`flex items-center justify-between pt-10 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <button type="button" onClick={() => step > 1 ? setStep(step - 1) : null} className={`px-8 py-3 text-slate-400 font-black uppercase text-[10px] ${step === 1 ? 'invisible' : ''}`}>Voltar</button>
            <button type={step === 3 ? "submit" : "button"} onClick={handleNextStep} className="px-12 py-5 rounded-2xl font-black bg-indigo-600 text-white uppercase tracking-widest text-xs shadow-xl shadow-indigo-900/20">
              {step === 3 ? 'Salvar Registro Completo' : 'Avançar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PhotoUploadField = ({ label, value, photo, onChange, onPhoto, inputRef, onUpload, isDark }: any) => (
  <div className="space-y-4 text-center flex flex-col items-center shrink-0">
    <div className="relative">
      <div className={`w-24 h-24 lg:w-32 lg:h-32 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden shadow-inner group transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
        {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={24} />}
        <button type="button" onClick={() => inputRef.current?.click()} className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all">
          <Plus className="text-white opacity-0 group-hover:opacity-100" size={20} />
        </button>
      </div>
      <input type="file" className="hidden" ref={inputRef} accept="image/*" onChange={(e) => onUpload(e, onPhoto)} />
    </div>
    <div className="w-full text-left">
      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome do {label}</label>
      <input type="text" required value={value} onChange={(e) => onChange(e.target.value)} className={`w-full px-4 py-2.5 border rounded-xl outline-none text-xs font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100'}`} placeholder="Nome completo" />
    </div>
  </div>
);

const InputField = ({ label, icon, value, onChange, placeholder, required, error, isDark, type = "text" }: any) => (
  <div className="w-full">
    <label className="flex items-center space-x-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
      <span className={isDark ? 'text-slate-500' : 'text-slate-300'}>{icon}</span>
      <span>{label}</span>
    </label>
    <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className={`w-full px-4 py-3 border rounded-xl outline-none text-xs font-bold transition-all ${error ? 'border-red-500 bg-red-50' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100 focus:ring-1 focus:ring-indigo-500')}`} />
    {error && <p className="text-[9px] text-red-500 font-bold mt-1.5 uppercase">{error}</p>}
  </div>
);

const MiniInput = ({ label, value, onChange, type = "text", icon, placeholder, isDark }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">{icon && <span className="mr-1">{icon}</span>} {label}</label>
    <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full border px-3 py-2 rounded-xl text-[10px] font-bold outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100'}`} />
  </div>
);

const MiniSelect = ({ label, value, onChange, options, isDark }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full border px-3 py-2 rounded-xl text-[10px] font-bold outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100'}`}>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default RegistrationForm;
