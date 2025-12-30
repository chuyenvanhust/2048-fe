import React from 'react';

/**
 * Component hiển thị mũi tên gợi ý nước đi
 */
const ArrowHint = ({ direction }) => {
    let rotation = 0;
    
    // Tính góc xoay cho mũi tên
    switch (direction) {
        case 'UP':
            rotation = 0;
            break;
        case 'DOWN':
            rotation = 180;
            break;
        case 'LEFT':
            rotation = -90;
            break;
        case 'RIGHT':
            rotation = 90;
            break;
        default:
            rotation = 0;
    }

    return (
        <div 
            className="hint-arrow" 
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <polygon 
                    points="50,0 100,100 0,100"
                    fill="#ffa500" 
                    opacity="0.9"
                />
            </svg>
        </div>
    );
};

export default ArrowHint;