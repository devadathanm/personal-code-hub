import React, { useState, useEffect } from 'react';
import { AppWindow, ArrowLeftRight, Settings, Sliders } from 'lucide-react';

export default function WebAppsHub() {
  const [category, setCategory] = useState(() => localStorage.getItem('hubos_web_category') || 'length');
  const [inputValue, setInputValue] = useState(() => localStorage.getItem('hubos_web_input') || '1');

  useEffect(() => { localStorage.setItem('hubos_web_category', category); }, [category]);
  useEffect(() => { localStorage.setItem('hubos_web_input', inputValue); }, [inputValue]);

  const convertUnits = () => {
    const val = parseFloat(inputValue) || 0;
    if (category === 'length') {
      return [
        { label: 'Millimeters (mm)', value: (val * 25.4).toFixed(2), unit: 'mm' },
        { label: 'Inches (in)', value: (val / 25.4).toFixed(3), unit: 'in' },
        { label: 'Meters (m)', value: (val * 0.0254).toFixed(4), unit: 'm' }
      ];
    } else if (category === 'pressure') {
      return [
        { label: 'Bar', value: (val * 0.0689).toFixed(3), unit: 'bar' },
        { label: 'PSI (Pounds/in²)', value: (val / 0.0689).toFixed(2), unit: 'psi' },
        { label: 'Kilopascals (kPa)', value: (val * 6.8947).toFixed(2), unit: 'kPa' }
      ];
    } else if (category === 'temperature') {
      return [
        { label: 'Celsius (°C)', value: ((val - 32) * (5 / 9)).toFixed(1), unit: '°C' },
        { label: 'Fahrenheit (°F)', value: ((val * (9 / 5)) + 32).toFixed(1), unit: '°F' },
        { label: 'Kelvin (K)', value: (((val - 32) * (5 / 9)) + 273.15).toFixed(1), unit: 'K' }
      ];
    }
    return [];
  };

  const results = convertUnits();

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-1 pb-24 md:pb-6">
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
          <AppWindow className="h-6 w-6 text-indigo-500" /> Transformation App
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Real-time engineering domain unit metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Input System Control */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 h-fit">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" /> Parameters
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium">Domain Module</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setInputValue(e.target.value === 'temperature' ? '100' : '1'); }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer">
                <option value="length">Length Dimensional Axis</option>
                <option value="pressure">Fluid Pressure Tolerances</option>
                <option value="temperature">Thermal Thermodynamics</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium">Baseline Input</label>
              <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        {/* Live Metrics Conversion Yield */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-indigo-400" /> Matrix Outputs
          </h3>
          <div className="space-y-2">
            {results.map((res, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">{res.label}</span>
                  <span className="text-lg font-mono font-bold text-indigo-400 mt-0.5 block select-all truncate max-w-[200px]">{res.value}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 text-slate-500 rounded border border-slate-800">{res.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}