import React, { useState, useEffect } from 'react';
import { Gamepad2, Play, RotateCcw, ShieldAlert, Zap } from 'lucide-react';

export default function FunHub() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, ended
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });

  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem('hubos_highscore');
    return savedScore ? parseInt(savedScore, 10) : 0;
  });

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('ended');
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('hubos_highscore', score.toString());
    }
  }, [score, highScore]);

  const moveTarget = () => {
    // Safety boundaries explicitly scaled down so nodes never render off-screen or under timers
    const randomTop = Math.floor(Math.random() * 50) + 25; 
    const randomLeft = Math.floor(Math.random() * 60) + 20;
    setTargetPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setGameState('playing');
    moveTarget();
  };

  const handleTargetClick = (e) => {
    // Prevents mobile browsers from triggering ghost click zoom behaviors
    e.preventDefault();
    if (gameState !== 'playing') return;
    setScore((prev) => prev + 1);
    moveTarget();
  };

  return (
    <div className="space-y-4 max-w-md mx-auto p-1 pb-24 md:pb-6 flex flex-col h-[calc(100vh-140px)] md:h-auto justify-between sm:justify-start">
      
      {/* Header Profile */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <Gamepad2 className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">Reflex Arcade</h1>
            <p className="text-[10px] text-slate-400">Thumb latency testing stream</p>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-right font-mono shrink-0">
          <span className="text-[9px] text-slate-500 block leading-none">HIGH</span>
          <span className="text-xs font-bold text-rose-400">{highScore}</span>
        </div>
      </div>

      {/* Main Gaming Terminal Frame */}
      <div className="relative w-full flex-1 min-h-[340px] bg-slate-950 border border-slate-900 rounded-2xl flex flex-col items-center justify-center overflow-hidden p-4 shadow-2xl select-none touch-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-20 pointer-events-none" />

        {/* STATE: IDLE SCREEN */}
        {gameState === 'idle' && (
          <div className="text-center z-10 space-y-4 max-w-xs mx-auto px-2">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center mx-auto shadow-md">
              <Zap className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Matrix Engine v1.2</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Tap moving anchors inside the dynamic boundary profile before the timer loop expires.</p>
            </div>
            <button 
              onClick={startGame} 
              onTouchStart={startGame}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition active:scale-95 cursor-pointer"
            >
              Launch Session
            </button>
          </div>
        )}

        {/* STATE: PLAYING MODE PANEL ACTIVE */}
        {gameState === 'playing' && (
          <>
            {/* Live Counter Tracking Overlays */}
            <div className="absolute top-3 left-3 font-mono text-xs text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800/80 shadow-md">
              SCORE: <span className="text-rose-400 font-bold">{score}</span>
            </div>
            
            {/* SVG Floating Timer Ring */}
            <div className="absolute top-3 right-3 flex items-center justify-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-md">
              <svg className="w-7 h-7 transform -rotate-90">
                <circle cx="14" cy="14" r="11" stroke="#1e293b" strokeWidth="2.5" fill="transparent" />
                <circle cx="14" cy="14" r="11" stroke="#f43f5e" strokeWidth="2.5" fill="transparent" strokeDasharray={2 * Math.PI * 11} strokeDashoffset={((10 - timeLeft) / 10) * (2 * Math.PI * 11)} />
              </svg>
              <span className="absolute text-[10px] font-mono font-bold text-slate-300">{timeLeft}</span>
            </div>

            {/* Target Node Button Trigger - onTouchStart triggers zero-latency mobile capture */}
            <button
              onClick={handleTargetClick}
              onTouchStart={handleTargetClick}
              style={{ top: targetPos.top, left: targetPos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-rose-500 rounded-xl border-2 border-white text-white flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.6)] active:scale-90 transition-all duration-75 select-none touch-none cursor-pointer"
            >
              <Zap className="h-5 w-5 fill-white text-white" />
            </button>
          </>
        )}

        {/* STATE: GAME ENDED REPORT */}
        {gameState === 'ended' && (
          <div className="text-center z-10 space-y-4 max-w-xs mx-auto px-2">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Loop Session Ended</h3>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-4 mt-2 max-w-[160px] mx-auto">
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Captured</span>
                <span className="text-xl font-mono font-extrabold text-rose-400">{score}</span>
              </div>
            </div>
            <button 
              onClick={startGame} 
              onTouchStart={startGame}
              className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl shadow-md transition active:text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retry Session Loop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}