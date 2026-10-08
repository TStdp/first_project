// Lucid MVP Data Model
const state = {
  alarms: [
    { id: 1, time: '7:30 AM', label: 'Gym Session', days: ['Mon','Tue','Wed','Thu','Fri'], difficulty: 'Junior', theme: 'Sunrise', enabled: true },
    { id: 2, time: '8:15 AM', label: 'Standup Meeting', days: ['Mon','Tue','Wed','Thu','Fri'], difficulty: 'Sophomore', theme: 'Midnight', enabled: true }
  ],
  streaks: 7,
  clarityScore: 82,
  accountabilityCircle: ['Zoe', 'Liam', 'Ava'],
  hardMode: false,
  unlockableThemes: [
    { id: 'sunrise', name: 'Sunrise', gradient: 'linear-gradient(135deg, #FF9A5C, #F7B267)' },
    { id: 'midnight', name: 'Midnight', gradient: 'linear-gradient(135deg, #12132B, #2D2A6E)' },
    { id: 'solar', name: 'Solar Flare', gradient: 'linear-gradient(135deg, #FF7847, #FFD166)' },
    { id: 'electric', name: 'Electric Purple', gradient: 'linear-gradient(135deg, #7C3AED, #9F67FF)' }
  ],
  selectedDifficulty: 'Junior',
  selectedDays: ['Mon','Tue','Wed','Thu','Fri'],
  selectedTheme: 'sunrise'
};

let audioCtx = null;
let masterGain = null;
let waveAnimationId = null;

const challengeState = {
  grid: [],
  firstIndex: null,
  secondIndex: null,
  matchedIndices: new Set(),
  lockBoard: false,
  attempts: 0,
  startTime: 0,
  intervalId: null,
  elapsed: 0,
  volume: 1,
  initialized: false,
  completed: false
};

const SYMBOLS = ['▲','■','●','◆','★','♦','⬢','♥'];

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderAlarmSetup();
  bindAlarmDashboardEvents();
  bindHardMode();
  bindChallengeEvents();
  renderVictory();
  renderClarityTrends();
});

function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;
      if (!target) return;

      if (target === 'wake-up-challenge' && (!challengeState.initialized || challengeState.completed)) {
        triggerAlarm();
        return;
      }

      showSection(target);
    });
  });

  showSection('alarm-setup');
}

function showSection(sectionId) {
  document.querySelectorAll('.app-section').forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('enter-section');
  });
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
    void target.offsetWidth;
    target.classList.add('enter-section');
  }
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.section === sectionId));
}

function renderAlarmSetup() {
  renderNextAlarm();
  renderAlarmList();
  renderThemes();
  highlightSelectedDifficulty();
  highlightSelectedDays();
}

function renderNextAlarm() {
  const nextAlarm = state.alarms.find(a => a.enabled) || state.alarms[0];
  const timeEl = document.getElementById('next-alarm-time');
  const nameEl = document.getElementById('next-alarm-name');
  if (nextAlarm && timeEl && nameEl) {
    timeEl.textContent = nextAlarm.time;
    nameEl.textContent = nextAlarm.label;
  }
}

function renderAlarmList() {
  const list = document.getElementById('alarm-list');
  const empty = document.getElementById('alarms-empty');
  if (!list) return;
  if (!state.alarms.length) {
    list.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');
  list.innerHTML = state.alarms.map(alarm => `
    <li class='alarm-item glass-card' data-id='${alarm.id}'>
      <span class='alarm-time'>${alarm.time}</span>
      <span class='alarm-label'>${alarm.label}</span>
      <span class='alarm-difficulty'>${alarm.difficulty}</span>
      <span class='alarm-days'>${alarm.days.map(d => d[0]).join('')}</span>
      <span class='toggle ${alarm.enabled ? 'on' : ''}'></span>
    </li>
  `).join('');
}

function renderThemes() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  grid.innerHTML = state.unlockableThemes.map(theme => `
    <button class='theme-card ${state.selectedTheme === theme.id ? 'active' : ''}' data-theme='${theme.id}' style='background: ${theme.gradient}'>
      <span class='theme-dot'></span>
      <span>${theme.name}</span>
    </button>
  `).join('');
}

function highlightSelectedDifficulty() {
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.difficulty === state.selectedDifficulty);
  });
}

function highlightSelectedDays() {
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.classList.toggle('active', state.selectedDays.includes(btn.dataset.day));
  });
}

function bindAlarmDashboardEvents() {
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedDifficulty = btn.dataset.difficulty;
      highlightSelectedDifficulty();
    });
  });

  document.getElementById('theme-grid')?.addEventListener('click', event => {
    const card = event.target.closest('.theme-card');
    if (!card) return;
    state.selectedTheme = card.dataset.theme;
    renderThemes();
  });

  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const day = btn.dataset.day;
      if (state.selectedDays.includes(day)) {
        state.selectedDays = state.selectedDays.filter(d => d !== day);
      } else {
        state.selectedDays.push(day);
      }
      highlightSelectedDays();
    });
  });

  document.getElementById('add-alarm-btn')?.addEventListener('click', () => {
    console.log('Add alarm flow — coming soon');
  });

  document.getElementById('alarm-list')?.addEventListener('click', event => {
    const item = event.target.closest('.alarm-item');
    if (!item) return;
    const id = Number(item.dataset.id);
    const alarm = state.alarms.find(a => a.id === id);
    if (alarm) {
      alarm.enabled = !alarm.enabled;
      renderAlarmSetup();
    }
  });
}

function bindHardMode() {
  const toggle = document.getElementById('hard-mode-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    state.hardMode = !state.hardMode;
    toggle.classList.toggle('on', state.hardMode);
    toggle.setAttribute('aria-pressed', state.hardMode);
    updateSnoozeVisibility();
  });
  toggle.classList.toggle('on', state.hardMode);
  toggle.setAttribute('aria-pressed', state.hardMode);
  updateSnoozeVisibility();
}

function updateSnoozeVisibility() {
  const snooze = document.getElementById('emergency-snooze');
  if (snooze) {
    if (state.hardMode) snooze.classList.add('hidden');
    else snooze.classList.remove('hidden');
  }
}

// ===== Wake-Up Challenge =====

function triggerAlarm() {
  initAudio();
  startNewChallenge();
}

function initAudio() {
  if (audioCtx) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (AudioCtx) {
    audioCtx = new AudioCtx();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
  }
}

function setAlarmVolume(volume) {
  challengeState.volume = Math.max(0.2, Math.min(1, volume));
  if (masterGain) masterGain.gain.value = challengeState.volume;
  console.log(`Alarm volume: ${Math.round(challengeState.volume * 100)}%`);
}

function startNewChallenge() {
  clearInterval(challengeState.intervalId);
  cancelAnimationFrame(waveAnimationId);
  challengeState.grid = [];
  challengeState.firstIndex = null;
  challengeState.secondIndex = null;
  challengeState.matchedIndices.clear();
  challengeState.lockBoard = false;
  challengeState.attempts = 0;
  challengeState.elapsed = 0;
  challengeState.volume = 1;
  challengeState.initialized = true;
  challengeState.completed = false;

  const deck = [...SYMBOLS, ...SYMBOLS].map((symbol, index) => ({
    symbol,
    id: index
  }));

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  challengeState.grid = deck;

  renderGrid();
  resetProgress();
  updateTimer();
  updateAccuracy();
  setAlarmVolume(1);
  updateSnoozeVisibility();

  showSection('wake-up-challenge');
  challengeState.startTime = Date.now();
  challengeState.intervalId = setInterval(updateTimer, 1000);
  startWaveVisualizer();
}

function renderGrid() {
  const grid = document.getElementById('memory-grid');
  if (!grid) return;
  grid.innerHTML = challengeState.grid.map((tile, index) => `
    <button class='memory-tile' data-index='${index}' aria-label='Memory tile ${index + 1}'>
      <div class='tile-inner'>
        <div class='tile-face tile-front'></div>
        <div class='tile-face tile-back'>${tile.symbol}</div>
      </div>
    </button>
  `).join('');
}

function resetProgress() {
  const progress = document.getElementById('challenge-progress');
  const progressLabel = document.getElementById('challenge-progress-label');
  const silence = document.getElementById('silence-progress');
  const silenceLabel = document.getElementById('silence-progress-label');
  const pairs = document.getElementById('challenge-pairs');

  if (progress) progress.style.width = '0%';
  if (progressLabel) progressLabel.textContent = '0%';
  if (silence) silence.style.width = '0%';
  if (silenceLabel) silenceLabel.textContent = '0%';
  if (pairs) pairs.textContent = '0/8';
}

function updateTimer() {
  if (challengeState.startTime) {
    challengeState.elapsed = Math.floor((Date.now() - challengeState.startTime) / 1000);
  }
  const timerEl = document.getElementById('challenge-timer');
  if (timerEl) timerEl.textContent = formatTime(challengeState.elapsed);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function calculateAccuracy() {
  if (challengeState.attempts === 0) return 100;
  const matchedPairs = challengeState.matchedIndices.size / 2;
  return Math.round((matchedPairs / challengeState.attempts) * 100);
}

function updateAccuracy() {
  const el = document.getElementById('challenge-accuracy');
  if (el) el.textContent = `${calculateAccuracy()}%`;
}

function updateProgress() {
  const matchedPairs = challengeState.matchedIndices.size / 2;
  const percent = Math.round((matchedPairs / 8) * 100);

  const progress = document.getElementById('challenge-progress');
  const progressLabel = document.getElementById('challenge-progress-label');
  const silence = document.getElementById('silence-progress');
  const silenceLabel = document.getElementById('silence-progress-label');
  const pairs = document.getElementById('challenge-pairs');

  if (progress) progress.style.width = `${percent}%`;
  if (progressLabel) progressLabel.textContent = `${percent}%`;
  if (silence) silence.style.width = `${percent}%`;
  if (silenceLabel) silenceLabel.textContent = `${percent}%`;
  if (pairs) pairs.textContent = `${matchedPairs}/8`;

  updateAccuracy();
}

function handleTileClick(index) {
  if (challengeState.completed || challengeState.lockBoard) return;
  if (challengeState.matchedIndices.has(index)) return;

  const tile = document.querySelector(`.memory-tile[data-index='${index}']`);
  if (!tile || tile.classList.contains('open')) return;

  tile.classList.add('open');

  if (challengeState.firstIndex === null) {
    challengeState.firstIndex = index;
    return;
  }

  challengeState.secondIndex = index;
  challengeState.lockBoard = true;
  challengeState.attempts++;
  updateAccuracy();
  checkMatch();
}

function checkMatch() {
  const firstIndex = challengeState.firstIndex;
  const secondIndex = challengeState.secondIndex;
  const firstSymbol = challengeState.grid[firstIndex].symbol;
  const secondSymbol = challengeState.grid[secondIndex].symbol;

  if (firstSymbol === secondSymbol) {
    challengeState.matchedIndices.add(firstIndex);
    challengeState.matchedIndices.add(secondIndex);
    markMatched(firstIndex);
    markMatched(secondIndex);

    const matchedPairs = challengeState.matchedIndices.size / 2;
    challengeState.firstIndex = null;
    challengeState.secondIndex = null;
    challengeState.lockBoard = false;

    updateProgress();

    if (matchedPairs % 2 === 0) {
      setAlarmVolume(challengeState.volume - 0.2);
    }

    if (challengeState.matchedIndices.size === challengeState.grid.length) {
      completeChallenge();
    }
  } else {
    setTimeout(() => {
      const firstTile = document.querySelector(`.memory-tile[data-index='${firstIndex}']`);
      const secondTile = document.querySelector(`.memory-tile[data-index='${secondIndex}']`);
      if (firstTile) firstTile.classList.add('shake');
      if (secondTile) secondTile.classList.add('shake');

      setTimeout(() => {
        if (firstTile) firstTile.classList.remove('open', 'shake');
        if (secondTile) secondTile.classList.remove('open', 'shake');
        challengeState.firstIndex = null;
        challengeState.secondIndex = null;
        challengeState.lockBoard = false;
      }, 450);
    }, 600);
  }
}

function markMatched(index) {
  const tile = document.querySelector(`.memory-tile[data-index='${index}']`);
  if (tile) tile.classList.add('open', 'matched');
}

function completeChallenge() {
  clearInterval(challengeState.intervalId);
  challengeState.intervalId = null;
  cancelAnimationFrame(waveAnimationId);
  challengeState.elapsed = Math.floor((Date.now() - challengeState.startTime) / 1000);
  challengeState.completed = true;
  populateVictory();
  showSection('morning-victory');
}

function resetChallenge() {
  clearInterval(challengeState.intervalId);
  challengeState.intervalId = null;
  cancelAnimationFrame(waveAnimationId);
  challengeState.grid = [];
  challengeState.firstIndex = null;
  challengeState.secondIndex = null;
  challengeState.matchedIndices.clear();
  challengeState.lockBoard = false;
  challengeState.attempts = 0;
  challengeState.elapsed = 0;
  challengeState.volume = 1;
  challengeState.initialized = false;
  challengeState.completed = false;

  const grid = document.getElementById('memory-grid');
  if (grid) grid.innerHTML = '';
}

function snooze() {
  resetChallenge();
  showSection('alarm-setup');
}

function imUp() {
  resetChallenge();
  showSection('alarm-setup');
}

function renderVictory() {
  const streak = state.streaks || 0;
  const streakEl = document.getElementById('victory-streak');
  if (streakEl) streakEl.textContent = `🔥 ${streak}`;
}

function populateVictory() {
  const timeEl = document.getElementById('victory-time');
  const accuracyEl = document.getElementById('victory-accuracy');
  const streakEl = document.getElementById('victory-streak');

  if (timeEl) timeEl.textContent = formatTime(challengeState.elapsed);
  if (accuracyEl) accuracyEl.textContent = `${calculateAccuracy()}%`;
  if (streakEl) streakEl.textContent = `🔥 ${state.streaks}`;

  fireConfetti();
}

function fireConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;

  container.innerHTML = '';
  const colors = ['#FF7847', '#7C3AED', '#FFD166', '#58D6E0', '#F7F5FF'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${Math.random() * 2 + 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(piece);
  }

  setTimeout(() => {
    if (container) container.innerHTML = '';
  }, 4000);
}

function shareWin() {
  const text = `I beat the Lucid wake-up challenge in ${formatTime(challengeState.elapsed)} with ${calculateAccuracy()}% accuracy! 🔥`;
  if (navigator.share) {
    navigator.share({ title: 'Lucid Win', text }).catch(() => {});
  } else {
    alert('Share your Lucid win!');
  }
}

// Volume wave visualizer
function startWaveVisualizer() {
  const canvas = document.getElementById('volume-wave');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let time = 0;
  cancelAnimationFrame(waveAnimationId);

  function draw() {
    const challengeVisible = !document.getElementById('wake-up-challenge').classList.contains('hidden');
    if (!challengeVisible) {
      cancelAnimationFrame(waveAnimationId);
      return;
    }
    time += 0.1;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const amplitude = challengeState.volume * height * 0.4;

    // main wave
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin(x * 0.05 + time) * amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#FF7847';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#FF7847';
    ctx.stroke();

    // secondary wave
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin(x * 0.05 + time + 3) * amplitude * 0.6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#7C3AED';
    ctx.shadowColor = '#7C3AED';
    ctx.stroke();

    waveAnimationId = requestAnimationFrame(draw);
  }

  draw();
}

// ===== Clarity Trends =====
function renderClarityTrends() {
  renderHeatmap();
  renderLeaderboard();
}

function renderHeatmap() {
  const grid = document.getElementById('heatmap-grid');
  if (!grid) return;
  const data = [
    [0.7,0.4,0.9,0.5,0.8,0.2,0.3],
    [0.6,0.8,0.9,0.7,0.3,0.5,0.4],
    [0.5,0.7,0.8,0.9,0.6,0.8,0.9],
    [0.9,0.9,0.7,0.8,0.9,0.9,0.8]
  ];
  let html = '';
  data.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const bg = `rgba(124, 58, 237, ${0.2 + value * 0.8})`;
      const title = `Week ${rowIndex + 1}, Day ${colIndex + 1}: ${Math.round(value * 100)}%`;
      html += `<div class='heatmap-cell' style='background: ${bg}' title='${title}'></div>`;
    });
  });
  grid.innerHTML = html;
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard');
  if (!list) return;
  const members = [
    { name: 'You', score: state.clarityScore },
    { name: 'Zoe', score: 92 },
    { name: 'Liam', score: 88 },
    { name: 'Ava', score: 75 }
  ];
  members.sort((a, b) => b.score - a.score);
  list.innerHTML = members.map((member, index) => `
    <li class='leaderboard-item'>
      <span><span class='leaderboard-rank'>#${index + 1}</span>${member.name}</span>
      <span class='leaderboard-score'>${member.score}</span>
    </li>
  `).join('');
}

function bindChallengeEvents() {
  document.getElementById('memory-grid')?.addEventListener('click', event => {
    const tile = event.target.closest('.memory-tile');
    if (tile) handleTileClick(Number(tile.dataset.index));
  });

  document.getElementById('emergency-snooze')?.addEventListener('click', snooze);
  document.getElementById('test-alarm-btn')?.addEventListener('click', triggerAlarm);
  document.getElementById('share-win-btn')?.addEventListener('click', shareWin);
  document.getElementById('im-up-btn')?.addEventListener('click', imUp);
}
