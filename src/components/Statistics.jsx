import { useState, useEffect } from 'react';
import * as api from '../api';

export default function Statistics() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedCategory(res.data[0]);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadStats = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      const res = await api.getStatsByCategory(selectedCategory);
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCategory) {
      loadStats();
      setShowChart(false);
    }
  }, [selectedCategory]);

  const renderDistributionChart = () => {
    if (!stats || !stats.distribution) return null;

    // Convert to log2 scale and prepare data
    const chartData = Object.entries(stats.distribution)
      .map(([tile, count]) => ({
        log2Tile: Math.log2(parseInt(tile)),
        tile: parseInt(tile),
        count: count
      }))
      .sort((a, b) => a.log2Tile - b.log2Tile);

    if (chartData.length === 0) return null;

    const maxCount = Math.max(...chartData.map(d => d.count));
    const minLog2 = Math.min(...chartData.map(d => d.log2Tile));
    const maxLog2 = Math.max(...chartData.map(d => d.log2Tile));

    return (
      <div className="chart-container">
        <h4>📊 Distribution Chart (log₂ scale)</h4>
        <div className="chart-axes">
          <div className="y-axis-label">Count</div>
          <div className="chart-content">
            <svg width="100%" height="400" viewBox="0 0 800 400">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <g key={i}>
                  <line
                    x1="60"
                    y1={350 - ratio * 300}
                    x2="760"
                    y2={350 - ratio * 300}
                    stroke="#e0e0e0"
                    strokeDasharray="4"
                  />
                  <text
                    x="50"
                    y={355 - ratio * 300}
                    textAnchor="end"
                    fontSize="12"
                    fill="#666"
                  >
                    {Math.round(maxCount * ratio)}
                  </text>
                </g>
              ))}

              {/* Bars */}
              {chartData.map((d, i) => {
                const x = 60 + ((d.log2Tile - minLog2) / (maxLog2 - minLog2)) * 680;
                const barWidth = 680 / chartData.length * 0.8;
                const barHeight = (d.count / maxCount) * 300;
                
                return (
                  <g key={i}>
                    <rect
                      x={x - barWidth / 2}
                      y={350 - barHeight}
                      width={barWidth}
                      height={barHeight}
                      fill="#667eea"
                      opacity="0.8"
                    />
                    <text
                      x={x}
                      y={365}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#333"
                      fontWeight="600"
                    >
                      {d.tile}
                    </text>
                    <text
                      x={x}
                      y={380}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#999"
                    >
                      (2^{d.log2Tile})
                    </text>
                  </g>
                );
              })}

              {/* Normal distribution curve approximation */}
              {stats.mean && stats.stdDev && (
                <path
                  d={generateNormalCurve(chartData, stats.mean, stats.stdDev, maxCount, minLog2, maxLog2)}
                  fill="none"
                  stroke="#f67c5f"
                  strokeWidth="2"
                  opacity="0.7"
                />
              )}

              {/* Axes */}
              <line x1="60" y1="350" x2="760" y2="350" stroke="#333" strokeWidth="2" />
              <line x1="60" y1="50" x2="60" y2="350" stroke="#333" strokeWidth="2" />
            </svg>
          </div>
          <div className="x-axis-label">Max Tile (log₂ scale)</div>
        </div>
      </div>
    );
  };

  const generateNormalCurve = (chartData, mean, stdDev, maxCount, minLog2, maxLog2) => {
    if (stdDev === 0) return '';
    
    const points = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const x = minLog2 + (i / steps) * (maxLog2 - minLog2);
      const xPixel = 60 + ((x - minLog2) / (maxLog2 - minLog2)) * 680;
      
      // Normal distribution formula
      const exponent = -Math.pow(x - Math.log2(mean), 2) / (2 * Math.pow(stdDev, 2));
      const y = Math.exp(exponent) / (stdDev * Math.sqrt(2 * Math.PI));
      
      // Scale to fit chart
      const scaleFactor = maxCount * 0.8;
      const yPixel = 350 - (y * scaleFactor * 50);
      
      points.push(`${xPixel},${yPixel}`);
    }
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="statistics-container">
      <h3>📈 Performance Statistics</h3>
      
      <div className="category-selector">
        <label>Select Category:</label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button 
          onClick={() => setShowChart(!showChart)}
          disabled={!stats || loading}
          className="btn-visualize"
        >
          {showChart ? '📊 Hide Chart' : '📊 Visualize'}
        </button>
      </div>

      {loading && (
        <div className="loading-spinner">Loading statistics...</div>
      )}

      {stats && !loading && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Games</div>
            <div className="stat-value">{stats.totalGames}</div>
          </div>
          
          {stats.totalGames > 0 && (
            <>
              <div className="stat-card">
                <div className="stat-label">Mean (μ)</div>
                <div className="stat-value">{stats.mean?.toFixed(2)}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Std Dev (σ)</div>
                <div className="stat-value">{stats.stdDev?.toFixed(2)}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Variance (σ²)</div>
                <div className="stat-value">{stats.variance?.toFixed(2)}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Mode</div>
                <div className="stat-value tile-badge-small">{stats.mode}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Max Tile</div>
                <div className="stat-value tile-badge-small">{stats.max}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Min Tile</div>
                <div className="stat-value tile-badge-small">{stats.min}</div>
              </div>
            </>
          )}
        </div>
      )}

      {showChart && stats && renderDistributionChart()}

      {stats && stats.totalGames === 0 && (
        <p className="no-data-message">
          No data available for this category yet. Play some games to see statistics!
        </p>
      )}
    </div>
  );
}