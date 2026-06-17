import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, RotateCcw, ShieldAlert } from 'lucide-react';

export default function FunHub() {
  const [gameState, setGameState] = useState('idle'); // idle, playing, ended
  const [score, setScore] = useState(0);
  const [birdY, setBirdY] = useState(150);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('hubos_bird_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Physics constants
  const GRAVITY = 0.6;
  const JUMP_STRENGTH = -7.5;
  const PIPE_SPEED = 3;
  const PIPE_SPAWN_RATE = 90; // frames
  const GAP_SIZE = 110; // size of clearance path in pixels

  const gameLoopRef = useRef();
  const frameCountRef = useRef(0);

  // Jump Trigger
  const handleJump = (e) => {
    if (e) e.preventDefault();
    if (gameState !== 'playing') return;
    setVelocity(JUMP_STRENGTH);
  };

  // Start Session
  const startGame = () => {
    setScore(0);
    setBirdY(150);
    setVelocity(0);
    setPipes([{ x: 400, topHeight: 120, bottomHeight: 120 }]);
    frameCountRef.current = 0;
    setGameState('playing');
  };

  // Main Physics Engine loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const updatePhysics = () => {
      // 1. Apply Gravity to Bird Vector
      setBirdY((prevY) => {
        const nextY = prevY + velocity;
        // Floor/Ceiling Collisions
        if (nextY > 300 || nextY < 0) {
          setGameState('ended');
          return nextY > 300 ? 300 : 0;
        }
        return nextY;
      });
      setVelocity((prevVel) => prevVel + GRAVITY);

      // 2. Move & Spawn Pipes
      frameCountRef.current += 1;
      setPipes((prevPipes) => {
        let updatedPipes = prevPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED,
        }));

        // Filter out off-screen pipes
        if (updatedPipes.length > 0 && updatedPipes[0].x < -50) {
          updatedPipes.shift();
          setScore((s) => s + 1);
        }

        // Spawn new pipe matrix
        if (frameCountRef.current % PIPE_SPAWN_RATE === 0) {
          const minHeight = 40;
          const maxHeight = 170;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
          const bottomHeight = 320 - topHeight - GAP_SIZE;
          updatedPipes.push({ x: 340, topHeight, bottomHeight });
        }

        return updatedPipes;
      });

      // 3. Simple AABB Box Collision Matrix Detection
      pipes.forEach((pipe) => {
        if (pipe.x > 30 && pipe.x < 85) {
          // Bird is horizontally inside pipe zone
          if (birdY < pipe.topHeight || birdY > 320 - pipe.bottomHeight) {
            setGameState('ended');
          }
        }
      });

      gameLoopRef.current = requestAnimationFrame(updatePhysics);
    };

    gameLoopRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, velocity, birdY, pipes]);

  // Sync high score to local memory storage layers
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('hubos_bird_highscore', score.toString());
    }
  }, [score, highScore]);

  return (
    <div className="space-y-4 max-w-md mx-auto p-1 pb-24 md:pb-6 flex flex-col h-[calc(100vh-140px)] md:h-auto justify-between sm:justify-start select-none">
      
      {/* Header telemetry display overlay */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Gamepad2 className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">Aero Stream</h1>
            <p className="text-[10px] text-slate-400">Vector gravity calculation sandbox</p>
          </div>
        </div>
        <div className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-right font-mono shrink-0">
          <span className="text-[9px] text-slate-500 block leading-none">HIGH</span>
          <span className="text-xs font-bold text-amber-500">{highScore}</span>
        </div>
      </div>

      {/* Main Terminal Physics Canvas Shell Container */}
      <div 
        onClick={handleJump}
        onTouchStart={handleJump}
        className="relative w-full h-80 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl select-none touch-none cursor-pointer"
      >
        {/* Sky alignment scanning vectors */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

        {/* RENDER CURRENT pipes STREAM */}
        {gameState !== 'idle' && pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            {/* Top Obstacle Guard */}
            <div 
              style={{ width: '40px', height: `${pipe.topHeight}px`, left: `${pipe.x}px`, top: 0 }}
              className="absolute bg-slate-900 border-b-4 border-x border-amber-500/40 rounded-b-md shadow-lg"
            />
            {/* Bottom Obstacle Guard */}
            <div 
              style={{ width: '40px', height: `${pipe.bottomHeight}px`, left: `${pipe.x}px`, bottom: 0 }}
              className="absolute bg-slate-900 border-t-4 border-x border-amber-500/40 rounded-t-md shadow-lg"
            />
          </React.Fragment>
        ))}

        {/* RENDER BIRD STREAM VECTOR OBJS */}
        {gameState === 'playing' && (
          <div 
            style={{ top: `${birdY}px`, left: '50px' }}
            className="absolute w-6 h-6 bg-amber-500 border border-white rounded-lg shadow-[0_0_15px_#f59e0b] flex items-center justify-center transition-transform duration-75"
          >
            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full ml-2 mb-1" />
          </div>
        )}

        {/* STATE UI OVERLAYS: IDLE DECK */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 space-y-4 z-20">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-amber-500 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Aero Stream Engine</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">Tap anywhere on the window display field to jump and navigate the vector clearing paths.</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="w-full max-w-[180px] py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer">
              Begin Stream Loop
            </button>
          </div>
        )}

        {/* STATE UI OVERLAYS: LIVE SCORE SCOREBOARD STRIP */}
        {gameState === 'playing' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-4 py-1 rounded-xl font-mono text-sm font-bold text-slate-200 z-10 shadow-md">
            {score}
          </div>
        )}

        {/* STATE UI OVERLAYS: ENDED SYSTEM TERMINAL SHUTDOWN */}
        {gameState === 'ended' && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-4 space-y-4 z-20 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-full shadow-md">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Boundary Impact Detected</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-4 mt-2 inline-block">
                <span className="text-[9px] text-slate-500 block uppercase">Final Yield</span>
                <span className="text-xl font-mono font-extrabold text-amber-500">{score}</span>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="w-full max-w-[180px] py-2.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer">
              <RotateCcw className="h-3.5 w-3.5" /> Re-arm Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}