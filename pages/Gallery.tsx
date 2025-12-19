
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Camera, Trash2, X, Download, Maximize2, 
  Filter, Calendar, Info, Heart, Award, Star, 
  MapPin, Clock, CheckCircle2, ImageIcon, Search, AlertCircle, Loader2
} from 'lucide-react';
import { ECCGalleryPhoto, ECCStage, ECCEvent, User } from '../types';
import { storageService } from '../services/storageService';

interface GalleryProps {
  isDark?: boolean;
  currentUser: User;
}

// Componente para carregamento otimizado de imagens
const LazyImage: React.FC<{ src: string; alt: string; className?: string; isDark?: boolean }> = ({ src, alt, className, isDark }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden w-full h-full ${className}`}>
      {!isLoaded && (
        <div className={`absolute inset-0 flex items-center justify-center animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <ImageIcon className={`${isDark ? 'text-slate-700' : 'text-slate-300'}`} size={32} />
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-110`}
        />
      )}
    </div>
  );
};

const Gallery: React.FC<GalleryProps> = ({ isDark, currentUser }) => {
  const [photos, setPhotos] = useState<ECCGalleryPhoto[]>([]);
  const [events, setEvents] = useState<ECCEvent[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ECCGalleryPhoto | null>(null);
  const [activeStage, setActiveStage] = useState<ECCStage | 'GERAL'>('GERAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [eventId, setEventId] = useState('');
  const [stage, setStage] = useState<ECCStage | 'GERAL'>('GERAL');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDirigente = currentUser.role !== 'COUPLE_USER';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPhotos(storageService.getGalleryPhotos().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setEvents(storageService.getEvents().filter(e => e.status === 'REALIZADO'));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Formato inválido. Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, etc).');
        setPhotoUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.onerror = () => {
        setUploadError('Erro ao processar a imagem. Tente novamente.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;

    const newPhoto: ECCGalleryPhoto = {
      id: Math.random().toString(36).substr(2, 9),
      url: photoUrl,
      title,
      description,
      eventId: eventId || undefined,
      stage,
      uploadedBy: currentUser.name,
      createdAt: new Date().toISOString()
    };

    storageService.saveGalleryPhoto(newPhoto);
    loadData();
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover esta memória da galeria?')) {
      storageService.deleteGalleryPhoto(id);
      loadData();
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setTitle('');
    setDescription('');
    setPhotoUrl(null);
    setEventId('');
    setStage('GERAL');
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredPhotos = photos.filter(p => {
    const matchesStage = activeStage === 'GERAL' || p.stage === activeStage;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* Header e Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className={`flex p-1 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {['GERAL', ECCStage.FIRST, ECCStage.SECOND, ECCStage.THIRD].map(s => (
            <button
              key={s}
              onClick={() => setActiveStage(s as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeStage === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar memórias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-12 pr-4 py-3 border rounded-2xl shadow-sm outline-none text-xs font-bold w-full lg:w-64 transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-white focus:ring-1 focus:ring-indigo-500' : 'bg-white border-slate-200 focus:ring-1 focus:ring-indigo-500'}`}
            />
          </div>
          {isDirigente && (
            <button 
              onClick={() => setIsAdding(true)}
              className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Grid de Memórias com Lazy Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPhotos.map((photo) => (
          <div 
            key={photo.id} 
            className={`group relative rounded-[2rem] overflow-hidden shadow-sm border transition-all hover:shadow-2xl cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-square overflow-hidden relative">
              <LazyImage src={photo.url} alt={photo.title} isDark={isDark} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                 <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                       <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[8px] font-black text-white uppercase tracking-widest">{photo.stage}</span>
                       {photo.eventId && <span className="px-2 py-1 bg-amber-500/20 backdrop-blur-md rounded text-[8px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/30">Evento Vinculado</span>}
                    </div>
                    <Maximize2 size={18} className="text-white" />
                 </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className={`text-sm font-black tracking-tight mb-1 truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{photo.title}</h3>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(photo.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center space-x-1 text-indigo-500">
                   <Heart size={10} fill="currentColor" />
                   <span className="text-[8px] font-black uppercase">Fé e União</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-20">
            <ImageIcon size={64} className="mx-auto mb-4" />
            <p className="text-xl font-black uppercase tracking-[0.3em]">Nenhuma Memória</p>
            <p className="text-xs font-bold uppercase mt-2">A galeria de memórias está aguardando os primeiros registros</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-fadeIn" onClick={() => setSelectedPhoto(null)}>
          <div className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-md z-10">
            <div className="flex items-center space-x-4">
               <div className="p-3 bg-white/10 rounded-2xl"><ImageIcon className="text-white" size={24}/></div>
               <div>
                 <h3 className="text-white font-black uppercase tracking-widest text-sm">{selectedPhoto.title}</h3>
                 <p className="text-slate-400 text-[10px] font-bold uppercase">Memória compartilhada por {selectedPhoto.uploadedBy}</p>
               </div>
            </div>
            <div className="flex items-center space-x-3">
              {isDirigente && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(selectedPhoto.id); setSelectedPhoto(null); }}
                  className="p-3 bg-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
                >
                  <Trash2 size={20}/>
                </button>
              )}
              <button className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all"><Download size={20}/></button>
              <button className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all"><X size={20}/></button>
            </div>
          </div>
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
             <div className="flex-1 flex items-center justify-center p-4 md:p-10">
                <img src={selectedPhoto.url} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt={selectedPhoto.title} />
             </div>
             <div className="w-full md:w-96 bg-black/30 backdrop-blur-3xl p-10 border-l border-white/5 space-y-10 overflow-y-auto">
                <section>
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Sobre esta Memória</h4>
                   <p className="text-white font-medium leading-relaxed">{selectedPhoto.description || 'Nenhuma descrição detalhada fornecida para este momento.'}</p>
                </section>

                <div className="space-y-4">
                   <InfoItem icon={<Calendar size={14}/>} label="Registrado em" value={new Date(selectedPhoto.createdAt).toLocaleDateString()} />
                   <InfoItem icon={<Award size={14}/>} label="Etapa Relacionada" value={selectedPhoto.stage} />
                   {selectedPhoto.eventId && (
                      <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                        <div className="flex items-center space-x-2">
                           <Star className="text-amber-500" size={14} fill="currentColor" />
                           <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Evento Vinculado</p>
                        </div>
                        <p className="text-xs text-white font-bold">{events.find(e => e.id === selectedPhoto.eventId)?.title || 'Evento da Agenda'}</p>
                      </div>
                   )}
                </div>

                <div className="pt-10 border-t border-white/10 flex flex-col items-center">
                   <div className="w-16 h-1 w-1/3 bg-white/10 rounded-full mb-6"></div>
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] text-center">ECC Brasil • Comunhão e Fé</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Foto */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center p-6 animate-fadeIn">
          <div className={`w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-scaleUp ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
             <div className={`p-8 border-b flex items-center justify-between ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center space-x-3">
                   <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20"><Camera size={24}/></div>
                   <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Nova Memória Digital</h3>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
             </div>

             <form onSubmit={handleSave} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`aspect-video w-full border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${photoUrl ? 'border-amber-500 bg-amber-500/5' : (uploadError ? 'border-red-500 bg-red-500/5' : 'border-slate-300 hover:border-indigo-400')} ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
                        >
                          {photoUrl ? (
                            <img src={photoUrl} className="w-full h-full object-cover rounded-[2.2rem]" alt="Preview" />
                          ) : (
                            <>
                              <Camera className={`mb-2 ${uploadError ? 'text-red-400' : 'text-slate-300'}`} size={32} />
                              <span className={`text-[10px] font-bold uppercase tracking-widest text-center px-6 ${uploadError ? 'text-red-500' : 'text-slate-400'}`}>
                                {uploadError ? 'Erro no Upload' : 'Selecione uma foto do encontro ou evento'}
                              </span>
                            </>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                        {uploadError && (
                          <div className="mt-3 flex items-center justify-center space-x-2 text-red-500 animate-fadeIn">
                            <AlertCircle size={14} />
                            <p className="text-[10px] font-bold uppercase tracking-tighter leading-tight">{uploadError}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Etapa Relacionada</label>
                        <select 
                          value={stage} 
                          onChange={(e) => setStage(e.target.value as any)}
                          className={`w-full px-5 py-3.5 border rounded-2xl outline-none font-bold text-xs appearance-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100'}`}
                        >
                          <option value="GERAL">Geral (Aberto a Todos)</option>
                          <option value={ECCStage.FIRST}>1ª Etapa</option>
                          <option value={ECCStage.SECOND}>2ª Etapa</option>
                          <option value={ECCStage.THIRD}>3ª Etapa</option>
                        </select>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <InputField label="Título da Memória" value={title} onChange={setTitle} placeholder="Ex: Encerramento do 42º ECC..." required isDark={isDark} />
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Descrição do Momento</label>
                        <textarea 
                          value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                          className={`w-full px-5 py-3.5 border rounded-2xl outline-none font-medium text-xs leading-relaxed transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:ring-1 focus:ring-indigo-500' : 'bg-slate-50 border-slate-100 focus:ring-1 focus:ring-indigo-500'}`}
                          placeholder="Compartilhe brevemente o significado desta foto..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vincular a Evento da Agenda (Opcional)</label>
                        <select 
                          value={eventId} 
                          onChange={(e) => setEventId(e.target.value)}
                          className={`w-full px-5 py-3.5 border rounded-2xl outline-none font-bold text-xs appearance-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100'}`}
                        >
                          <option value="">Selecione um evento realizado...</option>
                          {events.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.title} ({new Date(ev.startDate).toLocaleDateString()})</option>
                          ))}
                        </select>
                      </div>
                   </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8 border-t dark:border-slate-800">
                   <button type="button" onClick={resetForm} className="px-8 py-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
                   <button type="submit" disabled={!photoUrl} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-3">
                     <CheckCircle2 size={18}/>
                     <span>Salvar na Galeria</span>
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, required, isDark, type = "text" }: any) => (
  <div className="w-full">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <input 
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      className={`w-full px-5 py-3.5 border rounded-2xl outline-none font-bold text-xs transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:ring-1 focus:ring-indigo-500' : 'bg-slate-50 border-slate-100 focus:ring-1 focus:ring-indigo-500'}`}
    />
  </div>
);

const InfoItem = ({ icon, label, value }: any) => (
  <div className="flex items-center space-x-4">
    <div className="p-2.5 bg-white/5 rounded-xl text-indigo-400">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xs font-bold text-white">{value}</p>
    </div>
  </div>
);

export default Gallery;
