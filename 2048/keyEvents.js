// Functions

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }   
    return "";
}

function newGame() {
    mat = [[0, 0, 0, 0],
           [0, 0, 0, 0],
           [0, 0, 0, 0],
           [0, 0, 0, 0]];
    addTile(mat);
    addTile(mat);
    return mat
}

function addTile(mat) {
    let options = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (mat[i][j] === 0) {
                options.push({x: i, y: j});
            }
        }
    }
    if (options.length > 0) {
        let spot = options[Math.floor(Math.random()*options.length)];
        let r = Math.random();
        mat[spot.x][spot.y] = r > 0.1 ? 2 : 4;
    }
    return mat;
}

function updateTable(mat) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let cell = document.getElementById(i.toString() + j.toString());
            cell.innerHTML = mat[i][j] === 0 ? "" : mat[i][j];
            cell.className = mat[i][j] === 0 ? "cell" : "cell _" + mat[i][j];
        }
    }
}

function updateScore(score) {
    bestScore = Math.max(score, bestScore);
    document.getElementById("score").innerHTML = "Score: " + score;
    document.getElementById("bestScore").innerHTML = "Best Score: " + bestScore;

    setCookie("bestScore", bestScore);
}

function compressRow(row) {
    let newRow = [0, 0, 0, 0];
    let changed = false;
    let pos = 0;
    for (let i = 0; i < 4; i++) {
        if (row[i] !== 0) {
            newRow[pos] = row[i];
            if (i !== pos) {
                changed = true;
            }
            pos++;
        }
    }
    return {newRow, changed};
}

function mergeRow(row) {
    let changed = false;
    for (let i = 0; i < 3; i++) {
        if (row[i] === row[i + 1] && row[i] !== 0) {
            row[i] = row[i] * 2;
            row[i + 1] = 0;
            changed = true;
            score += row[i];
        }
    }
    return {row, changed};
}

function reverse(mat) {
    let newMat = [];
    for (let i = 0; i < 4; i++) {
        newMat.push([]);
        for (let j = 0; j < 4; j++) {
            newMat[i].push(mat[i][3 - j]);
        }
    }
    return newMat;
}

function transpose(mat) {
    let newMat = [];
    for (let i = 0; i < 4; i++) {
        newMat.push([]);
        for (let j = 0; j < 4; j++) {
            newMat[i].push(mat[j][i]);
        }
    }
    return newMat;
}

function moveLeft(mat) {
    let newMat = [];
    let changed = false;
    for (let i = 0; i < 4; i++) {
        let compressed = compressRow(mat[i]);
        let merged = mergeRow(compressed.newRow);
        let recompressed = compressRow(merged.row);
        newMat.push(recompressed.newRow);
        if (compressed.changed || merged.changed || recompressed.changed) {
            changed = true;
        }
    }
    return {newMat, changed};
}

function moveRight(mat) {
    newMat = reverse(mat);
    let output = moveLeft(newMat);
    newMat = reverse(output.newMat);
    changed = output.changed;
    return {newMat, changed};
}

function moveUp(mat) {
    newMat = transpose(mat);
    let output = moveLeft(newMat);
    newMat = transpose(output.newMat);
    changed = output.changed
    return {newMat, changed};
}

function moveDown(mat) {
    newMat = transpose(mat);
    let output = moveRight(newMat);
    newMat = transpose(output.newMat);
    changed = output.changed
    return {newMat, changed};
}

function testMove(mat, direction) {
    if (direction === "up") {
        output = moveUp(mat);
    } else if (direction === "down") {
        output = moveDown(mat);
    } else if (direction === "left") {
        output = moveLeft(mat);
    } else if (direction === "right") {
        output = moveRight(mat);
    }
    return output.changed
}

function makeMove(mat, direction) {
    if (direction === "up") {
        output = moveUp(mat);
    } else if (direction === "down") {
        output = moveDown(mat);
    } else if (direction === "left") {
        output = moveLeft(mat);
    } else if (direction === "right") {
        output = moveRight(mat);
    }
    if (output.changed && !isGameOver(output.newMat)) {
        mat = output.newMat;
        mat = addTile(mat);
        updateTable(mat);
        updateScore(score);
    }
    return mat;
}

function isGameOver(mat) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (mat[i][j] === 0) {
                return false;
            }
            if (j !== 3 && mat[i][j] === mat[i][j + 1]) {
                return false;
            }
            if (i !== 3 && mat[i][j] === mat[i + 1][j]) {
                return false;
            }
        }
    }
    return true;
}

function getValidMoves(mat) {
    let validMoves = [];
    for (let move of ["up", "down", "left", "right"]) {
        let changed = testMove(mat, move);
        if (changed) {
            validMoves.push(move);
        }
    }
    return validMoves;
}

// ALGORITHMS 
function randomMove(mat) {
    let moves = getValidMoves(mat);
    return moves[Math.floor(Math.random()*4)];
}



// MAIN CODE STARTS HERE

let prevMat = [];
let prevScore = 0;

bestScore = getCookie("bestScore");
if (bestScore === "") {
    bestScore = 0;
}
updateScore(0);

mat = newGame();
prevMat = mat;
prevScore = 0;
score = 0;
updateTable(mat);


document.addEventListener("keydown", function(event) {
    if (event.key === "z") {
        console.log("undo");
        console.log(prevScore);
        mat = prevMat;
        score = prevScore;
        updateTable(mat);
        updateScore(score);
        return;
    }
    prevScore = score;
    prevMat = mat;
    if (event.key === "ArrowUp") { 
        mat = makeMove(mat, "up");
    } else if (event.key === "ArrowDown") {
        mat = makeMove(mat, "down"); 
    } else if (event.key === "ArrowLeft") {
        mat = makeMove(mat, "left");
    } else if (event.key === "ArrowRight") {
        mat = makeMove(mat, "right");
    } else if (event.key === "r") {
        move = randomMove(mat);
        mat = makeMove(mat, move);
    }
});

document.getElementById("newGame").addEventListener("click", function() {
    mat = newGame();
    score = 0;
    prevMat = mat;
    prevScore = 0;
    updateTable(mat);
    updateScore(0);
});

