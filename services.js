'use strict';

const STORAGE_KEY = 'mineSeeperScore';

const _saveScoreToStorage = (bestScore) => {
    saveToStorage(STORAGE_KEY, bestScore);
};

const saveScore = (bestScore) => {
    _saveScoreToStorage(bestScore);
};

const getBestScore = () => {
    const bestScore = loadFromStorage(STORAGE_KEY);
    return bestScore;
};

const onCellClicked = (cellElement, i, j) => {
    cellClickedHandler(cellElement, i, j);
};

// let gBoard;
// let gGameisOn;
// let gCurrGameLvl;
// let gSeconds = 0;
// let gBestScore = Infinity;
// let gGameTimer; //was named gCancel
// let gActivator = true;
// let gLives;
// let gRecursiveLoop = 0;
// let gHints = [];
// let gSafeSteps = 3;

// const BEFORE_GAME_EMOJI = '&#128512';
// const IN_GAME_EMOJI = '&#128517';
// const SKULL_EMOJI = '&#128128';
// const WINNING_EMOJI = '&#129312';
// const EXPLODED = '&#128165';
// const MINE = '&#128261';
// const FLAG = '&#128681';
// const FALSE_FLAG = '&#10060';
// const HINT = '&#128161';
// const USED_HINT = '&#128162';
// const LIVES = '&#128151';
// const NO_LIVES = '&#128148';
// const COUNT_MINES = 'COUNT-MINES';
// const REVEAL_NEIGHBORS = 'REVEAL-NEIGHBORS';
// //if(check hint) &#128561 //optional

// const createCell = () => {
//     return {
//         isMine: false,
//         isFlagged: false,
//         isClicked: false,
//     }
// };

// const createBoard = (boardSize) => {
//     const board = [];
//     for (let i = 0; i < boardSize; i++) {
//         board.push([])
//         for (let j = 0; j < boardSize; j++) {
//             board[i][j] = createCell();
//             if ((Math.random() > 0.8)) {
//                 board[i][j].isMine = true;
//             }
//         }
//     }
//     return board;
// };


// const cellClickedHandler = (cellElement, i, j) => {
//     let cell;
//     try {
//         cell = firstClickHandler(i, j, cellElement);
//     } catch (error) {
//         console.log(error.message);
//         return;
//     }
//     startGame();
//     getSmiely(IN_GAME_EMOJI);
//     exposeCell(cell, i, j);
//     checkForWin(gBoard);
// };

// const firstClickHandler = (i, j, cellElement) => {
//     if (!gActivator || gBoard[i][j].isFlagged) {
//         throw new Error('Cannot click on flags OR while game is over');
//     }
//     const cell = gBoard[i][j];

//     if (!gGameisOn) {
//         if (cell.isMine) {
//             restart();
//             cellClickedHandler(cellElement, i, j);
//             throw new Error('First click was a mine!')
//         };
//     };
//     return cell;
// };