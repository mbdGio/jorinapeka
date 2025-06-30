document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreValue = document.getElementById('score-value');
    const movesValue = document.getElementById('moves-value');
    const levelValue = document.getElementById('level-value');

    const gridSize = 7;
    let board = [];
    let score = 0;
    let moves = 5;
    let level = 1;

    const directions = ['↑', '↓', '←', '→'];

    class Pawn {
        constructor(row, col, isColored) {
            this.row = row;
            this.col = col;
            this.direction = directions[Math.floor(Math.random() * directions.length)];
            this.isColored = isColored;
            this.element = document.createElement('div');
            this.element.classList.add('pawn');
            if (this.isColored) {
                this.element.classList.add('colored');
            }
            this.element.innerHTML = this.direction;
            this.element.addEventListener('click', () => handlePawnClick(this));
        }
    }

    function initBoard() {
        board = [];
        gameBoard.innerHTML = '';
        let coloredPawnsToCreate = 2 + level;
        const totalPawns = gridSize * gridSize;
        const coloredPawnIndices = new Set();
        while(coloredPawnIndices.size < coloredPawnsToCreate) {
            coloredPawnIndices.add(Math.floor(Math.random() * totalPawns));
        }

        for (let i = 0; i < totalPawns; i++) {
            const r = Math.floor(i / gridSize);
            const c = i % gridSize;
            if (!board[r]) {
                board[r] = [];
            }
            const isColored = coloredPawnIndices.has(i);
            const pawn = new Pawn(r, c, isColored);
            board[r][c] = pawn;
            gameBoard.appendChild(pawn.element);
        }
    }

    function handlePawnClick(pawn) {
        if (moves <= 0) return;

        moves--;
        movesValue.textContent = moves;

        let chain = 0;
        let currentRow = pawn.row;
        let currentCol = pawn.col;
        let currentDirection = pawn.direction;

        const movingPawn = document.createElement('div');
        movingPawn.classList.add('moving-pawn');
        movingPawn.innerHTML = currentDirection;
        movingPawn.style.top = `${currentRow * 50}px`;
        movingPawn.style.left = `${currentCol * 50}px`;
        gameBoard.appendChild(movingPawn);

        board[currentRow][currentCol].element.style.visibility = 'hidden';
        board[currentRow][currentCol] = null;

        function move() {
            let nextRow = currentRow;
            let nextCol = currentCol;

            switch (currentDirection) {
                case '↑': nextRow--; break;
                case '↓': nextRow++; break;
                case '←': nextCol--; break;
                case '→': nextCol++; break;
            }

            movingPawn.style.top = `${nextRow * 50}px`;
            movingPawn.style.left = `${nextCol * 50}px`;

            setTimeout(() => {
                if (nextRow < 0 || nextRow >= gridSize || nextCol < 0 || nextCol >= gridSize) {
                    movingPawn.remove();
                    updateBoard(chain);
                    return;
                }

                const nextPawn = board[nextRow][nextCol];

                if (nextPawn) {
                    chain++;
                    score += chain;
                    scoreValue.textContent = score;

                    currentDirection = nextPawn.direction;
                    movingPawn.innerHTML = currentDirection;
                    board[nextRow][nextCol].element.style.visibility = 'hidden';
                    board[nextRow][nextCol] = null;
                    currentRow = nextRow;
                    currentCol = nextCol;
                    move();
                } else {
                    currentRow = nextRow;
                    currentCol = nextCol;
                    move();
                }
            }, 400);
        }
        setTimeout(move, 10);
    }

    function updateBoard(chainLength = 0) {
        const clearedPawns = chainLength + 1; // The eaten pawns + the first pawn
        const bonusMoves = Math.floor(clearedPawns / 10);
        if (bonusMoves > 0) {
            moves += bonusMoves;
            movesValue.textContent = moves;
        }

        // Gravity
        for (let c = 0; c < gridSize; c++) {
            let emptyRow = gridSize - 1;
            for (let r = gridSize - 1; r >= 0; r--) {
                if (board[r][c]) {
                    if (emptyRow !== r) {
                        board[emptyRow][c] = board[r][c];
                        board[r][c] = null;
                        board[emptyRow][c].row = emptyRow;
                    }
                    emptyRow--;
                }
            }
        }

        // Refill
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (!board[r][c]) {
                    const pawn = new Pawn(r, c, false); // New pawns are not colored
                    board[r][c] = pawn;
                }
            }
        }
        renderBoard();
        checkLevelComplete();
    }

    function renderBoard() {
        gameBoard.innerHTML = '';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if(board[r][c]) {
                    const pawn = board[r][c];
                    pawn.element.style.visibility = 'visible';
                    gameBoard.appendChild(pawn.element);
                }
            }
        }
    }

    function checkLevelComplete() {
        const coloredPawns = board.flat().filter(pawn => pawn && pawn.isColored);
        if (coloredPawns.length === 0) {
            level++;
            moves = 5;
            levelValue.textContent = level;
            movesValue.textContent = moves;
            initBoard();
        }
    }

    initBoard();
});