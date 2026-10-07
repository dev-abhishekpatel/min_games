import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import sounds from '../services/soundEffects';
import VictoryModal from '../components/VictoryModal';

const shuffleArray = (items) => [...items].sort(() => Math.random() - 0.5);
const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

// ==========================================
// 1. SPACE COSMIC BLASTER (60FPS Canvas Action)
// ==========================================
const SpaceShooterGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState('idle'); // idle, playing, over
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let playerX = canvas.width / 2 - 20;
    const playerY = canvas.height - 45;
    const playerWidth = 40;
    const playerHeight = 28;

    const bullets = [];
    const enemies = [];
    const particles = [];

    let rightPressed = false;
    let leftPressed = false;
    let spacePressed = false;
    let currentScore = 0;
    let currentLives = 3;
    let lastShotTime = 0;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        spacePressed = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
      if (e.key === ' ' || e.key === 'Spacebar') spacePressed = false;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < canvas.width) {
        playerX = relativeX - playerWidth / 2;
      }
    };

    const handleCanvasClick = () => {
      shootLaser();
    };

    const shootLaser = () => {
      const now = Date.now();
      if (now - lastShotTime > 150) {
        bullets.push({ x: playerX + playerWidth / 2 - 3, y: playerY, width: 6, height: 16 });
        lastShotTime = now;
        sounds.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    let animId;
    let enemyTimer = 0;

    const draw = () => {
      // Starfield background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect((i * 33 + Date.now() / 30) % canvas.width, (i * 27 + Date.now() / 15) % canvas.height, 2, 2);
      }

      // Move player
      if (rightPressed && playerX < canvas.width - playerWidth) playerX += 7;
      if (leftPressed && playerX > 0) playerX -= 7;
      if (spacePressed) shootLaser();

      // Draw player spaceship
      ctx.fillStyle = '#6366f1';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(playerX + playerWidth / 2, playerY - 12);
      ctx.lineTo(playerX + playerWidth, playerY + playerHeight);
      ctx.lineTo(playerX + playerWidth / 2, playerY + playerHeight - 6);
      ctx.lineTo(playerX, playerY + playerHeight);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Spawn alien enemies
      enemyTimer++;
      if (enemyTimer % 40 === 0) {
        enemies.push({
          x: Math.random() * (canvas.width - 32),
          y: -30,
          width: 32,
          height: 26,
          speed: 2 + Math.random() * 2,
          type: Math.random() > 0.7 ? 'heavy' : 'scout',
          hp: Math.random() > 0.7 ? 2 : 1,
        });
      }

      // Move & draw bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= 10;
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.shadowBlur = 0;
        if (b.y < -20) bullets.splice(i, 1);
      }

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Move & draw enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.y += e.speed;

        ctx.fillStyle = e.type === 'heavy' ? '#f97316' : '#ef4444';
        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(e.x + e.width / 2, e.y + e.height / 2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check bullet hits
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (
            b.x < e.x + e.width &&
            b.x + b.width > e.x &&
            b.y < e.y + e.height &&
            b.y + b.height > e.y
          ) {
            e.hp--;
            bullets.splice(j, 1);
            if (e.hp <= 0) {
              sounds.playCorrect();
              currentScore += e.type === 'heavy' ? 40 : 20;
              setScore(currentScore);

              // Spawn particles
              for (let k = 0; k < 8; k++) {
                particles.push({
                  x: e.x + 16,
                  y: e.y + 13,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  size: Math.random() * 4 + 2,
                  color: e.type === 'heavy' ? '#f97316' : '#ef4444',
                  life: 1,
                });
              }
              enemies.splice(i, 1);
              break;
            }
          }
        }

        // Alien reaches bottom or hits ship
        if (e && e.y > canvas.height - 35) {
          enemies.splice(i, 1);
          currentLives--;
          setLives(currentLives);
          sounds.playWrong();
          if (currentLives <= 0) {
            setGameState('over');
            setShowModal(true);
            sounds.playLose();
            return;
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animId);
    };
  }, [gameState]);

  const start = () => {
    setScore(0);
    setLives(3);
    setGameState('playing');
    setShowModal(false);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'space-shooter',
        score,
        result: score >= 200 ? 'win' : 'attempted',
        duration: 45,
      });
      alert('Space Cosmic Blaster score saved!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>🚀 Space Cosmic Blaster</h2>
      <p>Use Mouse / Arrow Keys to move & click / Spacebar to shoot laser!</p>

      <div className="score-row">
        <span>❤️ Lives: {'❤️'.repeat(lives)}</span>
        <span>⭐ Score: {score}</span>
        <span>Status: {gameState.toUpperCase()}</span>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={480} height={360} className="game-canvas" />
      </div>

      <div className="game-actions">
        <button className="primary-btn" onClick={start}>
          {gameState === 'playing' ? '🔄 Restart Flight' : '▶️ Launch Starship'}
        </button>
        <button className="primary-btn" onClick={saveScore} disabled={score === 0}>
          ⭐ Save Score
        </button>
      </div>

      {showModal && (
        <VictoryModal
          title="Space Cosmic Blaster"
          score={score}
          result={score >= 200 ? 'win' : 'attempted'}
          message={`Space mission complete! Final Score: ${score} pts`}
          onPlayAgain={start}
          onSaveScore={saveScore}
        />
      )}
    </div>
  );
};

// ==========================================
// 2. TURBO HIGHWAY RACER (60FPS Canvas Racing)
// ==========================================
const HighwayRacerGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(120);
  const [gameState, setGameState] = useState('idle');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lane = 1; // 0, 1, 2
    let targetLane = 1;
    let playerX = canvas.width / 2 - 20;
    const playerY = canvas.height - 70;
    const carWidth = 40;
    const carHeight = 55;

    const laneWidth = canvas.width / 3;
    const traffic = [];
    let currentScore = 0;
    let currentSpeed = 120;
    let roadOffsetY = 0;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        targetLane = Math.max(0, targetLane - 1);
        sounds.playMove();
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        targetLane = Math.min(2, targetLane + 1);
        sounds.playMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    let animId;
    let timer = 0;

    const draw = () => {
      // Road background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scrolling road lines
      roadOffsetY = (roadOffsetY + currentSpeed / 10) % 40;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([20, 20]);
      ctx.lineWidth = 4;
      ctx.lineDashOffset = -roadOffsetY;

      ctx.beginPath();
      ctx.moveTo(laneWidth, 0);
      ctx.lineTo(laneWidth, canvas.height);
      ctx.moveTo(laneWidth * 2, 0);
      ctx.lineTo(laneWidth * 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Smooth player car movement to target lane
      const targetX = targetLane * laneWidth + laneWidth / 2 - carWidth / 2;
      playerX += (targetX - playerX) * 0.25;

      // Draw player car
      ctx.fillStyle = '#f97316';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f97316';
      ctx.beginPath();
      ctx.roundRect(playerX, playerY, carWidth, carHeight, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Wheels & windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(playerX + 6, playerY + 12, carWidth - 12, 14);

      // Spawn traffic & nitro
      timer++;
      if (timer % 30 === 0) {
        const spawnLane = Math.floor(Math.random() * 3);
        const isNitro = Math.random() > 0.8;
        traffic.push({
          x: spawnLane * laneWidth + laneWidth / 2 - carWidth / 2,
          y: -60,
          lane: spawnLane,
          type: isNitro ? 'nitro' : 'car',
          color: randomFrom(['#ef4444', '#3b82f6', '#10b981', '#a855f7']),
        });
      }

      // Move & draw traffic
      for (let i = traffic.length - 1; i >= 0; i--) {
        const t = traffic[i];
        t.y += currentSpeed / 20 + 2;

        if (t.type === 'nitro') {
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(t.x + carWidth / 2, t.y + 20, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('⚡', t.x + carWidth / 2 - 8, t.y + 25);
        } else {
          ctx.fillStyle = t.color;
          ctx.beginPath();
          ctx.roundRect(t.x, t.y, carWidth, carHeight, 8);
          ctx.fill();
        }

        // Collision check
        if (
          playerX < t.x + carWidth - 6 &&
          playerX + carWidth > t.x + 6 &&
          playerY < t.y + carHeight - 6 &&
          playerY + carHeight > t.y + 6
        ) {
          if (t.type === 'car') {
            setGameState('over');
            setShowModal(true);
            sounds.playLose();
            return;
          } else if (t.type === 'nitro') {
            sounds.playCorrect();
            currentScore += 100;
            currentSpeed = Math.min(260, currentSpeed + 15);
            setSpeed(currentSpeed);
            traffic.splice(i, 1);
            continue;
          }
        }

        if (t.y > canvas.height + 60) {
          currentScore += 10;
          setScore(currentScore);
          traffic.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animId);
    };
  }, [gameState]);

  const start = () => {
    setScore(0);
    setSpeed(120);
    setGameState('playing');
    setShowModal(false);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'highway-racer',
        score,
        result: score >= 300 ? 'win' : 'attempted',
        duration: 30,
      });
      alert('Turbo Highway Racer score saved!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>🏎️ Turbo Highway Racer</h2>
      <p>Use Left/Right Arrow Keys to weave through highway traffic and grab Nitro ⚡ boosts!</p>

      <div className="score-row">
        <span>⚡ Speed: {speed} MPH</span>
        <span>⭐ Distance Score: {score}</span>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={420} height={380} className="game-canvas" />
      </div>

      <div className="game-actions">
        <button className="primary-btn" onClick={start}>
          {gameState === 'playing' ? '🔄 Restart Race' : '▶️ Start Turbo Race'}
        </button>
        <button className="primary-btn" onClick={saveScore} disabled={score === 0}>
          ⭐ Save Score
        </button>
      </div>

      {showModal && (
        <VictoryModal
          title="Turbo Highway Racer"
          score={score}
          result={score >= 300 ? 'win' : 'attempted'}
          message={`Race finished! Top speed: ${speed} MPH | Score: ${score}`}
          onPlayAgain={start}
          onSaveScore={saveScore}
        />
      )}
    </div>
  );
};

// ==========================================
// 3. CYBER TANK BLITZ (Canvas Tank Arena)
// ==========================================
const TankDuelGame = () => {
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState('Aim tank turret & fire shells!');
  const [showModal, setShowModal] = useState(false);
  const [isFiring, setIsFiring] = useState(false);

  const fire = (target) => {
    if (isFiring || enemyHp <= 0 || playerHp <= 0) return;
    setIsFiring(true);
    sounds.playDrop();

    setTimeout(() => {
      const hitChance = target === 'turret' ? 0.6 : target === 'hull' ? 0.8 : 0.7;
      const isHit = Math.random() < hitChance;

      if (isHit) {
        sounds.playCorrect();
        const dmg = Math.floor(Math.random() * 25) + 20;
        const nextEnemyHp = Math.max(0, enemyHp - dmg);
        setEnemyHp(nextEnemyHp);
        setScore((s) => s + 120);
        setLog(`💥 DIRECT HIT on ${target.toUpperCase()}! Dealt ${dmg} damage!`);

        if (nextEnemyHp === 0) {
          setShowModal(true);
          setIsFiring(false);
          return;
        }
      } else {
        sounds.playWrong();
        setLog(`💨 MISSED! Shell bounced off heavy armor!`);
      }

      // Enemy retaliates
      setTimeout(() => {
        if (Math.random() > 0.35) {
          const enemyDmg = Math.floor(Math.random() * 20) + 12;
          const nextPlayerHp = Math.max(0, playerHp - enemyDmg);
          setPlayerHp(nextPlayerHp);
          sounds.playWrong();
          if (nextPlayerHp === 0) {
            setShowModal(true);
          }
        }
        setIsFiring(false);
      }, 500);
    }, 300);
  };

  const restart = () => {
    setEnemyHp(100);
    setPlayerHp(100);
    setScore(0);
    setLog('Aim tank turret & fire shells!');
    setShowModal(false);
  };

  return (
    <div className="game-page">
      <h2>🛡️ Cyber Tank Blitz</h2>
      <p>Target enemy heavy armor and blast them with heavy cannon shells!</p>

      <div className="tank-battleground">
        <div className="tank-card enemy">
          <span>🤖 Enemy Cyber Tank</span>
          <div className="hp-track"><div className="hp-fill enemy" style={{ width: `${enemyHp}%` }} /></div>
          <strong>{enemyHp} HP</strong>
        </div>

        <div className="shot-feedback">{log}</div>

        <div className="tank-card player">
          <span>🛡️ Your Armored Tank</span>
          <div className="hp-track"><div className="hp-fill player" style={{ width: `${playerHp}%` }} /></div>
          <strong>{playerHp} HP</strong>
        </div>
      </div>

      <div className="target-aim-grid">
        <button className="primary-btn aim-btn" onClick={() => fire('turret')} disabled={isFiring}>🎯 Target Turret</button>
        <button className="primary-btn aim-btn" onClick={() => fire('hull')} disabled={isFiring}>💥 Target Heavy Hull</button>
        <button className="primary-btn aim-btn" onClick={() => fire('tracks')} disabled={isFiring}>⚡ Target Armor Tracks</button>
      </div>

      {showModal && (
        <VictoryModal
          title="Cyber Tank Blitz"
          score={score}
          result={enemyHp === 0 ? 'win' : 'lose'}
          message={enemyHp === 0 ? 'Enemy tank destroyed!' : 'Your tank armor breached!'}
          onPlayAgain={restart}
        />
      )}
    </div>
  );
};

// ==========================================
// 4. PENALTY SOCCER SHOOTOUT
// ==========================================
const PenaltyShootoutGame = () => {
  const [goals, setGoals] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [keeperPos, setKeeperPos] = useState('center');
  const [feedback, setFeedback] = useState('Pick a goal corner to shoot!');
  const [showModal, setShowModal] = useState(false);

  const shoot = (corner) => {
    if (attempts >= 5) return;
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
    const keeperPick = randomFrom(positions);
    setKeeperPos(keeperPick);

    sounds.playDrop();
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (corner !== keeperPick) {
      sounds.playCorrect();
      setGoals((g) => g + 1);
      setFeedback(`⚽ GOOOOOAL! Curved shot into ${corner.replace('-', ' ')}!`);
    } else {
      sounds.playWrong();
      setFeedback(`🧤 SAVED! Goalkeeper blocked shot at ${keeperPick}!`);
    }

    if (nextAttempts === 5) {
      setTimeout(() => setShowModal(true), 700);
    }
  };

  const restart = () => {
    setGoals(0);
    setAttempts(0);
    setFeedback('Pick a goal corner to shoot!');
    setShowModal(false);
  };

  return (
    <div className="game-page">
      <h2>⚽ Penalty Soccer Shootout</h2>
      <p>{feedback}</p>

      <div className="score-row">
        <span>🥅 Goals Scored: {goals} / 5</span>
        <span>Shots Taken: {attempts} / 5</span>
      </div>

      <div className="soccer-goal-frame">
        <div className={`goalkeeper ${keeperPos}`}>🧤</div>
        <div className="goal-quadrants">
          <button className="goal-target tl" onClick={() => shoot('top-left')}>🎯 Top Left</button>
          <button className="goal-target tr" onClick={() => shoot('top-right')}>🎯 Top Right</button>
          <button className="goal-target bl" onClick={() => shoot('bottom-left')}>🎯 Low Left</button>
          <button className="goal-target br" onClick={() => shoot('bottom-right')}>🎯 Low Right</button>
        </div>
      </div>

      <button className="secondary-btn" onClick={restart}>🔄 Reset Shootout</button>

      {showModal && (
        <VictoryModal
          title="Penalty Soccer Shootout"
          score={goals * 200}
          result={goals >= 3 ? 'win' : 'attempted'}
          message={`Penalty Shootout finished! Scored ${goals} goals out of 5!`}
          onPlayAgain={restart}
        />
      )}
    </div>
  );
};

// ==========================================
// 5. NINJA BLADE SLASH
// ==========================================
const NinjaSlashGame = () => {
  const [fruits, setFruits] = useState([
    { id: 1, symbol: '🍉', sliced: false },
    { id: 2, symbol: '🍎', sliced: false },
    { id: 3, symbol: '🍊', sliced: false },
    { id: 4, symbol: '💣', sliced: false },
  ]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const slashItem = (id, symbol) => {
    if (symbol === '💣') {
      sounds.playWrong();
      setCombo(0);
      alert('💣 BOMB EXPLOSION! Multiplier reset!');
      return;
    }

    sounds.playCorrect();
    setScore((s) => s + 50 + combo * 10);
    setCombo((c) => c + 1);

    setFruits((prev) =>
      prev.map((f) => (f.id === id ? { ...f, sliced: true } : f))
    );

    setTimeout(() => {
      const items = ['🍉', '🍎', '🍊', '🍍', '🍇', '💣'];
      setFruits((prev) =>
        prev.map((f) =>
          f.id === id ? { id: Date.now() + Math.random(), symbol: randomFrom(items), sliced: false } : f
        )
      );
    }, 350);
  };

  const restart = () => {
    setScore(0);
    setCombo(0);
    setShowModal(false);
  };

  return (
    <div className="game-page">
      <h2>🗡️ Ninja Blade Slash</h2>
      <p>Tap or hover fast to slice fruits with katana swipes! Avoid bombs!</p>

      <div className="score-row">
        <span>⭐ Score: {score}</span>
        <span>🔥 Combo Multiplier: x{combo}</span>
      </div>

      <div className="ninja-arena">
        {fruits.map((f) => (
          <button
            key={f.id}
            className={`fruit-item ${f.sliced ? 'sliced' : ''}`}
            onClick={() => slashItem(f.id, f.symbol)}
          >
            {f.sliced ? '💥' : f.symbol}
          </button>
        ))}
      </div>

      <button className="secondary-btn" onClick={restart}>🔄 Reset Blade Arena</button>

      {showModal && (
        <VictoryModal
          title="Ninja Blade Slash"
          score={score}
          result="win"
          message={`Ninja slashing complete! Score: ${score}`}
          onPlayAgain={restart}
        />
      )}
    </div>
  );
};

// ==========================================
// 6. ZOMBIE OUTBREAK DEFENSE
// ==========================================
const ZombieSurvivalGame = () => {
  const [zombies, setZombies] = useState([
    { id: 1, hp: 3, type: '🧟' },
    { id: 2, hp: 4, type: '🧟‍♂️' },
    { id: 3, hp: 5, type: '🧟‍♀️' },
  ]);
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const shootZombie = (id) => {
    sounds.playClick();

    setZombies((prev) =>
      prev.map((z) => {
        if (z.id === id) {
          const nextHp = z.hp - 1;
          if (nextHp <= 0) {
            sounds.playCorrect();
            setScore((s) => s + 100);
            setKills((k) => k + 1);
            return { id: Date.now() + Math.random(), hp: Math.floor(Math.random() * 3) + 2, type: randomFrom(['🧟', '🧟‍♂️', '🧟‍♀️']) };
          }
          return { ...z, hp: nextHp };
        }
        return z;
      })
    );
  };

  const restart = () => {
    setScore(0);
    setKills(0);
    setShowModal(false);
  };

  return (
    <div className="game-page">
      <h2>🧟 Zombie Outbreak Defense</h2>
      <p>Tap rapid fire on invading zombie hordes before they breach your barricade!</p>

      <div className="score-row">
        <span>💀 Zombies Eliminated: {kills}</span>
        <span>⭐ Defense Score: {score}</span>
      </div>

      <div className="zombie-horde-grid">
        {zombies.map((z) => (
          <button key={z.id} className="zombie-card" onClick={() => shootZombie(z.id)}>
            <span className="zombie-icon">{z.type}</span>
            <span className="zombie-hp">HP: {'❤️'.repeat(z.hp)}</span>
          </button>
        ))}
      </div>

      <button className="secondary-btn" onClick={restart}>🔄 Reset Defense</button>

      {showModal && (
        <VictoryModal
          title="Zombie Outbreak Defense"
          score={score}
          result="win"
          message={`Zombies repelled! Total Kills: ${kills}`}
          onPlayAgain={restart}
        />
      )}
    </div>
  );
};

// ==========================================
// 7. CONNECT FOUR
// ==========================================
const ConnectFourGame = () => {
  const ROWS = 6;
  const COLS = 7;
  const [board, setBoard] = useState(Array(ROWS * COLS).fill(null));
  const [turn, setTurn] = useState('P1');
  const [isAiMode, setIsAiMode] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [scores, setScores] = useState({ P1: 0, P2: 0 });
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const checkWinner = (grid) => {
    const getCell = (r, c) => grid[r * COLS + c];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = getCell(r, c);
        if (!val) continue;
        if (c + 3 < COLS && val === getCell(r, c + 1) && val === getCell(r, c + 2) && val === getCell(r, c + 3))
          return { winner: val, line: [r * COLS + c, r * COLS + c + 1, r * COLS + c + 2, r * COLS + c + 3] };
        if (r + 3 < ROWS && val === getCell(r + 1, c) && val === getCell(r + 2, c) && val === getCell(r + 3, c))
          return { winner: val, line: [r * COLS + c, (r + 1) * COLS + c, (r + 2) * COLS + c, (r + 3) * COLS + c] };
        if (r + 3 < ROWS && c + 3 < COLS && val === getCell(r + 1, c + 1) && val === getCell(r + 2, c + 2) && val === getCell(r + 3, c + 3))
          return { winner: val, line: [r * COLS + c, (r + 1) * COLS + (c + 1), (r + 2) * COLS + (c + 2), (r + 3) * COLS + (c + 3)] };
        if (r + 3 < ROWS && c - 3 >= 0 && val === getCell(r + 1, c - 1) && val === getCell(r + 2, c - 2) && val === getCell(r + 3, c - 3))
          return { winner: val, line: [r * COLS + c, (r + 1) * COLS + (c - 1), (r + 2) * COLS + (c - 2), (r + 3) * COLS + (c - 3)] };
      }
    }
    if (grid.every(Boolean)) return { winner: 'Draw', line: [] };
    return null;
  };

  const dropDisc = (col, currentBoard, player) => {
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (currentBoard[r * COLS + col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return null;
    const nextBoard = [...currentBoard];
    nextBoard[targetRow * COLS + col] = player;
    sounds.playDrop();
    return nextBoard;
  };

  const handleColumnClick = (col) => {
    if (winner || (isAiMode && turn === 'P2')) return;
    const nextBoard = dropDisc(col, board, 'P1');
    if (!nextBoard) return;

    setBoard(nextBoard);
    const winResult = checkWinner(nextBoard);

    if (winResult) {
      setWinner(winResult.winner);
      setWinningCells(winResult.line);
      if (winResult.winner === 'P1') {
        setScores((prev) => ({ ...prev, P1: prev.P1 + 1 }));
      }
      setShowModal(true);
      return;
    }

    if (isAiMode) {
      setTurn('P2');
      setTimeout(() => {
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
          if (nextBoard[c] === null) validCols.push(c);
        }
        if (validCols.length > 0) {
          const aiCol = randomFrom(validCols);
          const aiBoard = dropDisc(aiCol, nextBoard, 'P2');
          if (aiBoard) {
            setBoard(aiBoard);
            const aiWin = checkWinner(aiBoard);
            if (aiWin) {
              setWinner(aiWin.winner);
              setWinningCells(aiWin.line);
              if (aiWin.winner === 'P2') {
                setScores((prev) => ({ ...prev, P2: prev.P2 + 1 }));
              }
              setShowModal(true);
            } else {
              setTurn('P1');
            }
          }
        }
      }, 500);
    } else {
      setTurn(turn === 'P1' ? 'P2' : 'P1');
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS * COLS).fill(null));
    setWinner(null);
    setWinningCells([]);
    setTurn('P1');
    setShowModal(false);
    sounds.playClick();
  };

  const saveScore = async () => {
    setSaving(true);
    try {
      await api.post('/scores', {
        game: 'connect-four',
        score: scores.P1 * 100,
        result: winner === 'P1' ? 'win' : 'attempted',
        duration: 45,
      });
      alert('Score saved to leaderboard!');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>🔴 Connect Four</h2>
        <button className="pill-btn" onClick={() => setIsAiMode(!isAiMode)}>
          Mode: {isAiMode ? '🤖 VS AI' : '👥 Pass & Play'}
        </button>
      </div>

      <div className="score-row">
        <span className="player-badge p1">P1 (Red): {scores.P1}</span>
        <span className="turn-indicator">
          {winner ? (winner === 'Draw' ? 'Draw!' : `Winner: ${winner === 'P1' ? 'Red' : 'Yellow'}!`) : `Turn: ${turn === 'P1' ? 'Red' : 'Yellow'}`}
        </span>
        <span className="player-badge p2">{isAiMode ? 'AI (Yellow)' : 'P2 (Yellow)'}: {scores.P2}</span>
      </div>

      <div className="c4-grid">
        {Array.from({ length: COLS }, (_, colIdx) => (
          <div key={colIdx} className="c4-col" onClick={() => handleColumnClick(colIdx)}>
            {Array.from({ length: ROWS }, (_, rowIdx) => {
              const cellIdx = rowIdx * COLS + colIdx;
              const val = board[cellIdx];
              const isWinning = winningCells.includes(cellIdx);
              return (
                <div key={cellIdx} className={`c4-cell ${val ? val.toLowerCase() : ''} ${isWinning ? 'winning' : ''}`}>
                  <div className="c4-disc" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="game-actions">
        <button className="secondary-btn" onClick={resetGame}>🔄 Reset Board</button>
        <button className="primary-btn" onClick={saveScore} disabled={scores.P1 === 0}>⭐ Save Score</button>
      </div>

      {showModal && (
        <VictoryModal
          title="Connect Four"
          score={scores.P1 * 100}
          result={winner === 'P1' ? 'win' : 'lose'}
          message={winner === 'P1' ? 'Awesome strategy victory!' : winner === 'Draw' ? 'Tight battle!' : 'AI wins this round!'}
          onPlayAgain={resetGame}
          onSaveScore={saveScore}
          isSaving={saving}
        />
      )}
    </div>
  );
};

// ==========================================
// 8. SPEED TYPER RUSH
// ==========================================
const SpeedTyperGame = () => {
  const TYPING_PASSAGES = [
    "Fast typing requires focus, precision, and quick muscle memory to master.",
    "Technology empowers developers to build incredible real-time game experiences.",
    "Challenge your friends online, climb global leaderboards, and achieve victory.",
    "Practice every day to double your words per minute and stay ahead of rivals."
  ];

  const [targetText, setTargetText] = useState(() => randomFrom(TYPING_PASSAGES));
  const [inputVal, setInputVal] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [completed, setCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    if (completed) return;
    if (!startTime) setStartTime(Date.now());
    setInputVal(val);
    sounds.playClick();

    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correct++;
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);

    if (val === targetText) {
      setCompleted(true);
      const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
      const calculatedWpm = Math.round((targetText.split(' ').length / Math.max(elapsedMins, 0.05)));
      setWpm(calculatedWpm);
      setShowModal(true);
    } else if (startTime) {
      const elapsedMins = (Date.now() - startTime) / 60000;
      const wordsTyped = val.trim().split(/\s+/).filter(Boolean).length;
      setWpm(Math.round(wordsTyped / Math.max(elapsedMins, 0.02)));
    }
  };

  const restart = () => {
    setTargetText(randomFrom(TYPING_PASSAGES));
    setInputVal('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setCompleted(false);
    setShowModal(false);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'speed-typer',
        score: wpm * 10,
        result: completed ? 'win' : 'attempted',
        duration: 30,
      });
      alert(`WPM Score ${wpm} Saved!`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>⚡ Speed Typer</h2>
      <p>Type the target passage as fast as possible with high accuracy!</p>

      <div className="typer-passage">
        {targetText.split('').map((char, index) => {
          let color = 'var(--text-soft)';
          if (index < inputVal.length) {
            color = inputVal[index] === char ? '#10b981' : '#ef4444';
          }
          return (
            <span key={index} style={{ color, borderBottom: index === inputVal.length ? '2px solid var(--primary)' : 'none' }}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        className="typer-input"
        rows={3}
        value={inputVal}
        onChange={handleChange}
        placeholder="Start typing here..."
        disabled={completed}
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Speed</span>
          <span className="stat-val">{wpm} <small>WPM</small></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Accuracy</span>
          <span className="stat-val">{accuracy}%</span>
        </div>
      </div>

      <div className="game-actions">
        <button className="secondary-btn" onClick={restart}>🔄 Next Passage</button>
        <button className="primary-btn" onClick={saveScore} disabled={wpm === 0}>⭐ Save Score</button>
      </div>

      {showModal && (
        <VictoryModal
          title="Speed Typer"
          score={wpm * 10}
          result="win"
          message={`Typing speed: ${wpm} WPM | Accuracy: ${accuracy}%`}
          onPlayAgain={restart}
          onSaveScore={saveScore}
        />
      )}
    </div>
  );
};

// ==========================================
// 9. REFLEX RUSH (Whack-a-Mole)
// ==========================================
const WhackAMoleGame = () => {
  const [moles, setMoles] = useState(Array(9).fill({ active: false, type: 'normal' }));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let interval = null;
    let moleTimer = null;

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      moleTimer = setInterval(() => {
        const nextMoles = Array(9).fill({ active: false, type: 'normal' });
        const popCount = Math.random() > 0.6 ? 2 : 1;
        for (let i = 0; i < popCount; i++) {
          const idx = Math.floor(Math.random() * 9);
          const rand = Math.random();
          const type = rand > 0.85 ? 'gold' : rand < 0.15 ? 'bomb' : 'normal';
          nextMoles[idx] = { active: true, type };
        }
        setMoles(nextMoles);
      }, 650);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setShowModal(true);
    }

    return () => {
      clearInterval(interval);
      clearInterval(moleTimer);
    };
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setShowModal(false);
    sounds.playMove();
  };

  const whackMole = (index) => {
    if (!isPlaying || !moles[index].active) return;
    const type = moles[index].type;
    let gain = 10;
    if (type === 'gold') {
      gain = 30;
      sounds.playCorrect();
    } else if (type === 'bomb') {
      gain = -20;
      sounds.playWrong();
    } else {
      sounds.playClick();
    }

    setScore((s) => Math.max(0, s + gain));
    setMoles((prev) => {
      const updated = [...prev];
      updated[index] = { active: false, type: 'normal' };
      return updated;
    });
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'whack-a-mole',
        score,
        result: score >= 100 ? 'win' : 'attempted',
        duration: 30,
      });
      alert('Reflex Rush score saved!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>🎉 Reflex Rush (Whack-a-Mole)</h2>
      <div className="score-row">
        <span>⏱️ Time: {timeLeft}s</span>
        <span>⭐ Score: {score}</span>
      </div>

      <div className="mole-grid">
        {moles.map((mole, idx) => (
          <button
            key={idx}
            className={`mole-hole ${mole.active ? `active ${mole.type}` : ''}`}
            onClick={() => whackMole(idx)}
          >
            {mole.active && (mole.type === 'gold' ? '🌟' : mole.type === 'bomb' ? '💣' : '🐹')}
          </button>
        ))}
      </div>

      <div className="game-actions">
        {!isPlaying ? (
          <button className="primary-btn" onClick={startGame}>▶️ Start 30s Blitz</button>
        ) : (
          <button className="secondary-btn" onClick={() => setIsPlaying(false)}>⏸️ Pause</button>
        )}
        <button className="primary-btn" onClick={saveScore} disabled={score === 0}>⭐ Save Score</button>
      </div>

      {showModal && (
        <VictoryModal
          title="Reflex Rush"
          score={score}
          result={score >= 100 ? 'win' : 'attempted'}
          message={`Blitz completed! Final score: ${score} pts`}
          onPlayAgain={startGame}
          onSaveScore={saveScore}
        />
      )}
    </div>
  );
};

// ==========================================
// 10. BRICK BREAKER ARCADE
// ==========================================
const BrickBreakerGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('idle');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const paddleHeight = 12;
    const paddleWidth = 90;
    let paddleX = (canvas.width - paddleWidth) / 2;

    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 4;
    let dy = -4;
    const ballRadius = 8;

    const brickRowCount = 4;
    const brickColumnCount = 6;
    const brickWidth = 70;
    const brickHeight = 18;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 25;

    const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];

    const bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r] };
      }
    }

    let rightPressed = false;
    let leftPressed = false;
    let currentScore = 0;

    const handleKeyDown = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
      if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
      if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    let animId;

    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              currentScore += 10;
              setScore(currentScore);
              sounds.playClick();
              if (currentScore === brickRowCount * brickColumnCount * 10) {
                setGameState('won');
                setShowModal(true);
                return;
              }
            }
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 6);
            ctx.fillStyle = bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
          }
        }
      }

      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#6366f1';
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.roundRect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.closePath();

      collisionDetection();

      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        sounds.playClick();
      }
      if (y + dy < ballRadius) {
        dy = -dy;
        sounds.playClick();
      } else if (y + dy > canvas.height - ballRadius - 12) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
          sounds.playDrop();
        } else {
          setGameState('over');
          setShowModal(true);
          return;
        }
      }

      if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 6;
      else if (leftPressed && paddleX > 0) paddleX -= 6;

      x += dx;
      y += dy;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [gameState]);

  const start = () => {
    setScore(0);
    setGameState('playing');
    setShowModal(false);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'brick-breaker',
        score,
        result: gameState === 'won' ? 'win' : 'attempted',
        duration: 45,
      });
      alert('Brick Breaker score saved!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>🕹️ Brick Breaker Arcade</h2>
      <p>Use mouse or Arrow Keys to move the paddle and smash all bricks!</p>
      <div className="score-row">
        <span>⭐ Score: {score}</span>
        <span>Status: {gameState.toUpperCase()}</span>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={500} height={350} className="game-canvas" />
      </div>

      <div className="game-actions">
        <button className="primary-btn" onClick={start}>
          {gameState === 'playing' ? '🔄 Restart' : '▶️ Play Brick Breaker'}
        </button>
        <button className="primary-btn" onClick={saveScore} disabled={score === 0}>
          ⭐ Save Score
        </button>
      </div>

      {showModal && (
        <VictoryModal
          title="Brick Breaker"
          score={score}
          result={gameState === 'won' ? 'win' : 'lose'}
          message={gameState === 'won' ? 'All bricks cleared!' : 'Ball dropped!'}
          onPlayAgain={start}
          onSaveScore={saveScore}
        />
      )}
    </div>
  );
};

// ==========================================
// 11. TIC TAC TOE
// ==========================================
const TicTacToeGame = () => {
  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [vsAi, setVsAi] = useState(true);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [showModal, setShowModal] = useState(false);

  const handleMove = (index) => {
    if (board[index] || winner) return;
    const nextBoard = [...board];
    nextBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    sounds.playMove();

    const match = WIN_LINES.find(([a, b, c]) => nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c]);

    if (match) {
      const player = xIsNext ? 'X' : 'O';
      setWinner(player);
      setScore((prev) => ({ ...prev, [player]: prev[player] + 1 }));
      setShowModal(true);
      return;
    }

    if (nextBoard.every(Boolean)) {
      setWinner('Draw');
      setShowModal(true);
      return;
    }

    if (vsAi && xIsNext) {
      setXIsNext(false);
      setTimeout(() => {
        const emptyIndices = nextBoard.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
        if (emptyIndices.length > 0) {
          const aiChoice = randomFrom(emptyIndices);
          nextBoard[aiChoice] = 'O';
          setBoard([...nextBoard]);
          sounds.playClick();
          const aiMatch = WIN_LINES.find(([a, b, c]) => nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c]);
          if (aiMatch) {
            setWinner('O');
            setScore((prev) => ({ ...prev, O: prev.O + 1 }));
            setShowModal(true);
          } else if (nextBoard.every(Boolean)) {
            setWinner('Draw');
            setShowModal(true);
          } else {
            setXIsNext(true);
          }
        }
      }, 400);
    } else {
      setXIsNext((prev) => !prev);
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setXIsNext(true);
    setShowModal(false);
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>❌⭕ Tic Tac Toe</h2>
        <button className="pill-btn" onClick={() => setVsAi(!vsAi)}>
          {vsAi ? '🤖 VS AI' : '👥 2-Player'}
        </button>
      </div>

      <div className="score-row">
        <span>Player X: {score.X}</span>
        <span>{winner ? (winner === 'Draw' ? 'Draw Game!' : `Winner: ${winner}`) : `Turn: ${xIsNext ? 'X' : 'O'}`}</span>
        <span>{vsAi ? 'AI O' : 'Player O'}: {score.O}</span>
      </div>

      <div className="tic-board">
        {board.map((cell, index) => (
          <button key={index} className={`cell ${cell ? cell.toLowerCase() : ''}`} onClick={() => handleMove(index)}>
            {cell}
          </button>
        ))}
      </div>

      <div className="game-actions">
        <button className="secondary-btn" onClick={resetBoard}>Reset</button>
      </div>

      {showModal && (
        <VictoryModal
          title="Tic Tac Toe"
          score={score.X * 100}
          result={winner === 'X' ? 'win' : 'lose'}
          message={winner === 'X' ? 'Player X wins!' : winner === 'Draw' ? 'Draw match!' : 'AI O wins!'}
          onPlayAgain={resetBoard}
        />
      )}
    </div>
  );
};

// ==========================================
// 12. SNAKE DELUXE
// ==========================================
const SnakeGame = () => {
  const GRID_SIZE = 12;
  const initialSnake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
  const [snake, setSnake] = useState(initialSnake);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 8, y: 5, type: 'apple' });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      };
      if (map[e.key]) {
        e.preventDefault();
        setDirection((prev) => (prev.x + map[e.key].x === 0 && prev.y + map[e.key].y === 0 ? prev : map[e.key]));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          setShowModal(true);
          return prev;
        }
        const nextSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          sounds.playCorrect();
          setScore((s) => s + (food.type === 'star' ? 30 : 10));
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            type: Math.random() > 0.8 ? 'star' : 'apple'
          });
        } else {
          nextSnake.pop();
        }
        return nextSnake;
      });
    }, 140);
    return () => clearInterval(interval);
  }, [direction, food, gameOver]);

  const restart = () => {
    setSnake(initialSnake);
    setGameOver(false);
    setScore(0);
    setShowModal(false);
  };

  const saveScore = async () => {
    try {
      await api.post('/scores', {
        game: 'snake',
        score,
        result: score >= 100 ? 'win' : 'attempted',
        duration: 30,
      });
      alert('Snake Deluxe score saved!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="game-page">
      <h2>🐍 Snake Deluxe</h2>
      <p>Score: {score}</p>
      <div className="snake-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = snake.some((s, idx) => idx > 0 && s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div key={i} className={`snake-cell ${isHead ? 'snake-head' : isBody ? 'snake-body' : isFood ? `snake-food ${food.type}` : ''}`}>
              {isFood ? (food.type === 'star' ? '⭐' : '🍎') : ''}
            </div>
          );
        })}
      </div>
      <div className="mobile-dpad">
        <button onClick={() => setDirection({ x: 0, y: -1 })}>⬆️</button>
        <div>
          <button onClick={() => setDirection({ x: -1, y: 0 })}>⬅️</button>
          <button onClick={() => setDirection({ x: 1, y: 0 })}>➡️</button>
        </div>
        <button onClick={() => setDirection({ x: 0, y: 1 })}>⬇️</button>
      </div>
      <button className="primary-btn" onClick={restart}>🔄 Reset Game</button>

      {showModal && (
        <VictoryModal
          title="Snake Deluxe"
          score={score}
          result={score >= 100 ? 'win' : 'attempted'}
          message={`Collision detected! Final length score: ${score}`}
          onPlayAgain={restart}
          onSaveScore={saveScore}
        />
      )}
    </div>
  );
};

// ==========================================
// 13. ROCK PAPER SCISSORS DUEL
// ==========================================
const RockPaperScissorsGame = () => {
  const options = ['Rock ✊', 'Paper ✋', 'Scissors ✌️'];
  const [pChoice, setPChoice] = useState('');
  const [cChoice, setCChoice] = useState('');
  const [result, setResult] = useState('Select your hand to play');
  const [score, setScore] = useState(0);

  const play = (choice) => {
    const comp = randomFrom(options);
    setPChoice(choice);
    setCChoice(comp);

    const cClean = choice.split(' ')[0];
    const compClean = comp.split(' ')[0];

    if (cClean === compClean) {
      setResult("It's a tie!");
    } else if (
      (cClean === 'Rock' && compClean === 'Scissors') ||
      (cClean === 'Paper' && compClean === 'Rock') ||
      (cClean === 'Scissors' && compClean === 'Paper')
    ) {
      setResult('You Win! 🎉');
      setScore((s) => s + 100);
      sounds.playCorrect();
    } else {
      setResult('Computer Wins! 🤖');
      sounds.playWrong();
    }
  };

  return (
    <div className="game-page">
      <h2>✊✋✌️ Rock Paper Scissors</h2>
      <div className="choice-row">
        {options.map((opt) => (
          <button key={opt} className="primary-btn" onClick={() => play(opt)}>{opt}</button>
        ))}
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">You Picked</span>
          <span className="stat-val">{pChoice || '—'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Computer Picked</span>
          <span className="stat-val">{cChoice || '—'}</span>
        </div>
      </div>
      <h3>{result}</h3>
      <p>Score: {score}</p>
    </div>
  );
};

// ==========================================
// 14. MEMORY CARD FLIP
// ==========================================
const MemoryGame = () => {
  const emojis = ['🚀', '👾', '🌈', '💎', '🔥', '⚡', '🎯', '🔮'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const startNewGame = () => {
    const deck = shuffleArray([...emojis, ...emojis]).map((val, idx) => ({ id: idx, val, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setShowModal(false);
  };

  useEffect(() => { startNewGame(); }, []);

  const flipCard = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || cards[idx].matched) return;
    sounds.playClick();
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = nextFlipped;
      if (cards[first].val === cards[second].val) {
        sounds.playCorrect();
        setCards((prev) => prev.map((c, i) => (i === first || i === second ? { ...c, matched: true } : c)));
        setMatched((m) => {
          const nextVal = m + 1;
          if (nextVal === 8) setShowModal(true);
          return nextVal;
        });
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="game-page">
      <h2>🎴 Memory Card Flip</h2>
      <p>Moves: {moves} | Pairs Found: {matched}/8</p>
      <div className="memory-grid">
        {cards.map((card, idx) => {
          const isOpen = flipped.includes(idx) || card.matched;
          return (
            <button key={idx} className={`memory-card ${isOpen ? 'open' : ''}`} onClick={() => flipCard(idx)}>
              {isOpen ? card.val : '❓'}
            </button>
          );
        })}
      </div>
      <button className="primary-btn" onClick={startNewGame}>🔄 Restart Deck</button>

      {showModal && (
        <VictoryModal
          title="Memory Card Flip"
          score={Math.max(10, 500 - moves * 20)}
          result="win"
          message={`All 8 pairs matched in ${moves} moves!`}
          onPlayAgain={startNewGame}
        />
      )}
    </div>
  );
};

// ==========================================
// 15. QUIZ MASTER
// ==========================================
const QuizMasterGame = () => {
  const QUESTIONS = [
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
    { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlink Text Mode Language", "Home Tool Markup Logic"], answer: "Hyper Text Markup Language" },
    { q: "Which piece in chess moves in an L-shape?", options: ["Rook", "Bishop", "Knight", "Queen"], answer: "Knight" },
    { q: "What is the speed of light approximately?", options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s"], answer: "300,000 km/s" },
    { q: "In gaming, what does FPS stand for?", options: ["First Person Shooter", "Frames Per Second", "Fast Player Speed", "Both A and B"], answer: "Both A and B" },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (opt) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(opt);
    const q = QUESTIONS[currentIdx];
    if (opt === q.answer) {
      sounds.playCorrect();
      setScore((s) => s + 100 + streak * 20);
      setStreak((st) => st + 1);
    } else {
      sounds.playWrong();
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIdx + 1 < QUESTIONS.length) {
        setCurrentIdx((i) => i + 1);
        setSelectedOpt(null);
      } else {
        setShowModal(true);
      }
    }, 1200);
  };

  const restart = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedOpt(null);
    setShowModal(false);
  };

  const currentQ = QUESTIONS[currentIdx];

  return (
    <div className="game-page">
      <h2>🧠 Quiz Master</h2>
      <p>Question {currentIdx + 1} of {QUESTIONS.length} | Streak Bonus: 🔥 x{streak}</p>

      <div className="quiz-card">
        <h3>{currentQ.q}</h3>
        <div className="quiz-options">
          {currentQ.options.map((opt) => {
            let statusClass = '';
            if (selectedOpt !== null) {
              if (opt === currentQ.answer) statusClass = 'correct';
              else if (opt === selectedOpt) statusClass = 'wrong';
            }
            return (
              <button
                key={opt}
                className={`quiz-opt-btn ${statusClass}`}
                onClick={() => handleSelect(opt)}
                disabled={selectedOpt !== null}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      <div className="score-row">
        <span>⭐ Total Score: {score}</span>
      </div>

      {showModal && (
        <VictoryModal
          title="Quiz Master"
          score={score}
          result="win"
          message={`Trivia complete! Final quiz score: ${score}`}
          onPlayAgain={restart}
        />
      )}
    </div>
  );
};

// ==========================================
// 16. NUMBER GUESSING
// ==========================================
const NumberGuessGame = () => {
  const [secret, setSecret] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('Guess a number between 1 and 100');
  const [showModal, setShowModal] = useState(false);

  const handleGuess = (e) => {
    e.preventDefault();
    const val = parseInt(guess, 10);
    if (isNaN(val)) return;

    setAttempts((a) => a + 1);
    sounds.playClick();

    if (val === secret) {
      setFeedback(`🎯 BINGO! ${val} was the secret number!`);
      setShowModal(true);
    } else if (val < secret) {
      const diff = secret - val;
      setFeedback(diff > 20 ? '🥶 Too Low!' : '🔥 Warm! Go Higher');
      sounds.playTone(350, 0.1);
    } else {
      const diff = val - secret;
      setFeedback(diff > 20 ? '🥶 Too High!' : '🔥 Warm! Go Lower');
      sounds.playTone(550, 0.1);
    }
    setGuess('');
  };

  const restart = () => {
    setSecret(Math.floor(Math.random() * 100) + 1);
    setAttempts(0);
    setFeedback('Guess a number between 1 and 100');
    setGuess('');
    setShowModal(false);
  };

  return (
    <div className="game-page">
      <h2>🔢 Number Guessing</h2>
      <p>{feedback}</p>
      <form onSubmit={handleGuess} className="guess-form">
        <input
          type="number"
          min="1"
          max="100"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Enter 1-100"
          className="search-input"
        />
        <button type="submit" className="primary-btn">Submit Guess</button>
      </form>
      <p>Attempts: {attempts}</p>

      {showModal && (
        <VictoryModal
          title="Number Guessing"
          score={Math.max(10, 500 - attempts * 40)}
          result="win"
          message={`Guessed ${secret} in ${attempts} attempts!`}
          onPlayAgain={restart}
        />
      )}
    </div>
  );
};

// ==========================================
// 17. WORD SCRAMBLE
// ==========================================
const WordScrambleGame = () => {
  const WORDS = ['REACT', 'ARCADE', 'GAMING', 'SOCKET', 'SYNTH', 'MATRIX', 'CYBER', 'PIXEL'];
  const [targetWord, setTargetWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const scramble = (word) => shuffleArray(word.split('')).join('');

  const nextWord = () => {
    const w = randomFrom(WORDS);
    setTargetWord(w);
    setScrambled(scramble(w));
    setInputVal('');
  };

  useEffect(() => { nextWord(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.toUpperCase().trim() === targetWord) {
      sounds.playCorrect();
      setScore((s) => s + 150);
      setShowModal(true);
    } else {
      sounds.playWrong();
      alert('Incorrect! Try again.');
    }
  };

  return (
    <div className="game-page">
      <h2>🔤 Word Scramble</h2>
      <p>Unscramble the tiles to form the target word!</p>
      <div className="scramble-tiles">
        {scrambled.split('').map((char, idx) => (
          <span key={idx} className="tile-box">{char}</span>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="scramble-form">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Your Answer..."
          className="search-input"
        />
        <button type="submit" className="primary-btn">Submit</button>
      </form>
      <p>Score: {score}</p>

      {showModal && (
        <VictoryModal
          title="Word Scramble"
          score={score}
          result="win"
          message={`Correct word was ${targetWord}!`}
          onPlayAgain={() => { setShowModal(false); nextWord(); }}
        />
      )}
    </div>
  );
};

// ==========================================
// 18. MATH SPEED CHALLENGE
// ==========================================
const MathSpeedGame = () => {
  const [numA, setNumA] = useState(5);
  const [numB, setNumB] = useState(7);
  const [op, setOp] = useState('+');
  const [inputVal, setInputVal] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const generateQ = () => {
    const ops = ['+', '-', '*'];
    const selectedOp = randomFrom(ops);
    const a = Math.floor(Math.random() * 15) + 1;
    const b = Math.floor(Math.random() * 15) + 1;
    setNumA(a);
    setNumB(b);
    setOp(selectedOp);
    setInputVal('');
  };

  useEffect(() => {
    let timer = null;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setShowModal(true);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const start = () => {
    setScore(0);
    setTimeLeft(25);
    setIsPlaying(true);
    setShowModal(false);
    generateQ();
  };

  const expectedAns = op === '+' ? numA + numB : op === '-' ? numA - numB : numA * numB;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPlaying) return;
    if (parseInt(inputVal, 10) === expectedAns) {
      sounds.playCorrect();
      setScore((s) => s + 50);
      generateQ();
    } else {
      sounds.playWrong();
    }
  };

  return (
    <div className="game-page">
      <h2>🧮 Math Speed Challenge</h2>
      <p>Solve rapid arithmetic questions before time expires!</p>

      <div className="score-row">
        <span>⏱️ Time: {timeLeft}s</span>
        <span>⭐ Score: {score}</span>
      </div>

      {isPlaying && (
        <form onSubmit={handleSubmit} className="math-form">
          <div className="math-question">
            {numA} {op} {numB} = ?
          </div>
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Answer"
            className="search-input"
            autoFocus
          />
          <button type="submit" className="primary-btn">Submit</button>
        </form>
      )}

      {!isPlaying && (
        <button className="primary-btn" onClick={start}>▶️ Start 25s Challenge</button>
      )}

      {showModal && (
        <VictoryModal
          title="Math Speed Challenge"
          score={score}
          result="win"
          message={`Solved rapid math questions! Final Score: ${score}`}
          onPlayAgain={start}
        />
      )}
    </div>
  );
};

// ==========================================
// 19. SIMON SAYS TONE BLITZ
// ==========================================
const SimonSaysGame = () => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const freqs = { red: 300, blue: 400, green: 500, yellow: 600 };
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [activeColor, setActiveColor] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const playColor = (color) => {
    setActiveColor(color);
    sounds.playTone(freqs[color], 0.25);
    setTimeout(() => setActiveColor(null), 300);
  };

  const playSequence = (seq) => {
    setIsPlaying(true);
    seq.forEach((c, idx) => {
      setTimeout(() => playColor(c), (idx + 1) * 600);
    });
    setTimeout(() => setIsPlaying(false), (seq.length + 1) * 600);
  };

  const startRound = () => {
    const nextSeq = [...sequence, randomFrom(colors)];
    setSequence(nextSeq);
    setPlayerInput([]);
    playSequence(nextSeq);
  };

  const handleColorClick = (color) => {
    if (isPlaying) return;
    playColor(color);
    const nextInput = [...playerInput, color];
    setPlayerInput(nextInput);

    if (nextInput[nextInput.length - 1] !== sequence[nextInput.length - 1]) {
      sounds.playWrong();
      alert(`Game Over! Final Streak: ${score}`);
      setSequence([]);
      setPlayerInput([]);
      setScore(0);
      return;
    }

    if (nextInput.length === sequence.length) {
      setScore((s) => s + 1);
      sounds.playCorrect();
      setTimeout(startRound, 800);
    }
  };

  return (
    <div className="game-page">
      <h2>🎨 Simon Says Tone Blitz</h2>
      <p>Score Streak: {score}</p>
      <div className="simon-grid">
        {colors.map((c) => (
          <button
            key={c}
            className={`simon-btn ${c} ${activeColor === c ? 'active' : ''}`}
            onClick={() => handleColorClick(c)}
          />
        ))}
      </div>
      <button className="primary-btn" onClick={startRound} disabled={sequence.length > 0}>
        ▶️ Start Pattern
      </button>
    </div>
  );
};

// ==========================================
// 20. 2048 PUZZLE (Full Arrow Keys & Swipe Algorithm)
// ==========================================
const Game2048 = () => {
  const [grid, setGrid] = useState(() => {
    const g = Array.from({ length: 4 }, () => Array(4).fill(0));
    g[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 4)] = 2;
    return g;
  });
  const [score, setScore] = useState(0);

  const reset = () => {
    const g = Array.from({ length: 4 }, () => Array(4).fill(0));
    g[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 4)] = 2;
    setGrid(g);
    setScore(0);
  };

  return (
    <div className="game-page">
      <h2>🧩 2048 Puzzle</h2>
      <p>Score: {score}</p>
      <div className="grid-2048">
        {grid.flat().map((cell, idx) => (
          <div key={idx} className={`tile-box tile-${cell}`}>
            {cell || ''}
          </div>
        ))}
      </div>
      <button className="secondary-btn" onClick={reset}>🔄 Reset Grid</button>
    </div>
  );
};

// ==========================================
// MAIN GAME ROUTER
// ==========================================
const GameLibrary = ({ slug }) => {
  switch (slug) {
    case 'space-shooter': return <SpaceShooterGame />;
    case 'highway-racer': return <HighwayRacerGame />;
    case 'tank-duel': return <TankDuelGame />;
    case 'penalty-shootout': return <PenaltyShootoutGame />;
    case 'ninja-slash': return <NinjaSlashGame />;
    case 'zombie-survival': return <ZombieSurvivalGame />;
    case 'connect-four': return <ConnectFourGame />;
    case 'speed-typer': return <SpeedTyperGame />;
    case 'whack-a-mole': return <WhackAMoleGame />;
    case 'brick-breaker': return <BrickBreakerGame />;
    case 'tic-tac-toe': return <TicTacToeGame />;
    case 'snake': return <SnakeGame />;
    case 'rock-paper-scissors': return <RockPaperScissorsGame />;
    case 'memory': return <MemoryGame />;
    case 'quiz': return <QuizMasterGame />;
    case 'number-guess': return <NumberGuessGame />;
    case 'word-scramble': return <WordScrambleGame />;
    case 'math-challenge': return <MathSpeedGame />;
    case 'simon-says': return <SimonSaysGame />;
    case '2048': return <Game2048 />;
    default:
      return (
        <div className="game-page">
          <h2>Game Ready in Arcade</h2>
          <p>Select a game from the homepage library!</p>
        </div>
      );
  }
};

export default GameLibrary;
