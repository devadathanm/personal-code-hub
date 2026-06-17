import React, { useState, useEffect } from 'react';
import { Gamepad2, Play, RotateCcw, ShieldAlert, Zap } from 'lucide-react';

export default function FunHub() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, ended
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });

  // Game countdown timer logic hook
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('ended');
      if (score > highScore) setHighScore(score);
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // Teleport the click target randomly within the panel frame
  const moveTarget = () => {
    const randomTop = Math.floor(Math.random() * 70) + 15; // stay inside bounds %
    const randomLeft = Math.floor(Math.random() * 80) + 10;
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
    <div className="space-y-6 max-w-5xl mx-auto p-2">
      {/* Header Profile */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-rose-500 animate-pulse" /> Fun Projects Playground
          </h1>
          <p className="text-slate-400 mt-1">Local sandbox modules, simulation games, and experimental math rendering.</p>
        </div>
        
        {/* Leaderboard Array Display */}
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl font-mono text-xs">
          <span className="text-slate-500">ALL-TIME HIGH:</span>{' '}
          <span className="text-rose-400 font-bold">{highScore} Pts</span>
        </div>
      </div>

      {/* Main Gaming Terminal Frame */}
      <div className="relative w-full h-96 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col items-center justify-center overflow-hidden shadow-inner group">
        
        {/* Subtle grid background tracking layout line overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

        {/* STATE: IDLE / START SCREEN */}
        {gameState === 'idle' && (
          <div className="text-center z-10 space-y-4 max-w-sm px-4">
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
              <Zap className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">Reflex Matrix Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test your input targeting speed. Tap the shifting neon anchor vectors as fast as possible before the 10-second buffer loop expires.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/20 transition flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" /> Initialize Grid Session
            </button>
          </div>
        )}

        {/* STATE: PLAYING MODE PANEL ACTIVE */}
        {gameState === 'playing' && (
          <>
            {/* Live Counter Tracking Overlays */}
            <div className="absolute top-4 left-6 font-mono text-sm tracking-wider text-slate-400">
              SCORE: <span className="text-rose-400 font-bold">{score}</span>
            </div>
            <div className="absolute top-4 right-6 font-mono text-sm tracking-wider text-slate-400">
              BUFFER LOOP: <span className={`font-bold ${timeLeft <= 3 ? 'text-rose-500 animate-ping' : 'text-emerald-400'}`}>{timeLeft}s</span>
            </div>

            {/* Target Node Button Trigger */}
            <button
              onClick={handleTargetClick}
              style={{ top: targetPos.top, left: targetPos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-rose-500 rounded-xl border-2 border-white text-white flex items-center justify-center font-bold shadow-[0_0_20px_#f43f5e] hover:scale-110 active:scale-95 transition-all duration-100 cursor-pointer animate-none"
            >
              <Zap className="h-5 w-5 fill-white" />
            </button>
          </>
        )}

        {/* STATE: GAME ENDED REPORT */}
        {gameState === 'ended' && (
          <div className="text-center z-10 space-y-4 max-w-sm px-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">Session Buffer Expired</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-xl py-3 px-6 max-w-xs mx-auto">
              <span className="text-xs text-slate-500 block">Total Target Matches Captured</span>
              <span className="text-3xl font-mono font-extrabold text-rose-400">{score}</span>
            </div>
            <button
              onClick={startGame}
              className="px-5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 font-semibold text-sm rounded-xl transition flex items-center gap-2 mx-auto cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> Reset Stream Loop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}