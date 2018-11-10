var wins = [];      // 赢法统计数组
var count = 0;      // 赢法统计数组的计数器
const AI = 2;
const EMPTY = 0;
const HUMAN = 1;
const MIN = Number.MIN_SAFE_INTEGER;
const MAX = Number.MAX_SAFE_INTEGER;

// 初始化赢法统计数组
for (var i = 0; i < 15; i++) {
    wins[i] = [];
    for (var j = 0; j < 15; j++) {
        wins[i][j] = []
    }
}

var humanWin = [];
var aiWin = [];

// 阳线纵向90°的赢法
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i][j + k][count] = true;
        }
        count++;
    }
}

// 阳线横向0°的赢法
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[j + k][i][count] = true;
        }
        count++;
    }
}

// 阴线斜向135°的赢法
for (var i = 0; i < 11; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j + k][count] = true;
        }
        count++;
    }
}

// 阴线斜向45°的赢法
for (var i = 0; i < 11; i++) {
    for (var j = 14; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j - k][count] = true;
        }
        count++;
    }
}

const evaluate = (board) => {
    let humanScore = 0;
    let aiScore = 0;
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (board[i][j] == AI) {
                aiScore += evaluateScore(aiWin, i, j);
            } else if (board[i][j] == HUMAN) {
                humanScore += evaluateScore(humanWin, i, j);
            }
        }
    }
    return aiScore - humanScore;
};

const evaluateScore = (win, x, y) => {
    let score = 0;
    for (let k = 0; k < count; k++) {
        if (wins[x][y][k]) {
            if (win[k] == 1) {
                score += 1;
            } else if (win[k] == 2) {
                score += 30;
            } else if (win[k] == 3) {
                score += 900;
            } else if (win[k] == 4) {
                score += 27000;
            } else if (win[k] == 5) {
                score += 81000;
            }
        }
    }
    return score;
};

const gen = (board, deep) => {
    let points = [];
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (board[i][j] == EMPTY) {
                points.push([i, j]);
            }
        }
    }
    return points;
};

const maxmin = (board, deep) => {
    let best = MIN;
    let points = gen(board, deep);
    let bestPoints = [];

    for (let i = 0; i < points.length; i++) {
        let point = points[i];
        board[point[0]][point[1]] = AI; // AI 尝试放置一粒棋子
        let lastHumanWin = []; // 记录 humanWin 的原本状态
        for (var k = 0; k < count; k++) {
            if (wins[point[0]][point[1]][k]) {
                aiWin[k]++;
                lastHumanWin.push(humanWin[k]);
                humanWin[k] = 6;
            }
    
        }
        let v = min(board, deep - 1, best); // AI 假设 HUMAN 的下一步走棋会使 AI 的整体得分最少
        // 如果跟当前最佳得分相同, 则将当前位置加入最佳待选位置
        if (v == best) {
            bestPoints.push(point);
        }
        // AI 会从一系列得分中选出最高得分
        if (v > best) {
            best = v;
            bestPoints = [];
            bestPoints.push(point);
        }
        board[point[0]][point[1]] = EMPTY;
        for (var k = 0; k < count; k++) {
            if (wins[point[0]][point[1]][k]) {
                aiWin[k]--;
                humanWin[k] = lastHumanWin.shift();
            }
    
        }
    }
    console.log(best);
    return bestPoints[Math.floor(bestPoints.length * Math.random())];
};

const min = (board, deep, alpha) => {
    let best = MAX;
    const points = gen(board, deep);

    for (let i = 0; i < points.length; i++) {
        let point = points[i];
        board[point[0]][point[1]] = HUMAN; // HUMAN 尝试放置一粒棋子
        let lastAiWin= []; // 记录 humanWin 的原本状态
        for (var k = 0; k < count; k ++) {
            if (wins[point[0]][point[1]][k]) {
                humanWin[k]++;
                lastAiWin.push(aiWin[k]);
                aiWin[k] = 6;
            }
    
        }
        // 由于 evaluate 函数的评分角度是 AI 角度, 所以 evaluate 函数返回值越大, 表示 HUMAN 得分越少
        let v = max(board, deep - 1, best); // HUMAN 假设 AI 的下一步走棋会使 HUMAN 的整体得分最少
        board[point[0]][point[1]] = EMPTY; // 棋盘还原
        for (var k = 0; k < count; k ++) {
            if (wins[point[0]][point[1]][k]) {
                humanWin[k]--;
                aiWin[k] = lastAiWin.shift();
            }
    
        }
        // HUMAN 得分越高, 则值越小
        if (v < best) {
            best = v;
        }
        if (best < alpha) {
            return best;
        }
    }
    return best;
};

const max = (board, deep, beta) => {
    let v = evaluate(board);
    if (deep <= 0) {
        return v;
    }
    
    let best = MIN;
    const points = gen(board, deep);

    for (let i = 0; i < points.length; i++) {
        let point = points[i];
        board[point[0]][point[1]] = AI;
        let lastHumanWin = 0;
        for (var k = 0; k < count; k ++) {
            if (wins[point[0]][point[1]][k]) {
                aiWin[k]++;
                lastHumanWin.push(humanWin[k]);
                humanWin[k] = 6;
            }
    
        }
        let v = min(board, deep - 1);
        board[point[0]][point[1]] = EMPTY;
        for (var k = 0; k < count; k ++) {
            if (wins[point[0]][point[1]][k]) {
                aiWin[k]--;
                humanWin[k] = lastHumanWin.shift();
            }
    
        }
        if (v > best) {
            best = v;
        }
        if (best > beta) {
            return best;
        }
    }
    return best;
};

/**
 * AI
 */
function ai() {
    if (over) {
        return;
    }

    const point = maxmin(board, 2);
    // debugger;
    oneStep(point[0], point[1], false);
    board[point[0]][point[1]] = 2;

    for (var k = 0; k < count; k++) {
        if (wins[point[0]][point[1]][k]) {
            aiWin[k] ++;
            humanWin[k] = 6;
            if (aiWin[k] == 5) {
                window.alert("You Fail!");
                over = true;
            }
        }
    }

    if (!over) {
       me = !me;
    }

}
