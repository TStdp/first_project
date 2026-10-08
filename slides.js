(() => {
  const slidesData = [
    {
      title: 'The End of the Snooze-Cycle',
      subtitle: 'An alarm that wakes your brain, not just your eyes.',
      keyMessage: 'Snoozing drains up to 60 minutes of mental sharpness every morning.',
      points: [
        'Snooze causes sleep inertia and lingering grogginess',
        'The average sleep cycle is fragmented by 3+ snooze taps',
        'Lucid eliminates the snooze loop entirely'
      ],
      callout: 'Ready to rise',
      illustration: 'split-screen'
    },
    {
      title: 'Cognitive Jumpstart Technology',
      subtitle: 'A memory puzzle engineered to flip your brain from asleep to alert.',
      keyMessage: 'Our 60-second challenge activates the prefrontal cortex within seconds.',
      points: [
        'Tile matching wakes executive function',
        'Dynamic difficulty adapts to your alertness',
        'Audio volume drops as you make progress'
      ],
      callout: 'Think fast, wake faster',
      illustration: 'tile-grid'
    },
    {
      title: 'Morning Momentum',
      subtitle: 'Celebrate every small win and build streaks that last.',
      keyMessage: 'Users report 78% more energetic mornings after one week.',
      points: [
        'Victory screen marks your completion',
        'Streak counter keeps you accountable',
        'Share your win with your Lucid circle'
      ],
      callout: 'The chain stays unbroken',
      illustration: 'streak-badge'
    },
    {
      title: 'Quantified Wakefulness',
      subtitle: 'Know exactly how your brain performs each morning.',
      keyMessage: 'Lucid gives you clarity scores and insights no alarm has ever captured.',
      points: [
        'Track solve times and accuracy over time',
        'Clarity trends reveal your best waking window',
        'Benchmark against your accountability circle'
      ],
      callout: 'Know your morning',
      illustration: 'line-graph'
    }
  ];

  const deckTrack = document.getElementById('deck-track');
  const dotNav = document.getElementById('dot-nav');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const slideCount = document.getElementById('slide-count');
  let current = 0;

  function illustrationHTML(type) {
    switch (type) {
      case 'split-screen':
        return `<div class='illustration split-illustration'>
          <div class='split-column snooze-column'>
            <div class='split-emoji'>😴</div>
            <p class='split-label'>Snooze</p>
            <div class='signal-bars low'><span></span><span></span><span></span></div>
          </div>
          <div class='split-column lucid-column'>
            <div class='split-emoji'>⚡</div>
            <p class='split-label'>Lucid</p>
            <div class='signal-bars high'><span></span><span></span><span></span></div>
          </div>
        </div>`;
      case 'tile-grid':
        return `<div class='illustration tile-illustration'>
          <div class='tile-grid'>
            <span>▲</span><span>■</span><span>●</span><span>◆</span>
            <span>★</span><span>●</span><span>▲</span><span>■</span>
            <span>◆</span><span>★</span><span>■</span><span>●</span>
            <span>●</span><span>▲</span><span>◆</span><span>★</span>
          </div>
        </div>`;
      case 'streak-badge':
        return `<div class='illustration streak-illustration'>
          <div class='streak-badge'>
            <div class='streak-flame'>🔥</div>
            <div class='streak-count'>7</div>
            <div class='streak-label'>DAY STREAK</div>
          </div>
        </div>`;
      case 'line-graph':
        return `<div class='illustration graph-illustration'>
          <svg class='line-graph' viewBox='0 0 300 140' preserveAspectRatio='none'>
            <defs>
              <linearGradient id='graphGradient' x1='0' y1='0' x2='1' y2='1'>
                <stop offset='0%' stop-color='#7C3AED'/>
                <stop offset='100%' stop-color='#FF7847'/>
              </linearGradient>
            </defs>
            <polyline points='0,120 30,100 60,110 90,70 120,80 150,45 180,55 210,30 240,40 270,15 300,20' fill='none' stroke='url(#graphGradient)' stroke-width='4' stroke-linecap='round'/>
          </svg>
          <div class='graph-labels'><span>Mon</span><span>Wed</span><span>Fri</span><span>+82 clarity</span></div>
        </div>`;
      default:
        return '';
    }
  }

  function slideHTML(data, index) {
    return `<article class='slide' data-index='${index}'>
      <div class='slide-content'>
        <div class='slide-text'>
          <div class='slide-kicker'>${String(index + 1).padStart(2, '0')} — ${data.title.toUpperCase().split(' ').slice(0, 3).join(' ')}</div>
          <h1>${data.title}</h1>
          <p class='slide-subtitle'>${data.subtitle}</p>
          <div class='key-message'>${data.keyMessage}</div>
          <ul class='supporting-points'>${data.points.map(point => `<li>${point}</li>`).join('')}</ul>
          <span class='callout'>${data.callout}</span>
        </div>
        <div class='slide-visual'>${illustrationHTML(data.illustration)}</div>
      </div>
    </article>`;
  }

  function render() {
    deckTrack.innerHTML = slidesData.map(slideHTML).join('');
    dotNav.innerHTML = slidesData.map((_, index) => `<button class='dot' data-index='${index}' aria-label='Go to slide ${index + 1}'></button>`).join('');
    update();
  }

  function update() {
    document.querySelectorAll('.slide').forEach((slide, index) => {
      slide.classList.toggle('active', index === current);
    });
    document.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === current);
    });
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === slidesData.length - 1;
    if (slideCount) slideCount.textContent = `${current + 1} / ${slidesData.length}`;
  }

  function goTo(index) {
    if (index >= 0 && index < slidesData.length) {
      current = index;
      update();
    }
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  dotNav.addEventListener('click', event => {
    const dot = event.target.closest('.dot');
    if (dot) goTo(Number(dot.dataset.index));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'PageDown') next();
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') prev();
  });

  render();
})();
