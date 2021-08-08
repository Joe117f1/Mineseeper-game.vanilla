'use strict';

const STORAGE_KEY = 'mineSeeperScore';

const _saveScoreToStorage = (bestScore) => {
    saveToStorage(STORAGE_KEY, bestScore);
}

const saveScore = (bestScore) => {
    _saveScoreToStorage(bestScore);
}

const getBestScore = () => {
    const bestScore = loadFromStorage(STORAGE_KEY);
    return bestScore;
}

const onCellClicked = (cellElement, i, j) => {
    cellClickedHandler(cellElement, i, j);
}
