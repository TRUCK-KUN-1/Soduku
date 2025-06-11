const board = document.getElementById('board');
    const message = document.getElementById('message');
    const timerDisplay = document.getElementById('time');
    const solvedDisplay = document.getElementById('solved');
    const bestDisplay = document.getElementById('best');
    const difficultySelect = document.getElementById('difficulty');
    const size = 9;
    let puzzle = [], solution = [], timer = 0, interval;

    let selectedCell = null;

    const stats = JSON.parse(localStorage.getItem('sudokuStats')) || {solved: 0, bestTime: null};
    solvedDisplay.textContent = stats.solved;
    bestDisplay.textContent = stats.bestTime ?? '--';

    function startTimer() {
      clearInterval(interval);
      timer = 0;
      interval = setInterval(() => {
        timer++;
        timerDisplay.textContent = timer;
      }, 1000);
    }

    function stopTimer() {
      clearInterval(interval);
    }

    function toggleTheme() {
      document.body.classList.toggle('dark');
    }

    function resetStats() {
      if (!confirm('Reset all stats?')) return;
      localStorage.removeItem('sudokuStats');
      location.reload();
    }

    function giveHint() {
      const cells = document.querySelectorAll('.cell');
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (!cell.classList.contains('prefilled') && cell.value === '') {
          const row = Math.floor(i / 9);
          const col = i % 9;
          cell.value = solution[row][col];
          break;
        }
      }
    }

    
    function createBoard(puzzleData) {
        board.innerHTML = '';
        for(let i = 0; i < size * size; i++){
            const cell = document.createElement('input');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            const value = puzzleData[Math.floor(i / size)][i % size];
            if(value !== 0){
                cell.value = value;
                cell.disabled = true;
                cell.classList.add('prefilled');
            }
            else{
                cell.setAttribute('type', 'number');
                cell.setAttribute('min', '1');
                cell.setAttribute('max', '9');
                cell.addEventListener('input', () => {
                    if(!/^[1-9]?$/.test(cell.value)){
                        cell.value = '';
                    }
                });
            }
            cell.addEventListener('focus', () => selectedCell = i);
            board.appendChild(cell);
        }
    }


    function newGame() {
      let clues;
      const diff = difficultySelect.value;
      if (diff === 'easy') clues = 40;
      else if (diff === 'medium') clues = 30;
      else clues = 25;
      const fullGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
      solveSudoku(fullGrid);
      solution = JSON.parse(JSON.stringify(fullGrid));
      let puzzleCopy = JSON.parse(JSON.stringify(fullGrid));
      let removed = 81 - clues;
      while (removed > 0) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (puzzleCopy[r][c] !== 0) {
          puzzleCopy[r][c] = 0;
          removed--;
        }
      }
      puzzle = puzzleCopy;
      createBoard(puzzle);
      message.textContent = '';
      startTimer();
    }

    function resetBoard() {
      if (!confirm("Reset all user inputs?")) return;
      const cells = document.querySelectorAll('.cell');
      cells.forEach((cell) => {
        if (!cell.classList.contains('prefilled')) {
          cell.value = '';
          cell.classList.remove('invalid');
        }
      });
      message.textContent = '';
    }

    function checkSolution() {
      const cells = document.querySelectorAll('.cell');
      let correct = true;
      cells.forEach((cell, i) => {
        const row = Math.floor(i / 9);
        const col = i % 9;
        if (!cell.classList.contains('prefilled')) {
          if (Number(cell.value) !== solution[row][col]) {
            cell.classList.add('invalid');
            correct = false;
          } else {
            cell.classList.remove('invalid');
          }
        }
      });
      if (correct) {
        stopTimer();
        message.textContent = '🎉 Correct Solution!';
        message.style.color = 'var(--success)';
        stats.solved++;
        if (!stats.bestTime || timer < stats.bestTime) stats.bestTime = timer;
        localStorage.setItem('sudokuStats', JSON.stringify(stats));
        solvedDisplay.textContent = stats.solved;
        bestDisplay.textContent = stats.bestTime;
      } else {
        message.textContent = '❌ Incorrect entries found!';
        message.style.color = 'var(--error)';
      }
    }

    function solveSudoku(grid) {
      function isValid(r, c, n) {
        for (let i = 0; i < 9; i++) {
          if (grid[r][i] === n || grid[i][c] === n) return false;
          const br = 3 * Math.floor(r / 3) + Math.floor(i / 3);
          const bc = 3 * Math.floor(c / 3) + (i % 3);
          if (grid[br][bc] === n) return false;
        }
        return true;
      }
      function backtrack(r = 0, c = 0) {
        if (r === 9) return true;
        if (grid[r][c] !== 0) return backtrack(c === 8 ? r + 1 : r, (c + 1) % 9);
        for (let n = 1; n <= 9; n++) {
          if (isValid(r, c, n)) {
            grid[r][c] = n;
            if (backtrack(c === 8 ? r + 1 : r, (c + 1) % 9)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
      backtrack();
      return grid;
    }


    document.addEventListener('keydown', e => {
        const cells = document.querySelectorAll('.cell');
        if (selectedCell === null) return;

        if (e.key === 'ArrowRight') selectedCell = (selectedCell + 1) % 81;
        if (e.key === 'ArrowLeft') selectedCell = (selectedCell + 80) % 81;
        if (e.key === 'ArrowUp') selectedCell = (selectedCell + 72) % 81;
        if (e.key === 'ArrowDown') selectedCell = (selectedCell + 9) % 81;

        cells[selectedCell].focus();
});


    newGame();