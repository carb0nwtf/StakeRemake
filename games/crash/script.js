class CrashGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.multiplier = 1.00;
    this.isPlaying = false;
    this.gamePhase = 'waiting';
    this.crashPoint = 0;
    this.lastTimestamp = 0;
    this.startTime = 0;
    this.currentBet = 0;
    this.gameHistory = [];
    this.autoCashoutAt = 0;
    this.won = false;

    this.setupCanvas();
    this.setupEventListeners();
    this.updateDisplay();
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
  }

  setupCanvas() {
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    this.canvasWidth = this.canvas.width / window.devicePixelRatio;
    this.canvasHeight = this.canvas.height / window.devicePixelRatio;
  }

  setupEventListeners() {
    const betButton = document.getElementById('betButton');
    const betAmount = document.getElementById('betAmount');
    const cashoutAt = document.getElementById('cashoutAt');
    const quickButtons = document.querySelectorAll('.quick-buttons button');
    const arrowButtons = document.querySelectorAll('.input-controls button');

    betButton.addEventListener('click', () => this.toggleBet());
    
    betAmount.addEventListener('input', (e) => {
      this.updateProfitDisplay(parseFloat(e.target.value) || 0);
    });

    cashoutAt.addEventListener('blur', (e) => {
      let value = parseFloat(e.target.value);
      if (value < 1.01 && value !== 0) value = 1.01;
      e.target.value = value.toFixed(2);
      this.updateProfitDisplay(parseFloat(betAmount.value) || 0);
    });

    quickButtons.forEach(button => {
      button.addEventListener('click', () => {
        const currentBet = parseFloat(betAmount.value) || 0;
        if (button.textContent === '½') {
          betAmount.value = (currentBet / 2).toFixed(2);
        } else {
          const newBet = currentBet * 2;
          betAmount.value = (newBet > window.parent.globalBalance ? window.parent.globalBalance.toFixed(2) : newBet.toFixed(2));
        }
        this.updateProfitDisplay(parseFloat(betAmount.value));
      });
    });

    arrowButtons.forEach(button => {
      button.addEventListener('click', () => {
        let currentValue = parseFloat(cashoutAt.value) || 1.01;
        if (button.textContent === '▼') {
          if (currentValue === 1.01) {
            cashoutAt.value = 0;
          } else {
            cashoutAt.value = Math.max(1.01, (currentValue - 0.01)).toFixed(2);
          }
        } else {
          if (currentValue === 0) {
            cashoutAt.value = 1.01;
          } else {
            cashoutAt.value = (currentValue + 0.01).toFixed(2);
          }
        }
        this.autoCashoutAt = parseFloat(cashoutAt.value) || 0;
        this.updateProfitDisplay(parseFloat(betAmount.value) || 0);
      });
    });

    cashoutAt.addEventListener('input', (e) => {
      this.autoCashoutAt = parseFloat(e.target.value) || 0;
      this.updateProfitDisplay(parseFloat(betAmount.value) || 0);
    });

    window.addEventListener('resize', () => this.setupCanvas());
  }

  updateProfitDisplay(betAmount) {
    const cashoutAt = parseFloat(document.getElementById('cashoutAt').value);
    let profit = betAmount * (cashoutAt - 1);
    if (profit < 0) profit = 0;
    document.querySelector('.profit-amount').textContent = '$' + profit.toFixed(2);
  }

  toggleBet() {
    if (this.gamePhase === 'waiting') {
      const betAmount = parseFloat(document.getElementById('betAmount').value);
      const cashoutAt = parseFloat(document.getElementById('cashoutAt').value);
      
      if (betAmount <= 0 || betAmount > window.parent.globalBalance) {
        alert('Invalid bet amount!');
        return;
      }

      this.currentBet = betAmount;
      this.autoCashoutAt = cashoutAt || 0;
      window.parent.globalBalance -= betAmount;
      window.parent.updateGlobalBalanceDisplay();
      this.startGame();
      document.getElementById('betButton').textContent = 'Cashout';
      document.getElementById('betButton').style.backgroundColor = '#ff4444';
    } else if (this.gamePhase === 'playing') {
      this.cashout();
    }
  }

  startGame() {
    this.gamePhase = 'playing';
    this.isPlaying = true;
    this.multiplier = 1.00;
    this.startTime = performance.now();
    this.crashPoint = this.generateCrashPoint();
    this.animate();
  }

  generateCrashPoint() {
    const r = Math.random();
    const crashPoint = 0.99 / (1 - Math.pow(r, 2));
    return isNaN(crashPoint) ? 1.00 : crashPoint;
  }

  cashout() {
    if (this.gamePhase === 'playing') {
      this.autoCashoutAt = 0;
      const winAmount = this.autoCashoutAt > 0 ? this.currentBet * this.autoCashoutAt : this.currentBet * this.multiplier;
      window.parent.globalBalance += winAmount;
      window.parent.updateGlobalBalanceDisplay();
      document.getElementById('betButton').textContent = 'Bet';
      document.getElementById('betButton').style.backgroundColor = 'var(--accent-green)';
      this.won = true;
      this.currentBet = 0;
    }
  }

  crash() {
    this.gamePhase = 'crashed';
    this.isPlaying = false;
    this.addToHistory(this.multiplier, this.won);
    
    setTimeout(() => {
      this.gamePhase = 'waiting';
      this.multiplier = 1.00;
      document.getElementById('betButton').textContent = 'Bet';
      document.getElementById('betButton').style.backgroundColor = 'var(--accent-green)';
      this.resetGame();
    }, 2000);
  }

  resetGame() {
    this.currentBet = 0;
    this.startTime = 0;
    this.lastTimestamp = 0;
    this.gamePhase = 'waiting';
    this.won = false;
  }

  addToHistory(multiplier, won) {
    const historyDiv = document.querySelector('.recent-multipliers');
    const newMultiplier = document.createElement('div');
    newMultiplier.className = `multiplier ${won ? 'green' : 'gray'}`;
    newMultiplier.textContent = multiplier.toFixed(2) + '×';
    
    historyDiv.insertBefore(newMultiplier, historyDiv.firstChild);
    if (historyDiv.children.length > 12) {
      historyDiv.removeChild(historyDiv.lastChild);
    }
  }

  updateTimeMarkers() {
    if (this.gamePhase === 'crashed') return;

    const timeMarkers = document.querySelector('.time-markers');
    const elapsed = (performance.now() - this.startTime) / 1000;
    const markers = [];
    const maxMarkers = 2;

    for (let i = 2; i <= elapsed + 2; i += 2) {
      markers.push(`<span>${i}s</span>`);
    }

    if (markers.length > maxMarkers) {
      markers.splice(0, markers.length - maxMarkers);
    }

    timeMarkers.innerHTML = markers.join('');
  }

  updateDisplay() {
    const multiplierDisplay = document.querySelector('.multiplier-display');
    multiplierDisplay.textContent = this.multiplier.toFixed(2) + '×';
    
    this.updateTimeMarkers();
  }

  drawGraph() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    this.ctx.save();
    this.ctx.translate(0, this.canvasHeight);
    this.ctx.scale(1, -1);

    this.drawGrid();

    this.ctx.beginPath();
    this.ctx.strokeStyle = '#00ff4c';
    this.ctx.lineWidth = 3;
    
    const points = this.calculateGraphPoints();
    points.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });
    
    this.ctx.stroke();

    this.ctx.lineTo(points[points.length - 1].x, 0);
    this.ctx.lineTo(points[0].x, 0);
    this.ctx.fillStyle = 'rgba(0, 255, 76, 0.1)';
    this.ctx.fill();
    
    this.ctx.restore();
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.canvasWidth; i += this.canvasWidth / 8) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, -this.canvasHeight);
      this.ctx.stroke();
    }

    for (let i = 0; i <= this.canvasHeight; i += this.canvasHeight / 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, -i);
      this.ctx.lineTo(this.canvasWidth, -i);
      this.ctx.stroke();
    }
  }

  calculateGraphPoints() {
    const points = [];
    const elapsed = (performance.now() - this.startTime) / 1000;
    
    const growthRate = 1.1678;
    
    for (let i = 0; i <= elapsed; i += 0.05) {
      const multiplier = Math.pow(growthRate, i);
      const x = (i / 4) * this.canvasWidth;
      const y = ((multiplier - 1) / 2) * this.canvasHeight;
      points.push({ x, y });
    }
    
    return points;
  }

  animate(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const elapsed = timestamp - this.startTime;
    
    if (this.isPlaying) {
      this.multiplier = Math.pow(1.1678, elapsed / 1000);
      
      if (this.autoCashoutAt > 0 && this.multiplier >= this.autoCashoutAt && this.currentBet > 0) {
        this.cashout();
      }

      if (this.multiplier >= this.crashPoint) {
        this.crash();
      } else {
        this.updateDisplay();
        this.drawGraph();
        requestAnimationFrame((ts) => this.animate(ts));
      }
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseGame();
    } else {
      this.resumeGame();
    }
  }

  pauseGame() {
    if (this.gamePhase === 'playing') {
      this.isPlaying = false;
      this.lastTimestamp = performance.now();
    }
  }

  resumeGame() {
    if (this.gamePhase === 'playing') {
      this.isPlaying = true;
      this.startTime += performance.now() - this.lastTimestamp;
      this.animate();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new CrashGame();
});