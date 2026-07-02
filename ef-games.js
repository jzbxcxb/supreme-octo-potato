(function(){
  'use strict';
  
  const gameEngine = window.gameEngine = {
    startGame(id) {
      if(id === 'tictactoe') this.startTicTacToe();
      else if(id === 'minesweeper') this.startMinesweeper();
      else if(id === 'chess') this.startChess();
      else if(id === 'checkers') this.startCheckers();
      else if(id === 'sudoku') this.startSudoku();
      else if(id === 'battleship') this.startBattleship();
    },

    // Utility functions
    qs(sel) { return document.querySelector(sel) },
    qsa(sel) { return Array.from(document.querySelectorAll(sel)) },

    award(coins, rating) {
      try {
        const s = JSON.parse(localStorage.getItem('ef_state_v1')||'{}');
        s.shopCoins = (s.shopCoins||0) + coins;
        s.ratingCoins = (s.ratingCoins||0) + rating;
        localStorage.setItem('ef_state_v1', JSON.stringify(s));
        app.save();
        this.showModal('🎉 Награда!', `+${coins} монет магазина\n+${rating} рейтинг очков`);
      } catch(e) { console.warn('award failed', e) }
    },

    showModal(title, text) {
      const modal = document.getElementById('modal');
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalText').textContent = text;
      modal.style.display = 'flex';
    },

    // ============ ТИК-ТАК-ТОЕ ============
    startTicTacToe() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';
      
      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = 'Крестики-нолики';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const controls = document.createElement('div');
      controls.style.display = 'flex';
      controls.style.gap = '10px';
      controls.style.marginBottom = '15px';
      controls.style.flexWrap = 'wrap';

      const btnNew = document.createElement('button');
      btnNew.className = 'buy-btn';
      btnNew.textContent = 'Новая игра';
      controls.appendChild(btnNew);

      const difficultyBtn = document.createElement('button');
      difficultyBtn.className = 'shop-tab';
      difficultyBtn.textContent = 'Легко';
      controls.appendChild(difficultyBtn);

      const resultDiv = document.createElement('div');
      resultDiv.style.textAlign = 'center';
      resultDiv.style.marginBottom = '15px';
      resultDiv.id = 'tictactoeResult';

      body.appendChild(controls);
      body.appendChild(resultDiv);

      const board = document.createElement('div');
      board.className = 't3-board';
      board.style.margin = '0 auto';
      body.appendChild(board);

      let difficulty = 'easy';
      let state;

      const newGame = () => {
        state = {
          board: Array(9).fill(null),
          human: 'X',
          ai: 'O',
          gameOver: false,
          result: null
        };
        renderBoard();
        resultDiv.innerHTML = '';
      };

      const renderBoard = () => {
        board.innerHTML = '';
        state.board.forEach((cell, i) => {
          const div = document.createElement('div');
          div.className = 't3-cell';
          div.textContent = cell || '';
          if (!state.gameOver && !cell) {
            div.style.cursor = 'pointer';
            div.onclick = () => makeMove(i);
          }
          board.appendChild(div);
        });
      };

      const makeMove = (index) => {
        if (state.board[index] || state.gameOver) return;
        state.board[index] = state.human;
        const winner = checkWinner();
        if (winner) {
          state.gameOver = true;
          state.result = winner === state.human ? 'win' : (winner === state.ai ? 'loss' : 'draw');
          endGame();
          renderBoard();
          return;
        }
        setTimeout(() => {
          const aiIndex = getAiMove();
          if (aiIndex !== null) {
            state.board[aiIndex] = state.ai;
            const w = checkWinner();
            if (w) {
              state.gameOver = true;
              state.result = w === state.human ? 'win' : (w === state.ai ? 'loss' : 'draw');
              endGame();
            }
          }
          renderBoard();
        }, 500);
      };

      const getAiMove = () => {
        if (difficulty === 'easy') return getRandomMove();
        if (difficulty === 'medium') return getMediumAiMove();
        return getHardAiMove();
      };

      const getRandomMove = () => {
        const empty = state.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        return empty[Math.floor(Math.random() * empty.length)];
      };

      const getMediumAiMove = () => {
        // Try to win
        for (let i = 0; i < 9; i++) {
          if (!state.board[i]) {
            state.board[i] = state.ai;
            if (checkWinner() === state.ai) return i;
            state.board[i] = null;
          }
        }
        // Try to block
        for (let i = 0; i < 9; i++) {
          if (!state.board[i]) {
            state.board[i] = state.human;
            if (checkWinner() === state.human) {
              state.board[i] = null;
              return i;
            }
            state.board[i] = null;
          }
        }
        return getRandomMove();
      };

      const getHardAiMove = () => {
        let bestScore = -Infinity;
        let bestMove = null;
        for (let i = 0; i < 9; i++) {
          if (!state.board[i]) {
            state.board[i] = state.ai;
            const score = minimax(0, true);
            state.board[i] = null;
            if (score > bestScore) {
              bestScore = score;
              bestMove = i;
            }
          }
        }
        return bestMove;
      };

      const minimax = (depth, isMax) => {
        const winner = checkWinner();
        if (winner === state.ai) return 10 - depth;
        if (winner === state.human) return depth - 10;
        const empty = state.board.some(v => v === null);
        if (!empty) return 0;

        if (isMax) {
          let score = -Infinity;
          for (let i = 0; i < 9; i++) {
            if (!state.board[i]) {
              state.board[i] = state.ai;
              score = Math.max(score, minimax(depth + 1, false));
              state.board[i] = null;
            }
          }
          return score;
        } else {
          let score = Infinity;
          for (let i = 0; i < 9; i++) {
            if (!state.board[i]) {
              state.board[i] = state.human;
              score = Math.min(score, minimax(depth + 1, true));
              state.board[i] = null;
            }
          }
          return score;
        }
      };

      const checkWinner = () => {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let line of lines) {
          const [a,b,c] = line;
          if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
            return state.board[a];
          }
        }
        if (state.board.some(v => v === null)) return null;
        return 'draw';
      };

      const endGame = () => {
        let msg = '🤝 Ничья!';
        let coins = 3, rating = 2;
        if (state.result === 'win') {
          msg = '🎉 Вы победили!';
          coins = 6;
          rating = 5;
        } else if (state.result === 'loss') {
          msg = '💔 Вы проиграли';
          coins = 1;
          rating = 1;
        }
        resultDiv.innerHTML = `<strong>${msg}</strong>`;
        gameEngine.award(coins, rating);
      };

      btnNew.onclick = () => newGame();
      difficultyBtn.onclick = () => {
        if (difficulty === 'easy') {
          difficulty = 'medium';
          difficultyBtn.textContent = 'Средне';
        } else if (difficulty === 'medium') {
          difficulty = 'hard';
          difficultyBtn.textContent = 'Сложно';
        } else {
          difficulty = 'easy';
          difficultyBtn.textContent = 'Легко';
        }
        newGame();
      };

      newGame();
    },

    // ============ САПЕР ============
    startMinesweeper() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = 'Сапёр';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const controls = document.createElement('div');
      controls.style.display = 'grid';
      controls.style.gridTemplateColumns = '1fr 1fr 1fr';
      controls.style.gap = '10px';
      controls.style.marginBottom = '15px';

      const btnEasy = document.createElement('button');
      btnEasy.className = 'buy-btn';
      btnEasy.textContent = 'Легко';
      controls.appendChild(btnEasy);

      const btnMed = document.createElement('button');
      btnMed.className = 'buy-btn';
      btnMed.textContent = 'Средне';
      controls.appendChild(btnMed);

      const btnHard = document.createElement('button');
      btnHard.className = 'buy-btn';
      btnHard.textContent = 'Сложно';
      controls.appendChild(btnHard);

      const resultDiv = document.createElement('div');
      resultDiv.style.textAlign = 'center';
      resultDiv.style.marginBottom = '15px';
      resultDiv.id = 'minesweeperResult';

      body.appendChild(controls);
      body.appendChild(resultDiv);

      const board = document.createElement('div');
      board.className = 'ms-board';
      board.style.margin = '0 auto';
      board.style.width = 'fit-content';
      body.appendChild(board);

      let rows, cols, mines, gameState;

      const setup = (r, c, m) => {
        rows = r;
        cols = c;
        mines = m;
        gameState = {
          board: Array(rows * cols).fill(0),
          revealed: Array(rows * cols).fill(false),
          flagged: Array(rows * cols).fill(false),
          gameOver: false,
          won: false
        };

        // Place mines
        let mineCount = 0;
        while (mineCount < mines) {
          const idx = Math.floor(Math.random() * rows * cols);
          if (gameState.board[idx] !== 'X') {
            gameState.board[idx] = 'X';
            mineCount++;
          }
        }

        // Calculate numbers
        for (let i = 0; i < rows * cols; i++) {
          if (gameState.board[i] !== 'X') {
            let count = 0;
            const r = Math.floor(i / cols);
            const c = i % cols;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                  const ni = nr * cols + nc;
                  if (gameState.board[ni] === 'X') count++;
                }
              }
            }
            gameState.board[i] = count;
          }
        }

        resultDiv.innerHTML = '';
        renderBoard();
      };

      const renderBoard = () => {
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${cols}, 36px)`;
        
        for (let i = 0; i < rows * cols; i++) {
          const cell = document.createElement('div');
          cell.className = 'ms-cell';
          
          if (gameState.revealed[i]) {
            cell.classList.add('revealed');
            if (gameState.board[i] === 'X') {
              cell.textContent = '💣';
            } else if (gameState.board[i] > 0) {
              cell.textContent = gameState.board[i];
              cell.style.color = ['#0074ff','#2ecc71','#ff0000','#000080','#8b0000','#008080','#000000','#808080'][gameState.board[i]-1];
            }
          } else if (gameState.flagged[i]) {
            cell.classList.add('flag');
            cell.textContent = '🚩';
          }

          if (!gameState.gameOver && !gameState.won && !gameState.revealed[i]) {
            cell.style.cursor = 'pointer';
            cell.oncontextmenu = (e) => {
              e.preventDefault();
              gameState.flagged[i] = !gameState.flagged[i];
              renderBoard();
            };
            cell.onclick = () => reveal(i);
          }

          board.appendChild(cell);
        }
      };

      const reveal = (idx) => {
        if (gameState.revealed[idx] || gameState.flagged[idx]) return;
        
        if (gameState.board[idx] === 'X') {
          gameState.gameOver = true;
          gameState.revealed.fill(true);
          resultDiv.innerHTML = '<strong>💣 Игра окончена!</strong>';
          gameEngine.award(2, 1);
          renderBoard();
          return;
        }

        const queue = [idx];
        while (queue.length > 0) {
          const i = queue.shift();
          if (gameState.revealed[i]) continue;
          gameState.revealed[i] = true;

          if (gameState.board[i] === 0) {
            const r = Math.floor(i / cols);
            const c = i % cols;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                  queue.push(nr * cols + nc);
                }
              }
            }
          }
        }

        if (gameState.revealed.filter((v, i) => !v && gameState.board[i] !== 'X').length === 0) {
          gameState.won = true;
          resultDiv.innerHTML = '<strong>🎉 Вы победили!</strong>';
          gameEngine.award(10, 8);
        }

        renderBoard();
      };

      btnEasy.onclick = () => setup(6, 6, 6);
      btnMed.onclick = () => setup(9, 9, 10);
      btnHard.onclick = () => setup(12, 12, 30);

      setup(6, 6, 6);
    },

    // ============ ШАХМАТЫ ============
    startChess() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = '♟️ Шахматы (демо)';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const info = document.createElement('div');
      info.textContent = '🚀 Полная реализация шахмат с умным AI будет добавлена скоро!';
      info.style.textAlign = 'center';
      info.style.padding = '20px';
      info.style.background = 'var(--bg-secondary)';
      info.style.borderRadius = '10px';
      info.style.marginBottom = '20px';
      body.appendChild(info);

      const demoBoard = document.createElement('div');
      demoBoard.style.display = 'grid';
      demoBoard.style.gridTemplateColumns = 'repeat(8, 40px)';
      demoBoard.style.gap = '1px';
      demoBoard.style.background = '#999';
      demoBoard.style.padding = '5px';
      demoBoard.style.margin = '0 auto';
      demoBoard.style.borderRadius = '5px';

      for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.style.width = '40px';
        cell.style.height = '40px';
        cell.style.background = (Math.floor(i / 8) + i % 8) % 2 === 0 ? '#f0d9b5' : '#b58863';
        demoBoard.appendChild(cell);
      }

      body.appendChild(demoBoard);
    },

    // ============ ШАШКИ ============
    startCheckers() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = '⚫ Шашки';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const info = document.createElement('div');
      info.textContent = '🎮 Скоро будет реализована игра в шашки!';
      info.style.textAlign = 'center';
      info.style.padding = '20px';
      body.appendChild(info);
    },

    // ============ СУДОКУ ============
    startSudoku() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = '🔢 Судоку';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const info = document.createElement('div');
      info.textContent = '🎯 Генератор судоку скоро запустится!';
      info.style.textAlign = 'center';
      info.style.padding = '20px';
      body.appendChild(info);
    },

    // ============ МОРСКОЙ БОЙ ============
    startBattleship() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = '🚢 Морской бой';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const info = document.createElement('div');
      info.textContent = '⚓ Битва на море скоро начнётся!';
      info.style.textAlign = 'center';
      info.style.padding = '20px';
      body.appendChild(info);
    }
  };

  window.gameEngine = gameEngine;
})();