import React, { useState } from 'react';
import { Sparkles, Copy, Check, Search, Terminal, Image as ImageIcon } from 'lucide-react';

export default function AiHub() {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Your structural and creative AI prompt library array
  const promptLibrary = [
    {
      id: 'cinematic-render',
      title: 'Cinematic Subject Re-Rendering',
      category: 'Creative Design',
      icon: <ImageIcon className="h-4 w-4 text-orange-400" />,
      summary: 'Optimizes image generators for realistic, subject-focused architectural or product layouts.',
      prompt: 'Cinematic subject-focused lighting, realistic re-rendering, 8k resolution, path tracing simulation, dramatic volumetric shadows, industrial design aesthetic, sharp focus detailing, photorealistic textures --v 6.0'
    },
    {
      id: 'smart-product',
      title: 'Smart Product Brainstorming',
      category: 'Engineering AI',
      icon: <Terminal className="h-4 w-4 text-blue-400" />,
      summary: 'Generates system architecture and sensor integration concepts for electromechanical products.',
      prompt: 'Act as an expert mechatronics systems engineer. Provide a detailed modular component architecture for an AI-powered smart product. Include sensor arrays, microcontroller processing requirements, power management protocols, and edge-computing communication data flow mappings.'
    },
    {
      id: 'fe-mesh',
      title: 'FEA Simulation Optimization',
      category: 'Engineering AI',
      icon: <Terminal className="h-4 w-4 text-purple-400" />,
      summary: 'Gives step-by-step guidance for setting up mesh convergence and load vectors in simulation software.',
      prompt: 'Analyze this structural geometry for Finite Element Analysis (FEA). Suggest the optimal global mesh size, localized inflation layers for high-stress concentration zones, bound conditions, and appropriate convergence criteria for linear static structural loading profiles.'
    }
  ];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Reset icon checkmark after 2 seconds
  };

  // Filter matrix checking Title, Category, Summary, AND the core Prompt text
  const filteredPrompts = promptLibrary.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.summary.toLowerCase().includes(search.toLowerCase()) ||
    p.prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-amber-400 animate-pulse" /> AI Prompt Command
          </h1>
          <p className="text-slate-400 mt-1">Structured system vectors and copy-paste development frameworks.</p>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search prompt vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Prompts Matrix Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((item) => (
          <div 
            key={item.id} 
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition duration-200 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md border border-slate-800 flex items-center gap-1.5">
                  {item.icon} {item.category}
                </span>
                <button
                  onClick={() => handleCopy(item.prompt, item.id)}
                  className="p-2 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl hover:text-amber-400 hover:border-amber-500/40 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Vault</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition">
                {item.title}
              </h3>
              <p className="text-sm text-slate-400 mt-1.5 font-normal leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Hidden/Collapsed code view box for layout aesthetic */}
            <div className="mt-4 bg-slate-950 p-3 rounded-xl border border-slate-900/40 text-xs font-mono text-slate-500 max-h-16 overflow-hidden truncate whitespace-normal select-all">
              {item.prompt}
            </div>
          </div>
        ))}

        {filteredPrompts.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-500">
            No engineering vectors matching your criteria found in local index registry.
          </div>
        )}
      </div>
    </div>
  );
}