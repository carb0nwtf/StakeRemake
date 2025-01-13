const games = [
  // { id: 1, title: 'PLINKO', players: 0, image: 'icons/image_1.jpg' },
  // { id: 2, title: 'BLACKJACK', players: 0, image: 'icons/image_2.jpg' },
  { id: 3, title: 'MINES', players: 0, image: 'icons/image_3.jpg' },
  // { id: 4, title: 'DICE', players: 0, image: 'icons/image_4.jpg' },
  { id: 5, title: 'CRASH', players: 0, image: 'icons/image_5.jpg' },
  // { id: 6, title: 'KENO', players: 0, image: 'icons/image_6.jpg' },
  // { id: 7, title: 'LIMBO', players: 0, image: 'icons/image_7.jpg' },
  // { id: 8, title: 'ROULETTE', players: 0, image: 'icons/image_8.jpg' },
  // { id: 9, title: 'HILO', players: 0, image: 'icons/image_9.jpg' },
  // { id: 10, title: 'DRAGON TOWER', players: 0, image: 'icons/image_10.jpg' },
  // { id: 11, title: 'WHEEL', players: 0, image: 'icons/image_11.jpg' },
  // { id: 12, title: 'TOWER OF LIFE', players: 0, image: 'icons/image_12.jpg' },
  // { id: 13, title: 'VIDEO POKER', players: 0, image: 'icons/image_13.jpg' },
  // { id: 14, title: 'BACCARAT', players: 0, image: 'icons/image_14.jpg' },
  // { id: 15, title: 'DIAMONDS', players: 0, image: 'icons/image_15.jpg' },
  // { id: 16, title: 'SCARAB SPIN', players: 0, image: 'icons/image_16.jpg' },
  // { id: 17, title: 'SLIDE', players: 0, image: 'icons/image_17.jpg' },
  // { id: 18, title: 'BLUE SAMURAI', players: 0, image: 'icons/image_18.jpg' }
];

window.globalBalance = 1000.00;

function createGameCard(game) {
  return `
    <div class="game-card" onclick="switchGame('${game.title.toLowerCase().replace(/ /g, '-')}')">
      <img src="${game.image}" alt="${game.title}" class="game-image" width="131" height="176" draggable="false">
      <div class="player-count">${game.players} playing</div>
    </div>
  `;
}

function switchGame(gameName) {
  const gameGrid = document.getElementById('gameGrid');
  gameGrid.style.display = 'none';
  
  const iframe = document.getElementById('gameIframe');
  iframe.src = `games/${gameName}/index.html`;
  iframe.style.display = 'block';
  
  const resultsCount = document.getElementById('resultsCount');
  resultsCount.style.display = 'none';

  const searchContainer = document.getElementById('searchContainer');
  searchContainer.style.display = 'none';

  const controls = document.getElementById('controls');
  controls.style.display = 'none';
}

window.switchGame = switchGame;

function updateGlobalBalanceDisplay() {
  window.globalBalance = Math.round(window.globalBalance * 100) / 100;
  document.querySelector('.balance').textContent = window.globalBalance.toFixed(2);
}

window.updateGlobalBalanceDisplay = updateGlobalBalanceDisplay;

function initializeGrid() {
  const gameGrid = document.getElementById('gameGrid');
  const gameCount = document.getElementById('gameCount');
  const totalGames = document.getElementById('totalGames');
  
  gameGrid.innerHTML = games.map(createGameCard).join('');
  gameCount.textContent = games.length;
  totalGames.textContent = games.length;

  updateGlobalBalanceDisplay();
}

document.addEventListener('DOMContentLoaded', initializeGrid);

const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchTerm)
  );
  
  const gameGrid = document.getElementById('gameGrid');
  gameGrid.innerHTML = filteredGames.map(createGameCard).join('');
  
  const gameCount = document.getElementById('gameCount');
  gameCount.textContent = filteredGames.length;
});

document.getElementById('originalsText').addEventListener('click', () => {
  const gameGrid = document.getElementById('gameGrid');
  gameGrid.style.display = 'grid';
  
  const iframe = document.getElementById('gameIframe');
  iframe.style.display = 'none';
  
  const resultsCount = document.getElementById('resultsCount');
  resultsCount.style.display = 'block';

  const searchContainer = document.getElementById('searchContainer');
  searchContainer.style.display = 'block';

  const controls = document.getElementById('controls');
  controls.style.display = 'flex';
  
  initializeGrid();
});