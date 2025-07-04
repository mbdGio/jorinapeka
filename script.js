document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreValue = document.getElementById('score-value');
    const movesValue = document.getElementById('moves-value');
    const levelValue = document.getElementById('level-value');

    const gridSize = 7;
    const pawnSize = 50;
    let board = [];
    let coloredPositions = [];
    let score = 0;
    let moves = 5;
    let level = 1;
    let isChainActive = false;

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
            positionPawn(this);
            gameBoard.appendChild(this.element);
        }
    }

    function positionPawn(pawn) {
        pawn.element.style.top = `${pawn.row * pawnSize}px`;
        pawn.element.style.left = `${pawn.col * pawnSize}px`;
    }

    function initBoard() {
        board = [];
        coloredPositions = [];
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
                coloredPositions[r] = [];
            }
            const isColored = coloredPawnIndices.has(i);
            coloredPositions[r][c] = isColored;
            const pawn = new Pawn(r, c, isColored);
            board[r][c] = pawn;
        }
    }

    function handlePawnClick(pawn) {
        if (pawn.isColored || moves <= 0 || isChainActive) return;

        isChainActive = true;
        moves--;
        movesValue.textContent = moves;

        let scoreMultiplier = 1;
        let currentRow = pawn.row;
        let currentCol = pawn.col;
        let currentDirection = pawn.direction;
        const clearedPawns = [];

        const movingPawn = document.createElement('div');
        movingPawn.classList.add('moving-pawn');
        movingPawn.innerHTML = currentDirection;
        movingPawn.style.top = `${currentRow * pawnSize}px`;
        movingPawn.style.left = `${currentCol * pawnSize}px`;
        gameBoard.appendChild(movingPawn);

        clearedPawns.push(board[currentRow][currentCol]);
        board[currentRow][currentCol].element.style.visibility = 'hidden';
        if (board[currentRow][currentCol].isColored) {
            coloredPositions[currentRow][currentCol] = false;
        }
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

            movingPawn.style.top = `${nextRow * pawnSize}px`;
            movingPawn.style.left = `${nextCol * pawnSize}px`;

            setTimeout(() => {
                if (nextRow < 0 || nextRow >= gridSize || nextCol < 0 || nextCol >= gridSize) {
                    movingPawn.remove();
                    updateBoard(clearedPawns);
                    return;
                }

                const nextPawn = board[nextRow][nextCol];

                if (nextPawn) {
                    let pointsGained;
                    if (nextPawn.isColored) {
                        pointsGained = 5 * scoreMultiplier;
                        scoreMultiplier *= 2;
                    } else {
                        pointsGained = 1 * scoreMultiplier;
                    }
                    score += pointsGained;
                    scoreValue.textContent = score;
                    displayFloatingPoints(pointsGained);

                    clearedPawns.push(nextPawn);
                    // Check for bonus moves every 10 cleared pawns
                    if (clearedPawns.length > 0 && clearedPawns.length % 10 === 0) {
                        moves += 1;
                        movesValue.textContent = moves;
                        displayFloatingMoves(1);
                    }

                    currentDirection = nextPawn.direction;
                    movingPawn.innerHTML = currentDirection;
                    nextPawn.element.style.visibility = 'hidden';
                    if (nextPawn.isColored) {
                        coloredPositions[nextRow][nextCol] = false;
                    }
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

    function displayFloatingPoints(points) {
        const floatingPoints = document.createElement('div');
        floatingPoints.classList.add('floating-points');
        floatingPoints.textContent = `+${points}`;

        const scoreRect = scoreValue.getBoundingClientRect();
        floatingPoints.style.left = `${scoreRect.right}px`;
        floatingPoints.style.top = `${scoreRect.top}px`;

        document.body.appendChild(floatingPoints);

        floatingPoints.addEventListener('animationend', () => {
            floatingPoints.remove();
        });
    }

    function displayFloatingMoves(amount) {
        const floatingMoves = document.createElement('div');
        floatingMoves.classList.add('floating-points'); // Reusing the same animation class
        floatingMoves.textContent = `+${amount}`;
        floatingMoves.style.color = 'blue'; // Differentiate from points

        const movesRect = movesValue.getBoundingClientRect();
        floatingMoves.style.left = `${movesRect.right}px`;
        floatingMoves.style.top = `${movesRect.top}px`;

        document.body.appendChild(floatingMoves);

        floatingMoves.addEventListener('animationend', () => {
            floatingMoves.remove();
        });
    }

    function updateBoard(clearedPawns = []) {

        // Gravity with animation
        for (let c = 0; c < gridSize; c++) {
            let emptyRow = gridSize - 1;
            for (let r = gridSize - 1; r >= 0; r--) {
                if (board[r][c]) {
                    if (emptyRow !== r) {
                        const pawnToMove = board[r][c];
                        board[emptyRow][c] = pawnToMove;
                        board[r][c] = null;
                        pawnToMove.row = emptyRow;

                        // Immediately update color based on the destination
                        const isNowColored = coloredPositions[emptyRow][c];
                        pawnToMove.isColored = isNowColored;
                        if (isNowColored) {
                            pawnToMove.element.classList.add('colored');
                        } else {
                            pawnToMove.element.classList.remove('colored');
                        }

                        positionPawn(pawnToMove);
                    }
                    emptyRow--;
                }
            }
        }

        // Refill after a delay
        setTimeout(() => {
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    if (!board[r][c]) {
                        const isColored = coloredPositions[r][c];
                        const pawn = new Pawn(r, c, isColored);
                        board[r][c] = pawn;
                        // Animate new pawns falling from the top
                        pawn.element.style.top = `-${pawnSize}px`;
                        setTimeout(() => positionPawn(pawn), 10);
                    }
                }
            }
            renderBoard();
            checkLevelComplete();
            isChainActive = false;
        }, 300); // Delay to allow falling animation to finish
    }

    function renderBoard() {
        // The board is now rendered as pawns are created and moved
        // This function can be used for any additional rendering needs
        // but for now, we will just update the colors
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if(board[r][c]) {
                    const pawn = board[r][c];
                    if (coloredPositions[r][c]) {
                        pawn.element.classList.add('colored');
                        pawn.isColored = true;
                    } else {
                        pawn.element.classList.remove('colored');
                        pawn.isColored = false;
                    }
                }
            }
        }
    }

    function checkLevelComplete() {
        const coloredPawns = board.flat().filter(pawn => pawn && pawn.isColored);
        if (coloredPawns.length === 0) {
            const bonusPoints = (moves + 1) * 10;
            score += bonusPoints;
            scoreValue.textContent = score;

            const bonusOverlay = document.getElementById('bonus-overlay');
            const bonusMessage = document.getElementById('bonus-message');
            bonusMessage.innerHTML = `BONUS POINTS: ${bonusPoints}`;
            bonusOverlay.style.display = 'block';

            setTimeout(() => {
                bonusOverlay.style.display = 'none';
                level++;
                moves = 5;
                levelValue.textContent = level;
                movesValue.textContent = moves;
                initBoard();
            }, 2000); // Corresponds to the animation duration
        }
    }

    initBoard();
});