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
      } catch(e) { console.warn('award failed', e) }
    },

    showModal(title, text) {
      const modal = document.getElementById('modal');
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalText').textContent = text;
      modal.style.display = 'flex';
    },

    // ========== КРЕСТИКИ-НОЛИКИ ==========
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

      let difficulty = 'easy'; // easy, medium, hard
      let state;

      const newGame = () => {
        state = { cells: Array(9).fill(null), turn: 'X', over: false };
        resultDiv.textContent = '';
        render();
      };

      const render = () => {
        board.innerHTML = '';
        state.cells.forEach((v, i) => {
          const cell = document.createElement('div');
          cell.className = 't3-cell' + (v ? ' disabled' : '');
          cell.textContent = v || '';
          cell.onclick = () => {
            if(state.over || state.cells[i]) return;
            state.cells[i] = state.turn;
            checkEnd();
            if(!state.over) {
              state.turn = state.turn === 'X' ? 'O' : 'X';
              render();
              if(!state.over && state.turn === 'O') {
                setTimeout(() => {
                  botMove();
                  state.turn = 'X';
                  render();
                  checkEnd();
                }, 500);
              }
            }
          };
          board.appendChild(cell);
        });
      };

      const checkEnd = () => {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for(const l of lines) {
          const [a,b,c] = l;
          if(state.cells[a] && state.cells[a] === state.cells[b] && state.cells[a] === state.cells[c]) {
            state.over = true;
            highlightWin(l);
            onGameEnd(state.cells[a]);
            return;
          }
        }
        if(state.cells.every(x => x !== null)) {
          state.over = true;
          onGameEnd(null);
        }
      };

      const highlightWin = (line) => {
        const cells = this.qsa('.t3-board .t3-cell');
        line.forEach(i => {
          if(cells[i]) cells[i].classList.add('win');
        });
      };

      const botMove = () => {
        const c = state.cells;
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        
        if(difficulty === 'hard') {
          // Лучшая игра: победить, защитить, центр, углы
          // Победить
          for(const l of lines) {
            const [a,b,d] = l;
            const vals = [c[a], c[b], c[d]];
            if(vals.filter(x => x === 'O').length === 2 && vals.includes(null)) {
              const idx = [a,b,d][vals.indexOf(null)];
              c[idx] = 'O';
              return;
            }
          }
          
          // Защитить
          for(const l of lines) {
            const [a,b,d] = l;
            const vals = [c[a], c[b], c[d]];
            if(vals.filter(x => x === 'X').length === 2 && vals.includes(null)) {
              const idx = [a,b,d][vals.indexOf(null)];
              c[idx] = 'O';
              return;
            }
          }
          
          // Центр - стратегическая позиция
          if(c[4] === null) { c[4] = 'O'; return; }
          
          // Противоположные углы - продвинутая тактика
          const oppPairs = [[0,8],[2,6]];
          for(const [a,b] of oppPairs) {
            if(c[a] === 'X' && c[b] === null) { c[b] = 'O'; return; }
            if(c[b] === 'X' && c[a] === null) { c[a] = 'O'; return; }
          }
          
          // Углы
          const corners = [0,2,6,8];
          const availCorners = corners.filter(i => c[i] === null);
          if(availCorners.length) {
            c[availCorners[Math.floor(Math.random() * availCorners.length)]] = 'O';
            return;
          }
          
          // Стороны
          const sides = [1,3,5,7];
          const avail = sides.filter(i => c[i] === null);
          if(avail.length) {
            c[avail[Math.floor(Math.random() * avail.length)]] = 'O';
          }
        }
        else if(difficulty === 'medium') {
          // Примерно 70% делает хороший ход, 30% рандом
          if(Math.random() < 0.7) {
            // Победить
            for(const l of lines) {
              const [a,b,d] = l;
              const vals = [c[a], c[b], c[d]];
              if(vals.filter(x => x === 'O').length === 2 && vals.includes(null)) {
                const idx = [a,b,d][vals.indexOf(null)];
                c[idx] = 'O';
                return;
              }
            }
            
            // Защитить
            for(const l of lines) {
              const [a,b,d] = l;
              const vals = [c[a], c[b], c[d]];
              if(vals.filter(x => x === 'X').length === 2 && vals.includes(null)) {
                const idx = [a,b,d][vals.indexOf(null)];
                c[idx] = 'O';
                return;
              }
            }
          }
          
          // Рандомный ход
          const avail = c.map((v, i) => v === null ? i : null).filter(x => x !== null);
          if(avail.length) {
            c[avail[Math.floor(Math.random() * avail.length)]] = 'O';
          }
        }
        else { // easy
          // Просто случайный ход
          const avail = c.map((v, i) => v === null ? i : null).filter(x => x !== null);
          if(avail.length) {
            c[avail[Math.floor(Math.random() * avail.length)]] = 'O';
          }
        }
      };

      const onGameEnd = (winner) => {
        if(winner === null) {
          resultDiv.innerHTML = '<div class="game-result-draw">Ничья!</div>';
        } else if(winner === 'X') {
          this.award(10, 5);
          resultDiv.innerHTML = '<div class="game-result-win">Победа! +10 монет</div>';
        } else {
          resultDiv.innerHTML = '<div class="game-result-lose">Поражение!</div>';
        }
      };

      btnNew.onclick = () => newGame();
      difficultyBtn.onclick = () => {
        const levels = ['easy', 'medium', 'hard'];
        const names = ['Легко', 'Среднее', 'Сложно'];
        const idx = levels.indexOf(difficulty);
        const nextIdx = (idx + 1) % levels.length;
        difficulty = levels[nextIdx];
        difficultyBtn.textContent = names[nextIdx];
        newGame();
      };

      newGame();
    },

    // ========== САПЁР ==========
    startMinesweeper() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = 'Сапёр';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const controls = document.createElement('div');
      controls.style.display = 'flex';
      controls.style.gap = '8px';
      controls.style.marginBottom = '15px';
      controls.style.flexWrap = 'wrap';

      const btnEasy = document.createElement('button');
      btnEasy.className = 'shop-tab';
      btnEasy.textContent = '🟩 Легко (6x6)';
      
      const btnMed = document.createElement('button');
      btnMed.className = 'shop-tab';
      btnMed.textContent = '🟩 Среднее (9x9)';
      
      const btnHard = document.createElement('button');
      btnHard.className = 'shop-tab';
      btnHard.textContent = '🟩 Сложно (12x12)';

      const resultDiv = document.createElement('div');
      resultDiv.style.textAlign = 'center';
      resultDiv.style.marginBottom = '10px';
      resultDiv.id = 'minesweeperResult';

      controls.appendChild(btnEasy);
      controls.appendChild(btnMed);
      controls.appendChild(btnHard);
      body.appendChild(controls);
      body.appendChild(resultDiv);

      const boardWrap = document.createElement('div');
      boardWrap.style.marginTop = '10px';
      boardWrap.style.display = 'flex';
      boardWrap.style.justifyContent = 'center';
      body.appendChild(boardWrap);

      let rows = 9, cols = 9, bombs = 10;
      let boardState;
      let gameOver = false;

      const setup = (r, c, b) => {
        rows = r;
        cols = c;
        bombs = b;
        gameOver = false;
        resultDiv.textContent = '';
        initBoard();
      };

      const initBoard = () => {
        const size = rows * cols;
        const cells = Array(size).fill(null).map(() => ({
          mine: false,
          revealed: false,
          flag: false,
          num: 0
        }));

        let placed = 0;
        while(placed < bombs) {
          const idx = Math.floor(Math.random() * size);
          if(!cells[idx].mine) {
            cells[idx].mine = true;
            placed++;
          }
        }

        // Считаем мины рядом
        for(let i = 0; i < size; i++) {
          if(!cells[i].mine) {
            let count = 0;
            const r = Math.floor(i / cols);
            const c = i % cols;
            for(let dr = -1; dr <= 1; dr++) {
              for(let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if(nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                  const nidx = nr * cols + nc;
                  if(cells[nidx].mine) count++;
                }
              }
            }
            cells[i].num = count;
          }
        }

        boardState = { cells };
        render();
      };

      const render = () => {
        boardWrap.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'ms-board';
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.width = Math.min(100, cols * 30) + 'vw';

        boardState.cells.forEach((cell, i) => {
          const el = document.createElement('div');
          el.className = 'ms-cell';
          el.style.cursor = gameOver ? 'default' : 'pointer';

          if(cell.revealed) {
            el.classList.add('revealed');
            if(cell.mine) {
              el.textContent = '💣';
            } else if(cell.num > 0) {
              el.textContent = cell.num;
              el.style.color = ['', 'blue', 'green', 'red', 'darkblue', 'darkred', 'teal', 'black', 'gray'][cell.num];
              el.style.fontWeight = 'bold';
            }
          } else if(cell.flag) {
            el.classList.add('flag');
            el.textContent = '🚩';
          }

          el.onleftclick = el.onclick = () => {
            if(gameOver || cell.revealed || cell.flag) return;
            if(cell.mine) {
              revealAll();
              gameOver = true;
              resultDiv.innerHTML = '<div class="game-result-lose">💣 БУММ! Вы проиграли</div>';
            } else {
              revealRecursive(i);
              render();
              if(checkWin()) {
                gameOver = true;
                this.award(30, 12);
                resultDiv.innerHTML = '<div class="game-result-win">🎉 Победа! +30 монет</div>';
              }
            }
          };

          el.onrightclick = el.oncontextmenu = (e) => {
            e.preventDefault();
            if(!gameOver && !cell.revealed) {
              cell.flag = !cell.flag;
              render();
            }
          };

          grid.appendChild(el);
        });

        boardWrap.appendChild(grid);
      };

      const revealRecursive = (i) => {
        if(boardState.cells[i].revealed || boardState.cells[i].flag) return;
        boardState.cells[i].revealed = true;
        
        if(boardState.cells[i].num === 0) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          for(let dr = -1; dr <= 1; dr++) {
            for(let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if(nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                const nidx = nr * cols + nc;
                revealRecursive(nidx);
              }
            }
          }
        }
      };

      const revealAll = () => {
        boardState.cells.forEach(c => c.revealed = true);
        render();
      };

      const checkWin = () => {
        return boardState.cells.every(c => 
          (c.mine && !c.revealed) || (!c.mine && c.revealed)
        );
      };

      btnEasy.onclick = () => { rows=6; cols=6; setup(rows, cols, 6); };
      btnMed.onclick = () => { rows=9; cols=9; setup(rows, cols, 10); };
      btnHard.onclick = () => { rows=12; cols=12; setup(rows, cols, 30); };

      setup(rows, cols, bombs);
    },

    // ========== ШАХМАТЫ ==========
    startChess() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = '♟️ Шахматы';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const difficultyBtn = document.createElement('button');
      difficultyBtn.className = 'shop-tab';
      difficultyBtn.textContent = 'Уровень: Легко';
      difficultyBtn.style.marginBottom = '15px';
      body.appendChild(difficultyBtn);

      const info = document.createElement('div');
      info.style.textAlign = 'center';
      info.style.marginBottom = '15px';
      info.style.fontSize = '14px';
      info.style.fontWeight = 'bold';
      info.id = 'chessInfo';
      info.textContent = 'Белые (вы): Ваш ход';
      body.appendChild(info);

      const board = document.createElement('div');
      board.style.display = 'grid';
      board.style.gridTemplateColumns = 'repeat(8, 1fr)';
      board.style.gap = '1px';
      board.style.width = '100%';
      board.style.maxWidth = '320px';
      board.style.margin = '0 auto';
      board.style.background = '#333';
      board.style.padding = '4px';
      board.id = 'chessBoard';
      body.appendChild(board);

      const pieces = {
        'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
        'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
      };

      const startPos = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
      ];

      let boardState = startPos.map(row => [...row]);
      let selected = null;
      let whiteTurn = true;
      let difficulty = 'easy';

      const isValidMove = (fr, fc, tr, tc, turn) => {
        const piece = boardState[fr][fc];
        if(!piece) return false;
        if(boardState[tr][tc] && boardState[tr][tc][0] === piece[0]) return false;
        
        const type = piece[1];
        const dr = tr - fr;
        const dc = tc - fc;

        if(type === 'P') {
          const dir = piece[0] === 'w' ? -1 : 1;
          const startRow = piece[0] === 'w' ? 6 : 1;
          if(dc === 0 && boardState[tr][tc] === null) {
            if(dr === dir) return true;
            if(fr === startRow && dr === 2 * dir && boardState[fr+dir][fc] === null) return true;
          }
          if(Math.abs(dc) === 1 && dr === dir && boardState[tr][tc]) return true;
          return false;
        }
        if(type === 'N') {
          return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
        }
        if(type === 'B') {
          if(Math.abs(dr) !== Math.abs(dc)) return false;
          const stepR = dr > 0 ? 1 : -1;
          const stepC = dc > 0 ? 1 : -1;
          for(let i = 1; i < Math.abs(dr); i++) {
            if(boardState[fr + i*stepR][fc + i*stepC]) return false;
          }
          return true;
        }
        if(type === 'R') {
          if(dr !== 0 && dc !== 0) return false;
          const step = dr !== 0 ? (dr > 0 ? 1 : -1) : (dc > 0 ? 1 : -1);
          const len = Math.abs(dr || dc);
          for(let i = 1; i < len; i++) {
            if(boardState[fr + (dr !== 0 ? i*step : 0)][fc + (dc !== 0 ? i*step : 0)]) return false;
          }
          return true;
        }
        if(type === 'Q') {
          if(dr === 0 || dc === 0) {
            const step = dr !== 0 ? (dr > 0 ? 1 : -1) : (dc > 0 ? 1 : -1);
            const len = Math.max(Math.abs(dr), Math.abs(dc));
            for(let i = 1; i < len; i++) {
              if(boardState[fr + (dr !== 0 ? i*step : 0)][fc + (dc !== 0 ? i*step : 0)]) return false;
            }
            return true;
          }
          if(Math.abs(dr) === Math.abs(dc)) {
            const stepR = dr > 0 ? 1 : -1;
            const stepC = dc > 0 ? 1 : -1;
            for(let i = 1; i < Math.abs(dr); i++) {
              if(boardState[fr + i*stepR][fc + i*stepC]) return false;
            }
            return true;
          }
          return false;
        }
        if(type === 'K') {
          return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
        }
        return false;
      };

      const render = () => {
        board.innerHTML = '';
        boardState.forEach((row, r) => {
          row.forEach((piece, c) => {
            const cell = document.createElement('div');
            cell.style.width = '40px';
            cell.style.height = '40px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.background = (r + c) % 2 === 0 ? '#eee' : '#999';
            cell.style.cursor = 'pointer';
            cell.style.fontSize = '24px';
            cell.style.userSelect = 'none';
            
            if(selected && selected.r === r && selected.c === c) {
              cell.style.background = '#ffeb3b';
            }

            if(piece) {
              cell.textContent = pieces[piece];
              cell.onclick = () => {
                if(whiteTurn && piece[0] === 'w' || !whiteTurn && piece[0] === 'b') {
                  selected = { r, c };
                  render();
                } else if(selected) {
                  makeMove(selected.r, selected.c, r, c);
                }
              };
            } else if(selected) {
              cell.style.opacity = '0.5';
              cell.onclick = () => {
                makeMove(selected.r, selected.c, r, c);
              };
            }

            board.appendChild(cell);
          });
        });
      };

      const makeMove = (fr, fc, tr, tc) => {
        if(!isValidMove(fr, fc, tr, tc, whiteTurn)) {
          selected = null;
          render();
          return;
        }

        boardState[tr][tc] = boardState[fr][fc];
        boardState[fr][fc] = null;

        // Превращение пешки
        if(boardState[tr][tc] === 'wP' && tr === 0) boardState[tr][tc] = 'wQ';
        if(boardState[tr][tc] === 'bP' && tr === 7) boardState[tr][tc] = 'bQ';

        selected = null;
        whiteTurn = !whiteTurn;
        info.textContent = (whiteTurn ? 'Белые' : 'Чёрные') + ': Ваш ход';
        render();

        if(!whiteTurn) {
          setTimeout(() => {
            makeBlackMove();
            whiteTurn = true;
            info.textContent = 'Белые: Ваш ход';
            render();
          }, 1000);
        }
      };

      const makeBlackMove = () => {
        const moves = [];
        for(let r = 0; r < 8; r++) {
          for(let c = 0; c < 8; c++) {
            if(boardState[r][c] && boardState[r][c][0] === 'b') {
              for(let tr = 0; tr < 8; tr++) {
                for(let tc = 0; tc < 8; tc++) {
                  if(isValidMove(r, c, tr, tc, false)) {
                    const captureVal = boardState[tr][tc] ? 2 : 0;
                    const piece = boardState[r][c];
                    const targetPiece = boardState[tr][tc];
                    
                    // Оценка хода в зависимости от типа фигуры
                    let score = captureVal;
                    if(piece[1] === 'P' && tr === 7) score += 10; // Превращение пешки
                    if(targetPiece) {
                      // Ценность захватываемых фигур
                      const values = {'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0};
                      score += values[targetPiece[1]] || 0;
                    }
                    
                    moves.push({from: [r,c], to: [tr,tc], score: score});
                  }
                }
              }
            }
          }
        }
        
        if(moves.length > 0) {
          let move;
          if(difficulty === 'hard') {
            // Выбираем ход с лучшим score
            moves.sort((a, b) => b.score - a.score);
            move = moves[0];
          } else if(difficulty === 'medium') {
            // 60% лучший ход, 40% рандом
            if(Math.random() < 0.6) {
              moves.sort((a, b) => b.score - a.score);
              move = moves[0];
            } else {
              move = moves[Math.floor(Math.random() * moves.length)];
            }
          } else {
            // easy - полностью рандом
            move = moves[Math.floor(Math.random() * moves.length)];
          }
          
          const [fr, fc] = move.from;
          const [tr, tc] = move.to;
          boardState[tr][tc] = boardState[fr][fc];
          boardState[fr][fc] = null;
          if(boardState[tr][tc] === 'bP' && tr === 7) boardState[tr][tc] = 'bQ';
        }
      };

      difficultyBtn.onclick = () => {
        const levels = ['easy', 'medium', 'hard'];
        const names = ['Легко', 'Среднее', 'Сложно'];
        const idx = levels.indexOf(difficulty);
        const nextIdx = (idx + 1) % levels.length;
        difficulty = levels[nextIdx];
        difficultyBtn.textContent = 'Уровень: ' + names[nextIdx];
        boardState = startPos.map(row => [...row]);
        selected = null;
        whiteTurn = true;
        info.textContent = 'Белые (вы): Ваш ход';
        render();
      };

      render();
    },

    // ========== ШАШКИ ==========
    startCheckers() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = '⚫ Шашки (русские)';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const difficultyBtn = document.createElement('button');
      difficultyBtn.className = 'shop-tab';
      difficultyBtn.textContent = 'Уровень: Легко';
      difficultyBtn.style.marginBottom = '15px';
      body.appendChild(difficultyBtn);

      const info = document.createElement('div');
      info.style.textAlign = 'center';
      info.style.marginBottom = '15px';
      info.style.fontSize = '14px';
      info.style.fontWeight = 'bold';
      info.id = 'checkersInfo';
      info.textContent = 'Белые: Ваш ход';
      body.appendChild(info);

      const board = document.createElement('div');
      board.style.display = 'grid';
      board.style.gridTemplateColumns = 'repeat(8, 1fr)';
      board.style.gap = '1px';
      board.style.width = '100%';
      board.style.maxWidth = '280px';
      board.style.margin = '0 auto';
      board.style.background = '#333';
      board.id = 'checkersBoard';
      body.appendChild(board);

      let boardState = Array(8).fill(null).map(() => Array(8).fill(null));
      let difficulty = 'easy';
      
      // Инициализация
      for(let r = 0; r < 3; r++) {
        for(let c = 0; c < 8; c++) {
          if((r + c) % 2 === 1) boardState[r][c] = 'b';
        }
      }
      for(let r = 5; r < 8; r++) {
        for(let c = 0; c < 8; c++) {
          if((r + c) % 2 === 1) boardState[r][c] = 'w';
        }
      }

      let selected = null;
      let whiteTurn = true;
      let captureAvailable = false;

      const getCapturesForPiece = (r, c) => {
        const captures = [];
        const piece = boardState[r][c];
        if(!piece) return captures;

        const isWhite = piece[0] === 'w';
        const isKing = piece === 'wK' || piece === 'bK';

        const dirs = isKing ? [[-1,-1],[-1,1],[1,-1],[1,1]] : 
                     isWhite ? [[1,-1],[1,1]] : [[-1,-1],[-1,1]];

        dirs.forEach(([dr, dc]) => {
          const mr = r + dr;
          const mc = c + dc;
          const tr = r + 2*dr;
          const tc = c + 2*dc;

          if(tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            const mid = boardState[mr][mc];
            if(mid && mid[0] !== piece[0] && !boardState[tr][tc]) {
              captures.push([r, c, tr, tc, mr, mc]);
            }
          }
        });

        return captures;
      };

      const hasAnyCapturesForColor = (color) => {
        for(let r = 0; r < 8; r++) {
          for(let c = 0; c < 8; c++) {
            if(boardState[r][c] && boardState[r][c][0] === color) {
              if(getCapturesForPiece(r, c).length > 0) return true;
            }
          }
        }
        return false;
      };

      const render = () => {
        board.innerHTML = '';
        boardState.forEach((row, r) => {
          row.forEach((piece, c) => {
            const cell = document.createElement('div');
            cell.style.width = '35px';
            cell.style.height = '35px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.background = (r + c) % 2 === 0 ? '#f0f0f0' : '#666';
            cell.style.cursor = (r + c) % 2 === 1 ? 'pointer' : 'default';
            cell.style.fontSize = '18px';
            cell.style.fontWeight = 'bold';

            if((r + c) % 2 === 1) {
              if(piece) {
                cell.textContent = piece === 'w' ? '⚪' : piece === 'wK' ? '👑' : piece === 'bK' ? '♛' : '⚫';
                if(selected && selected.r === r && selected.c === c) {
                  cell.style.background = '#ffeb3b';
                }
                const isOurPiece = (whiteTurn && piece[0] === 'w') || (!whiteTurn && piece[0] === 'b');
                if(isOurPiece) {
                  cell.onclick = () => {
                    selected = { r, c };
                    render();
                  };
                }
              } else if(selected) {
                cell.style.opacity = '0.5';
                cell.onclick = () => makeMove(selected.r, selected.c, r, c);
              }
            }

            board.appendChild(cell);
          });
        });
      };

      const makeMove = (fr, fc, tr, tc) => {
        const piece = boardState[fr][fc];
        if(!piece) return;

        const dr = tr - fr;
        const dc = tc - fc;
        const dist = Math.abs(dr);

        const isKing = piece === 'wK' || piece === 'bK';
        let capturedPiece = false;

        if(captureAvailable && dist !== 2) {
          info.textContent = 'Обязательно съешьте шашку!';
          return;
        }

        // Простой ход
        if(dist === 1 && !boardState[tr][tc]) {
          const isWhite = piece[0] === 'w';
          if(!isKing) {
            if(isWhite && dr < 0) {
              boardState[tr][tc] = piece;
              boardState[fr][fc] = null;
            } else if(!isWhite && dr > 0) {
              boardState[tr][tc] = piece;
              boardState[fr][fc] = null;
            } else {
              info.textContent = 'Неверное направление!';
              return;
            }
          } else {
            boardState[tr][tc] = piece;
            boardState[fr][fc] = null;
          }

          // Превращение в дамку
          if(boardState[tr][tc] === 'w' && tr === 7) boardState[tr][tc] = 'wK';
          if(boardState[tr][tc] === 'b' && tr === 0) boardState[tr][tc] = 'bK';
        }
        // Съедание
        else if(dist === 2 && !boardState[tr][tc]) {
          const mr = fr + dr / 2;
          const mc = fc + dc / 2;
          const mid = boardState[mr][mc];
          if(mid && mid[0] !== piece[0]) {
            boardState[tr][tc] = piece;
            boardState[fr][fc] = null;
            boardState[mr][mc] = null;
            capturedPiece = true;

            // Превращение в дамку
            if(boardState[tr][tc] === 'w' && tr === 7) boardState[tr][tc] = 'wK';
            if(boardState[tr][tc] === 'b' && tr === 0) boardState[tr][tc] = 'bK';

            // Проверка доп. съедания
            const morCaptures = getCapturesForPiece(tr, tc);
            if(morCaptures.length > 0) {
              selected = { r: tr, c: tc };
              captureAvailable = true;
              render();
              info.textContent = 'Можно съесть ещё!';
              return;
            }
          } else {
            info.textContent = 'Нельзя там!';
            return;
          }
        } else {
          info.textContent = 'Неверный ход!';
          return;
        }

        selected = null;
        captureAvailable = false;
        whiteTurn = !whiteTurn;
        info.textContent = (whiteTurn ? 'Белые' : 'Чёрные') + ': Ваш ход';
        render();

        if(!whiteTurn) {
          setTimeout(() => {
            makeAIMove();
            whiteTurn = true;
            info.textContent = 'Белые: Ваш ход';
            captureAvailable = false;
            render();
          }, 1000);
        }
      };

      const makeAIMove = () => {
        const moves = [];
        const captures = [];

        for(let r = 0; r < 8; r++) {
          for(let c = 0; c < 8; c++) {
            if(boardState[r][c] === 'b' || boardState[r][c] === 'bK') {
              const pieceCaps = getCapturesForPiece(r, c);
              pieceCaps.forEach(cap => captures.push(cap));

              const piece = boardState[r][c];
              const isKing = piece === 'bK';
              const dirs = isKing ? [[-1,-1],[-1,1],[1,-1],[1,1]] : [[-1,-1],[-1,1]];

              dirs.forEach(([dr, dc]) => {
                const tr = r + dr;
                const tc = c + dc;
                if(tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && !boardState[tr][tc]) {
                  moves.push([r, c, tr, tc]);
                }
              });
            }
          }
        }

        let moveList = captures.length > 0 ? captures : moves;
        
        if(moveList.length > 0) {
          let selectedMove;
          
          if(difficulty === 'hard') {
            // Выбор умного хода: захват > атака на короля > развитие
            if(captures.length > 0) {
              // Приоритет: съесть больше фигур, достичь конца доски
              captures.sort((a, b) => {
                const [, , tr1, tc1] = a;
                const [, , tr2, tc2] = b;
                // Ценность достижения конца доски (tr=0)
                return (tr1 === 0 ? 1000 : 0) - (tr2 === 0 ? 1000 : 0);
              });
              selectedMove = captures[0];
            } else {
              moveList.sort((a, b) => {
                const [, , tr1, tc1] = a;
                const [, , tr2, tc2] = b;
                // Стремимся к центру и вперёд
                const centerDist1 = Math.abs(tr1 - 3.5) + Math.abs(tc1 - 3.5);
                const centerDist2 = Math.abs(tr2 - 3.5) + Math.abs(tc2 - 3.5);
                const forwardBonus1 = -tr1 * 2;
                const forwardBonus2 = -tr2 * 2;
                return (centerDist1 + forwardBonus1) - (centerDist2 + forwardBonus2);
              });
              selectedMove = moveList[0];
            }
          } else if(difficulty === 'medium') {
            // 65% умные ходы, 35% рандом
            if(Math.random() < 0.65 && captures.length > 0) {
              selectedMove = captures[Math.floor(Math.random() * captures.length)];
            } else if(Math.random() < 0.5) {
              moveList.sort((a, b) => {
                const [, , tr1] = a;
                const [, , tr2] = b;
                return -tr1 - (-tr2); // Стремимся вперёд
              });
              selectedMove = moveList[0];
            } else {
              selectedMove = moveList[Math.floor(Math.random() * moveList.length)];
            }
          } else {
            // easy - просто рандом
            selectedMove = moveList[Math.floor(Math.random() * moveList.length)];
          }

          if(selectedMove.length === 6) {
            const [fr, fc, tr, tc, mr, mc] = selectedMove;
            boardState[tr][tc] = boardState[fr][fc];
            boardState[fr][fc] = null;
            boardState[mr][mc] = null;
            if(boardState[tr][tc] === 'b' && tr === 0) boardState[tr][tc] = 'bK';
          } else {
            const [fr, fc, tr, tc] = selectedMove;
            boardState[tr][tc] = boardState[fr][fc];
            boardState[fr][fc] = null;
            if(boardState[tr][tc] === 'b' && tr === 0) boardState[tr][tc] = 'bK';
          }
        }
      };

      difficultyBtn.onclick = () => {
        const levels = ['easy', 'medium', 'hard'];
        const names = ['Легко', 'Среднее', 'Сложно'];
        const idx = levels.indexOf(difficulty);
        const nextIdx = (idx + 1) % levels.length;
        difficulty = levels[nextIdx];
        difficultyBtn.textContent = 'Уровень: ' + names[nextIdx];
        
        boardState = Array(8).fill(null).map(() => Array(8).fill(null));
        for(let r = 0; r < 3; r++) {
          for(let c = 0; c < 8; c++) {
            if((r + c) % 2 === 1) boardState[r][c] = 'b';
          }
        }
        for(let r = 5; r < 8; r++) {
          for(let c = 0; c < 8; c++) {
            if((r + c) % 2 === 1) boardState[r][c] = 'w';
          }
        }
        selected = null;
        whiteTurn = true;
        info.textContent = 'Белые: Ваш ход';
        render();
      };

      render();
    },

    // ========== СУДОКУ ==========
    startSudoku() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = '🔢 Судоку';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      // Сложная судоку
      const puzzle = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
      ];

      const solution = [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
      ];

      let grid = puzzle.map(row => [...row]);
      let userGrid = puzzle.map(row => [...row]);

      const board = document.createElement('div');
      board.style.display = 'grid';
      board.style.gridTemplateColumns = 'repeat(9, 1fr)';
      board.style.gap = '1px';
      board.style.width = '100%';
      board.style.maxWidth = '280px';
      board.style.margin = '0 auto 15px';
      board.style.background = '#999';
      board.style.padding = '4px';
      board.id = 'sudokuBoard';
      body.appendChild(board);

      const infoDiv = document.createElement('div');
      infoDiv.style.textAlign = 'center';
      infoDiv.style.fontSize = '14px';
      infoDiv.style.marginBottom = '10px';
      infoDiv.id = 'sudokuInfo';
      body.appendChild(infoDiv);

      const btnNew = document.createElement('button');
      btnNew.className = 'buy-btn';
      btnNew.textContent = 'Новая игра';
      btnNew.style.width = '100%';
      body.appendChild(btnNew);

      const render = () => {
        board.innerHTML = '';
        userGrid.forEach((row, r) => {
          row.forEach((val, c) => {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = '1';
            cell.style.width = '30px';
            cell.style.height = '30px';
            cell.style.textAlign = 'center';
            cell.style.fontSize = '14px';
            cell.style.fontWeight = 'bold';
            cell.style.border = '1px solid #ccc';
            cell.style.borderRight = (c + 1) % 3 === 0 ? '2px solid #333' : '1px solid #ccc';
            cell.style.borderBottom = (r + 1) % 3 === 0 ? '2px solid #333' : '1px solid #ccc';
            cell.style.borderLeft = c % 3 === 0 ? '2px solid #333' : '1px solid #ccc';
            cell.style.borderTop = r % 3 === 0 ? '2px solid #333' : '1px solid #ccc';
            cell.style.padding = '0';

            if(puzzle[r][c] !== 0) {
              cell.value = puzzle[r][c];
              cell.disabled = true;
              cell.style.background = '#f0f0f0';
              cell.style.cursor = 'default';
            } else {
              cell.value = val || '';
              cell.onchange = () => {
                userGrid[r][c] = cell.value ? parseInt(cell.value) : 0;
                checkSudoku();
              };
            }

            board.appendChild(cell);
          });
        });
      };

      const checkSudoku = () => {
        let complete = true;
        for(let r = 0; r < 9; r++) {
          for(let c = 0; c < 9; c++) {
            if(userGrid[r][c] === 0) {
              complete = false;
              break;
            }
            if(userGrid[r][c] !== solution[r][c]) {
              infoDiv.textContent = '❌ Есть ошибки';
              infoDiv.style.color = 'red';
              return;
            }
          }
        }
        if(complete) {
          infoDiv.innerHTML = '<div class="game-result-win">🎉 Судоку решена! +50 монет</div>';
          this.award(50, 15);
        }
      };

      btnNew.onclick = () => {
        userGrid = puzzle.map(row => [...row]);
        infoDiv.textContent = '';
        render();
      };

      render();
    },

    // ========== МОРСКОЙ БОЙ ==========
    startBattleship() {
      const body = this.qs('#gamesContent');
      body.innerHTML = '';

      const title = document.createElement('div');
      title.className = 'ef-game-title';
      title.textContent = '🚢 Морской бой';
      title.style.marginBottom = '15px';
      body.appendChild(title);

      const difficultyBtn = document.createElement('button');
      difficultyBtn.className = 'shop-tab';
      difficultyBtn.textContent = 'Уровень: Легко';
      difficultyBtn.style.marginBottom = '15px';
      body.appendChild(difficultyBtn);

      const info = document.createElement('div');
      info.style.textAlign = 'center';
      info.style.marginBottom = '15px';
      info.style.fontSize = '14px';
      info.id = 'battleshipInfo';
      info.textContent = 'Ваш ход - атакуйте поле противника';
      body.appendChild(info);

      const container = document.createElement('div');
      container.style.display = 'grid';
      container.style.gridTemplateColumns = '1fr 1fr';
      container.style.gap = '15px';
      container.style.marginBottom = '15px';
      body.appendChild(container);

      const playerLabel = document.createElement('div');
      playerLabel.style.textAlign = 'center';
      playerLabel.style.fontWeight = 'bold';
      playerLabel.style.fontSize = '12px';
      playerLabel.textContent = 'Ваш флот';
      container.appendChild(playerLabel);

      const enemyLabel = document.createElement('div');
      enemyLabel.style.textAlign = 'center';
      enemyLabel.style.fontWeight = 'bold';
      enemyLabel.style.fontSize = '12px';
      enemyLabel.textContent = 'Флот врага';
      container.appendChild(enemyLabel);

      const playerBoard = document.createElement('div');
      playerBoard.style.display = 'grid';
      playerBoard.style.gridTemplateColumns = 'repeat(5, 1fr)';
      playerBoard.style.gap = '2px';
      playerBoard.id = 'playerBoard';
      container.appendChild(playerBoard);

      const enemyBoard = document.createElement('div');
      enemyBoard.style.display = 'grid';
      enemyBoard.style.gridTemplateColumns = 'repeat(5, 1fr)';
      enemyBoard.style.gap = '2px';
      enemyBoard.id = 'enemyBoard';
      container.appendChild(enemyBoard);

      const size = 5;
      let playerCells = Array(size * size).fill(0);
      let enemyCells = Array(size * size).fill(0);
      let playerHealth = 6;
      let enemyHealth = 6;
      let difficulty = 'easy';
      let lastHitIdx = -1;
      let hitStreak = [];

      const placeShips = (cells) => {
        const ships = [3, 2, 1];
        ships.forEach(len => {
          let placed = false;
          while(!placed) {
            const horizontal = Math.random() > 0.5;
            const startRow = Math.floor(Math.random() * size);
            const startCol = Math.floor(Math.random() * size);

            let canPlace = true;
            for(let i = 0; i < len; i++) {
              const idx = horizontal ?
                startRow * size + startCol + i :
                (startRow + i) * size + startCol;
              if(idx >= cells.length || cells[idx] !== 0) {
                canPlace = false;
                break;
              }
            }

            if(canPlace) {
              for(let i = 0; i < len; i++) {
                const idx = horizontal ?
                  startRow * size + startCol + i :
                  (startRow + i) * size + startCol;
                cells[idx] = 1;
              }
              placed = true;
            }
          }
        });
      };

      placeShips(playerCells);
      placeShips(enemyCells);

      const renderBoards = () => {
        playerBoard.innerHTML = '';
        playerCells.forEach((v, i) => {
          const el = document.createElement('div');
          el.style.width = '35px';
          el.style.height = '35px';
          el.style.background = v === 2 ? '#ff7b7b' : v === 1 ? '#90caf9' : '#e0e0e0';
          el.style.borderRadius = '4px';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.fontSize = '12px';
          el.textContent = v === 2 ? '✕' : v === 1 ? '🚢' : '';
          playerBoard.appendChild(el);
        });

        enemyBoard.innerHTML = '';
        enemyCells.forEach((v, i) => {
          const el = document.createElement('div');
          el.style.width = '35px';
          el.style.height = '35px';
          el.style.background = v === 3 ? '#ff7b7b' : v === 2 ? '#b3e5fc' : '#90caf9';
          el.style.borderRadius = '4px';
          el.style.cursor = 'pointer';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.fontSize = '12px';
          el.style.transition = 'all .2s';

          if(v === 2) el.textContent = '✓';
          if(v === 3) el.textContent = '✕';

          el.onmouseover = () => {
            if(v !== 2 && v !== 3) el.style.background = '#ffd54f';
          };

          el.onmouseout = () => {
            if(v !== 2 && v !== 3) el.style.background = '#90caf9';
          };

          el.onclick = () => {
            if(v === 2 || v === 3) return;
            if(enemyCells[i] === 1) {
              enemyCells[i] = 3;
              enemyHealth--;
              lastHitIdx = i;
              info.textContent = '✓ Попадание!';
              if(enemyHealth === 0) {
                this.award(40, 20);
                info.innerHTML = '<div class="game-result-win">🎉 Все корабли потоплены! +40 монет</div>';
              } else {
                setTimeout(() => botAttack(), 1000);
              }
            } else {
              enemyCells[i] = 2;
              info.textContent = '✗ Промах!';
              setTimeout(() => botAttack(), 1000);
            }
            renderBoards();
          };

          enemyBoard.appendChild(el);
        });
      };

      const botAttack = () => {
        let idx;
        
        if(difficulty === 'hard') {
          // Умная атака: ищем и охотимся за корабль
          if(lastHitIdx >= 0 && playerCells[lastHitIdx] === 2) {
            const r = Math.floor(lastHitIdx / size);
            const c = lastHitIdx % size;
            
            // Проверяем соседние клетки в направлении удара
            const neighbors = [
              r > 0 ? lastHitIdx - size : -1,
              r < size - 1 ? lastHitIdx + size : -1,
              c > 0 ? lastHitIdx - 1 : -1,
              c < size - 1 ? lastHitIdx + 1 : -1
            ].filter(x => x >= 0 && (playerCells[x] === 0 || playerCells[x] === 1));
            
            if(neighbors.length > 0) {
              idx = neighbors[Math.floor(Math.random() * neighbors.length)];
            }
          }
          
          if(!idx && idx !== 0) {
            // Паттернная атака - атакуем через клетку для максимальной вероятности
            const available = [];
            for(let i = 0; i < size * size; i++) {
              if(playerCells[i] === 0 || playerCells[i] === 1) {
                const r = Math.floor(i / size);
                const c = i % size;
                if((r + c) % 2 === 0) available.push(i); // Шахматный паттерн
              }
            }
            idx = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
          }
        }
        else if(difficulty === 'medium') {
          // 60% умная атака, 40% рандом
          if(lastHitIdx >= 0 && Math.random() < 0.6) {
            const r = Math.floor(lastHitIdx / size);
            const c = lastHitIdx % size;
            const neighbors = [
              r > 0 ? lastHitIdx - size : -1,
              r < size - 1 ? lastHitIdx + size : -1,
              c > 0 ? lastHitIdx - 1 : -1,
              c < size - 1 ? lastHitIdx + 1 : -1
            ].filter(x => x >= 0 && (playerCells[x] === 0 || playerCells[x] === 1));
            
            if(neighbors.length > 0) {
              idx = neighbors[Math.floor(Math.random() * neighbors.length)];
            }
          }
          
          if(!idx && idx !== 0) {
            const available = playerCells.map((v, i) => v === 0 || v === 1 ? i : null).filter(x => x !== null);
            idx = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
          }
        }
        else { // easy
          // Просто рандом
          const available = playerCells.map((v, i) => v === 0 || v === 1 ? i : null).filter(x => x !== null);
          idx = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : -1;
        }

        if(idx >= 0) {
          if(playerCells[idx] === 1) {
            playerCells[idx] = 2;
            lastHitIdx = idx;
            playerHealth--;
            info.textContent = '💥 Вас поразили!';
            if(playerHealth === 0) {
              info.textContent = '😔 Вы проиграли!';
            }
          } else {
            playerCells[idx] = 2;
            lastHitIdx = -1;
            info.textContent = '😊 Противник промахнулся';
          }
          renderBoards();
        }
      };

      difficultyBtn.onclick = () => {
        const levels = ['easy', 'medium', 'hard'];
        const names = ['Легко', 'Среднее', 'Сложно'];
        const idx = levels.indexOf(difficulty);
        const nextIdx = (idx + 1) % levels.length;
        difficulty = levels[nextIdx];
        difficultyBtn.textContent = 'Уровень: ' + names[nextIdx];
        
        playerCells = Array(size * size).fill(0);
        enemyCells = Array(size * size).fill(0);
        playerHealth = 6;
        enemyHealth = 6;
        lastHitIdx = -1;
        hitStreak = [];
        placeShips(playerCells);
        placeShips(enemyCells);
        info.textContent = 'Ваш ход - атакуйте поле противника';
        renderBoards();
      };

      renderBoards();
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    // Инициализация игр
  });

})();
