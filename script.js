document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreValue = document.getElementById('score-value');
    const movesValue = document.getElementById('moves-value');

    const gridSize = 7;
    let board = [];
    let score = 0;
    let moves = 20;

    const directions = ['↑', '↓', '←', '→'];

    class Pawn {
        constructor(row, col) {
            this.row = row;
            this.col = col;
            this.direction = directions[Math.floor(Math.random() * directions.length)];
            this.isColored = Math.random() < 0.2; // 20% chance of being colored
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
        for (let r = 0; r < gridSize; r++) {
            board[r] = [];
            for (let c = 0; c < gridSize; c++) {
                const pawn = new Pawn(r, c);
                board[r][c] = pawn;
                gameBoard.appendChild(pawn.element);
            }
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

        // Create a moving pawn
        const movingPawn = document.createElement('div');
        movingPawn.classList.add('moving-pawn');
        movingPawn.innerHTML = currentDirection;
        movingPawn.style.top = `${currentRow * 50}px`;
        movingPawn.style.left = `${currentCol * 50}px`;
        gameBoard.appendChild(movingPawn);

        // Hide the original pawn
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

            // Move the visual pawn
            movingPawn.style.top = `${nextRow * 50}px`;
            movingPawn.style.left = `${nextCol * 50}px`;

            setTimeout(() => {
                if (nextRow < 0 || nextRow >= gridSize || nextCol < 0 || nextCol >= gridSize) {
                    // Pawn moved off the board
                    movingPawn.remove();
                    updateBoard();
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
                    // Empty cell, continue moving
                    currentRow = nextRow;
                    currentCol = nextCol;
                    move();
                }
            }, 400); // Wait for the animation to finish
        }
        // A small delay to ensure the pawn is rendered before the first move animation
        setTimeout(move, 10);
    }

    function updateBoard() {
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
                    const pawn = new Pawn(r, c);
                    board[r][c] = pawn;
                }
            }
        }
        renderBoard();
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

    initBoard();
});