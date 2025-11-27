import React from 'react';

function BackButton({ currentStage, onClick }) {
    if (currentStage !== 5 && currentStage !== 6) return null;

    return (
        <button className="back-button" onClick={onClick}>
            ← BACK
        </button>
    );
}

export default BackButton;