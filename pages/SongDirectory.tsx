
import React, { useState, useEffect } from 'react';
import { Music, Plus, Play, FileText, Search, X, Hash, Info, ExternalLink } from 'lucide-react';
import { ECCSong, ECCStage } from '../types';
import { storageService } from '../services/storageService';

const SongDirectory: React.FC = () => {
  const [songs, setSongs] = useState<ECCSong[]>([]);
  const [activeStage, setActiveStage] = useState<ECCStage>(ECCStage.FIRST);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSong, setViewingSong] = useState<ECCSong | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [stage, setStage] = useState<ECCStage>(ECCStage.FIRST);
  const [category, setCategory] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    setSongs(storageService.getSongs());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newSong: ECCSong = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      author,
      stage,
      category,
      lyrics,
      videoUrl
    };
    storageService.saveSong(newSong);
    setSongs(storageService.getSongs());
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCategory('');
    setLyrics('');
    setVideoUrl('');
  };

  const filtered = songs.filter(s => 
    s.stage === activeStage && 
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          {[ECCStage.FIRST, ECCStage.SECOND, ECCStage.THIRD].map(s => (
            <button
              key={s}
              onClick={() => setActiveStage(s)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeStage === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
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
              placeholder="Buscar música ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium w-full lg:w-64"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(song => (
          <div key={song.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all group cursor-pointer" onClick={() => setViewingSong(song)}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Music size={24} />
              </div>
              <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{song.category}</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1 truncate">{song.title}</h3>
            <p className="text-xs font-bold text-slate-400 mb-6">{song.author}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button className="flex items-center space-x-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                <FileText size={14} />
                <span>Ver Letra</span>
              </button>
              {song.videoUrl && (
                <a href={song.videoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Play size={18} />
                </a>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <Music size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">Nenhuma música cadastrada para a {activeStage}.</p>
          </div>
        )}
      </div>

      {/* Modal Visualização */}
      {viewingSong && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white rounded-3xl shadow-sm"><Music className="text-indigo-600"/></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{viewingSong.title}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{viewingSong.author}</p>
                </div>
              </div>
              <button onClick={() => setViewingSong(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors"><X/></button>
            </div>
            
            <div className="p-10 overflow-y-auto flex-1 bg-[url('https://www.transparenttextures.com/patterns/cream-pixels.png')]">
              <div className="max-w-md mx-auto">
                <pre className="whitespace-pre-wrap font-serif text-lg text-slate-700 leading-relaxed text-center italic">
                  {viewingSong.lyrics}
                </pre>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 text-[10px] font-black uppercase">
                <Hash size={14}/>
                <span>{viewingSong.stage}</span>
              </div>
              {viewingSong.videoUrl && (
                <a href={viewingSong.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-6 py-3 bg-[#ff0000] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200">
                  <Play size={18}/>
                  <span>Ouvir no YouTube</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Adição */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-[#0f172a]/80 flex items-center justify-center p-6 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-slideUp overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">Nova Música para o ECC</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Título</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Autor</label>
                  <input type="text" required value={author} onChange={e => setAuthor(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Etapa</label>
                  <select value={stage} onChange={e => setStage(e.target.value as ECCStage)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold appearance-none">
                    <option value={ECCStage.FIRST}>1ª Etapa</option>
                    <option value={ECCStage.SECOND}>2ª Etapa</option>
                    <option value={ECCStage.THIRD}>3ª Etapa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                  <input type="text" required value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: Entrada, Ofertas..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Letra Completa</label>
                <textarea required rows={6} value={lyrics} onChange={e => setLyrics(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium leading-relaxed italic" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link do Vídeo (Opcional)</label>
                <div className="relative">
                  <Play className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-3 text-slate-400 font-bold">Cancelar</button>
                <button type="submit" className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">Homologar Música</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongDirectory;
