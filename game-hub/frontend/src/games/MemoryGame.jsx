import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const CARD_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const shuffleCards = () =>
  [...CARD_VALUES, ...CARD_VALUES]
    .map((value, index) => ({ id: `${value}-${index}`, value, matched: false }))
    .sort(() => Math.random() - 0.5);

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [score, setScore] = useState(0);

  const startNewGame = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setScore(0);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const isSolved = useMemo(() => matched === CARD_VALUES.length, [matched]);

  useEffect(() => {
    if (flipped.length !== 2) return;

    const [first, second] = flipped;
    const firstCard = cards.find((card) => card.id === first);
    const secondCard = cards.find((card) => card.id === second);

    if (!firstCard || !secondCard) return;

    if (firstCard.value === secondCard.value) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === first || card.id === second ? { ...card, matched: true } : card
        )
      );
      setMatched((prev) => prev + 1);
      setScore((prev) => prev + 120);
      setFlipped([]);
    } else {
      setTimeout(() => {
        setFlipped([]);
      }, 700);
    }

    setMoves((prev) => prev + 1);
  }, [cards, flipped]);

  const handleFlip = (cardId) => {
    if (flipped.length === 2 || flipped.includes(cardId)) return;
    setFlipped((prev) => [...prev, cardId]);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'memory',
        score,
        result: isSolved ? 'win' : 'in-progress',
        duration: 40,
      });
      alert('Memory score saved.');
    } catch (error) {
      console.error('Could not save score:', error);
    }
  };

  return (
    <div className="game-page">
      <h2>Memory Match</h2>
      <p>Moves: {moves} | Matched: {matched}/8</p>
      <p>Score: {score}</p>
      <div className="tic-board" style={{ gridTemplateColumns: 'repeat(4, minmax(52px, 1fr))' }}>
        {cards.map((card) => {
          const isVisible = flipped.includes(card.id) || card.matched;
          return (
            <button
              key={card.id}
              className="cell"
              onClick={() => handleFlip(card.id)}
              style={{ background: isVisible ? '#20325f' : '#0d172d' }}
            >
              {isVisible ? card.value : '?'}
            </button>
          );
        })}
      </div>
      <div className="game-actions">
        <button className="secondary-btn" onClick={startNewGame}>Reset</button>
        <button className="primary-btn" onClick={saveScore}>Save Score</button>
      </div>
      {isSolved && <p>Great job! You matched every card.</p>}
    </div>
  );
};

export default MemoryGame;
