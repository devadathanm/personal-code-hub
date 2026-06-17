import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, RotateCcw, ShieldAlert, Trophy, Waves } from 'lucide-react';

export default function FunHub() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, ended
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [boatY, setBoatY] = useState(140);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [splashes, setSplashes] = useState([]); // Visual particle ripple array

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('hubos_vallam_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const GRAVITY = 0.42; 
  const ROW_STRENGTH = -6.2; // Smooth rowing jump glide
  const CANVAS_HEIGHT = 320;

  // Level tuning matrix
  const pipeSpeed = 2.2 + (currentLevel * 0.3);
  const gapSize = Math.max(135 - (currentLevel * 4), 100);
  const spawnRate = Math.max(95 - (currentLevel * 4), 65);

  const gameLoopRef = useRef();
  const frameCountRef = useRef(0);

  useEffect(() => {
    const calculatedLevel = Math.floor(score / 5) + 1;
    if (calculatedLevel !== currentLevel) setCurrentLevel(calculatedLevel);
  }, [score, currentLevel]);

  // Rowing Action Trigger (Tap)
  const handleRow = (e) => {
    if (e) e.preventDefault();
    if (gameState !== 'playing') return;
    
    setVelocity(ROW_STRENGTH);
    
    // Spawn ripple particles at the boat's tail coordinate
    setSplashes((prev) => [
      ...prev,
      { id: Date.now(), y: boatY + 12, x: 50, opacity: 1 }
    ]);
  };

  const startGame = () => {
    setScore(0);
    setCurrentLevel(1);
    setBoatY(120);
    setVelocity(0);
    setPipes([{ x: 400, topHeight: 80, bottomHeight: 105 }]);
    setSplashes([]);
    frameCountRef.current = 0;
    setGameState('playing');
  };

  // Physics & Animation Pipeline Engine
  useEffect(() => {
    if (gameState !== 'playing') return;

    const updatePhysics = () => {
      // 1. Boat Hydrodynamics
      setBoatY((prevY) => {
        const nextY = prevY + velocity;
        if (nextY > CANVAS_HEIGHT - 28 || nextY < 0) {
          setGameState('ended');
          return nextY > CANVAS_HEIGHT - 28 ? CANVAS_HEIGHT - 28 : 0;
        }
        return nextY;
      });
      setVelocity((prevVel) => prevVel + GRAVITY);

      // 2. Clear out splash particles
      setSplashes((prev) => 
        prev
          .map((s) => ({ ...s, x: s.x - 2, opacity: s.opacity - 0.05 }))
          .filter((s) => s.opacity > 0)
      );

      // 3. Tree Obstacle Stream Loops
      frameCountRef.current += 1;
      setPipes((prevPipes) => {
        let updatedPipes = prevPipes.map((p) => ({ ...p, x: p.x - pipeSpeed }));

        if (updatedPipes.length > 0 && updatedPipes[0].x < -50) {
          updatedPipes.shift();
          setScore((s) => s + 1);
        }

        if (frameCountRef.current % spawnRate === 0) {
          const minH = 40;
          const maxH = CANVAS_HEIGHT - gapSize - minH;
          const topHeight = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
          const bottomHeight = CANVAS_HEIGHT - topHeight - gapSize;
          updatedPipes.push({ x: 360, topHeight, bottomHeight });
        }
        return updatedPipes;
      });

      // 4. Structural Intersect Collision Matrix
      pipes.forEach((p) => {
        if (p.x > 25 && p.x < 75) {
          if (boatY < p.topHeight || boatY > CANVAS_HEIGHT - p.bottomHeight - 24) {
            setGameState('ended');
          }
        }
      });

      gameLoopRef.current = requestAnimationFrame(updatePhysics);
    };

    gameLoopRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, velocity, boatY, pipes, pipeSpeed, gapSize, spawnRate]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('hubos_vallam_highscore', score.toString());
    }
  }, [score, highScore]);

  return (
    <div className="space-y-4 max-w-md mx-auto p-1 pb-24 md:pb-6 flex flex-col h-[calc(100vh-140px)] md:h-auto justify-between sm:justify-start select-none">
      
      {/* HUD Bar Dashboard */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Waves className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-100 tracking-tight flex items-center gap-1">
              വള്ളം കളി <span className="text-amber-500 text-xs font-normal font-mono">v2.0</span>
            </h1>
            <p className="text-[10px] text-slate-400">Chundan Stream Simulation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
            LEVEL {currentLevel}
          </span>
          <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-right font-mono">
            <span className="text-[8px] text-slate-500 block leading-none">BEST</span>
            <span className="text-xs font-bold text-slate-200">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Backwater Arena Container */}
      <div 
        onClick={handleRow}
        onTouchStart={handleRow}
        className="relative w-full h-80 bg-gradient-to-b from-slate-950 via-slate-950 to-cyan-950/40 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl select-none touch-none cursor-pointer"
      >
        {/* Dynamic Water Wave Ripple Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_90%,rgba(6,182,212,0.05)_90%)] bg-[size:100%_1.5rem] opacity-40 pointer-events-none" />

        {/* RENDERING COCONUT TREES OBSTACLES */}
        {gameState !== 'idle' && pipes.map((p, i) => (
          <React.Fragment key={i}>
            {/* Top Down Hanging Coconut Trunk */}
            <div 
              style={{ width: '40px', height: `${p.topHeight}px`, left: `${p.x}px`, top: 0 }}
              className="absolute bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-900 border-b-8 border-x border-amber-700 rounded-b-lg shadow-lg"
            >
              {/* Palm Leaves effect anchor box */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full blur-[1px]" />
            </div>
            {/* Bottom Up Coconut Tree Trunk */}
            <div 
              style={{ width: '40px', height: `${p.bottomHeight}px`, left: `${p.x}px`, bottom: 0 }}
              className="absolute bg-gradient-to-t from-slate-900 via-amber-950/40 to-slate-900 border-t-8 border-x border-amber-700 rounded-t-lg shadow-lg"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full blur-[1px]" />
            </div>
          </React.Fragment>
        ))}

        {/* RENDERING WATER SPLASH PARTICLES */}
        {splashes.map((s) => (
          <div 
            key={s.id}
            style={{ top: `${s.y}px`, left: `${s.x}px`, opacity: s.opacity }}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-[0.5px] pointer-events-none transition-all duration-75"
          />
        ))}

        {/* RENDER CHUNDAN VALLAM HERO OBJECT */}
        {gameState === 'playing' && (
          <div 
            style={{ top: `${boatY}px`, left: '44px', transform: `rotate(${Math.min(Math.max(velocity * 2.5, -20), 25)}deg)` }}
            className="absolute w-10 h-5 bg-gradient-to-r from-amber-800 via-amber-900 to-amber-700 border border-amber-600 rounded-l-full rounded-r-2xl shadow-[0_4px_10px_rgba(245,158,11,0.2)] flex items-center justify-end px-1 transition-transform"
          >
            {/* Traditional Golden Stern/Bow Point */}
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping absolute right-0" />
            {/* Mini Rowers Row representation blocks */}
            <div className="flex gap-0.5 opacity-60 mr-1.5">
              <div className="w-0.5 h-2 bg-white/80 rounded-full rotate-12" />
              <div className="w-0.5 h-2 bg-white/80 rounded-full rotate-12" />
              <div className="w-0.5 h-2 bg-white/80 rounded-full rotate-12" />
            </div>
          </div>
        )}

        {/* LAYERS: IDLE SCREEN */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 space-y-4 z-20">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-md">
              <Waves className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-200 tracking-wide">കുട്ടനാട് അരീന</h3>
              <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto leading-normal">Tap anywhere to row your Snake Boat through the coconut groves. Don't hit the trees!</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="w-full max-w-[180px] py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 cursor-pointer">
              തയ്യാറാവുക (Start)
            </button>
          </div>
        )}

        {/* LAYERS: RUNTIME SCOREBOARD STRIP */}
        {gameState === 'playing' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl font-mono text-xs font-bold text-slate-200 z-10 shadow-lg flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-sans font-normal">SCORE</span>
            <span className="text-amber-500">{score}</span>
          </div>
        )}

        {/* LAYERS: CRASH TERMINAL REPORT */}
        {gameState === 'ended' && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-4 space-y-4 z-20 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-full shadow-md">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">തകർന്നു (Game Over)</h3>
              <div className="flex justify-center gap-2.5 mt-2">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl py-1 px-3 min-w-[70px]">
                  <span className="text-[8px] text-slate-500 block uppercase">Level</span>
                  <span className="text-xs font-mono font-bold text-slate-300">{currentLevel}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl py-1 px-3 min-w-[70px]">
                  <span className="text-[8px] text-slate-500 block uppercase">Score</span>
                  <span className="text-xs font-mono font-bold text-amber-500">{score}</span>
                </div>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="w-full max-w-[180px] py-2.5 bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl shadow-md active:text-white flex items-center justify-center gap-1.5 cursor-pointer">
              <RotateCcw className="h-3.5 w-3.5" /> വീണ്ടും ശ്രമിക്കുക
            </button>
          </div>
        )}
      </div>
    </div>
  );
}