import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import ControlPanel from './ControlPanel';
import './App.css';
import axios from 'axios';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';

import backgroundMusic from './yujian.wav';

// Maximum number of guesses allowed
const MAX_GUESSES = 11;

// Firebase configuration details
const firebaseConfig = {
  // My Firebase configuration keys
  apiKey: "AIzaSyCV0-z4-ztLOkCQKQWGYqLxqhhzKOnhQXo",
  authDomain: "noble-freehold-404519.firebaseapp.com",
  projectId: "noble-freehold-404519",
  storageBucket: "noble-freehold-404519.appspot.com",
  messagingSenderId: "616928719132",
  appId: "1:616928719132:web:290f280f0ae5c2d14ccad9"
};

// Initialize Firebase with the specified configuration
initializeApp(firebaseConfig);

const App = () => {
  // State variables to manage game state and user data
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const [secret, setSecret] = useState('');

  const [newHandle1, setNewHandle1] = useState('');
  const [oldHandle, setOldHandle] = useState('');
  const [gameRecords, setGameRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [handle, setHandle] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [viewOwnRecords, setViewOwnRecords] = useState(false);

  // Pagination state for game records
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = gameRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(gameRecords.length / recordsPerPage);
  const goToNextPage = () => setCurrentPage(page => Math.min(page + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage(page => Math.max(page - 1, 1));
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  const [submitChoice, setSubmitChoice] = useState(null);
  const [newHandle, setNewHandle] = useState('');

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [guesses, setGuesses] = useState([]);

  // Effect hook to manage authentication state and fetch initial data
  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    if (viewOwnRecords) {
      displayUserGameRecords();
    } else {
      displayAllGameRecords();
    }

    axios.get('https://noble-freehold-404519.ue.r.appspot.com/getComments')
    .then(response => {
        setComments(response.data);
    })
    .catch(error => console.error('Error fetching comments:', error));
    
    startNewRound();
    let timer;
    if (!gameOver) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [viewOwnRecords, userId, selectedLevel]);



  const isHandleAvailable = async (handle) => {
    if (!handle) return true;
  
    try {
      const response = await axios.get(`https://noble-freehold-404519.ue.r.appspot.com/checkHandle?handle=${encodeURIComponent(handle)}&userId=${encodeURIComponent(userId)}`);
      return !response.data;
    } catch (error) {
      console.error('Error checking handle:', error);
      return false;
    }
  };
  
  async function handleSubmit(event) {
    event.preventDefault();

    const handleAvailable = await isHandleAvailable(handle);

    if (!handleAvailable) {
      alert("This handle is already in use by another user. Please choose a different one.");
      return;
    }
    const postData = {
        userId,
        handle,
        score
    };
    try {
        const response = await axios.post('https://noble-freehold-404519.ue.r.appspot.com/addGameRecord', postData);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error posting data:', error);
    }
    startNewRound();
  };

  const handleDontSubmit = () => {
    setSubmitChoice(false);
    startNewRound();
  };

  const changeHandle = async () => {
    try {

      const recordToUpdate = gameRecords.find(record => record.handle=== oldHandle);

      if (recordToUpdate) {

        const updatedRecord = {
          userId: recordToUpdate.userId,
          handle: newHandle1,
          score: recordToUpdate.score,
        };

        // Delete the old record from the database
        await axios.delete(`https://noble-freehold-404519.ue.r.appspot.com/deleteByHandle?handle=${oldHandle}`);

        // Add the updated record to the database
        await axios.post(`https://noble-freehold-404519.ue.r.appspot.com/addGameRecord`, updatedRecord);

        // Update the local state with the modified game record
        setGameRecords(prevRecords => {
          const updatedRecords = prevRecords.map(record => {
            return record.id === recordToUpdate.id ? updatedRecord : record;
          });
          return updatedRecords;
        });
      }
    } catch (error) {
      console.error('Error updating handle:', error);
    }
  };
  
  // function to call API to get all books in DB
  function displayAllGameRecords() {
    setLoading(true);
    axios.get(`https://noble-freehold-404519.ue.r.appspot.com/showAllRecords`)
      .then(response => {
        const sortedRecords = response.data.sort((a, b) => b.score - a.score);
        setGameRecords(sortedRecords);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }
  
  function displayUserGameRecords() {
    setLoading(true);
    axios.get(`https://noble-freehold-404519.ue.r.appspot.com/findByUserId?userId=${userId}`)
      .then(response => {
        const sortedRecords = response.data.sort((a, b) => b.score - a.score);
        setGameRecords(sortedRecords);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }

  const submitComment = () => {

    const postComment = {
      userId: userId,
      content: newComment
  };
    axios.post('https://noble-freehold-404519.ue.r.appspot.com/addComment',postComment)
    .then(() => {
        setNewComment('');
        // Re-fetch comments or update state
        fetchComments(); // Assuming fetchComments is a function that fetches comments and updates state
    })
    .catch(error => console.error('Error submitting comment:', error));
    startNewRound();
  };

  // You can create a separate function for fetching comments
  const fetchComments = () => {
      axios.get('https://noble-freehold-404519.ue.r.appspot.com/getComments')
      .then(response => {
          setComments(response.data);
      })
      .catch(error => console.error('Error fetching comments:', error));
  }

  const startNewRound = () => {//mod
    //  setElapsedTime(0);//mod
      setGameOver(false);
      setSubmitChoice(null);
      setScore(0);
      setGuesses([]);
    
      // Reset any other relevant state variables
    
      // Generate secret based on the selected level
      let colors = [];
      let length = 0;
    
      switch (selectedLevel) {
        case 'easy':
          colors = ['R', 'G', 'B', 'Y', 'O', 'P'];
          length = 4;
          break;
        case 'medium':
          colors = ['R', 'G', 'B', 'Y', 'O', 'P', 'C'];
          length = 6;
          break;
        case 'hard':
          colors = ['R', 'G', 'B', 'Y', 'O', 'P', 'C', 'M'];
          length = 8;
          break;
        default:
          break;
      }
    
      const generatedSecret = Array.from({ length }, () =>
        colors[Math.floor(Math.random() * colors.length)]
      ).join('');
    
      // Set the generated secret
      setSecret(generatedSecret);
    };
  
  const deleteUserGameRecords = () => {
    setLoading(true);
    axios.delete(`https://noble-freehold-404519.ue.r.appspot.com/deleteByUserId?userId=${userId}`)
      .then(response => {
        console.log('Records deleted:', response.data);
        displayUserGameRecords(); // Refresh the list after deletion
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  };
  
  const updateUserHandle = (newHandle) => {
    setLoading(true);
    axios.put(`https://noble-freehold-404519.ue.r.appspot.com/updateHandleByUserId?userId=${userId}&newHandle=${newHandle}`)
      .then(response => {
        console.log('Handle updated:', response.data);
        setHandle(newHandle); // Update the handle in the state
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  };
  
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithRedirect(auth, provider);
  };
  
  const signOut = () => {
    const auth = getAuth();
    auth.signOut();
  };
  
  const calculateScore = (numberOfGuesses) => {
    const timeBonus = Math.max((MAX_GUESSES - 1) * 10 - elapsedTime, 0);
    let number = ((MAX_GUESSES - numberOfGuesses) * 10 + timeBonus)/2;
    let result = Math.floor(number);
    return (result);
  };

  // Function to add a new guess to the state
  const addGuess = (newGuess) => {
    // Compare the new guess to the secret to determine exact and partial matches
    const results = compareGuessToSecret(newGuess, secret);
    // Update the guesses state with the new guess and the results of the comparison
    setGuesses(guesses.concat({ guess: newGuess, results }));
    const newGuesses = guesses.concat({ guess: newGuess, results });
    setGuesses(newGuesses);
  
    // Check if the game is over
    if (results.exacts === secret.length || newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      setScore(calculateScore(newGuesses.length));
      // Do not automatically submit. Instead, ask for the user's choice.
      setSubmitChoice(null); // Reset the choice for a new game
    }
  };

  // Function to compare a guess to the secret
  const compareGuessToSecret = (guess, secret) => {
    let exacts = 0; // Counter for exact matches
    let partials = 0; // Counter for partial matches
    let secretArray = secret.split(''); // Split the secret into an array for comparison
    let guessArray = guess.split(''); // Split the guess into an array for comparison

    // Check for exact matches
    secretArray.forEach((s, index) => {
      if (s === guessArray[index]) {
        exacts++;
        // Nullify the matched elements to avoid recounting them in partial matches
        secretArray[index] = null;
        guessArray[index] = null;
      }
    });

    // Check for partial matches (correct color in the wrong place)
    guessArray.forEach((g, index) => {
      if (g && secretArray.includes(g)) {
        partials++;
        // Nullify the matched element in the secret array to avoid recounting
        secretArray[secretArray.indexOf(g)] = null;
      }
    });

    // Return the results as an object with exact and partial counts
    return { exacts, partials };
  };

  if (!isAuthenticated) {
    return (
      <div className="login-prompt">
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      </div>
    );
  }
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Render the main game app with a title, game board, and control panel
  return (
    <div className="app">
      <h1>MasterMind Game</h1>
      <div>
        <p>Timer: {elapsedTime} seconds</p >
        {/* ... (other UI elements) */}
      </div>
      <div>
        <button onClick={() => setSelectedLevel('easy')}>Easy</button>
        <button onClick={() => setSelectedLevel('medium')}>Medium</button>
        <button onClick={() => setSelectedLevel('hard')}>Hard</button>
      </div>
      <div>
        <p>Current Level: {selectedLevel}</p >
        <p>Available Colors: {selectedLevel === 'easy' ? 'RGBYOP' : selectedLevel === 'medium' ? 'RGBYOPC' : 'RGBYOPCM'}</p >
        <p>Length: {selectedLevel === 'easy' ? 4 : selectedLevel === 'medium' ? 6 : 8}</p >
        <p>Secret: {secret}</p > {/* Display the secret for testing */}
      </div>
      <GameBoard guesses={guesses} />
      <ControlPanel onGuessSubmit={addGuess} selectedLevel={selectedLevel} />
      {gameOver && (
      <div className="game-over-container">
        <p>Your score: {score}</p>
        {!submitChoice && (
          <div className="button-container">
            <button onClick={() => setSubmitChoice(true)}>Submit Score</button>
            <button onClick={handleDontSubmit}>Don't Submit</button>
            </div>
          )}
          {submitChoice && submitChoice === true && (
            <form onSubmit={handleSubmit}>
              <label>
                Handle (Your Game Name): 
                <input type="text" value={handle} onChange={e => setHandle(e.target.value)} />
              </label>
              <br />
              <button type="submit">Submit</button>
            </form>
          )}
          {submitChoice === false && <p>Game ended without submitting score.</p>}
        </div>
      )}

      {/* Input for old handle */}
      <label>
        Old Handle:
        <input type="text" value={oldHandle} onChange={e => setOldHandle(e.target.value)} />
      </label>

      {/* Input and button to change handle name */}
      <label>
        New Handle:
        <input type="text" value={newHandle1} onChange={e => setNewHandle1(e.target.value)} />
      </label>
      <button onClick={changeHandle}>Change Handle</button>


      <button onClick={() => setViewOwnRecords(!viewOwnRecords)}>
        {viewOwnRecords ? "View Hgih Score" : "View My Records"}
      </button>
      {/* Render only paginated records */}
      {currentRecords.map(gameRecord => (
        <div className="game-record-item" key={gameRecord.id}>
          <p>{gameRecord.handle} ID: {gameRecord.userId}</p>
          <p>Score: {gameRecord.score}, Date: {gameRecord.date}</p>
          {/* Include other game record details as needed */}
        </div>
      ))}


      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>Previous</button>
        {[...Array(totalPages).keys()].map(number => (
          <button
            key={number}
            onClick={() => goToPage(number + 1)}
            disabled={currentPage === number + 1}
          >
            {number + 1}
          </button>
        ))}
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>

      {/* Add the audio element */}
      <audio autoPlay loop>
        <source src={backgroundMusic} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>

      <div className="user-actions-container">
        {isAuthenticated && userId && (
          <button onClick={deleteUserGameRecords}>Delete My Records</button>
        )}

        <div className="handle-update-container">
          <label>
            New Handle: 
            <input type="text" value={newHandle} onChange={e => setNewHandle(e.target.value)} />
          </label>
          <button onClick={() => updateUserHandle(newHandle)}>Update Handle</button>
        </div>

        <div className="user-info-container">
          <p>My Id: {userId}</p>
        </div>

        <div className="sign-out-container">
          <button onClick={signOut}>Sign Out</button>
        </div>
      </div>

      <div className="comments-section">
          <h3>Comments</h3>
          {comments.map(comment => (
              <div key={comment.id}>
                  <strong>User {comment.userId}</strong>: {comment.content}
              </div>
          ))}
          <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
          />
          <button onClick={submitComment}>Post Comment</button>
      </div>

    </div>
  );
};

export default App;
