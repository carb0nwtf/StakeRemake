let betAmount = 5;
let mineCount = 3;
let isPlaying = false;
let minePositions = [];
let revealedTiles = [];
let currentMultiplier = 1;


const updateUI = () => {
    document.getElementById("playButton").disabled = isPlaying || betAmount > window.parent.globalBalance;
    document.getElementById("cashoutButton").disabled = !isPlaying || revealedTiles.length === 0;
}

const generateMines = (count) => {
    const positions = new Set();
    while (positions.size < count) {
        positions.add(Math.floor(Math.random() * 25));
    }
    return Array.from(positions);
}

const calculateMultiplier = (mines, revealed) => {
    const safeTiles = 25 - mines;
    let multiplier = 1;
    for (let i = 0; i < revealed; i++) {
        multiplier *= (safeTiles - i) / (25 - i);
    }
    return 0.99 / multiplier;
}

const startGame = () => {
    if (betAmount > window.parent.globalBalance) return;
    isPlaying = true;
    window.parent.globalBalance -= betAmount;
    window.parent.updateGlobalBalanceDisplay();
    minePositions = generateMines(mineCount);
    revealedTiles = [];
    currentMultiplier = 1;

    const grid = document.getElementById("game-grid");
    const tiles = grid.querySelectorAll(".tile");
    tiles.forEach((tile, i) => {
        tile.className = "tile";
        tile.innerHTML = "";
        tile.onclick = () => revealTile(i);
    });

    updateUI();
}

const revealTile = (index) => {
    if (!isPlaying || revealedTiles.includes(index)) return;
    const grid = document.getElementById("game-grid");
    const tiles = grid.querySelectorAll(".tile");
    const tile = tiles[index];
    revealedTiles.push(index);

    if (minePositions.includes(index)) {
        tile.className = "tile revealed-mine";
        tile.innerHTML = "💣";
        isPlaying = false;

        minePositions.forEach((pos) => {
            if (!revealedTiles.includes(pos)) {
                tiles[pos].className = "tile revealed-mine";
                tiles[pos].innerHTML = "💣";
            }
        });
    } else {
        tile.className = "tile revealed-safe";
        const multiplier = calculateMultiplier(mineCount, revealedTiles.length);
        tile.innerHTML = `<span>${multiplier.toFixed(2)}x</span>`;
        currentMultiplier = multiplier;
    }
    updateUI();
}

const cashout = () => {
    if (!isPlaying || revealedTiles.length === 0) return;
    window.parent.globalBalance += betAmount * currentMultiplier;
    window.parent.updateGlobalBalanceDisplay();
    isPlaying = false;

    const grid = document.getElementById("game-grid")
    const tiles = grid.querySelectorAll(".tile");
    minePositions.forEach((pos) => {
        const tile = tiles[pos];
        tile.className = "tile revealed-mine";
        tile.innerHTML = "💣";
    });

    updateUI();
}

const adjustBet = (factor) => {
    betAmount = Math.min(window.parent.globalBalance, Math.max(1, betAmount * factor));
    document.getElementById("betAmount").value = betAmount.toFixed(2);
    updateUI();
}

const betInput = document.getElementById("betAmount");
betInput.addEventListener("input", () => {
    const inputVal = parseFloat(betInput.value);
    if (!isNaN(inputVal)) {
        betAmount = Math.min(window.parent.globalBalance, Math.max(1, inputVal));
        updateUI();
    }
});

const mineSelector = document.getElementById("mineCount");
mineSelector.onchange = () => {
    mineCount = parseInt(mineSelector.value, 10);
    updateUI();
};

updateUI();