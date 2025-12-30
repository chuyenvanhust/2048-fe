import React from 'react';
import Tile from './Tile';
import ArrowHint from './ArrowHint';

/**
 * Component hiển thị toàn bộ bàn cờ và hiệu ứng gợi ý
 */
const GameGrid = ({ board = [], suggestedMove }) => {
    // Ensure we always render a 4x4 grid even if board is missing/partial
    const tiles = [];
    for (let r = 0; r < 4; r++) {
        const row = Array.isArray(board[r]) ? board[r] : [];
        for (let c = 0; c < 4; c++) {
            const value = typeof row[c] !== 'undefined' ? row[c] : 0;
            tiles.push(
                <Tile
                    key={`${r}-${c}`}
                    value={value}
                />
            );
        }
    }

    return (
        <div className="game-grid-container">
            <div className="game-grid">{tiles}</div>

            {/* Render Overlay gợi ý chỉ khi có suggestedMove */}
            {suggestedMove && (
                <div className="hint-overlay">
                    <ArrowHint direction={suggestedMove} />
                </div>
            )}
        </div>
    );
};

export default GameGrid;