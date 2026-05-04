const body = document.body;

let bestOf = 3;
let maxWins = Math.ceil(bestOf / 2);
let blueWinsCount = 0;
let redWinsCount = 0;

const drawer = document.getElementById('control-drawer');

const seriesLabel = document.getElementById('series-label');
const blueWinCountLabel = document.getElementById('blue-win-count-label');
const redWinCountLabel = document.getElementById('red-win-count-label');

const backgroundOverlay = document.getElementById('background-overlay');
const backgroundUpload = document.getElementById('background-upload');

const playerCard = document.getElementById('player-card');
const playerCardUpload = document.getElementById('player-card-upload');

backgroundUpload.addEventListener('change', () => {
  const file = backgroundUpload.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  backgroundOverlay.src = imageUrl;
});

playerCardUpload.addEventListener('change', () => {
  const file = playerCardUpload.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  playerCard.src = imageUrl;
});

document.querySelectorAll('.bg-preset').forEach((button) => {
  button.addEventListener('click', () => {
    backgroundOverlay.src = button.dataset.bgSrc;
  });
});
/* --------------------------
   Drawer open / close
-------------------------- */

function toggleDrawer(force) {
  if (typeof force === 'boolean') {
    drawer.classList.toggle('open', force);
  } else {
    drawer.classList.toggle('open');
  }
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
    e.preventDefault();
    toggleDrawer();
  }

  if (e.key === 'Escape') {
    toggleDrawer(false);
  }
});

/* --------------------------
   Visibility toggles
-------------------------- */
function isHidden(el) {
  return el.dataset.hidden === 'true';
}

function setHidden(el, hidden) {
  el.style.display = hidden ? 'none' : '';
  el.dataset.hidden = hidden ? 'true' : 'false';
}

function getToggleTargets(btn) {
  const ids = btn.dataset.toggleTargets
    ? btn.dataset.toggleTargets.split(',').map(id => id.trim())
    : [btn.dataset.toggleTarget];

  return ids
    .map(id => document.getElementById(id))
    .filter(Boolean);
}

function toggleButtonTargets(btn) {
  const targets = getToggleTargets(btn);
  if (targets.length === 0) return;

  const shouldHide = !targets.every(isHidden);

  targets.forEach((target) => {
    setHidden(target, shouldHide);
  });

  syncToggleButtons();
}

function syncToggleButtons() {
  document.querySelectorAll('.toggle-btn').forEach((btn) => {
    const targets = getToggleTargets(btn);
    if (targets.length === 0) return;

    const off = targets.every(isHidden);

    btn.classList.toggle('off', off);
    btn.textContent = `${btn.dataset.baseLabel} ${off ? '(OFF)' : '(ON)'}`;
  });
}

document.querySelectorAll('.toggle-btn').forEach((btn) => {
  btn.dataset.baseLabel = btn.textContent.trim();

  btn.addEventListener('click', () => {
    toggleButtonTargets(btn);
  });
});
/* --------------------------
   Text editing from menu
-------------------------- */

function htmlToFieldValue(html) {
  return html.replace(/<br\s*\/?>/gi, '\n');
}

function fieldValueToHtml(value) {
  return value.replace(/\n/g, '<br>');
}

document.querySelectorAll('[data-text-target]').forEach((field) => {
  const target = document.getElementById(field.dataset.textTarget);
  if (!target) return;

  field.value = htmlToFieldValue(target.innerHTML);

  field.addEventListener('input', () => {
    target.innerHTML = fieldValueToHtml(field.value);
  });
});

document.querySelectorAll('[data-colour-target]').forEach((colourInput) => {
  const target = document.getElementById(colourInput.dataset.colourTarget);
  if (!target) return;

  const currentColour = getComputedStyle(target).color;
  const rgbMatch = currentColour.match(/\d+/g);

  if (rgbMatch && rgbMatch.length >= 3) {
    const [r, g, b] = rgbMatch.map(Number);
    colourInput.value =
      '#' +
      [r, g, b]
        .map((value) => value.toString(16).padStart(2, '0'))
        .join('');
  }

  colourInput.addEventListener('input', () => {
    target.style.color = colourInput.value;
  });
});

/* --------------------------
   Match controls
-------------------------- */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateStatusLabels() {
  seriesLabel.textContent = `Best of ${bestOf}`;
  blueWinCountLabel.textContent = blueWinsCount;
  redWinCountLabel.textContent = redWinsCount;
}

function updateWins(team, count) {
  const wins = document.querySelectorAll(`#${team}-wins .win`);
  wins.forEach((el, i) => {
    el.style.backgroundColor = i < count ? '#00ff00' : 'black';
  });
}

function setBestOf(n) {
  bestOf = n;
  maxWins = Math.ceil(bestOf / 2);

  const visibleWins = n === 3 ? 2 : 3;
  const blueWins = document.querySelectorAll('#blue-wins .win');
  const redWins = document.querySelectorAll('#red-wins .win');

  blueWins.forEach((el, i) => {
    el.style.display = i < visibleWins ? 'block' : 'none';
  });

  redWins.forEach((el, i) => {
    el.style.display = i < visibleWins ? 'block' : 'none';
  });

  blueWinsCount = clamp(blueWinsCount, 0, maxWins);
  redWinsCount = clamp(redWinsCount, 0, maxWins);

  updateWins('blue', blueWinsCount);
  updateWins('red', redWinsCount);
  updateStatusLabels();
}

function changeWins(team, delta) {
  if (team === 'blue') {
    blueWinsCount = clamp(blueWinsCount + delta, 0, maxWins);
    updateWins('blue', blueWinsCount);
  } else if (team === 'red') {
    redWinsCount = clamp(redWinsCount + delta, 0, maxWins);
    updateWins('red', redWinsCount);
  }

  updateStatusLabels();
}

function swapSides() {
  const blueName = document.getElementById('blue-team-name');
  const redName = document.getElementById('red-team-name');

  const blueField = document.querySelector('[data-text-target="blue-team-name"]');
  const redField = document.querySelector('[data-text-target="red-team-name"]');

  const tempName = blueName.innerHTML;
  blueName.innerHTML = redName.innerHTML;
  redName.innerHTML = tempName;

  const tempWins = blueWinsCount;
  blueWinsCount = redWinsCount;
  redWinsCount = tempWins;

  if (blueField) blueField.value = blueName.textContent;
  if (redField) redField.value = redName.textContent;

  updateWins('blue', blueWinsCount);
  updateWins('red', redWinsCount);
  updateStatusLabels();
}

document.getElementById('best-of-3-btn').addEventListener('click', () => {
  setBestOf(3);
});

document.getElementById('best-of-5-btn').addEventListener('click', () => {
  setBestOf(5);
});

document.getElementById('swap-sides-btn').addEventListener('click', () => {
  swapSides();
});

document.getElementById('blue-win-up-btn').addEventListener('click', () => {
  changeWins('blue', 1);
});

document.getElementById('blue-win-down-btn').addEventListener('click', () => {
  changeWins('blue', -1);
});

document.getElementById('red-win-up-btn').addEventListener('click', () => {
  changeWins('red', 1);
});

document.getElementById('red-win-down-btn').addEventListener('click', () => {
  changeWins('red', -1);
});

/* --------------------------
   Init
-------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  setBestOf(3);
  syncToggleButtons();
  updateStatusLabels();
});