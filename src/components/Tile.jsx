import React from 'react';

/**
 * Component hiển thị một ô cờ (tile) đơn lẻ
 */
const Tile = ({ value = 0 }) => {
    // Normalize value to a number and guard against null/undefined
    const val = Number(value) || 0;

    // Logic để xác định tên lớp CSS dựa trên giá trị
    const getClassName = (v) => {
        if (v === 0) return 'tile-empty';
        if (v > 2048) return 'tile-large';
        return `tile-${v}`;
    };

    return (
        <div className={`tile ${getClassName(val)}`}>
            {val !== 0 ? val : null}
        </div>
    );
};

export default Tile;