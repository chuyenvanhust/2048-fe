import React, { useState, useEffect } from 'react';

const MoveEffect = ({ direction, onAnimationEnd }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onAnimationEnd) onAnimationEnd();
        }, 500); 
        return () => clearTimeout(timer);
    }, [direction, onAnimationEnd]);

    if (!direction) return null;

    return (
        <div className={`direction-overlay overlay-green glow-${direction} glow-animation`}>
            <div className="direction-text">
                {direction === 'UP' && '↑'}
                {direction === 'DOWN' && '↓'}
                {direction === 'LEFT' && '←'}
                {direction === 'RIGHT' && '→'}
            </div>
            <div className="direction-badge">{direction}</div>
        </div>
    );
};

export default MoveEffect;
