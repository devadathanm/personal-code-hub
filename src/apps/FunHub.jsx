import React, { useState, useEffect } from 'react';
import { Gamepad2, Play, RotateCcw, ShieldAlert, Zap } from 'lucide-react';

export default function FunHub() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, ended
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });

  // LEVEL 3 STATE: Initialize straight from browser hardware storage memory
  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem('hubos_highscore');
    return savedScore ? parseInt(savedScore, 10) : 0;
  });

  // Game countdown timer logic hook
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('ended');
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // LEVEL 3 STORAGE WRITER: Synchronize high score to device cache when score updates
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('hubos_highscore', score.toString());
    }
  }, [score, highScore]);

  // Teleport the click target randomly within the panel frame
  const moveTarget = () => {
    // Tighter safety percentages keep the button from overlapping layout borders on mobile
    const randomTop = Math.floor(Math.random() * 60) + 20; 
    const randomLeft = Math.floor(Math.random() * 70) + 15;
    setTargetPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setGameState('playing');
    moveTarget();
  };

  const handleTargetClick = () => {
    if (gameState !== 'playing') return;
    setScore((prev) => prev + 1);
    moveTarget();
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-1 pb-24 md:pb-6">
      
      {/* Header Profile - Stack vertically on mobile, row layout on desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 sm:h-8 sm:w-8 text-rose-500 animate-pulse" /> Fun Playground
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 leading-tight">Local matrix execution loops and speed testing arrays.</p>
        </div>
        
        {/* Leaderboard Array Display */}
        <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs w-full sm:w-auto text-center sm:text-left shrink-0">
          <span className="text-slate-500">ALL-TIME HIGH:</span>{' '}
          <span className="text-rose-400 font-bold">{highScore} Pts</span>
        </div>
      </div>

      {/* Main Gaming Terminal Frame - Dynamically scales height safely */}
      <div className="relative w-full h-[65vh] sm:h-[450px] md:h-96 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col items-center justify-center overflow-hidden shadow-inner p-4 touch-none">
        
        {/* Subtle grid background tracking layout line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

        {/* STATE: IDLE / START SCREEN */}
        {gameState === 'idle' && (
          <div className="text-center安全 context z-10 space-y-4 max-w-sm mx-auto px-2">
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto shadow-lg">
              <Zap className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Reflex Matrix Engine</h3>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
              Tap the shifting neon anchor vectors as fast as possible before the 10-second buffer loop expires.
            </p>
            <button
              onClick={startGame}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-white" /> Initialize Grid Session
            </button>
          </div>
        )}

        {/* STATE: PLAYING MODE PANEL ACTIVE */}
        {gameState === 'playing' && (
          <>
            {/* Live Counter Tracking Overlays - Shifted down safely away from mobile notches */}
            <div className="absolute top-3 left-4 font-mono text-xs tracking-wider text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              SCORE: <span className="text-rose-400 font-bold">{score}</span>
            </div>
            <div className="absolute top-3 right-4 font-mono text-xs tracking-wider text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              LOOP: <span className={`font-bold ${timeLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>{timeLeft}s</span>
            </div>

            {/* Target Node Button Trigger */}
            <button
              onClick={handleTargetClick}
              style={{ top: targetPos.top, left: targetPos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-rose-500 rounded-xl border-2 border-white text-white flex items-center justify-center font-bold shadow-[0_0_25px_#f43f5e] active:scale-90 transition-all duration-75 cursor-pointer"
            >
              <Zap className="h-5 w-5 fill-white" />
            </button>
          </>
        )}

        {/* STATE: GAME ENDED REPORT */}
        {gameState === 'ended' && (
          <div className="text-center z-10 space-y-4 max-w-sm mx-auto px-2">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Session Expired</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 max-w-xs mx-auto">
              <span className="text-[10px] text-slate-500 block">Matches Captured</span>
              <span className="text-2xl font-mono font-extrabold text-rose-400">{score}</span>
            </div>
            <button
              onClick={startGame}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Stream Loop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}