import React, { useState, useEffect } from 'react';
import { Wrench, Calculator, Layers } from 'lucide-react';

export default function EngineeringHub() {
  // LEVEL 3 STATE: Pull last session metrics from storage array or load standard engineering baselines
  const [shape, setShape] = useState(() => {
    return localStorage.getItem('hubos_eng_shape') || 'rectangle';
  });

  const [dim1, setDim1] = useState(() => {
    return localStorage.getItem('hubos_eng_dim1') || '100';
  });

  const [dim2, setDim2] = useState(() => {
    return localStorage.getItem('hubos_eng_dim2') || '50';
  });

  // LEVEL 3 SYNCHRONIZERS: Automatically mirror data states to local device storage layers on mutation
  useEffect(() => {
    localStorage.setItem('hubos_eng_shape', shape);
  }, [shape]);

  useEffect(() => {
    localStorage.setItem('hubos_eng_dim1', dim1);
  }, [dim1]);

  useEffect(() => {
    localStorage.setItem('hubos_eng_dim2', dim2);
  }, [dim2]);

  // Math engine for advanced cross-sectional & structural properties
  const calculateProperties = () => {
    let area = 0;
    let ix = 0;
    let iy = 0;
    let zx = 0; // Section Modulus
    let rx = 0; // Radius of Gyration

    const w = parseFloat(dim1) || 0;
    const h = parseFloat(dim2) || 0;

    if (shape === 'rectangle') {
      area = w * h;
      ix = (w * Math.pow(h, 3)) / 12;
      iy = (h * Math.pow(w, 3)) / 12;
      
      // Zx = Ix / y_max (where y_max = h / 2)
      zx = h > 0 ? ix / (h / 2) : 0;
      // rx = sqrt(Ix / Area)
      rx = area > 0 ? Math.sqrt(ix / area) : 0;
    } else if (shape === 'pipe') {
      // dim1 = Outer Diameter (D), dim2 = Inner Diameter (d)
      const rOut = w / 2;
      const rIn = h / 2;
      area = Math.PI * (Math.pow(rOut, 2) - Math.pow(rIn, 2));
      ix = (Math.PI * (Math.pow(w, 4) - Math.pow(h, 4))) / 64;
      iy = ix; // Symmetrical
      
      // Zx = Ix / rOut (where rOut = w / 2)
      zx = w > 0 ? ix / (w / 2) : 0;
      rx = area > 0 ? Math.sqrt(ix / area) : 0;
    }

    return {
      area: area.toFixed(2),
      ix: ix.toExponential(3),
      iy: iy.toExponential(3),
      zx: zx.toExponential(3),
      rx: rx.toFixed(2)
    };
  };

  const results = calculateProperties();

  return (
    // pb-24 handles safe spacing above iPhone home indicators across mobile viewports
    <div className="space-y-6 max-w-5xl mx-auto p-2 pb-24 md:pb-6 scroll-touch">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
          <Wrench className="h-8 w-8 text-blue-500 animate-pulse" /> Engineering Workspace
        </h1>
        <p className="text-slate-400 mt-1">Mechanical calculators and section modulus analysis profiles.</p>
      </div>

      {/* Calculator Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Panel: Inputs */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-400" /> Section Input
          </h3>
          
          {/* Shape Select */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-medium">Profile Shape</label>
            <select 
              value={shape} 
              onChange={(e) => setShape(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="rectangle">Solid Rectangle</option>
              <option value="pipe">Hollow Pipe / Cylinder</option>
            </select>
          </div>

          {/* Dimension 1 */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-medium">
              {shape === 'rectangle' ? 'Width (b) in mm' : 'Outer Diameter (D) in mm'}
            </label>
            <input 
              type="number" 
              value={dim1}
              onChange={(e) => setDim1(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
            />
          </div>

          {/* Dimension 2 */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-medium">
              {shape === 'rectangle' ? 'Height (h) in mm' : 'Inner Diameter (d) in mm'}
            </label>
            <input 
              type="number" 
              value={dim2}
              onChange={(e) => setDim2(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition font-mono"
            />
          </div>
        </div>

        {/* Right Panel: Live Output Display */}
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-emerald-400" /> Geometric Properties Telemetry
            </h3>

            {/* Results Grid - Expanded to 5 items to hold Zx and rx */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-xs text-slate-500 block">Cross-Sectional Area</span>
                <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block select-all">{results.area}</span>
                <span className="text-[10px] text-slate-600 font-mono">mm²</span>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-xs text-slate-500 block">Moment of Inertia (Ix)</span>
                <span className="text-xl font-mono font-bold text-blue-400 mt-1 block select-all">{results.ix}</span>
                <span className="text-[10px] text-slate-600 font-mono">mm⁴</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-xs text-slate-500 block">Moment of Inertia (Iy)</span>
                <span className="text-xl font-mono font-bold text-purple-400 mt-1 block select-all">{results.iy}</span>
                <span className="text-[10px] text-slate-600 font-mono">mm⁴</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-xs text-slate-500 block">Section Modulus (Zx)</span>
                <span className="text-xl font-mono font-bold text-amber-400 mt-1 block select-all">{results.zx}</span>
                <span className="text-[10px] text-slate-600 font-mono">mm³</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-xs text-slate-500 block">Radius of Gyration (rx)</span>
                <span className="text-xl font-mono font-bold text-cyan-400 mt-1 block select-all">{results.rx}</span>
                <span className="text-[10px] text-slate-600 font-mono">mm</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800/60 pt-4 text-xs text-slate-500 flex justify-between items-center gap-2 flex-wrap">
            <span>Formula Matrix: {shape === 'rectangle' ? 'b·h³ / 12 | Zx = Ix / (h/2)' : 'π·(D⁴ - d⁴) / 64 | Zx = Ix / (D/2)'}</span>
            <span className="text-blue-500 font-medium whitespace-nowrap">● Real-time Solver Engaged</span>
          </div>
        </div>

      </div>
    </div>
  );
}