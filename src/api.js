import axios from 'axios';

const API_BASE = 'http://localhost:8088/api/game';

// ========== SESSION MANAGEMENT ==========

let sessionId = null;
let sessionPromise = null;
/**
 * Initialize or retrieve session ID
 */
export const initSession = async () => {
  // 🔥 Nếu đang có process tạo session, đợi nó hoàn thành
  if (sessionPromise) {
    return await sessionPromise;
  }

  // Check if we have a stored session ID
  const storedSessionId = localStorage.getItem('gameSessionId');
  
  if (storedSessionId) {
    // Validate the stored session
    try {
      const response = await axios.get(`${API_BASE}/session/validate`, {
        headers: { 'X-Session-Id': storedSessionId }
      });
      
      if (response.data.valid) {
        sessionId = storedSessionId;
        console.log('Using existing session:', sessionId);
        return sessionId;
      }
    } catch (err) {
      console.log('Stored session invalid, creating new session');
      localStorage.removeItem('gameSessionId'); // 🔥 Xóa session không hợp lệ
    }
  }
  
  // Create new session với lock mechanism
  sessionPromise = (async () => {
    try {
      const response = await axios.post(`${API_BASE}/session/create`);
      sessionId = response.data.sessionId;
      localStorage.setItem('gameSessionId', sessionId);
      console.log('Created new session:', sessionId);
      return sessionId;
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    } finally {
      sessionPromise = null; // 🔥 Reset lock sau khi hoàn thành
    }
  })();
  
  return await sessionPromise;
};
/**
 * Get current session ID (initialize if needed)
 */
export const getSessionId = async () => {
  if (!sessionId) {
    await initSession();
  }
  return sessionId;
};


/**
 * Clear session (logout)
 */
export const clearSession = () => {
  localStorage.removeItem('gameSessionId');
  sessionId = null;
  sessionPromise = null; // 🔥 Reset cả promise
};

/**
 * Get session statistics
 */
export const getSessionStats = async () => {
  return await axios.get(`${API_BASE}/session/stats`);
};

// ========== BOARD-SPECIFIC ENDPOINTS ==========

export const getBoardState = async (boardId) => {
  const sid = await getSessionId();
  return await axios.get(`${API_BASE}/board/${boardId}/status`, {
    headers: { 'X-Session-Id': sid }
  });
};

export const newBoardGame = async (boardId, username) => {
  const sid = await getSessionId();
  return await axios.post(`${API_BASE}/board/${boardId}/new`, null, {
    params: { username },
    headers: { 'X-Session-Id': sid }
  });
};

export const moveBoardDirection = async (boardId, direction) => {
  const sid = await getSessionId();
  return await axios.post(`${API_BASE}/board/${boardId}/move/${direction}`, null, {
    headers: { 'X-Session-Id': sid }
  });
};

export const aiBoardMove = async (boardId, algorithm) => {
  const sid = await getSessionId();
  return await axios.post(`${API_BASE}/board/${boardId}/ai-move`, null, {
    params: { algorithm },
    headers: { 'X-Session-Id': sid }
  });
};

export const getBoardHint = async (boardId, algorithm) => {
  const sid = await getSessionId();
  return await axios.get(`${API_BASE}/board/${boardId}/hint`, {
    params: { algorithm },
    headers: { 'X-Session-Id': sid }
  });
};

export const setBoardAiConfig = async (boardId, depth) => {
  const sid = await getSessionId();
  return await axios.put(`${API_BASE}/board/${boardId}/ai-config`, 
    { depth },
    { headers: { 'X-Session-Id': sid } }
  );
};

export const runBoardBatch = async (boardId, count, algorithm, username) => {
  const sid = await getSessionId();
  return await axios.post(`${API_BASE}/board/${boardId}/batch-run`, null, {
    params: { count, algorithm, username },
    headers: { 'X-Session-Id': sid }
  });
};

export const clearBoard = async (boardId) => {
  const sid = await getSessionId();
  return await axios.delete(`${API_BASE}/board/${boardId}`, {
    headers: { 'X-Session-Id': sid }
  });
};

export const updateBoardUsername = async (boardId, username) => {
  const sid = await getSessionId();
  return await axios.put(`${API_BASE}/board/${boardId}/username`, 
    { username },
    { headers: { 'X-Session-Id': sid } }
  );
};

export const clearAllBoards = async () => {
  const sid = await getSessionId();
  return await axios.delete(`${API_BASE}/session/boards/all`, {
    headers: { 'X-Session-Id': sid }
  });
};

// ========== LEADERBOARD (No session required) ==========

export const getLeaderboard = async (gameMode = null) => {
  const params = gameMode ? { gameMode } : {};
  return await axios.get(`${API_BASE}/leaderboard`, { params });
};

export const getManualLeaderboard = async () => {
  return await axios.get(`${API_BASE}/leaderboard/manual`);
};

export const getAiLeaderboard = async () => {
  return await axios.get(`${API_BASE}/leaderboard/ai`);
};

export const getBatchLeaderboard = async () => {
  return await axios.get(`${API_BASE}/leaderboard/batch`);
};

export const getUserRecords = async (username) => {
  return await axios.get(`${API_BASE}/leaderboard/user/${username}`);
};

// ========== STATISTICS (No session required) ==========

export const getGlobalStats = async () => {
  return await axios.get(`${API_BASE}/stats/global`);
};

export const getStatsByMode = async (gameMode = null) => {
  const params = gameMode ? { gameMode } : {};
  return await axios.get(`${API_BASE}/stats/by-mode`, { params });
};

export const getStatsByCategory = async (category) => {
  return await axios.get(`${API_BASE}/stats/by-category`, {
    params: { category }
  });
};

export const getCategories = async () => {
  return await axios.get(`${API_BASE}/stats/categories`);
};

export const getUserStats = async (username) => {
  return await axios.get(`${API_BASE}/stats/user/${username}`);
};

export const getModeDistribution = async () => {
  return await axios.get(`${API_BASE}/stats/mode-distribution`);
};

export const getTopPlayers = async () => {
  return await axios.get(`${API_BASE}/stats/top-players`);
};