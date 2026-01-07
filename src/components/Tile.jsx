import React from 'react';

const Tile = ({ value, x, y }) => {
    const isNew = React.useRef(true);
    
  
    const getBgColor = (v) => {
        const colors = {
            2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
            32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
            512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
        };
        return colors[v] || '#3c3a32';
    };

    const style = {
        transform: `translate(${x}px, ${y}px)`,
        backgroundColor: getBgColor(value),
        color: value <= 4 ? '#776e65' : '#f9f6f2',
        fontSize: value > 100 ? '28px' : '35px'
    };

    return (
        <div 
            className={`tile ${value > 2048 ? 'tile-large' : ''}`} 
            style={style}
        >
            {value}
        </div>
    );
};
export default Tile;
