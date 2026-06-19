import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, RotateCcw, Zap, ArrowLeft, Trophy, Bird, Crown } from 'lucide-react';

// ==========================================
// CHESS ENGINE CONSTANTS & HELPERS
// ==========================================
const INITIAL_CHESS_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const PIECE_ICONS = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟'
};

const getValidChessMoves = (board, r, c) => {
  const piece = board[r][c];
  if (!piece) return [];
  const isWhite = piece === piece.toUpperCase();
  const type = piece.toLowerCase();
  const moves = [];

  const isValid = (nr, nc) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;
  const isEnemy = (nr, nc) => board[nr][nc] && (board[nr][nc] === board[nr][nc].toUpperCase()) !== isWhite;
  const isEmpty = (nr, nc) => !board[nr][nc];

  const addSlide = (dr, dc) => {
    let nr = r + dr, nc = c + dc;
    while (isValid(nr, nc)) {
      if (isEmpty(nr, nc)) { moves.push([nr, nc]); }
      else { if (isEnemy(nr, nc)) moves.push([nr, nc]); break; }
      nr += dr; nc += dc;
    }
  };

  if (type === 'p') {
    const dir = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    if (isValid(r + dir, c) && isEmpty(r + dir, c)) {
      moves.push([r + dir, c]);
      if (r === startRow && isEmpty(r + dir * 2, c)) moves.push([r + dir * 2, c]);
    }
    if (isValid(r + dir, c - 1) && isEnemy(r + dir, c - 1)) moves.push([r + dir, c - 1]);
    if (isValid(r + dir, c + 1) && isEnemy(r + dir, c + 1)) moves.push([r + dir, c + 1]);
  }
  if (type === 'n') {
    [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]].forEach(([dr, dc]) => {
      if (isValid(r + dr, c + dc) && (isEmpty(r + dr, c + dc) || isEnemy(r + dr, c + dc))) moves.push([r + dr, c + dc]);
    });
  }
  if (type === 'k') {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr, dc]) => {
      if (isValid(r + dr, c + dc) && (isEmpty(r + dr, c + dc) || isEnemy(r + dr, c + dc))) moves.push([r + dr, c + dc]);
    });
  }
  if (type === 'r' || type === 'q') [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => addSlide(dr, dc));
  if (type === 'b' || type === 'q') [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr, dc]) => addSlide(dr, dc));

  return moves;
};


export default function FunHub() {
  const [activeApp, setActiveApp] = useState('menu'); 
  const [gameState, setGameState] = useState('idle'); 
  const [score, setScore] = useState(0);

  const [reflexHighScore, setReflexHighScore] = useState(() => parseInt(localStorage.getItem('hubos_reflex_highscore') || '0', 10));
  const [flappyHighScore, setFlappyHighScore] = useState(() => parseInt(localStorage.getItem('hubos_flappy_highscore') || '0', 10));

  const CANVAS_HEIGHT = 400; 
  const GROUND_HEIGHT = 40;

  // ==========================================
  // GAME 1: REFLEX MATRIX
  // ==========================================
  const [timeLeft, setTimeLeft] = useState(5);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
  const [multiplier, setMultiplier] = useState(1);
  const lastClickRef = useRef(Date.now());

  useEffect(() => {
    let timer;
    if (activeApp === 'reflex' && gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (activeApp === 'reflex' && timeLeft <= 0 && gameState === 'playing') {
      setGameState('ended');
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState, activeApp]);

  const moveTarget = () => {
    const randomTop = Math.floor(Math.random() * 60) + 20; 
    const randomLeft = Math.floor(Math.random() * 70) + 15;
    setTargetPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
  };

  const handleReflexTap = (e) => {
    if (e) e.preventDefault();
    if (gameState !== 'playing') return;
    
    const now = Date.now();
    const timeDiff = now - lastClickRef.current;
    
    const newMultiplier = timeDiff < 600 ? Math.min(multiplier + 1, 4) : 1;
    setMultiplier(newMultiplier);
    lastClickRef.current = now;

    setScore((prev) => prev + (1 * newMultiplier));
    setTimeLeft((prev) => Math.min(prev + 1, 10)); 
    moveTarget();
  };

  const startReflexGame = () => {
    setScore(0);
    setTimeLeft(5);
    setMultiplier(1);
    lastClickRef.current = Date.now();
    moveTarget();
    setGameState('playing');
  };

  const targetSize = Math.max(24, 55 - (score * 0.4)); 

  // ==========================================
  // GAME 2: FLAPPY PRO
  // ==========================================
  const [birdY, setBirdY] = useState(200);
  const [velocity, setVelocity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [flappyLevel, setFlappyLevel] = useState(1);
  const [bgOffset, setBgOffset] = useState(0); 
  const [flash, setFlash] = useState(false); 

  const GRAVITY = 0.3; 
  const JUMP_STRENGTH = -5.5; 
  const MAX_FALL_SPEED = 6; 
  const BIRD_X = 60; 
  const PIPE_WIDTH = 60;
  const PIPE_SPACING = 200; 

  const currentSpeed = 2.2 + (flappyLevel * 0.15); 
  const currentGapSize = Math.max(150 - (flappyLevel * 4), 105);

  const gameLoopRef = useRef();
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (activeApp === 'flappy') {
      const calculatedLevel = Math.floor(score / 5) + 1;
      if (calculatedLevel !== flappyLevel) setFlappyLevel(calculatedLevel);
    }
  }, [score, flappyLevel, activeApp]);

  const handleFlap = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (gameState !== 'playing') return;
    setVelocity(JUMP_STRENGTH);
  };

  const startFlappyGame = () => {
    setScore(0);
    setFlappyLevel(1);
    setBirdY(200);
    setVelocity(JUMP_STRENGTH); 
    setRotation(-20);
    setBgOffset(0);
    setFlash(false);
    setPipes([]); 
    frameCountRef.current = 0;
    setGameState('playing');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeApp === 'flappy') {
        if (e.code === 'Space') {
          e.preventDefault(); 
          if (gameState === 'playing') handleFlap();
        } else if (e.code === 'Enter') {
          e.preventDefault();
          if (gameState === 'idle' || gameState === 'ended') startFlappyGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeApp, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || activeApp !== 'flappy') return;

    const updatePhysics = () => {
      setBgOffset((prev) => (prev + currentSpeed) % 400);

      setBirdY((prevY) => {
        let nextY = prevY + velocity;
        if (nextY >= CANVAS_HEIGHT - GROUND_HEIGHT - 24) {
          triggerCrash();
          return CANVAS_HEIGHT - GROUND_HEIGHT - 24; 
        }
        if (nextY < 0) {
          setVelocity(0);
          return 0;
        }
        return nextY;
      });

      setVelocity((prevVel) => Math.min(prevVel + GRAVITY, MAX_FALL_SPEED));

      setRotation(() => {
        if (velocity < -1) return -20; 
        if (velocity > 2) return Math.min(90, (velocity - 2) * 15); 
        return 0; 
      });

      frameCountRef.current += 1;
      
      setPipes((prevPipes) => {
        let updatedPipes = prevPipes.map((p) => {
          let newTop = p.baseTop;
          if (flappyLevel >= 3) newTop = p.baseTop + Math.sin(frameCountRef.current * 0.05 + p.seed) * (15 + flappyLevel);
          return { ...p, x: p.x - currentSpeed, topHeight: newTop, bottomHeight: CANVAS_HEIGHT - newTop - currentGapSize };
        });

        updatedPipes.forEach(p => {
          if (!p.passed && p.x + PIPE_WIDTH < BIRD_X) {
            p.passed = true;
            setScore(s => s + 1);
          }
        });

        updatedPipes = updatedPipes.filter(p => p.x > -PIPE_WIDTH);

        const lastPipe = updatedPipes[updatedPipes.length - 1];
        if (!lastPipe || lastPipe.x < 800 - PIPE_SPACING) {
          const minH = 50;
          const maxH = CANVAS_HEIGHT - GROUND_HEIGHT - currentGapSize - minH;
          const topHeight = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
          updatedPipes.push({ x: 800, baseTop: topHeight, topHeight, bottomHeight: CANVAS_HEIGHT - topHeight - currentGapSize, seed: Math.random() * 100, passed: false });
        }
        return updatedPipes;
      });

      pipes.forEach((p) => {
        const birdLeft = BIRD_X + 4, birdRight = BIRD_X + 34 - 4;
        const birdTop = birdY + 4, birdBottom = birdY + 24 - 4;
        const pipeLeft = p.x, pipeRight = p.x + PIPE_WIDTH;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          if (birdTop < p.topHeight || birdBottom > CANVAS_HEIGHT - p.bottomHeight) triggerCrash();
        }
      });

      gameLoopRef.current = requestAnimationFrame(updatePhysics);
    };

    gameLoopRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, velocity, birdY, pipes, activeApp, currentSpeed, currentGapSize, flappyLevel]);

  const triggerCrash = () => {
    setFlash(true);
    setGameState('ended');
    setTimeout(() => setFlash(false), 100); 
  };

  // ==========================================
  // GAME 3: GRANDMASTER GRID (CHESS)
  // ==========================================
  const [chessBoard, setChessBoard] = useState(INITIAL_CHESS_BOARD);
  const [chessTurn, setChessTurn] = useState('w'); // 'w' or 'b'
  const [selectedSquare, setSelectedSquare] = useState(null); // [r, c]
  const [validMoves, setValidMoves] = useState([]);
  const [chessWinner, setChessWinner] = useState(null);

  const handleChessClick = (r, c) => {
    if (chessWinner) return;

    const piece = chessBoard[r][c];
    const isWhite = piece ? piece === piece.toUpperCase() : null;

    // Execute Move
    if (selectedSquare) {
      const isMoveValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
      
      if (isMoveValid) {
        const [selR, selC] = selectedSquare;
        const newBoard = chessBoard.map(row => [...row]);
        const movedPiece = newBoard[selR][selC];
        const targetPiece = newBoard[r][c];

        // Win Condition: King Capture
        if (targetPiece === 'k') setChessWinner('White Wins!');
        if (targetPiece === 'K') setChessWinner('Black Wins!');

        // Execute piece transfer
        newBoard[r][c] = movedPiece;
        newBoard[selR][selC] = null;

        // Auto Pawn Promotion to Queen
        if (movedPiece === 'P' && r === 0) newBoard[r][c] = 'Q';
        if (movedPiece === 'p' && r === 7) newBoard[r][c] = 'q';

        setChessBoard(newBoard);
        setChessTurn(chessTurn === 'w' ? 'b' : 'w');
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }
    }

    // Select Piece
    if (piece && ((chessTurn === 'w' && isWhite) || (chessTurn === 'b' && !isWhite))) {
      setSelectedSquare([r, c]);
      setValidMoves(getValidChessMoves(chessBoard, r, c));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const startChessGame = () => {
    setChessBoard(INITIAL_CHESS_BOARD);
    setChessTurn('w');
    setSelectedSquare(null);
    setValidMoves([]);
    setChessWinner(null);
  };

  // ==========================================
  // GLOBAL HUB LOGIC
  // ==========================================
  useEffect(() => {
    if (activeApp === 'reflex' && score > reflexHighScore) {
      setReflexHighScore(score);
      localStorage.setItem('hubos_reflex_highscore', score.toString());
    } else if (activeApp === 'flappy' && score > flappyHighScore) {
      setFlappyHighScore(score);
      localStorage.setItem('hubos_flappy_highscore', score.toString());
    }
  }, [score, activeApp, reflexHighScore, flappyHighScore]);

  const exitToMenu = () => {
    setGameState('idle');
    setActiveApp('menu');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 pb-24 md:pb-6 flex flex-col min-h-[calc(100vh-140px)] select-none">
      
      {/* HEADER */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.4)] shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shadow-inner ${activeApp === 'menu' ? 'bg-indigo-500/20 border-indigo-400/30' : activeApp === 'reflex' ? 'bg-rose-500/20 border-rose-400/30' : activeApp === 'chess' ? 'bg-amber-500/20 border-amber-400/30' : 'bg-emerald-500/20 border-emerald-400/30'}`}>
            {activeApp === 'menu' && <Gamepad2 className="h-6 w-6 text-indigo-400" />}
            {activeApp === 'reflex' && <Zap className="h-6 w-6 text-rose-400" />}
            {activeApp === 'flappy' && <Bird className="h-6 w-6 text-emerald-400" />}
            {activeApp === 'chess' && <Crown className="h-6 w-6 text-amber-400" />}
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight drop-shadow-md">
              {activeApp === 'menu' ? 'Arcade Hub' : activeApp === 'reflex' ? 'Neon Reflex' : activeApp === 'chess' ? 'Grandmaster Grid' : 'Flappy Pro'}
            </h1>
            <div className="text-[11px] text-slate-300 font-medium flex items-center gap-2">
              {activeApp === 'flappy' && gameState === 'playing' ? (
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 rounded">LEVEL {flappyLevel}</span>
              ) : activeApp === 'chess' ? (
                <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 rounded">Local 2-Player Sandbox</span>
              ) : activeApp === 'menu' ? 'Select a premium module' : 'Live execution environment'}
            </div>
          </div>
        </div>
        
        {activeApp !== 'menu' && activeApp !== 'chess' && (
          <div className="bg-slate-950/80 border border-slate-700/50 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
            <Trophy className={`h-4 w-4 ${activeApp === 'reflex' ? 'text-rose-400' : 'text-emerald-400'}`} />
            <div className="text-right font-mono">
              <span className="text-[9px] text-slate-400 block leading-none font-sans font-bold uppercase">Best</span>
              <span className="text-sm font-black text-white">{activeApp === 'reflex' ? reflexHighScore : flappyHighScore}</span>
            </div>
          </div>
        )}
      </div>

      {/* MENU SELECTOR */}
      {activeApp === 'menu' && (
        <div className="flex-1 bg-slate-900/30 border border-slate-800/40 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Available Engines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <button onClick={() => setActiveApp('reflex')} className="group relative w-full bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/60 border border-slate-700 hover:border-rose-500/80 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500/20 to-pink-600/20 rounded-2xl flex items-center justify-center border border-rose-500/40 shrink-0 z-10"><Zap className="h-7 w-7 text-rose-400 group-hover:scale-110 transition-transform" /></div>
              <div className="flex-1 z-10">
                <h3 className="text-lg font-black text-white">Neon Reflex</h3>
                <p className="text-xs text-rose-200/80 mt-1 font-medium">Dynamic scaled targeting</p>
              </div>
            </button>

            <button onClick={() => setActiveApp('flappy')} className="group relative w-full bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-700 hover:border-emerald-500/80 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/40 shrink-0 z-10"><Bird className="h-7 w-7 text-emerald-400 group-hover:scale-110 transition-transform" /></div>
              <div className="flex-1 z-10">
                <h3 className="text-lg font-black text-white">Flappy Pro</h3>
                <p className="text-xs text-emerald-200/80 mt-1 font-medium">Arcade gravity vector</p>
              </div>
            </button>

            <button onClick={() => setActiveApp('chess')} className="group relative w-full bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/60 border border-slate-700 hover:border-amber-500/80 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] md:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-2xl flex items-center justify-center border border-amber-500/40 shrink-0 z-10"><Crown className="h-7 w-7 text-amber-400 group-hover:scale-110 transition-transform" /></div>
              <div className="flex-1 z-10">
                <h3 className="text-lg font-black text-white">Chess Sandbox</h3>
                <p className="text-xs text-amber-200/80 mt-1 font-medium">2-Player Tactical Grid</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* GAMES WRAPPER */}
      {activeApp !== 'menu' && (
        <div className="w-full max-w-3xl mx-auto">
          
          {/* REFLEX MATRIX */}
          {activeApp === 'reflex' && (
             <div className="relative w-full h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black border-2 border-indigo-900/50 rounded-3xl flex flex-col items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)] select-none touch-none">
             {(gameState === 'idle' || gameState === 'ended') && (
               <button onClick={exitToMenu} className="absolute top-4 left-4 z-30 p-2.5 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 active:scale-90 cursor-pointer backdrop-blur-md shadow-lg transition-all"><ArrowLeft className="h-5 w-5" /></button>
             )}
             {gameState === 'idle' && (
               <div className="text-center z-10 space-y-5 max-w-xs mx-auto px-4 p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
                 <button onClick={startReflexGame} onTouchStart={startReflexGame} className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-95 cursor-pointer uppercase tracking-wider">Initiate Sequence</button>
               </div>
             )}
             {gameState === 'playing' && (
               <>
                 <div className="absolute top-4 left-4 font-mono text-sm text-white bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-indigo-500/30 shadow-lg">SCORE <span className="text-rose-400 font-black">{score}</span></div>
                 <button onClick={handleReflexTap} onTouchStart={handleReflexTap} style={{ top: targetPos.top, left: targetPos.left, width: `${targetSize}px`, height: `${targetSize}px` }} className="absolute -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.8)] active:scale-90 cursor-pointer" />
               </>
             )}
             {gameState === 'ended' && (
               <div className="text-center z-10 space-y-4 max-w-xs mx-auto p-8 bg-black/60 backdrop-blur-md rounded-3xl border border-rose-500/30 shadow-2xl">
                 <div className="text-5xl font-mono font-black text-rose-400">{score}</div>
                 <button onClick={startReflexGame} onTouchStart={startReflexGame} className="w-full py-3 bg-white text-rose-900 font-black text-sm rounded-xl cursor-pointer uppercase tracking-wider">Restart</button>
               </div>
             )}
           </div>
          )}

          {/* FLAPPY PRO */}
          {activeApp === 'flappy' && (
             <div onClick={handleFlap} onTouchStart={handleFlap} className="relative w-full h-[400px] bg-[#71c5cf] border-4 border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)] select-none touch-none cursor-pointer">
             {flash && <div className="absolute inset-0 bg-white z-50 pointer-events-none" />}
             <div className="absolute bottom-10 w-[200%] h-32 opacity-70 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM3MWM1Y2YiIC8+PHBhdGggZD0iTTAgMTBMMTAgMEwyMCAxMEwzMCA1TDQwIDIwTDUwIDEwTDYwIDMwTDcwIDBMODAgMjBMMTArIDEwWiIgZmlsbD0iIzVlYTlkZSIgLz48L3N2Zz4=')", backgroundPositionX: `${-bgOffset * 0.5}px` }} />

             {gameState !== 'idle' && pipes.map((p, i) => (
               <React.Fragment key={i}>
                 <div style={{ width: '60px', height: `${p.topHeight}px`, left: `${p.x}px`, top: 0 }} className="absolute bg-[#73bf2e] border-[3px] border-[#543847] shadow-inner"><div className="absolute bottom-0 -left-[4px] w-[62px] h-8 bg-[#73bf2e] border-[3px] border-[#543847]" /></div>
                 <div style={{ width: '60px', height: `${p.bottomHeight}px`, left: `${p.x}px`, bottom: 0 }} className="absolute bg-[#73bf2e] border-[3px] border-[#543847] shadow-inner"><div className="absolute top-0 -left-[4px] w-[62px] h-8 bg-[#73bf2e] border-[3px] border-[#543847]" /></div>
               </React.Fragment>
             ))}

             <div className="absolute bottom-0 w-[200%] h-[40px] bg-[repeating-linear-gradient(-45deg,#ded895,#ded895_15px,#e8e4a9_15px,#e8e4a9_30px)] border-t-[3px] border-[#543847] z-10 pointer-events-none" style={{ backgroundPositionX: `${-bgOffset}px` }} />

             {(gameState === 'idle' || gameState === 'ended') && (
               <button onClick={(e) => { e.stopPropagation(); exitToMenu(); }} className="absolute top-4 left-4 z-30 p-2.5 bg-black/30 border border-white/20 rounded-xl text-white hover:bg-black/50 active:scale-90 cursor-pointer backdrop-blur-md shadow-lg transition-all"><ArrowLeft className="h-5 w-5" /></button>
             )}

             {gameState === 'playing' && (
               <div style={{ top: `${birdY}px`, left: '60px', transform: `rotate(${rotation}deg)` }} className="absolute w-[34px] h-[24px] bg-[#f4cc25] border-[3px] border-[#543847] rounded-full flex items-center shadow-lg z-20 transition-transform duration-75">
                 <div className="absolute right-1 top-0.5 w-[10px] h-[10px] bg-white border-[2px] border-[#543847] rounded-full"><div className="w-[3px] h-[3px] bg-black rounded-full absolute right-0 top-1" /></div>
                 <div className="absolute -right-2 bottom-0 w-[14px] h-[10px] bg-[#e86122] border-[2px] border-[#543847] rounded-full" />
                 <div className={`absolute left-0 top-2 w-[14px] h-[10px] bg-white border-[2px] border-[#543847] rounded-r-full transition-transform ${velocity < -2 ? 'translate-y-1' : ''}`} />
               </div>
             )}

             {gameState === 'idle' && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 z-20 backdrop-blur-sm">
                 <button onClick={(e) => { e.stopPropagation(); startFlappyGame(); }} className="py-4 px-10 bg-[#e86122] border-4 border-white text-white font-black text-2xl rounded-xl shadow-[0_4px_0_#b24112] active:translate-y-1 active:shadow-none cursor-pointer uppercase tracking-widest drop-shadow-md">Play</button>
               </div>
             )}

             {gameState === 'playing' && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 font-black text-6xl text-white drop-shadow-[0_4px_0_#543847] z-30 select-none style-stroke">{score}</div>
             )}

             {gameState === 'ended' && (
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20 space-y-6">
                 <h3 className="text-3xl font-black text-[#e86122] uppercase tracking-widest drop-shadow-[0_3px_0_#fff]">Game Over</h3>
                 <div className="bg-[#ded895] border-4 border-[#543847] rounded-xl p-6 shadow-[0_8px_0_#543847] flex gap-8 w-64 justify-center">
                    <div className="text-center"><span className="block text-[#e86122] font-black uppercase text-sm drop-shadow-[0_1px_0_#fff]">Score</span><span className="text-4xl font-black text-white drop-shadow-[0_3px_0_#543847]">{score}</span></div>
                    <div className="text-center"><span className="block text-[#e86122] font-black uppercase text-sm drop-shadow-[0_1px_0_#fff]">Best</span><span className="text-4xl font-black text-white drop-shadow-[0_3px_0_#543847]">{flappyHighScore}</span></div>
                 </div>
                 <button onClick={(e) => { e.stopPropagation(); startFlappyGame(); }} className="py-3 px-10 bg-green-500 border-4 border-white text-white font-black text-xl rounded-xl shadow-[0_4px_0_#2b7316] active:translate-y-1 active:shadow-none cursor-pointer uppercase tracking-widest mt-4">Retry</button>
               </div>
             )}
           </div>
          )}

          {/* GRANDMASTER GRID (CHESS) */}
          {activeApp === 'chess' && (
            <div className="relative w-full max-w-[420px] mx-auto bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center select-none">
              <button onClick={() => { startChessGame(); exitToMenu(); }} className="absolute top-4 left-4 z-30 p-2.5 bg-slate-800 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-700 active:scale-90 cursor-pointer shadow-lg transition-all"><ArrowLeft className="h-5 w-5" /></button>
              
              <div className="flex w-full justify-between items-center mb-6 pl-12">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Turn</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full shadow-inner border border-slate-600 ${chessTurn === 'w' ? 'bg-slate-100' : 'bg-slate-900'}`} />
                    <span className="text-sm font-black text-white">{chessTurn === 'w' ? 'White to Move' : 'Black to Move'}</span>
                  </div>
                </div>
                <button onClick={startChessGame} className="p-2.5 bg-slate-800 border border-slate-600 rounded-xl text-amber-400 hover:bg-slate-700 active:scale-90 cursor-pointer shadow-lg transition-all" title="Reset Board"><RotateCcw className="h-5 w-5" /></button>
              </div>

              {/* CHESS BOARD GRID */}
              <div className="w-full aspect-square border-4 border-slate-800 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-slate-800 relative">
                
                {chessWinner && (
                  <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <Crown className="h-16 w-16 text-amber-400 mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    <h2 className="text-3xl font-black text-white drop-shadow-md">{chessWinner}</h2>
                    <p className="text-sm text-slate-400 mt-2">King Captured.</p>
                    <button onClick={startChessGame} className="mt-8 py-3 px-8 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-sm rounded-xl shadow-lg active:scale-95 cursor-pointer uppercase tracking-widest">Play Again</button>
                  </div>
                )}

                <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                  {chessBoard.map((row, rIndex) => 
                    row.map((piece, cIndex) => {
                      const isDark = (rIndex + cIndex) % 2 === 1;
                      const isSelected = selectedSquare && selectedSquare[0] === rIndex && selectedSquare[1] === cIndex;
                      const isValidTarget = validMoves.some(([vr, vc]) => vr === rIndex && vc === cIndex);
                      const isWhitePiece = piece && piece === piece.toUpperCase();

                      return (
                        <div 
                          key={`${rIndex}-${cIndex}`} 
                          onClick={() => handleChessClick(rIndex, cIndex)}
                          className={`
                            relative flex items-center justify-center cursor-pointer transition-colors
                            ${isDark ? 'bg-[#5e7760]' : 'bg-[#e0edd4]'}
                            ${isSelected ? 'bg-[#baca44]' : ''}
                            ${isValidTarget && !piece ? "after:content-[''] after:w-3 after:h-3 after:bg-black/20 after:rounded-full" : ''}
                          `}
                        >
                          {/* Capture Indicator Ring */}
                          {isValidTarget && piece && <div className="absolute inset-0 border-4 border-black/20 rounded-full scale-90 pointer-events-none" />}
                          
                          {/* Render Piece */}
                          {piece && (
                            <span 
                              className={`
                                text-3xl sm:text-4xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] select-none pointer-events-none
                                ${isWhitePiece ? 'text-white' : 'text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'}
                              `}
                            >
                              {PIECE_ICONS[piece]}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <p className="mt-6 text-[11px] text-slate-500 font-medium text-center uppercase tracking-widest">
                Pass & Play • Auto-Queen Promotion • Capture King to Win
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}