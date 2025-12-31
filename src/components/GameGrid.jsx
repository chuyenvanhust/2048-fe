import React from 'react';

/**
 * Component hiển thị toàn bộ bàn cờ với animation trượt mượt mà
 * FIXED: Tính toán vị trí chính xác để tile không tràn
 */
const GameGrid = ({ board = [], suggestedMove }) => {
    const tiles = [];
    
    // FIXED: Tính toán chính xác = cell_size (85px) + gap (12px) = 97px
    const CELL_SIZE = 85;
    const GAP = 12;
    const STEP = CELL_SIZE + GAP; // 97px
    
    // Duyệt board để tạo danh sách các ô có giá trị
    board.forEach((row, r) => {
        row.forEach((val, c) => {
            if (val !== 0) {
                tiles.push({
                    // Key duy nhất dựa trên vị trí và giá trị để React track animation
                    key: `${r}-${c}-${val}`,
                    value: val,
                    row: r,
                    col: c,
                    // FIXED: Tính toán vị trí chính xác
                    x: c * STEP,
                    y: r * STEP
                });
            }
        });
    });

    return (
        <div className="game-grid-container">
            {/* Lớp nền tĩnh - 16 ô trống */}
            <div className="grid-background">
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={`bg-${i}`} className="grid-cell-empty" />
                ))}
            </div>

            {/* Lớp các ô cờ động với animation */}
            {tiles.map(t => (
                <div 
                    key={t.key}
                    className={`tile tile-${t.value} ${t.value > 2048 ? 'tile-large' : ''}`}
                    style={{ 
                        transform: `translate(${t.x}px, ${t.y}px)`,
                        // Inline style cho màu sắc để đảm bảo hiển thị đúng
                        backgroundColor: getTileColor(t.value),
                        color: t.value <= 4 ? '#776e65' : '#f9f6f2'
                    }}
                >
                    {t.value}
                </div>
            ))}

            {/* Lớp Hint với hiệu ứng glow và arrow */}
            {suggestedMove && (
                <div className={`hint-overlay-v2 hint-glow-${suggestedMove}`}>
                    {/* Mũi tên chỉ hướng ở giữa */}
                    <div style={{
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        color: 'white', 
                        fontWeight: 'bold', 
                        textShadow: '0 0 20px rgba(255, 165, 0, 1), 0 0 40px rgba(255, 165, 0, 0.5)',
                        fontSize: '4rem',
                        animation: 'hint-bounce 1s infinite',
                        zIndex: 15
                    }}>
                        {suggestedMove === 'UP' && '↑'}
                        {suggestedMove === 'DOWN' && '↓'}
                        {suggestedMove === 'LEFT' && '←'}
                        {suggestedMove === 'RIGHT' && '→'}
                    </div>
                    
                    {/* Text gợi ý nhỏ */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                        backgroundColor: 'rgba(255, 165, 0, 0.8)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        zIndex: 15
                    }}>
                        AI suggests: {suggestedMove}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Hàm trả về màu sắc cho tile
 */
const getTileColor = (value) => {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#3c3a32'; // Màu default cho tile lớn hơn 2048
};

export default GameGrid;