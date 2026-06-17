import React, { useState, useEffect } from 'react';
import { Wrench, Calculator, Layers } from 'lucide-react';

export default function EngineeringHub() {
  const [shape, setShape] = useState(() => localStorage.getItem('hubos_eng_shape') || 'rectangle');
  const [dim1, setDim1] = useState(() => localStorage.getItem('hubos_eng_dim1') || '100');
  const [dim2, setDim2] = useState(() => localStorage.getItem('hubos_eng_dim2') || '50');

  useEffect(() => { localStorage.setItem('hubos_eng_shape', shape); }, [shape]);
  useEffect(() => { localStorage.setItem('hubos_eng_dim1', dim1); }, [dim1]);
  useEffect(() => { localStorage.setItem('hubos_eng_dim2', dim2); }, [dim2]);

  const calculateProperties = () => {
    let area = 0, ix = 0, iy = 0, zx = 0, rx = 0;
    const w = parseFloat(dim1) || 0;
    const h = parseFloat(dim2) || 0;

    if (shape === 'rectangle') {
      area = w * h;
      ix = (w * Math.pow(h, 3)) / 12;
      iy = (h * Math.pow(w, 3)) / 12;
      zx = h > 0 ? ix / (h / 2) : 0;
      rx = area > 0 ? Math.sqrt(ix / area) : 0;
    } else if (shape === 'pipe') {
      const rOut = w / 2;
      const rIn = h / 2;
      area = Math.PI * (Math.pow(rOut, 2) - Math.pow(rIn, 2));
      ix = (Math.PI * (Math.pow(w, 4) - Math.pow(h, 4))) / 64;
      iy = ix;
      zx = w > 0 ? ix / (w / 2) : 0;
      rx = area > 0 ? Math.sqrt(ix / area) : 0;
    }

    return {
      area: area.toFixed(2),
      ix: ix.toExponential(2),
      iy: iy.toExponential(2),
      zx: zx.toExponential(2),
      rx: rx.toFixed(2)
    };
  };

  const results = calculateProperties();

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-1 pb-24 md:pb-6">
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-blue-500" /> Engineering Suite
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Section modulus analysis and property solver solvers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Input Panel */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-400" /> Parameters
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium">Profile Geometry</label>
              <select value={shape} onChange={(e) => setShape(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer">
                <option value="rectangle">Solid Rectangle</option>
                <option value="pipe">Hollow Pipe</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium">{shape === 'rectangle' ? 'Width (b) mm' : 'Outer Dia (D) mm'}</label>
              <input type="number" value={dim1} onChange={(e) => setDim1(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium">{shape === 'rectangle' ? 'Height (h) mm' : 'Inner Dia (d) mm'}</label>
              <input type="number" value={dim2} onChange={(e) => setDim2(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Telemetry Output Board */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between backdrop-blur-sm space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" /> Output Telemetry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Cross Area', val: results.area, unit: 'mm²', color: 'text-emerald-400' },
                { label: 'Inertia Ix', val: results.ix, unit: 'mm⁴', color: 'text-blue-400' },
                { label: 'Inertia Iy', val: results.iy, unit: 'mm⁴', color: 'text-purple-400' },
                { label: 'Modulus Zx', val: results.zx, unit: 'mm³', color: 'text-amber-400' },
                { label: 'Gyration rx', val: results.rx, unit: 'mm', color: 'text-cyan-400' },
              ].map((res, i) => (
                <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">{res.label}</span>
                    <span className={`text-base font-mono font-bold ${res.color} mt-0.5 block select-all truncate max-w-[160px]`}>{res.val}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-slate-500 rounded border border-slate-800">{res.unit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/60 truncate">
            Matrix: {shape === 'rectangle' ? 'b·h³/12' : 'π·(D⁴-d⁴)/64'}
          </div>
        </div>
      </div>
    </div>
  );
}