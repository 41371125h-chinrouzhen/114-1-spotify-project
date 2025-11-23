import React, { useState, useEffect } from 'react';

function Phase1_UI({ currentStage, onNextStage, isLoading, onLogin }) {
    const [nameInput, setNameInput] = useState("");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleLoginClick = () => {
        if (!nameInput.trim()) {
            alert("Please enter your name");
            return;
        }
        onLogin(nameInput);
        onNextStage();
    };

    const handleGuestClick = () => {
        onLogin(null);
        onNextStage();
    };

    const isHidden = currentStage !== 1;

    const containerStyle = {
        opacity: visible && !isHidden ? 1 : 0,
        visibility: visible && !isHidden ? 'visible' : 'hidden',
        pointerEvents: isHidden ? 'none' : 'auto'
    };

    return (
        <div className="phase-1-ui ui-stage" style={containerStyle}>
            <span id="text-echo" className="ui-text">ECHO</span>
            <span id="text-the" className="ui-text">THE</span>
            <span id="text-mind" className="ui-text">MIND</span>
            <span id="text-within" className="ui-text">WITHIN</span>

            <div className="brand-info">
                <h3>SPOTIFY</h3>
                <p>SYNC. FEEL. FLOW.</p>
            </div>

            <div className="auth-container">
                <div className="auth-input-group">
                    <input
                        type="text"
                        placeholder="Enter name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="auth-input"
                    />
                    <button
                        className="menu-button"
                        onClick={handleLoginClick}
                        disabled={isLoading}
                    >
                        LOGIN
                    </button>
                </div>

                <button
                    className="guest-button"
                    onClick={handleGuestClick}
                    disabled={isLoading}
                >
                    CONTINUE AS GUEST
                </button>
            </div>
        </div>
    );
}

export default Phase1_UI;