import React, { useState } from 'react';
import './ControlPanel.css';

/**
 * ControlPanel component for user to input and submit their guess.
 *
 * @param {function} onGuessSubmit - Function to handle the submission of a guess.
 * @param {string} selectedLevel - Current game difficulty level.
 */
const ControlPanel = ({ onGuessSubmit, selectedLevel }) => {
  // State to manage the current guess and error message.
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');

  /**
     * Handles the change in the input field.
     * Converts input to uppercase and resets error state.
     *
     * @param {object} event - The input change event.
     */
  const handleInputChange = (event) => {
    setError('');
    setGuess(event.target.value.toUpperCase());
  };

  /**
     * Validates the guess based on the selected game level.
     *
     * @param {string} guess - The current guess input by the user.
     * @returns {string} errorMessage - The validation error message, if any.
     */
  const validateGuess = (guess) => {
    let errorMessage = '';
    
    // Validate the guess format based on the selected level
    switch (selectedLevel) {
      case 'easy':
        // Easy level validation rules
        if (guess.length !== 4) {
          errorMessage = "Guess must be 4 characters long.";
        }
        if (!/^[RGBYOP]{4}$/.test(guess)) {
          errorMessage = "Invalid guess. Only use R, G, B, Y, O, P.";
        }
        break;
      case 'medium':
        // Medium level validation rules
        if (guess.length !== 6) {
          errorMessage = "Guess must be 6 characters long.";
        }
        if (!/^[RGBYOPC]{6}$/.test(guess)) {
          errorMessage = "Invalid guess. Only use R, G, B, Y, O, P, C.";
        }
        break;
      case 'hard':
        // Hard level validation rules
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

   /**
     * Handles the submission of a guess.
     * Validates the guess and, if valid, submits it.
     */
  const handleSubmit = () => {
    const errorMessage = validateGuess(guess);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    onGuessSubmit(guess);
    setGuess('');
  };

  // Render the control panel with an input field and submit button.
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