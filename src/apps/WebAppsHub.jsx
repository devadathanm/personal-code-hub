import React, { useState } from 'react';
import { AppWindow, ArrowLeftRight, Settings, Sliders } from 'lucide-react';

export default function WebAppsHub() {
  const [category, setCategory] = useState('length');
  const [inputValue, setInputValue] = useState('1');

  // Multi-discipline conversion calculation matrix
  const convertUnits = () => {
    const val = parseFloat(inputValue) || 0;

    if (category === 'length') {
      return [
        { label: 'Millimeters (mm)', value: (val * 25.4).toFixed(3), unit: 'mm' },
        { label: 'Inches (in)', value: (val / 25.4).toFixed(4), unit: 'in' },
        { label: 'Meters (m)', value: (val * 0.0254).toFixed(5), unit: 'm' }
      ];
    } else if (category === 'pressure') {
      return [
        { label: 'Bar', value: (val * 0.0689476).toFixed(4), unit: 'bar' },
        { label: 'PSI (Pounds/Sq-In)', value: (val / 0.0689476).toFixed(2), unit: 'psi' },
        { label: 'Kilopascals (kPa)', value: (val * 6.89476).toFixed(2), unit: 'kPa' }
      ];
    } else if (category === 'temperature') {
      return [
        { label: 'Celsius (°C)', value: ((val - 32) * (5 / 9)).toFixed(2), unit: '°C' },
        { label: 'Fahrenheit (°F)', value: ((val * (9 / 5)) + 32).toFixed(2), unit: '°F' },
        { label: 'Kelvin (K)', value: (((val - 32) * (5 / 9)) + 273.15).toFixed(2), unit: 'K' }
      ];
    }
    return [];
  };

  const results = convertUnits();

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2">
      {/* Header Profile */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
          <AppWindow className="h-8 w-8 text-indigo-500 animate-pulse" /> Web Apps Hub
        </h1>
        <p className="text-slate-400 mt-1">Local utility engines, data transformations, and conversion profiles.</p>
      </div>

      {/* Interface Split Frame */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Control Deck */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" /> Control System
          </h3>

          {/* Conversion Parameter Select */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 font-medium">Measurement Domain</label>
            <select 
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setInputValue(e.target.value === 'temperature' ? '100' : '1'); // Set clean defaults
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="length">Length Dimensional Axis</option>
              <option value="pressure">Fluid Pressure Tolerances</option>
              <option value="temperature">Thermal Thermodynamics</option>
            </select>
          </div>

          {/* Input Value Slider/Numeric Block */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-500 font-medium">Input Baseline Value</label>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                {category === 'length' ? 'Base: Inches / mm' : category === 'pressure' ? 'Base: PSI' : 'Base: Input'}
              </span>
            </div>
            <input 
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Right Transform Result Board */}
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-sm">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-indigo-400" /> Live Matrix Outputs
            </h3>

            {/* Render Output Transformations */}
            <div className="space-y-3">
              {results.map((res, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-between hover:border-slate-800 transition duration-150"
                >
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">{res.label}</span>
                    <span className="text-2xl font-mono font-bold text-indigo-400 mt-1 block select-all">
                      {res.value}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg">
                    {res.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Status Footer */}
          <div className="mt-6 border-t border-slate-800/60 pt-4 text-xs text-slate-500 flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Settings className="h-3.5 w-3.5 animate-spin-slow text-slate-600" /> 
              Engine Target Matrix: {category.toUpperCase()}
            </span>
            <span className="text-indigo-400 font-medium">● Vector Stream Active</span>
          </div>
        </div>

      </div>
    </div>
  );
}