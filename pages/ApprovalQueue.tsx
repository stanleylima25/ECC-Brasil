
import React, { useState } from 'react';
import { Couple, RegistrationStatus, ECCDocument } from '../types';
import { storageService } from '../services/storageService';
import { Check, X, AlertCircle, Calendar, Phone, MapPin, Globe, Map, FileText, Download, Eye } from 'lucide-react';

interface ApprovalQueueProps {
  couples: Couple[];
  onRefresh: () => void;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ couples, onRefresh }) => {
  const [viewingDocs, setViewingDocs] = useState<ECCDocument[] | null>(null);

  const handleApprove = (id: string) => {
    storageService.approveCouple(id);
    onRefresh();
  };

  const handleReject = (id: string) => {
    if (confirm('Deseja realmente rejeitar este cadastro? Esta ação é irreversível.')) {
      storageService.rejectCouple(id);
      onRefresh();
    }
  };

  const downloadDoc = (doc: ECCDocument) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  };

  if (couples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <Check size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tudo em dia!</h2>
          <p className="text-slate-500">Não há solicitações de cadastro pendentes de coordenação.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {couples.map(couple => (
          <div key={couple.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="flex -space-x-3">
                  <div className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden shadow-sm bg-slate-100">
                    <img 
                      src={couple.husband.photoBase64 || 'https://picsum.photos/100/100'} 
                      className="w-full h-full object-cover" 
                      alt="Marido"
                    />
                  </div>
                  <div className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden shadow-sm bg-slate-100">
                    <img 
                      src={couple.wife.photoBase64 || 'https://picsum.photos/101/101'} 
                      className="w-full h-full object-cover" 
                      alt="Esposa"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleReject(couple.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                    title="Rejeitar Registro"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={() => handleApprove(couple.id)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center space-x-2"
                  >
                    <Check size={18} />
                    <span>Homologar</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{couple.husband.name} & {couple.wife.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1 uppercase font-bold tracking-widest">
                    <Calendar size={12} />
                    <span>Solicitado em {new Date(couple.createdAt).toLocaleDateString()} às {new Date(couple.createdAt).toLocaleTimeString()}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 border-l-2 border-indigo-100 pl-4 py-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
                    <Globe size={14} />
                    <span>{couple.parish}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                    <Map size={12} />
                    <span>{couple.region} • {couple.city}/{couple.state}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Phone size={16} className="text-indigo-400 shrink-0" />
                    <span className="font-bold">{couple.phone}</span>
                  </div>
                  {couple.documents && couple.documents.length > 0 && (
                    <button 
                      onClick={() => setViewingDocs(couple.documents)}
                      className="text-[10px] font-black text-indigo-600 uppercase flex items-center space-x-1 hover:underline"
                    >
                      <FileText size={14} />
                      <span>{couple.documents.length} Docs para Verificação</span>
                    </button>
                  )}
                </div>

                {couple.encounters.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Etapas para Validar</p>
                    <div className="flex flex-wrap gap-2">
                      {couple.encounters.map(e => (
                        <span key={e.id} className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg border border-amber-100">
                          {e.stage} • Encontro {e.number}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-3 flex items-center space-x-2">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Acesso restrito ao coordenador setorial</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Documentos */}
      {viewingDocs && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">Documentação Digitalizada</h3>
              <button onClick={() => setViewingDocs(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X/></button>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              {viewingDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm"><FileText className="text-indigo-500" /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enviado em {new Date(doc.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                     <button onClick={() => downloadDoc(doc)} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"><Download size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setViewingDocs(null)} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApprovalQueue;
