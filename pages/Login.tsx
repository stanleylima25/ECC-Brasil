
import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ChevronRight, AlertTriangle, UserCircle, Landmark, Globe, UserPlus, LogIn, CheckCircle2, Heart } from 'lucide-react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('STAGE_1_TEAM');
  const [parish, setParish] = useState('');
  const [region, setRegion] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const user = storageService.findUser(email, password);
      if (user) {
        localStorage.setItem('ecc_session', JSON.stringify(user));
        onLogin(user);
      } else {
        setError("E-mail ou senha incorretos. Verifique suas credenciais.");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("É necessário declarar sua autoridade eclesiástica para prosseguir.");
      return;
    }
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const newUser: User & { password?: string } = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          role,
          email,
          password,
          parish,
          region
        };
        storageService.saveUser(newUser);
        alert("Acesso criado com sucesso! Agora você pode realizar o login.");
        setIsSignup(false);
        setPassword('');
      } catch (err: any) {
        setError(err.message);
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center p-6 bg-amber-500 rounded-3xl shadow-2xl shadow-amber-500/20 mb-6 border-4 border-amber-400">
            <ShieldCheck className="w-16 h-16 text-[#0f172a]" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">ECC BRASIL</h1>
          <p className="text-amber-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-3">Sistema de Gestão e Comunicação</p>
        </div>

        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden p-8 lg:p-12 border border-slate-200 animate-slideUp">
          
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsSignup(false); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${!isSignup ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              <LogIn size={14} />
              <span>Acessar</span>
            </button>
            <button 
              onClick={() => { setIsSignup(true); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${isSignup ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              <UserPlus size={14} />
              <span>Novo Cadastro</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center space-x-3 text-red-700 animate-shake">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="text-[10px] font-black uppercase">{error}</p>
            </div>
          )}

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
            {isSignup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome do Casal ou Usuário</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" placeholder="Ex: João e Maria Silva" required />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sua Função no ECC</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs appearance-none"
                    >
                      <optgroup label="Coordenação">
                        <option value="NATIONAL_COUNCIL">Conselho Nacional</option>
                        <option value="NATIONAL_COUPLE">Casal Nacional</option>
                        <option value="REGIONAL_COUPLE">Casal Regional</option>
                        <option value="SPIRITUAL_DIRECTOR">Diretor Espiritual</option>
                        <option value="ARCHDIOCESAN_COUPLE">Casal Arquidiocesano</option>
                        <option value="STAGE_1_TEAM">Equipe Dirigente 1ª Etapa</option>
                        <option value="STAGE_2_TEAM">Equipe Dirigente 2ª Etapa</option>
                        <option value="STAGE_3_TEAM">Equipe Dirigente 3ª Etapa</option>
                      </optgroup>
                      <optgroup label="Comunidade">
                        <option value="COUPLE_USER">Casal Encontrista / Inscrito</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sua Paróquia</label>
                  <div className="relative">
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={parish} onChange={e => setParish(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" placeholder="Nome da Paróquia" required />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sua Região</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={region} onChange={e => setRegion(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" placeholder="Região Leste, Sul..." required />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" placeholder="exemplo@ecc.org.br" required />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" placeholder="••••••••" required />
                </div>
              </div>
            </div>

            {isSignup && (
              <div className="flex items-start space-x-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded text-indigo-600 border-slate-300" />
                <label htmlFor="terms" className="text-[9px] text-slate-600 font-bold leading-relaxed uppercase">
                  Declaro que as informações acima são verdadeiras e que este acesso será utilizado para comunicação com a coordenação do ECC.
                </label>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full py-5 bg-[#0f172a] text-white font-black rounded-3xl shadow-2xl hover:bg-black transition-all flex items-center justify-center space-x-3 group active:scale-95 disabled:opacity-50">
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs">{isSignup ? 'Finalizar Cadastro' : 'Entrar no Sistema'}</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {!isSignup && (
            <div className="mt-8 pt-8 border-t border-slate-100 text-center flex flex-col items-center space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center space-x-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Base de dados criptografada</span>
              </p>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center space-x-3">
                 <Heart size={16} className="text-amber-500" />
                 <p className="text-[9px] font-black text-amber-600 uppercase">Casais: Utilizem este portal para conversar com sua coordenação.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
