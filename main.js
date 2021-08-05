'use strict';

let gBoard;
let gGameisOn;
let gCurrGameLvl;
let gSeconds = 0;
let gBestScore = 0;
let gGameTimer;
let gActivator = true;
let gLives;
let gRecursiveLoop = 0;
let gHints = [];
let gSafeSteps = 3;

const BEFORE_GAME_EMOJI = '&#128512';
const IN_GAME_EMOJI = '&#128517';
const SKULL_EMOJI = '&#128128';
const WINNING_EMOJI = '&#129312';
const EXPLODED = '&#128165';
const MINE = '&#128261';
const FLAG = '&#128681';
const FALSE_FLAG = '&#10060';
const HINT = '&#128161';
const USED_HINT = '&#128162';
const LIVES = '&#128151';
const NO_LIVES = '&#128148';
const COUNT_MINES = 'COUNT-MINES';
const REVEAL_NEIGHBORS = 'REVEAL-NEIGHBORS';

const getSmiely = (emoji) => {
    const smiley = document.querySelector('.smiley');
    smiley.innerHTML = emoji
};

const getLivesElement = () => {
    const livesElement = document.querySelector('.lives');
    return livesElement;
};

const getCellElement = (i, j) => {
    const cellElement = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    return cellElement;
};

const createCell = () => {
    return {
        isMine: false,
        isFlagged: false,
        isClicked: false,
    }
};

const init = () => {
    gBoard = createBoard(4);
    renderBoard(gBoard);
    gGameisOn = false;
    gActivator = true;
    gLives = 3;
    const lives = getLivesElement();
    lives.innerHTML = `${LIVES} ${LIVES} ${LIVES}`;
    const zeroTime = document.querySelector('span');
    zeroTime.innerHTML = 0;
    displayBestScore();
    gRecursiveLoop = 0;
    gHints = [];
    resetClues();
};

const resetClues = () => {
    for (let i = 1; i < 4; i++) {
        document.querySelector(`.hint${i}`).innerHTML = HINT;
    }
    gSafeSteps = 3;
    renderSafeStepBtn();
};

const createBoard = (boardSize) => {
    const board = [];
    for (let i = 0; i < boardSize; i++) {
        board.push([])
        for (let j = 0; j < boardSize; j++) {
            board[i][j] = createCell();
            if ((Math.random() > 0.8)) {
                board[i][j].isMine = true;
            }
        }
    }
    return board;
};

const renderBoard = (board) => {
    let strHtml = '';
    for (let i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (let j = 0; j < board[0].length; j++) {
            const cell = board[i][j];
            const className = (cell) ? 'unClicked' : '';

            strHtml += `<td oncontextmenu="flaggedMine(event, this, ${i} , ${j})" class="${className}"
            data-i="${i}" data-j="${j}"
            onclick="cellClickedHandler(this , ${i} , ${j})"
            >${''}</td>`;
        }
        strHtml += '</tr>';
    }

    getSmiely(BEFORE_GAME_EMOJI);
    clearInterval(gGameTimer);
    const boardElement = document.querySelector('.board');
    boardElement.innerHTML = strHtml;
};

const renderCell = (i, j, value) => {
    const cell = gBoard[i][j];
    if (cell.isClicked) return;
    const cellElement = getCellElement(i, j);

    if (value !== FLAG && value !== null) {
        cell.isClicked = true;
        removeAndAddClass(cellElement, 'unClicked', 'clicked');
    };
    updateCellHtmlContent(cellElement, value);
};

const cellClickedHandler = (cellElement, i, j) => {
    let cell;
    try {
        cell = firstClickHandler(i, j, cellElement);
    } catch (error) {
        console.log(error.message);
        return;
    }
    startGame();
    getSmiely(IN_GAME_EMOJI);
    exposeCell(cell, i, j);
    checkForWin(gBoard);
};

const firstClickHandler = (i, j, cellElement) => {
    if (!gActivator || gBoard[i][j].isFlagged) {
        throw new Error('Cannot click on flags OR while game is over');
    }
    const cell = gBoard[i][j];

    if (!gGameisOn) {
        if (cell.isMine) {
            restart();
            cellClickedHandler(cellElement, i, j);
            throw new Error('First click was a mine!')
        };
    };
    return cell;
};

const startGame = () => {
    if (!gGameisOn) {
        gGameisOn = true;
        resetClues();
        timer();
    };
};

const exposeCell = (cell, i, j) => {
    if (cell.isMine) {
        updateLivesAndGameStatus(i, j);
        renderCell(i, j, EXPLODED)
        return;
    } else {
        workOnNeigborCells(i, j);
    }
};

//here I also change the mine to "flag"
const updateLivesAndGameStatus = (i, j) => {
    const lives = getLivesElement();
    if (gLives === 1) {
        gameOver();
        lives.innerHTML = NO_LIVES;
        return;
    } else {
        lives.innerHTML = (gLives > 2) ? `${LIVES} ${LIVES}` : LIVES;
        gBoard[i][j].isFlagged = true;
        gLives--;
    }
    checkForWin(gBoard);
};

const workOnNeigborCells = (i, j) => {
    const neighborMine = neighborCellsActionsHandler(i, j, gBoard, COUNT_MINES);
    (!neighborMine) ? renderCell(i, j, 0) : renderCell(i, j, neighborMine);
    if (!neighborMine) neighborCellsActionsHandler(i, j, gBoard, REVEAL_NEIGHBORS);
    if (neighborMine) gRecursiveLoop = 0;
};

const neighborCellsActionsHandler = (cellI, cellJ, board, request) => {
    let minesCounter = 0;
    for (let i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (let j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            const currCell = board[i][j];

            if (currCell.isMine) minesCounter++;
            if (currCell.isFlagged) continue;
            if (currCell.isClicked) continue;
            if (request === REVEAL_NEIGHBORS) {
                const val = neighborCellsActionsHandler(i, j, gBoard, COUNT_MINES)
                renderCell(i, j, val);
                if (!val) {
                    cellClickedHandler(val, i, j);
                }
            }
        }
    }
    if (request === COUNT_MINES) {
        return minesCounter;
    }
};

const gameOver = () => {
    endGame(SKULL_EMOJI);
    exposeMines();
};

const endGame = (emoji) => {
    gGameisOn = false;
    gActivator = false;
    clearInterval(gGameTimer);
    getSmiely(emoji);
};

const exposeMines = () => {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isFlagged) renderCell(i, j, MINE);
            if (!gBoard[i][j].isMine && gBoard[i][j].isFlagged) renderCell(i, j, FALSE_FLAG);
        }
    }
};

const gameWon = () => {
    endGame(WINNING_EMOJI);
    checkIfBestScore();
};

const checkForWin = (board) => {
    let cellsInBoardCounter = 0;
    let minesCounter = 0;
    let flaggedMinesCounter = 0;
    let clickedCellCounter = 0;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            cellsInBoardCounter++;
            const cell = board[i][j];
            if ((!cell.isClicked) && (!cell.isFlagged)) return;
            if (cell.isMine) minesCounter++;
            if (cell.isMine && cell.isFlagged) flaggedMinesCounter++;
            if (cell.isClicked) clickedCellCounter++;
        }
    }
    if (flaggedMinesCounter === minesCounter) {
        gameWon()
    }
};

const flaggedMine = (ev, cellElement, i, j) => {
    ev.preventDefault();
    if (cellElement.classList.contains('clicked')) return;
    if (!gActivator) return;
    startGame();
    const cell = gBoard[i][j];
    let cellCover;

    if (!cell.isFlagged) {
        cell.isFlagged = true;
        cellCover = FLAG;
    } else {
        cell.isFlagged = false;
        cellCover = null;
    }
    renderCell(i, j, cellCover);
    checkForWin(gBoard);
};

const timer = () => {
    gSeconds = 0;
    const seconds = document.getElementById('seconds-counter');
    const incrementSeconds = () => {
        gSeconds += 1;
        seconds.innerText = gSeconds;
    }
    gGameTimer = setInterval(incrementSeconds, 1000);
};

const restart = () => {
    init();
    chooseLvl(gCurrGameLvl);
};

const chooseLvl = (num) => {
    init();
    if (!num) num = 4;
    gBoard = createBoard(num);
    gCurrGameLvl = num;
    renderBoard(gBoard);
    clearInterval(gGameTimer);
};

const getHint = (num) => {
    if (gHints.includes(num)) return;

    startGame();
    gHints.push(num);
    renderHintIcon(num);

    const randomLocation = getRandomCell();
    let minesCounter = 0;
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine && (!gBoard[i][j].isClicked) && (!gBoard[i][j].isFlagged)) {
                minesCounter++;
                if (minesCounter === randomLocation) {
                    showMine(i, j);
                    return;
                }
            }
        }
    }
};

const renderHintIcon = (hintNumber) => {
    const hintIcon = document.querySelector(`.hint${hintNumber}`)
    hintIcon.innerHTML = USED_HINT;
};

const getRandomCell = () => {
    let factor = 4;
    switch (gCurrGameLvl) {
        case 8: factor = 20;
            break;
        case 12: factor = 35;
            break;
    }
    const randomTargetNum = getRandomIntInclusive(1, factor);
    return randomTargetNum;
};

const showMine = (i, j) => {
    setTimeout(renderCell, 300, i, j, MINE);
    setTimeout(resetCell, 1300, i, j, gBoard);
};

const resetCell = (i, j, board) => {
    const cellElement = getCellElement(i, j);
    adjustCellElement(cellElement, 'clicked', 'unClicked');
    board[i][j].isClicked = false;
};

const safeStep = () => {
    if (!gSafeSteps) return;
    startGame();
    gSafeSteps--;

    const randomLocation = getRandomCell();
    let safeSpotCounter = 0;
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if ((!gBoard[i][j].isMine) && (!gBoard[i][j].isClicked) && (!gBoard[i][j].isFlagged)) {
                safeSpotCounter++;
                if (safeSpotCounter === randomLocation) {
                    markSafeStep(i, j);
                    return;
                }
            }
        }
    }
};

const markSafeStep = (i, j) => {
    renderSafeStepBtn();
    const cellElement = getCellElement(i, j);
    adjustCellElement(cellElement, 'unClicked', 'safeStep');
    setTimeout(() => { cellElement.classList.add('safeStep'); }, 300);
    setTimeout(resetSafeCell, 1300, i, j, gBoard);
};

const renderSafeStepBtn = () => {
    const safeStepBtn = document.querySelector('.safe-step');
    safeStepBtn.innerText = ('' + gSafeSteps + ' safe steps');
};

const resetSafeCell = (i, j, board) => {
    const cellElement = getCellElement(i, j);
    adjustCellElement(cellElement, 'safeStep', 'unClicked');
    board[i][j].isClicked = false;
};

const adjustCellElement = (
    cell, classToRemove, classToAdd, HTMLval = null
) => {
    updateCellHtmlContent(cell, HTMLval)
    removeAndAddClass(cell, classToRemove, classToAdd);
};

const removeAndAddClass = (cell, classToRemove, classToAdd) => {
    cell.classList.remove(classToRemove);
    cell.classList.add(classToAdd);
};

const updateCellHtmlContent = (cell, HTMLval = null) => {
    cell.innerHTML = !HTMLval ? `<td></td>` : `<td>${HTMLval}</td>`;
};

const getScoreElement = () => {
    const scoreElement = document.querySelector('.best-time');
    return scoreElement;
};

const displayBestScore = () => {
    const bestScore = getBestScore();
    const scoreElement = getScoreElement();
    gBestScore = bestScore ? bestScore : 0;
    scoreElement.innerHTML = gBestScore;
};

const checkIfBestScore = () => {
    const scoreElement = getScoreElement();
    if (gBestScore === 0 || gSeconds <= gBestScore) {
        gBestScore = gSeconds
        scoreElement.innerHTML = gBestScore;
        saveScore(gBestScore);
    }
};


