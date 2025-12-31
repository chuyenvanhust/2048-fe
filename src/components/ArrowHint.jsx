import React from 'react';

/**
 * Component hiển thị mũi tên gợi ý nước đi
 */
const ArrowHint = ({ direction }) => {
    if (!direction) return null;

    // Mapping hướng để hiển thị hiệu ứng gradient chảy
    const getHintStyle = () => {
        const base = "hint-direction-common ";
        switch (direction) {
            case 'UP': return { 
                top: 0, left: 0, right: 0, height: '30%', 
                background: 'linear-gradient(to bottom, rgba(255, 191, 0, 0.6), transparent)',
                borderTop: '4px solid #ffcc00',
                animation: 'hint-move-up 1s infinite'
            };
            case 'DOWN': return { 
                bottom: 0, left: 0, right: 0, height: '30%', 
                background: 'linear-gradient(to top, rgba(255, 191, 0, 0.6), transparent)',
                borderBottom: '4px solid #ffcc00',
                animation: 'hint-move-down 1s infinite'
            };
            case 'LEFT': return { 
                left: 0, top: 0, bottom: 0, width: '30%', 
                background: 'linear-gradient(to right, rgba(255, 191, 0, 0.6), transparent)',
                borderLeft: '4px solid #ffcc00',
                animation: 'hint-move-left 1s infinite'
            };
            case 'RIGHT': return { 
                right: 0, top: 0, bottom: 0, width: '30%', 
                background: 'linear-gradient(to left, rgba(255, 191, 0, 0.6), transparent)',
                borderRight: '4px solid #ffcc00',
                animation: 'hint-move-right 1s infinite'
            };
            default: return {};
        }
    };

    return (
        <div className="hint-overlay-v2">
            <div style={{...getHintStyle(), position: 'absolute'}} />
            {/* Hiển thị thêm text gợi ý nhỏ ở giữa */}
            <div style={{
                position: 'absolute', 
                top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%)',
                color: '#fff', fontWeight: 'bold', textShadow: '0 0 10px orange',
                fontSize: '1.2rem', opacity: 0.8
            }}>
                AI SUGGESTS: {direction}
            </div>
        </div>
    );
};

export default ArrowHint;