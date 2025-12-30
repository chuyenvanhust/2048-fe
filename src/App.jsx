import { useState, useEffect } from 'react';
import Board from './components/Board';
import Statistics from './components/Statistics';
import * as api from './api';
import './index.css';

export default function App() {
  
  const [username, setUsername] = useState('Player1');
  const [parallelMode, setParallelMode] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const sid = await api.initSession();
      setSessionId(sid);
      setSessionReady(true);
      console.log('Session initialized:', sid);
    } catch (err) {
      console.error('Failed to initialize session:', err);
      // Retry after delay
      setTimeout(initializeSession, 2000);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.getLeaderboard();
      setLeaderboard(res.data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setLeaderboard([]);
    }
  };

  if (!sessionReady) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="loading-spinner">🎮 Initializing game session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🎮 2048 AI Master</h1>
          <div className="user-info">
            
            <span className="session-badge" title={`Session ID: ${sessionId}`}>
              🔐 Connected
            </span>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* SIDEBAR - CONTROLS */}
        <aside className="sidebar">
          <div className="control-section">
            <h3>⚙️ View Options</h3>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={parallelMode}
                onChange={(e) => setParallelMode(e.target.checked)}
              />
              <span>Parallel Mode (Compare 2 Boards)</span>
            </label>
          </div>

          <div className="control-section">
            <h3>📈 Views</h3>
            <button 
              onClick={() => {
                setShowLeaderboard(!showLeaderboard);
                setShowStatistics(false);
                if (!showLeaderboard) fetchLeaderboard();
              }}
              className="btn-leaderboard"
            >
              {showLeaderboard ? '📊 Hide' : '🏆 Show'} Leaderboard
            </button>
            <button 
              onClick={() => {
                setShowStatistics(!showStatistics);
                setShowLeaderboard(false);
              }}
              className="btn-leaderboard"
              style={{marginTop: '10px'}}
            >
              {showStatistics ? '📊 Hide' : '📈 Show'} Statistics
            </button>
          </div>

          <div className="control-section info-section">
            <h3>ℹ️ Instructions</h3>
            <ul className="info-list">
              <li><strong>Manual Mode:</strong> Use arrow keys or click direction buttons</li>
              <li><strong>AI Mode:</strong> Choose algorithm & click Auto Play</li>
              <li><strong>Batch Mode:</strong> Run multiple AI games to test performance</li>
              <li><strong>Parallel Mode:</strong> Compare 2 boards side-by-side</li>
              <li><strong>Statistics:</strong> View distribution charts and performance metrics</li>
              <li><strong>Multi-user:</strong> Each player has their own isolated session</li>
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          {/* GAME BOARDS SECTION */}
          <div className={`game-boards ${parallelMode ? 'parallel' : 'single'}`}>
            <Board 
              boardId={1}
              username={username}
            />
            
            {parallelMode && (
              <Board 
                boardId={2}
                username={username}
              />
            )}
          </div>

          {/* LEADERBOARD */}
          {showLeaderboard && (
            <div className="leaderboard-container">
              <h3>🏆 Global Leaderboard</h3>
              {leaderboard.length > 0 ? (
                <div className="leaderboard-table">
                  <div className="leaderboard-header">
                    <span>#</span>
                    <span>Player</span>
                    <span>Max Tile</span>
                    <span>Score</span>
                    <span>Mode</span>
                  </div>
                  {leaderboard.slice(0, 10).map((record, idx) => (
                    <div key={record.id} className="leaderboard-row">
                      <span className="rank">{idx + 1}</span>
                      <span className="player-name">{record.username}</span>
                      <span className={`tile-badge tile-${record.maxTile}`}>
                        {record.maxTile}
                      </span>
                      <span className="score">{record.score}</span>
                      <span className="mode-badge">{record.gameMode}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{textAlign: 'center', padding: '20px', color: '#999'}}>
                  No records yet. Start playing to see leaderboard!
                </p>
              )}
            </div>
          )}

          {/* STATISTICS */}
          {showStatistics && <Statistics />}
        </main>
      </div>
    </div>
  );
}