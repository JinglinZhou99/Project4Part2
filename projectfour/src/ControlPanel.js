import React, { useState } from 'react';
import './ControlPanel.css';

const ControlPanel = ({ onGuessSubmit, selectedLevel }) => {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setError('');
    setGuess(event.target.value.toUpperCase());
  };

  const validateGuess = (guess) => {
    let errorMessage = '';
    
    // Validate the guess format based on the selected level
    switch (selectedLevel) {
      case 'easy':
        if (guess.length !== 4) {
          errorMessage = "Guess must be 4 characters long.";
        }
        if (!/^[RGBYOP]{4}$/.test(guess)) {
          errorMessage = "Invalid guess. Only use R, G, B, Y, O, P.";
        }
        break;
      case 'medium':
        if (guess.length !== 6) {
          errorMessage = "Guess must be 6 characters long.";
        }
        if (!/^[RGBYOPC]{6}$/.test(guess)) {
          errorMessage = "Invalid guess. Only use R, G, B, Y, O, P, C.";
        }
        break;
      case 'hard':
        if (guess.length !== 8) {
          errorMessage = "Guess must be 8 characters long.";
        }
        if (!/^[RGBYOPCM]{8}$/.test(guess)) {
          errorMessage = "Invalid guess. Only use R, G, B, Y, O, P, C, M.";
        }
        break;
      default:
        break;
    }
    
    return errorMessage;
  };

  const handleSubmit = () => {
    const errorMessage = validateGuess(guess);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    onGuessSubmit(guess);
    setGuess('');
  };

  return (
    <div className="control-panel">
      <input
        type="text"
        placeholder="Enter your guess here"
        value={guess}
        onChange={handleInputChange}
        maxLength={selectedLevel === 'easy' ? '4' : selectedLevel === 'medium' ? '6' : '8'}
      />
      <button onClick={handleSubmit}>Submit Guess</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ControlPanel;