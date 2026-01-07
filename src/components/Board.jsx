import { useState, useEffect, useRef } from 'react';
import GameGrid from './GameGrid';
import DirectionControls from './DirectionControls';
import MoveEffect from './MoveEffect';
import * as api from '../api';

export default function Board({ boardId, username }) {
  
const [boardUsername, setBoardUsername] = useState(`Player${boardId}`);
  const [boardState, setBoardState] = useState({
    board: Array.from({ length: 4 }, () => Array(4).fill(0)),
    score: 0,
    gameOver: false,
    suggestedMove: null,
    mode: 'SINGLE',
    algorithm: 'expectimax',
    aiDepth: 3,
    isLoading: false,
    isRunning: false
  });

  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, stats: {} });
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [lastMove, setLastMove] = useState(null); // State cho hiệu ứng di chuyển

  const stopSignal = useRef(false);

  useEffect(() => {
    handleNewGame();
    return () => { stopSignal.current = true; };
  }, []);

  // Update board username when changed
  const handleUsernameChange = async (newUsername) => {
    setBoardUsername(newUsername);
    try {
      await api.updateBoardUsername(boardId, newUsername);
    } catch (err) {
      console.error('Error updating username:', err);
    }
  };

  const handleNewGame = async () => {
    stopSignal.current = true;
    setIsBatchRunning(false);
    setLastMove(null); // Reset hiệu ứng
    try {
      const res = await api.newBoardGame(boardId, boardUsername);
      setBoardState(prev => ({
        ...prev,
        board: res.data.board || Array.from({ length: 4 }, () => Array(4).fill(0)),
        score: res.data.score || 0,
        gameOver: false,
        suggestedMove: null,
        isRunning: false
      }));
      setBatchProgress({ current: 0, total: 0, stats: {} });
    } catch (err) {
      console.error(`Board ${boardId} error:`, err);
    }
  };

  const handleMove = async (direction) => {
    if (boardState.isRunning || isBatchRunning) return;
    
    // Trigger hiệu ứng di chuyển màu xanh
    setLastMove(direction);
    
    try {
      const res = await api.moveBoardDirection(boardId, direction);
      
      setBoardState(prev => ({
        ...prev,
        board: res.data.board,
        score: res.data.score,
        gameOver: res.data.gameOver,
        suggestedMove: null // Clear hint sau khi di chuyển
      }));

    } catch (err) { 
      console.error(err); 
    }
  };

  const handleAiMove = async () => {
    try {
      const res = await api.aiBoardMove(boardId, boardState.algorithm);
      
      // Đọc hướng đi từ suggestedMove (Backend đã gán ở trên)
      const movePerformed = res.data.suggestedMove;

      if (movePerformed) {
        // RESET để ép React nhận diện thay đổi nếu hướng đi trùng nhau (ví dụ: LEFT -> LEFT)
        setLastMove(null); 
        
        requestAnimationFrame(() => {
          setLastMove(movePerformed.toUpperCase());
        });
      }

      setBoardState(prev => ({
        ...prev,
        board: res.data.board,
        score: res.data.score,
        gameOver: res.data.gameOver,
        suggestedMove: null // Xóa hint cũ (nếu có)
      }));

      // Tắt hiệu ứng sau 300ms
      setTimeout(() => setLastMove(null), 300);

      return !res.data.gameOver;
    } catch (err) {
      console.error('AI Move Error:', err);
      return false;
    }
  };


  const handleAutoPlay = async () => {
    if (boardState.isRunning) return;

    setBoardState(prev => ({ ...prev, isRunning: true }));
    stopSignal.current = false;

    while (stopSignal.current === false) {
      const canContinue = await handleAiMove();
      if (!canContinue || stopSignal.current === true) break;
      await new Promise(r => setTimeout(r, 200));
    }

    setBoardState(prev => ({ ...prev, isRunning: false }));
  };

  const handleStop = () => {
    stopSignal.current = true;
    setIsBatchRunning(false);
    
    // Reset toàn bộ trạng thái UI
    setLastMove(null); // Tắt hiệu ứng xanh
    setBoardState(prev => ({ 
        ...prev, 
        isRunning: false, 
        suggestedMove: null, // Tắt hiệu ứng vàng (hint)
        isLoading: false 
    }));
};

  const handleModeChange = (newMode) => {
    handleStop();
    setLastMove(null);
    setBoardState(prev => ({ ...prev, mode: newMode, suggestedMove: null }));
    setBatchProgress({ current: 0, total: 0, stats: {} });
  };

  const handleGetHint = async () => {
    if (boardState.isLoading || boardState.gameOver) return;

    setBoardState(prev => ({ ...prev, isLoading: true }));

    try {
      const res = await api.getBoardHint(boardId, boardState.algorithm);

      const dir = res.data?.suggestedMove?.toUpperCase();
      const valid = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

      setBoardState(prev => ({
        ...prev,
        suggestedMove: valid.includes(dir) ? dir : null
      }));
    } catch (err) {
      console.error('Error getting hint:', err);
    } finally {
      setBoardState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAlgorithmChange = (algo) => {
    setBoardState(prev => ({ ...prev, algorithm: algo, suggestedMove: null }));
  };

  const handleDepthChange = async (depth) => {
    setBoardState(prev => ({ ...prev, aiDepth: depth }));
    try {
      await api.setBoardAiConfig(boardId, depth);
    } catch (err) {
      console.error('Error setting depth:', err);
    }
  };

  const handleBatchRun = async (count) => {
  if (isBatchRunning) return;
  
  setIsBatchRunning(true);
  stopSignal.current = false;
  setBatchProgress({ current: 0, total: count, stats: {} });

  try {
    const res = await api.runBoardBatch(boardId, count, boardState.algorithm, boardUsername);
    setBatchProgress({
      current: res.data.totalGames || count,
      total: count,
      stats: res.data.stats || {}
    });
  } catch (err) {
    console.error('Batch error:', err);
    
    // Xử lý lỗi 401 - session hết hạn
    if (err.response?.status === 401) {
      alert('Session expired. Creating new session...');
      await api.initSession(); // Tạo session mới
      // Có thể tự động retry
      // await handleBatchRun(count);
    }
  } finally {
    setIsBatchRunning(false);
  }
};

  // Keyboard controls for manual mode
  useEffect(() => {
    if (boardState.mode !== 'SINGLE' || boardState.gameOver || boardState.isRunning) return;
    
    const handleKeyPress = (e) => {
      const keyMap = { 
        ArrowUp: 'UP', 
        ArrowDown: 'DOWN', 
        ArrowLeft: 'LEFT', 
        ArrowRight: 'RIGHT' 
      };
      if (keyMap[e.key]) { 
        e.preventDefault(); 
        handleMove(keyMap[e.key]); 
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [boardState.mode, boardState.gameOver, boardState.isRunning]);

  return (
    <div className="game-board-container">
      <div className="board-header">
        <h2>🎮 Board {boardId}</h2>
        <div className="board-username-input">
          <input 
            type="text" 
            value={boardUsername}
            onChange={(e) => handleUsernameChange(e.target.value)}
            className="board-username"
            placeholder={`Player ${boardId}`}
          />
        </div>
        <div className="score-display">Score: {boardState.score}</div>
      </div>

      {/* MODE SELECTOR */}
      <div className="board-mode-selector">
        <button 
          className={`mode-tab ${boardState.mode === 'SINGLE' ? 'active' : ''}`}
          onClick={() => handleModeChange('SINGLE')}
        >
          👤 Manual
        </button>
        <button 
          className={`mode-tab ${boardState.mode === 'AI' ? 'active' : ''}`}
          onClick={() => handleModeChange('AI')}
        >
          🤖 AI Play
        </button>
        <button 
          className={`mode-tab ${boardState.mode === 'BATCH' ? 'active' : ''}`}
          onClick={() => handleModeChange('BATCH')}
        >
          ⚡ Batch
        </button>
      </div>

      {/* AI HINT SELECTOR FOR MANUAL MODE */}
      {boardState.mode === 'SINGLE' && (
        <div className="ai-controls-panel manual-hint-panel">
          <div className="algorithm-selector">
            <label>💡 Hint Algorithm:</label>
            <select 
              value={boardState.algorithm} 
              onChange={(e) => handleAlgorithmChange(e.target.value)}
              disabled={boardState.isLoading}
            >
              <option value="expectimax">Expectimax (Best)</option>
              <option value="greedy">Greedy</option>
              <option value="bfs">BFS</option>
              <option value="dls">DLS</option>
              <option value="ids">IDS</option>
              <option value="minimax">Minimax</option>
            </select>
          </div>
          
          <div className="depth-selector">
            <label>Depth: {boardState.aiDepth}</label>
            <input 
              type="range" 
              min="1" 
              max="6" 
              value={boardState.aiDepth}
              onChange={(e) => handleDepthChange(parseInt(e.target.value))}
              disabled={boardState.isLoading}
            />
          </div>
        </div>
      )}

      {/* ALGORITHM & DEPTH CONTROLS (for AI/BATCH modes) */}
      {(boardState.mode === 'AI' || boardState.mode === 'BATCH') && (
        <div className="ai-controls-panel">
          <div className="algorithm-selector">
            <label>Algorithm:</label>
            <select 
              value={boardState.algorithm} 
              onChange={(e) => handleAlgorithmChange(e.target.value)}
              disabled={boardState.isRunning || isBatchRunning}
            >
              <option value="expectimax">Expectimax</option>
              <option value="greedy">Greedy</option>
              <option value="bfs">BFS</option>
              <option value="dls">DLS</option>
              <option value="ids">IDS</option>
              <option value="minimax">Minimax</option>
            </select>
          </div>
          
          <div className="depth-selector">
            <label>Depth: {boardState.aiDepth}</label>
            <input 
              type="range" 
              min="1" 
              max="6" 
              value={boardState.aiDepth}
              onChange={(e) => handleDepthChange(parseInt(e.target.value))}
              disabled={boardState.isRunning || isBatchRunning}
            />
          </div>
        </div>
      )}

      {/* GAME GRID WITH DIRECTION CONTROLS */}
      <div className="game-area">
        <DirectionControls 
          onMove={handleMove}
          disabled={boardState.gameOver || boardState.isRunning || isBatchRunning || boardState.mode !== 'SINGLE'}
        />
        
        <GameGrid 
          board={boardState.board} 
          suggestedMove={boardState.suggestedMove} 
        />
        
        {/*  MOVE EFFECT OVERLAY - Hiệu ứng xanh lá khi di chuyển */}
        {lastMove && (
          <MoveEffect 
            direction={lastMove}
            onAnimationEnd={() => setLastMove(null)}
          />
        )}
        
        {boardState.gameOver && (
          <div className="game-over-badge">
            <h3>🎮 Game Over!</h3>
            <p>Max Tile: {Math.max(...boardState.board.flat())}</p>
            <p style={{fontSize: '1rem', marginTop: '10px', color: '#999'}}>
              Final Score: {boardState.score}
            </p>
          </div>
        )}
      </div>

      {/* MODE-SPECIFIC CONTROLS */}
      {boardState.mode === 'SINGLE' && (
        <div className="board-action-buttons">
          <button onClick={handleNewGame} className="btn-action btn-new">
            🔄 New Game
          </button>
          <button 
            onClick={handleGetHint} 
            className="btn-action btn-hint" 
            disabled={boardState.gameOver || boardState.isLoading}
          >
            {boardState.isLoading ? '⏳ Loading...' : '💡 Get Hint'}
          </button>
        </div>
      )}

      {boardState.mode === 'AI' && (
        <div className="board-action-buttons">
          <button onClick={handleNewGame} className="btn-action btn-new">
            🔄 New Game
          </button>
          {!boardState.isRunning ? (
            <button 
              onClick={handleAutoPlay} 
              className="btn-action btn-auto" 
              disabled={boardState.gameOver}
            >
              ▶️ Auto Play
            </button>
          ) : (
            <button onClick={handleStop} className="btn-action btn-stop">
              ⏸️ Stop
            </button>
          )}
        </div>
      )}

      {boardState.mode === 'BATCH' && (
        <div className="batch-controls-section">
          <div className="batch-input-group">
            <label>Games:</label>
            <input 
              type="number" 
              min="1" 
              max="100"
              defaultValue="10"
              disabled={isBatchRunning}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleBatchRun(parseInt(e.target.value) || 10);
                }
              }}
              id={`batch-count-${boardId}`}
            />
            <button 
              onClick={() => {
                const input = document.getElementById(`batch-count-${boardId}`);
                handleBatchRun(parseInt(input.value) || 10);
              }}
              disabled={isBatchRunning}
              className="btn-batch-run"
            >
              {isBatchRunning ? '⏳ Running...' : '🚀 Start'}
            </button>
          </div>

          {batchProgress.total > 0 && (
            <div className="batch-progress-container">
              <div className="progress-bar-wrapper">
                <div 
                  className="progress-bar-animated"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                >
                  <span className="progress-text">
                    {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                  </span>
                </div>
              </div>
              <p className="batch-status">
                {batchProgress.current} / {batchProgress.total} games
              </p>
            </div>
          )}

          {Object.keys(batchProgress.stats).length > 0 && (
            <div className="batch-stats-display">
              <h4>📊 Results:</h4>
              <div className="stats-tiles">
                {Object.entries(batchProgress.stats)
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([tile, count]) => (
                    <div key={tile} className="stat-item">
                      <span className={`tile-badge tile-${tile}`}>{tile}</span>
                      <span className="stat-count">{count}x</span>
                      <span className="stat-percent">
                        {((count / batchProgress.current) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
