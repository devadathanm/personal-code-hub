import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, RotateCcw, ShieldAlert, Trophy } from 'lucide-react';

export default function FunHub() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, ended
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [birdY, setBirdY] = useState(150);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('hubos_bird_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Base physics baselines (Slower, smoother fall curve for mobile screens)
  const GRAVITY = 0.45;
  const JUMP_STRENGTH = -6.5;
  const CANVAS_HEIGHT = 320;

  // LEVEL CONFIGURATION MATRIX (Calculated dynamically based on currentLevel)
  const pipeSpeed = 2 + (currentLevel * 0.4); // Starts slower (2.4), speeds up gradually
  const gapSize = Math.max(130 - (currentLevel * 4), 95); // Starts wide (126px), shrinks slowly
  const spawnRate = Math.max(100 - (currentLevel * 5), 65); // Pipes arrive faster as levels climb

  const gameLoopRef = useRef();
  const frameCountRef = useRef(0);

  // Dynamic Level Trigger: Every 5 points, increase the challenge rating
  useEffect(() => {
    const calculatedLevel = Math.floor(score / 5) + 1;
    if (calculatedLevel !== currentLevel) {
      setCurrentLevel(calculatedLevel);
    }
  }, [score, currentLevel]);

  // Jump Action Handler
  const handleJump = (e) => {
    if (e) e.preventDefault();
    if (gameState !== 'playing') return;
    setVelocity(JUMP_STRENGTH);
  };

  // Initialize Game Environment
  const startGame = () => {
    setScore(0);
    setCurrentLevel(1);
    setBirdY(130);
    setVelocity(0);
    setPipes([{ x: 400, topHeight: 90, bottomHeight: 100 }]);
    frameCountRef.current = 0;
    setGameState('playing');
  };

  // Frame Rendering Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const updatePhysics = () => {
      // 1. Bird Movement Vector
      setBirdY((prevY) => {
        const nextY = prevY + velocity;
        if (nextY > CANVAS_HEIGHT - 24 || nextY < 0) {
          setGameState('ended');
          return nextY > CANVAS_HEIGHT - 24 ? CANVAS_HEIGHT - 24 : 0;
        }
        return nextY;
      });
      setVelocity((prevVel) => prevVel + GRAVITY);

      // 2. Obstacle Generation and Shifts
      frameCountRef.current += 1;
      setPipes((prevPipes) => {
        let updatedPipes = prevPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - pipeSpeed,
        }));

        // Filter old pipes out & yield score increments
        if (updatedPipes.length > 0 && updatedPipes[0].x < -45) {
          updatedPipes.shift();
          setScore((s) => s + 1);
        }

        // Spawn dynamic, completely randomized pipe positions
        if (frameCountRef.current % spawnRate === 0) {
          const minHeight = 30;
          const maxHeight = CANVAS_HEIGHT - gapSize - minHeight;
          // Random generator ensures the gaps are never in the same sequence pattern
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
          const bottomHeight = CANVAS_HEIGHT - topHeight - gapSize;
          
          updatedPipes.push({ x: 360, topHeight, bottomHeight });
        }

        return updatedPipes;
      });

      // 3. Precise Collision Intersect Engine
      pipes.forEach((pipe) => {
        // Checking if the bird bounding profile crosses into the horizontal pipe width boundary
        if (pipe.x > 24 && pipe.x < 74) {
          if (birdY < pipe.topHeight || birdY > CANVAS_HEIGHT - pipe.bottomHeight - 24) {
            setGameState('ended');
          }
        }
      });

      gameLoopRef.current = requestAnimationFrame(updatePhysics);
    };

    gameLoopRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, velocity, birdY, pipes, pipeSpeed, gapSize, spawnRate]);

  // Sync personal milestone scores to physical cache memory arrays
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('hubos_bird_highscore', score.toString());
    }
  }, [score, highScore]);

  return (
    <div className="space-y-4 max-w-md mx-auto p-1 pb-24 md:pb-6 flex flex-col h-[calc(100vh-140px)] md:h-auto justify-between sm:justify-start select-none">
      
      {/* Top Status HUD Board */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Gamepad2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">Aero Stream Engine</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                Lv. {currentLevel}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-right font-mono shrink-0 flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <div>
            <span className="text-[8px] text-slate-500 block leading-none text-left">BEST</span>
            <span className="text-xs font-bold text-slate-200">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Vector Rendering Screen Frame */}
      <div 
        onClick={handleJump}
        onTouchStart={handleJump}
        className="relative w-full h-80 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl select-none touch-none cursor-pointer"
      >
        {/* Subtle grid system background wire lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30 pointer-events-none" />

        {/* HIGH VISIBILITY PIPES GENERATOR */}
        {gameState !== 'idle' && pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            {/* Top Tube Obstacle - Enhanced high-contrast styling */}
            <div 
              style={{ width: '44px', height: `${pipe.topHeight}px`, left: `${pipe.x}px`, top: 0 }}
              className="absolute bg-gradient-to-b from-slate-900 to-slate-950 border-b-4 border-x border-emerald-500/80 rounded-b-xl shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
            />
            {/* Bottom Tube Obstacle */}
            <div 
              style={{ width: '44px', height: `${pipe.bottomHeight}px`, left: `${pipe.x}px`, bottom: 0 }}
              className="absolute bg-gradient-to-t from-slate-900 to-slate-950 border-t-4 border-x border-emerald-500/80 rounded-t-xl shadow-[0_-4px_15px_rgba(16,185,129,0.2)]"
            />
          </React.Fragment>
        ))}

        {/* HERO OBJECT: FLUID AVATAR NODES */}
        {gameState === 'playing' && (
          <div 
            style={{ top: `${birdY}px`, left: '44px' }}
            className="absolute w-6 h-6 bg-emerald-400 border-2 border-white rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.6)] flex items-center justify-center transition-transform duration-75"
          >
            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full ml-1.5 mb-1" />
          </div>
        )}

        {/* RUNTIME DASH OVERLAYS: START CONTROLS */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 space-y-4 z-20">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-md">
              <Play className="h-4 w-4 text-emerald-400 fill-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Adaptive Stream Active</h3>
              <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">Tap anywhere to float. Score increments every 5 points scale difficulty parameters in real time.</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="w-full max-w-[180px] py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer">
              Launch Stream Loop
            </button>
          </div>
        )}

        {/* RUNTIME DASH OVERLAYS: SCORING ENGINE COUNTER */}
        {gameState === 'playing' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl font-mono text-xs font-bold text-slate-200 z-10 shadow-lg flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-sans font-normal">SCORE</span>
            <span className="text-emerald-400">{score}</span>
          </div>
        )}

        {/* RUNTIME DASH OVERLAYS: DEFEAT SUMMARY SHEET */}
        {gameState === 'ended' && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-4 space-y-4 z-20 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-full shadow-md">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Simulation Interrupted</h3>
              <div className="flex justify-center gap-3 mt-2">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl py-1 px-3 min-w-[70px]">
                  <span className="text-[8px] text-slate-500 block uppercase">Level</span>
                  <span className="text-sm font-mono font-bold text-slate-300">{currentLevel}</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl py-1 px-3 min-w-[70px]">
                  <span className="text-[8px] text-slate-500 block uppercase">Yield</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">{score}</span>
                </div>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="w-full max-w-[180px] py-2.5 bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl shadow-md transition active:text-white flex items-center justify-center gap-1.5 cursor-pointer">
              <RotateCcw className="h-3.5 w-3.5" /> Re-engage Loop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}