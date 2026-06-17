import React, { useState } from 'react';
import { Sparkles, Copy, Check, Search, Terminal, Image as ImageIcon } from 'lucide-react';

export default function AiHub() {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const promptLibrary = [
    { id: 'cinematic-render', title: 'Cinematic Rendering', category: 'Creative', icon: <ImageIcon className="h-3 w-3 text-orange-400" />, summary: 'Optimizes image generators for realistic layout structures.', prompt: 'Cinematic subject-focused lighting, realistic re-rendering, 8k resolution, path tracing simulation --v 6.0' },
    { id: 'smart-product', title: 'Smart Product Design', category: 'Engineering', icon: <Terminal className="h-3 w-3 text-blue-400" />, summary: 'Generates system concepts for mechatronics platforms.', prompt: 'Act as an expert mechatronics engineer. Provide a detailed modular component architecture for an AI-powered product.' },
    { id: 'fe-mesh', title: 'FEA Simulation Options', category: 'Simulation', icon: <Terminal className="h-3 w-3 text-purple-400" />, summary: 'Guidance rules for localized loading profiles.', prompt: 'Analyze structural geometry for FEA. Suggest the optimal global mesh size and loading profiles.' }
  ];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPrompts = promptLibrary.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.summary.toLowerCase().includes(search.toLowerCase()) ||
    p.prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-1 pb-24 md:pb-6">
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" /> Prompt Command
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Copy-paste structural vector prompt engines.</p>
        </div>
        <div className="relative w-full sm:w-60 shrink-0">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input type="text" placeholder="Search prompts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPrompts.map((item) => (
          <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-800 flex items-center gap-1">
                  {item.icon} {item.category}
                </span>
                <button onClick={() => handleCopy(item.prompt, item.id)} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded-lg hover:border-amber-500/40 transition flex items-center gap-1 cursor-pointer">
                  {copiedId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <h3 className="text-sm font-bold text-slate-200">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">{item.summary}</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-500 truncate select-all">
              {item.prompt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}