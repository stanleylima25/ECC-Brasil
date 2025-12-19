
import React from 'react';
import { Couple, RegistrationStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Globe, Users, ShieldCheck, Zap } from 'lucide-react';

interface DashboardProps {
  couples: Couple[];
  onRefresh: () => void;
  isDark?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ couples, isDark }) => {
  const approved = couples.filter(c => c.status === RegistrationStatus.APPROVED);
  
  const stateDistribution = approved.reduce((acc: any, curr) => {
    acc[curr.state] = (acc[curr.state] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(stateDistribution).map(s => ({
    name: s,
    casais: stateDistribution[s]
  })).sort((a, b) => b.casais - a.casais);

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SummaryCard 
          icon={<Globe className={isDark ? "text-blue-400" : "text-blue-600"}/>} 
          label="Total Nacional" 
          value={approved.length} 
          color={isDark ? "bg-blue-500/10" : "bg-blue-50"} 
          isDark={isDark}
        />
        <SummaryCard 
          icon={<Users className={isDark ? "text-emerald-400" : "text-emerald-600"}/>} 
          label="Paróquias" 
          value={new Set(approved.map(c => c.parish)).size} 
          color={isDark ? "bg-emerald-500/10" : "bg-emerald-50"} 
          isDark={isDark}
        />
        <SummaryCard 
          icon={<ShieldCheck className={isDark ? "text-amber-400" : "text-amber-600"}/>} 
          label="Homologadores" 
          value={142} 
          color={isDark ? "bg-amber-500/10" : "bg-amber-50"} 
          isDark={isDark}
        />
        <SummaryCard 
          icon={<Zap className={isDark ? "text-purple-400" : "text-purple-600"}/>} 
          label="Sincronizações" 
          value={1240} 
          color={isDark ? "bg-purple-500/10" : "bg-purple-50"} 
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className={`lg:col-span-2 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg lg:text-xl font-black mb-6 lg:mb-8 tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Presença por Estado (UF)</h3>
          <div className="h-[250px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b'}} 
                />
                <Tooltip 
                  cursor={{fill: isDark ? '#0f172a' : '#f8fafc'}} 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="casais" fill={isDark ? "#6366f1" : "#4f46e5"} radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col justify-between ${isDark ? 'bg-indigo-950 border border-indigo-900/50' : 'bg-[#1e293b]'} text-white`}>
          <div>
            <h3 className="text-lg lg:text-xl font-black mb-2 tracking-tight">Comunicado</h3>
            <p className="text-slate-400 text-xs lg:text-sm leading-relaxed">Verifique as fotos dos cônjuges antes da homologação para garantir a integridade do banco de dados.</p>
          </div>
          <div className="mt-6 lg:mt-8 space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Base Integrada</span>
              <span className="text-emerald-400 text-xs font-black">100%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resposta</span>
              <span className="text-blue-400 text-xs font-black">240ms</span>
            </div>
          </div>
          <button className="w-full py-4 mt-8 bg-indigo-600 rounded-xl lg:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
            Relatório Consolidado
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color, isDark }: any) => (
  <div className={`p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] shadow-sm border transition-colors duration-300 flex items-center lg:block ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
    <div className={`w-10 h-10 lg:w-12 lg:h-12 ${color} rounded-xl lg:rounded-2xl flex items-center justify-center mb-0 lg:mb-4 mr-4 lg:mr-0 shrink-0`}>{icon}</div>
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
      <p className="text-xl lg:text-3xl font-black mt-0 lg:mt-1">{value}</p>
    </div>
  </div>
);

export default Dashboard;
