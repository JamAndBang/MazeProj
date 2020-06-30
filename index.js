
// // import {filterArr} from "./JSLogic/mazeGen";


let box = 30; //unit size
let grid = []; //array data of each cell
let gridTracker = []; //unvisited represented with {}
let numOfUnvisitedGrid = 399;
let d;
let player = {
        x: 2,
        y: 10,
        poisonedStatus: false
    };
let hp = 5;
let img2 = new Image();    
let img3 = new Image();
// variables for patrol
let numOfPatrols;
let patrol = [];
// variables for gas bombs
let isBomb;
let gasX;
let gasY;
let tilesGased = [];
let Interval;
// variables for laser gun
let laserGuns = [];
let numOfGuns;




function generatepatrol(arraylength) {
    numOfPatrols = Math.round(arraylength**2/40);
    let patrolX;
    let patrolY;
    for (let i = 0; i < numOfPatrols; i++) {
        patrolX = Math.floor(Math.random()*arraylength);
        if (patrolX < 4) {
            patrolY = Math.floor(Math.random()*(arraylength - 4) + 4);
        } else {patrolY = Math.floor(Math.random()*arraylength);}
        patrol[i] = {x: patrolX * 30 + 10, y: patrolY * 30 + 10, pathTaken: [], chasestatus: false, canStartChase: true, playerMovementInChase: []};
    }
} // first 4 X 4 grid should be clear

document.addEventListener("keydown", direction);
document.addEventListener("keyup", function() {d = 5});
const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");
const gasctx = document.getElementById("gas-canvas").getContext("2d");
const gunctx = document.getElementById("gun-canvas").getContext("2d");
gunctx.strokeStyle = "red";
gunctx.lineWidth = 4;
gasctx.fillStyle = "yellow";

function draw() {
    for (let i = 0; i < 20; i++) {
        grid[i] = [];
        gridTracker[i] = [];
        for (let j = 0; j < 20; j++) {
            ctx.fillRect(i*box, j*box, box, box);
            grid[i][j] = {
                x: i,
                y: j,
                visited: false,
                linkCell: [],
                gased: false
            };
            gridTracker[i][j] = 0;
        }
    };
    ctx.clearRect(0, 2, 28, 26);
    ctx.clearRect(572, 572, 28, 26);
    let currentgrid = grid[0][0];

    grid[19][19].linkCell.push(0);
    generatepatrol(grid.length);
    
    while (true) {
        currentgrid.visited = true;
        gridTracker[currentgrid.x][currentgrid.y] = {
            x: currentgrid.x,
            y: currentgrid.y
        };
        let availDir = availgrid(currentgrid);
        let n = availDir.length;
        let k = Math.floor(Math.random()*n)
        let chosenDir = availDir[k];
        let newGrid = {};

        if (numOfUnvisitedGrid == 0) {
            break;
        } else if (n == 0 && numOfUnvisitedGrid > 0) {
            let newArr = filterArr(gridTracker);
            let num = Math.floor(Math.random()*newArr.length);
            currentgrid = grid[newArr[num].x][newArr[num].y];
        } else if (n > 0) {
            switch (chosenDir) { // wall thickness 2px on perimeter 4px within maze
                case 0:
                    ctx.save();
                    newGrid = grid[currentgrid.x + 1][currentgrid.y]; // right
                    grid[currentgrid.x][currentgrid.y].linkCell.push(0);
                    grid[currentgrid.x + 1][currentgrid.y].linkCell.push(1);
                    ctx.translate((currentgrid.x + 1)*box, (currentgrid.y + 0.5)*box);
                    ctx.clearRect(-28, -13, 56, 26);
                    ctx.restore();
                    break;
                case 1:
                    ctx.save();
                    newGrid = grid[currentgrid.x - 1][currentgrid.y]; // left
                    grid[currentgrid.x][currentgrid.y].linkCell.push(1);
                    grid[currentgrid.x - 1][currentgrid.y].linkCell.push(0);
                    ctx.translate((currentgrid.x)*box, (currentgrid.y + 0.5)*box);
                    ctx.clearRect(-28, -13, 56, 26);
                    ctx.restore();
                    break;
                case 2:
                    ctx.save();
                    newGrid = grid[currentgrid.x][currentgrid.y - 1]; // up
                    grid[currentgrid.x][currentgrid.y].linkCell.push(2);
                    grid[currentgrid.x][currentgrid.y - 1].linkCell.push(3);
                    ctx.translate((currentgrid.x + 0.5)*box, (currentgrid.y)*box);
                    ctx.clearRect(-13, -28, 26, 56);
                    ctx.restore();
                    break;
                case 3:
                    ctx.save();
                    newGrid = grid[currentgrid.x][currentgrid.y + 1]; // down
                    grid[currentgrid.x][currentgrid.y].linkCell.push(3);
                    grid[currentgrid.x][currentgrid.y + 1].linkCell.push(2);
                    ctx.translate((currentgrid.x + 0.5)*box, (currentgrid.y + 1)*box);
                    ctx.clearRect(-13, -28, 26, 56);
                    ctx.restore();
                    break;
            }
            currentgrid = newGrid;
            numOfUnvisitedGrid -= 1;
        } 
    }
    Interval = gasBombGenerator(grid.length);
    genLaserGuns(grid.length);
}

function filterArr(arr) {
    let newArr = [];
    for (let n = 0; n < arr.length; n++) {
        for (let c = 0; c < arr[0].length; c++) {
            if (arr[n][c] != 0 && ((arr[n+1] != undefined && arr[n+1][c] == 0) || (arr[n-1] != undefined && arr[n-1][c] == 0) || arr[n][c+1] == 0 || arr[n][c-1] == 0)) {
            newArr.push(arr[n][c])
            }
        }
    }
    return newArr
} // available grids to start new path

function availgrid(currentgrid) {
    let availDir = []
    for (let c = 0; c < 4; c++) {
        if (c == 0) {
            if (currentgrid.x != 19 && grid[currentgrid.x + 1][currentgrid.y].visited == false) {
                availDir.push(0);
            }
        } else if (c == 1) {
            if (currentgrid.x != 0 && grid[currentgrid.x - 1][currentgrid.y].visited == false) {
                availDir.push(1);
            }
        } else if (c == 2) {
            if (currentgrid.y != 0 && grid[currentgrid.x][currentgrid.y - 1].visited == false) {
                availDir.push(2);
            }
        } else if (c == 3) {
            if (currentgrid.y != 19 && grid[currentgrid.x][currentgrid.y + 1].visited == false) {
                availDir.push(3);
            }
        }
    }
    return availDir;
} // directions to unvisited grid from current grid

let myReq;

var start = null;
var lastTimerUpdate;
var lastPatrolUpdate;
var lastHpUpdate;
var timeGiven = 120;

const destinctx = document.getElementById("canvas2").getContext("2d");
const scoreBoard = document.getElementById("score");
const img = document.getElementById("pacman");
const img4 = document.getElementById("ghost");
const timer = document.getElementById("timer");
const health = document.getElementById("hp");

;(function () {
    function finalDraw(timeStamp) {
        myReq = window.requestAnimationFrame(finalDraw);
        if (start == null) {
            start = timeStamp;
            lastTimerUpdate = timeStamp;
            lastPatrolUpdate = timeStamp;
            lastHpUpdate = timeStamp;
            timer.innerText = "Time left: " + timeGiven;
            health.innerHTML = "HP: " + hp;
        }

        if (timeStamp - lastTimerUpdate >= 1000) {
            timeGiven -= 1;
            timer.innerText = "Time left: " + timeGiven;
            lastTimerUpdate = timeStamp;
        }

        destinctx.clearRect(0,0,620,600);

        let x = Math.floor(player.x/30);
        let y = Math.floor(player.y/30);

        img2.src = "https://media.tenor.com/images/f866585f83711e1416ed3eaa4beff3d0/tenor.gif"; //win image
        img3.src = "./public/gameover.jpg";
        
        destinctx.drawImage(img, player.x, player.y, 10, 10);

        for (let i = 0; i < numOfPatrols; i++) {
            destinctx.drawImage(img4, patrol[i].x, patrol[i].y, 10, 10);
        }

        if (timeStamp - lastPatrolUpdate >= 30) {
            checkAvailDirPatrol(patrol, x, y);
            lastPatrolUpdate = timeStamp;
        }

        if (timeStamp - lastHpUpdate >= 1000) {
            hitByLaser(player.x, player.y);
            // poisonByGas(player.x, player.y);
            health.innerHTML = "HP: " + hp;
            lastHpUpdate = timeStamp;
        }
        let list = checkMovementLimit(x, y);

        if (timeGiven == 0 || hp == 0 || capturedByPatrol(patrol, player.x, player.y)) {
            img3.onload = function () {
                destinctx.drawImage(img3, 0, 0, 600, 600);
            }
            timer.innerHTML = "";
            window.clearInterval(Interval);
            window.cancelAnimationFrame(myReq);
        } else if (player.x >= 600) {
            img2.onload = function () {
                destinctx.drawImage(img2, 0, 0, 600, 600);
            }
            scoreBoard.innerHTML = "Score:" + Math.round(timeGiven/120*100);              
            timer.innerHTML = "";
            window.clearInterval(Interval);
            window.cancelAnimationFrame(myReq);
        } else if (d == 0 && player.x != list[0] - 10) {
            player.x += 2;
            img.src = "./public/pacman.png";
        } else if (d == 1 && player.x != list[1]) {
            player.x -= 2;
            img.src = "./public/pacmanleft.jpg";
        } else if (d == 2 && player.y != list[2]) {
            player.y -= 2;
            img.src = "./public/pacmanup.png";
        } else if (d == 3 && player.y != list[3] - 10) {
            player.y += 2;
            img.src = "./public/pacmandown.png";
        }
    }
    finalDraw();
})();

//user control
function direction(event) {
    if (event.keyCode == 39) {
        d = 0;
    } else if (event.keyCode == 37) {
        d = 1;
    } else if (event.keyCode == 38) {
        d = 2;
    } else if (event.keyCode == 40) {
        d = 3;
    }
}

function checkMovementLimit(x, y) {
    let limit = [];
    let cellConnected;

    if (x < 20) {
        try {
            cellConnected = grid[x][y].linkCell;
        } catch (err) {
            return;
        }
    };
    for (let i = 0; i < 4; i++) {
        if (x == 20) {
            limit = [];
        } else if (cellConnected.indexOf(i) == -1 && i == 0) {
            let rightLimit = x * 30 + 28; 
            limit.push(rightLimit);
        } else if (cellConnected.indexOf(i) == -1 && i == 1) {
            let leftLimit = x * 30 + 2;
            limit.push(leftLimit); 
        } else if (cellConnected.indexOf(i) == -1 && i == 2) {
            let upperLimit = y * 30 + 2;
            limit.push(upperLimit); 
        } else if (cellConnected.indexOf(i) == -1 && i == 3) {
            let bottomLimit = y * 30 + 28;
            limit.push(bottomLimit); 
        } else {
            limit.push({});
        }
    }
    return limit
}

//Automate the movement of patrols
function capturedByPatrol(patrolArr, xp, yp) {
    let x;
    let y;
    xp = Math.floor((player.x + 5)/30);
    yp = Math.floor((player.y + 5)/30);
    for (let i = 0; i < patrolArr.length; i++) {
        x = Math.floor((patrolArr[i].x + 5)/30);
        y = Math.floor((patrolArr[i].y + 5)/30);
        if (x == xp && y == yp) {
            return true; //captured by patrol
        }
    }
}

function checkCentre(x, y) {
    if ((x - 10) % 30 == 0 && (y - 10) % 30 == 0) {
        return true
    } else {return false}
} 

function withinSight(x, x2, y, y2) {
    let distanceSquare = (x - x2)**2 + (y - y2)**2;
    let gridDiff = [];
    if (distanceSquare <= 9) {
        if (x == x2) {
            let dy = y2 - y;
            if (y < y2) { //player above patrol
                for (let i = 0; i < dy; i++) {
                    if (grid[x][y + i].linkCell.includes(3)) {
                    } else {
                        return false;
                    }
                } for (let j = 0; j < dy; j++) {
                    gridDiff.push({x: x, y: y2 - 1 - j});
                } 
                gridDiff.push(2);
                return gridDiff;
            } else {
                for (let i = 0; i < -dy; i++) { 
                    if (grid[x][y2 + i].linkCell.includes(3)) {
                    } else {
                        return false;
                    }
                } for (let j = 0; j < -dy; j++) {
                    gridDiff.push({x: x, y: y2 + 1 + j});
                } 
                gridDiff.push(3);
                return gridDiff;
            } //patrol above player
        } else if (y == y2) {
            let dx = x2 - x;
            if (x < x2) { //player left of patrol
                for (let i = 0; i < dx; i++) {
                    if (grid[x + i][y].linkCell.includes(0)) {
                    } else {
                        return false;
                    }
                } for (let j = 0; j < dx; j++) {
                    gridDiff.push({x: x2 - 1 - j, y: y});
                } 
                gridDiff.push(1);
                return gridDiff;
            } else {//patrol left of player
                for (let i = 0; i < -dx; i++) { 
                    if (grid[x2 + i][y].linkCell.includes(0)) {
                    } else {
                        return false;
                    }
                } for (let j = 0; j < -dx; j++) {
                    gridDiff.push({x: x2 + 1 + j, y: y});
                }
                gridDiff.push(0);
                return gridDiff;
            }
        } else {return false}
    } else {return false}
} 

function preventBackwardMovement(patroli) {
    if (patroli.pathTaken.length > 0) {
        switch(patroli.pathTaken[patroli.pathTaken.length - 1]) {
            case 0:
            return 1
            case 1:
            return 0
            case 2:
            return 3;
            case 3:
            return 2;
        }
    } else {
        return undefined;
    }
}

function setDelay(patrol, MovementInterval) { //use window.performance.now instead to track time
    window.setTimeout(() => {
        patrol.chasestatus = false;
        window.clearInterval(MovementInterval);
        patrol.playerMovementInChase = [];
    }, 10000); //patrol will chase player for 10s upon discovery
}

function setDelay2(patrol) {
    window.setTimeout(() => {patrol.canStartChase = true}, 15000); //5s cooldown before patrol can start another chase
}

function setDelay3(patrol) {
    let MovementInterval = window.setInterval(() => {
        if (patrol.playerMovementInChase.length > 1 && (patrol.playerMovementInChase[patrol.playerMovementInChase.length - 1].x != Math.floor(player.x/30) || patrol.playerMovementInChase[patrol.playerMovementInChase.length - 1].y != Math.floor(player.y/30))) {
            if (patrol.playerMovementInChase.length > 1 && (patrol.playerMovementInChase[patrol.playerMovementInChase.length - 2].x != Math.floor(player.x/30) || patrol.playerMovementInChase[patrol.playerMovementInChase.length - 2].y != Math.floor(player.y/30))) {
                patrol.playerMovementInChase.push({x: Math.floor(player.x/30), y: Math.floor(player.y/30)}); 
            } else if (patrol.playerMovementInChase.length > 1 && (patrol.playerMovementInChase[patrol.playerMovementInChase.length - 2].x == Math.floor(player.x/30) && patrol.playerMovementInChase[patrol.playerMovementInChase.length - 2].y == Math.floor(player.y/30))) {
                patrol.playerMovementInChase.pop(); // if the player move backwards redundant movement remove last element from playermovementarray
            } //functional
        } else if (patrol.playerMovementInChase.length == 1 && (patrol.playerMovementInChase[patrol.playerMovementInChase.length - 1].x != Math.floor(player.x/30) || patrol.playerMovementInChase[patrol.playerMovementInChase.length - 1].y != Math.floor(player.y/30))) { //1 grid in array only
            patrol.playerMovementInChase.push({x: Math.floor(player.x/30), y: Math.floor(player.y/30)}); // first two grid locations always recorded in array
        }
    }, 250);
    return MovementInterval;
}

function checkAvailDirPatrol(patrolArr, xp, yp) {
    let x;
    let y;
    let isCentre;
    let chosenDir;
    let backDir;
    let inRange;
    let startDir;
    let MovementInterval;
    
    for (let i = 0; i < patrolArr.length; i++) {
        x = Math.floor(patrolArr[i].x/30);
        y = Math.floor(patrolArr[i].y/30);
        let cellConnected = [];
        isCentre = checkCentre(patrolArr[i].x, patrolArr[i].y);
        inRange = withinSight(xp, x, yp, y); 
        
        if (inRange != false && patrolArr[i].chasestatus == false && patrolArr[i].canStartChase == true) {
            patrolArr[i].chasestatus = true;
            patrolArr[i].canStartChase = false;
            patrolArr[i].playerMovementInChase.push(0);
            for (let j = 0; j < inRange.length - 2; j++) {
                patrolArr[i].playerMovementInChase.push(inRange[j]);
            }
            MovementInterval = setDelay3(patrolArr[i]);
            setDelay(patrolArr[i], MovementInterval);
            setDelay2(patrolArr[i]);
            startDir = inRange[inRange.length - 1];
            if ((patrolArr[i].pathTaken[0] == 1 && patrolArr[i].x < x * 30 + 15) || (patrolArr[i].pathTaken[0] == 0 && patrolArr[i].x > x * 30 + 15) || (patrolArr[i].pathTaken[0] == 3 && patrolArr[i].y > y * 30 + 15) || (patrolArr[i].pathTaken[0] == 2 && patrolArr[i].y < y * 30 + 15)) {
                switch (patrolArr[i].pathTaken[0]) {
                    case 0:
                        patrolArr[i].pathTaken.push(1);
                        break;
                    case 1:
                        patrolArr[i].pathTaken.push(0);
                        break;
                    case 2:
                        patrolArr[i].pathTaken.push(3);
                        break;
                    case 3:
                        patrolArr[i].pathTaken.push(2);
                        break;
                }
                patrolArr[i].pathTaken.splice(0, 1);
            } else if ((startDir == 0 && patrolArr[i].pathTaken[0] == 1) || (startDir == 1 && patrolArr[i].pathTaken[0] == 0) || (startDir == 2 && patrolArr[i].pathTaken[0] == 3) || (startDir == 3 && patrolArr[i].pathTaken[0] == 2)) {
                patrolArr[i].pathTaken.push(startDir);
                patrolArr[i].pathTaken.splice(0, 1);
                patrolArr[i].playerMovementInChase.splice(0, 1); // special case of opp dir 
            } 
        } else if (patrolArr[i].chasestatus == true) {
            if (isCentre && patrolArr[i].playerMovementInChase.length > 1) {
                let nextGridTo = patrolArr[i].playerMovementInChase[1]; //decide next grid to move to
                patrolArr[i].playerMovementInChase.splice(0, 1);
                if (nextGridTo.x - x == 1) {
                    chosenDir = 0;
                    patrolArr[i].pathTaken.push(0);
                    patrolArr[i].pathTaken.splice(0, 1);
                } else if (x - nextGridTo.x == 1) { //player left of patrol
                    chosenDir = 1;
                    patrolArr[i].pathTaken.push(1);
                    patrolArr[i].pathTaken.splice(0, 1);
                } else if (nextGridTo.y - y == -1) {
                    chosenDir = 2;
                    patrolArr[i].pathTaken.push(2);
                    patrolArr[i].pathTaken.splice(0, 1);
                } else if (nextGridTo.y - y == 1) {
                    chosenDir = 3;
                    patrolArr[i].pathTaken.push(3);
                    patrolArr[i].pathTaken.splice(0, 1);
                }
                switch(chosenDir) {
                    case 0:
                        patrolArr[i].x += 2;
                        break;
                    case 1:
                        patrolArr[i].x -= 2;
                        break;
                    case 2:
                        patrolArr[i].y -= 2;
                        break;
                    case 3:
                        patrolArr[i].y += 2;
                        break;
                }
            } else if (Math.abs((patrolArr[i].x + 5) - (x * 30 + 15)) == 1 || Math.abs((patrolArr[i].y + 5) - (y * 30 + 15)) == 1) {
                switch(patrolArr[i].pathTaken[0]) {
                    case 0:
                        patrolArr[i].x += 1;
                        break;
                    case 1:
                        patrolArr[i].x -= 1;
                        break;
                    case 2:
                        patrolArr[i].y -= 1;
                        break;
                    case 3:
                        patrolArr[i].y += 1;
                        break;
            }
            } else {
                switch(patrolArr[i].pathTaken[0]) {
                    case 0:
                        patrolArr[i].x += 2;
                        break;
                    case 1:
                        patrolArr[i].x -= 2;
                        break;
                    case 2:
                        patrolArr[i].y -= 2;
                        break;
                    case 3:
                        patrolArr[i].y += 2;
                        break;
            }
            }
            // continue chase
        } else {
            for (let c = 0; c < grid[x][y].linkCell.length; c++) {
                cellConnected.push(grid[x][y].linkCell[c]);
            }
            if (isCentre) { // reached centre of intended grid choose new grid to move to
                backDir = preventBackwardMovement(patrolArr[i]);
                if (x == 19 && y == 19) {
                    cellConnected.splice(0,1); // grid[19][19] case
                }
                if (backDir != undefined && cellConnected.length > 1) {
                    cellConnected.splice(cellConnected.indexOf(backDir), 1);
                }
                chosenDir = cellConnected[Math.floor(Math.random()*cellConnected.length)];
                patrolArr[i].pathTaken.push(chosenDir);
                if (patrolArr[i].pathTaken.length > 1) {
                    patrolArr[i].pathTaken.splice(0, 1);
                }
                switch(chosenDir) {
                    case 0:
                        patrolArr[i].x += 1;
                        break;
                    case 1:
                        patrolArr[i].x -= 1;
                        break;
                    case 2:
                        patrolArr[i].y -= 1;
                        break;
                    case 3:
                        patrolArr[i].y += 1;
                        break;
                } //functional
            } else { // continue moving in the determined direction
                switch(patrolArr[i].pathTaken[0]) {
                    case 0:
                        patrolArr[i].x += 1;
                        break;
                    case 1:
                        patrolArr[i].x -= 1;
                        break;
                    case 2:
                        patrolArr[i].y -= 1;
                        break;
                    case 3:
                        patrolArr[i].y += 1;
                        break;
                }
            }
        } //functional
    } 
}

// gas bombs
function gasBombGenerator(arraylength) {
    let Interval = setInterval(() => {
        Math.floor(Math.random() * 4000/arraylength**2) == 0 ? isBomb = true : isBomb = false;
        if (isBomb) {
            gasX = Math.floor(Math.random() * arraylength);
            gasY = Math.floor(Math.random() * arraylength);
            tilesGased[tilesGased.length] = []; // each ongoing gas bomb gets an array to compute affected area
            tilesGased[tilesGased.length - 1].push(2, 0, [{x: gasX, y: gasY, backDir: 5}]) // [0] represents distance of current tile from starting tile
            genGasArea(tilesGased[tilesGased.length - 1]); 
        }
    }, 1000);
    return Interval;
}

function genGasArea(gasedTilesArr) { //per gas bomb
    gasedTilesArr[gasedTilesArr.length] = [];
    for (let i = 0; i < gasedTilesArr[gasedTilesArr[0]].length; i++) {
        grid[gasedTilesArr[gasedTilesArr[0]][i].x][gasedTilesArr[gasedTilesArr[0]][i].y].gased = true;
        gasctx.fillRect(gasedTilesArr[gasedTilesArr[0]][i].x * 30, gasedTilesArr[gasedTilesArr[0]][i].y * 30, 30, 30);
        gasedTilesArr[1] += 1;
        if (gasedTilesArr[1] == 10) {
            setTimeout(() => {
                for (let i = 2; i < gasedTilesArr.length; i++) {
                    for (let k = 0; k < gasedTilesArr[i].length; k++) {
                        grid[gasedTilesArr[i][k].x][gasedTilesArr[i][k].y].gased = false;
                        gasctx.clearRect(gasedTilesArr[i][k].x * 30, gasedTilesArr[i][k].y * 30, 30, 30);
                    }
                }
            }, 10000)
            return;
        }
        let cellConnected = [];
        for (let c = 0; c < grid[gasedTilesArr[gasedTilesArr[0]][i].x][gasedTilesArr[gasedTilesArr[0]][i].y].linkCell.length; c++) {
            cellConnected.push(grid[gasedTilesArr[gasedTilesArr[0]][i].x][gasedTilesArr[gasedTilesArr[0]][i].y].linkCell[c]);
        } 
        if (gasedTilesArr[0] != 2) {
            cellConnected.splice(cellConnected.indexOf(gasedTilesArr[gasedTilesArr[0]][i].backDir), 1);
        }
        if (gasedTilesArr[gasedTilesArr[0]][i].x == 19 && gasedTilesArr[gasedTilesArr[0]][i].y == 19) {
            cellConnected.splice(0, 1);
        }
        for (let j = 0; j < cellConnected.length; j++) {
            switch(cellConnected[j]) {
                case 0:
                    gasedTilesArr[gasedTilesArr.length - 1].push({x: gasedTilesArr[gasedTilesArr[0]][i].x + 1, y: gasedTilesArr[gasedTilesArr[0]][i].y, backDir: 1})
                    break;
                case 1:
                    gasedTilesArr[gasedTilesArr.length - 1].push({x: gasedTilesArr[gasedTilesArr[0]][i].x - 1, y: gasedTilesArr[gasedTilesArr[0]][i].y, backDir: 0})
                    break;
                case 2:
                    gasedTilesArr[gasedTilesArr.length - 1].push({x: gasedTilesArr[gasedTilesArr[0]][i].x, y: gasedTilesArr[gasedTilesArr[0]][i].y - 1, backDir: 3})
                    break;
                case 3:
                    gasedTilesArr[gasedTilesArr.length - 1].push({x: gasedTilesArr[gasedTilesArr[0]][i].x, y: gasedTilesArr[gasedTilesArr[0]][i].y + 1, backDir: 2})
                    break;
            }
        }
    } 
    gasedTilesArr[0] += 1; 
    setTimeout(() => {
        genGasArea(gasedTilesArr);
    }, 250)
} // maybe add in animation for gas spread from light color to dark color

// laser guns
function beamRange(x, y, d) {
    let pathLength = 30;
    let X = x;
    let Y = y;
    while (grid[X][Y].linkCell.includes(d)) {
        pathLength += 30;
        switch(d) {
            case 0:
                X += 1;
                break;
            case 1:
                X -= 1;
                break;
            case 2:
                Y -= 1;
                break;
            case 3:
                Y += 1;
                break;
        }
    } return pathLength;
}

function genLaserGuns (arraylength) {
    numOfGuns = arraylength ** 2/50;
    let gunX;
    let gunY;
    let dir;
    let beamLength;
    let startPoint;
    let endPoint;
    let initialLapse;
    let cellConnected = [];
    for (let i = 0; i < numOfGuns; i++) {
        beamLength = 30;
        while (beamLength < 90) {
            gunX = Math.floor(Math.random()*arraylength);
            gunY = Math.floor(Math.random()*arraylength);
            cellConnected = grid[gunX][gunY].linkCell;
            let shuffle = Math.floor(Math.random() * 4);
            for (let j = shuffle; j < shuffle + 4; j++) {
                if (cellConnected.includes(j % 4) == false) {
                    switch(j % 4) {
                        case 0:
                            dir = 1;
                            break;
                        case 1:
                            dir = 0;
                            break;
                        case 2:
                            dir = 3;
                            break;
                        case 3: 
                            dir = 2;
                            break;
                    }
                }
            }
            beamLength = beamRange(gunX, gunY, dir);
        }
        switch(dir) {
            case 0:
                startPoint = {x: gunX * 30, y: gunY * 30 + 15};
                endPoint = {x: gunX * 30 + beamLength, y: gunY * 30 + 15};
                break;
            case 1:
                startPoint = {x: gunX * 30 + 30, y: gunY * 30 + 15};
                endPoint = {x: gunX * 30 + 30 - beamLength, y: gunY * 30 + 15};
                break;
            case 2:
                startPoint = {x: gunX * 30 + 15, y: gunY * 30 + 30};
                endPoint = {x: gunX * 30 + 15, y: gunY * 30 + 30 - beamLength};
                break;
            case 3:
                startPoint = {x: gunX * 30 + 15, y: gunY * 30};
                endPoint = {x: gunX * 30 + 15, y: gunY * 30 + beamLength};
                break;
        }
        initialLapse = Math.floor(Math.random() * 5);
        laserGuns.push({startTime: initialLapse * 1000, x: gunX, y: gunY, d: dir, moveTo: startPoint, lineTo: endPoint, beamLength: beamLength, beamStatus: false});
    }

    for (let c = 0; c < numOfGuns; c++) {
        setTimeout(() => {
            drawBeam(laserGuns[c]);
        }, laserGuns[c].startTime)
    }
}

function drawBeam(LaserGun) {
    let start = LaserGun.moveTo;
    let end = LaserGun.lineTo;
    let dir = LaserGun.d;
    let beamLength = LaserGun.beamLength;
    
    gunctx.beginPath();
    gunctx.moveTo(start.x, start.y);
    gunctx.lineTo(end.x, end.y);
    gunctx.stroke();
    LaserGun.beamStatus = true;
    setTimeout(() => {
        switch(dir) {
            case 0:
                gunctx.clearRect(start.x, start.y - 2, beamLength, 4);
                break;
            case 1:
                gunctx.clearRect(end.x, end.y - 2, beamLength, 4);
                break;
            case 2:
                gunctx.clearRect(end.x - 2, end.y, 4, beamLength);
                break;
            case 3:
                gunctx.clearRect(start.x - 2, start.y, 4, beamLength)
                break;
        }
        LaserGun.beamStatus = false;
    }, 5000);
    setTimeout(() => {drawBeam(LaserGun)}, 8000);
}

// effect on player hp from gas and laser
function hitByLaser(x, y) {
    x += 5;
    y += 5;
    for (let i = 0; i < numOfGuns; i++) {
        if (laserGuns[i].beamStatus == false) {
        } else {
            switch(laserGuns[i].d) {
                case 0:
                    if (x <= laserGuns[i].lineTo.x + 5 && x >= laserGuns[i].moveTo.x - 5) {
                        if (Math.abs(y - laserGuns[i].moveTo.y) <= 7) {
                            hp -= 1;
                        }
                    }
                    break;
                case 1:
                    if (x >= laserGuns[i].lineTo.x - 5 && x <= laserGuns[i].moveTo.x + 5) {
                        if (Math.abs(y - laserGuns[i].moveTo.y) <= 7) {
                            hp -= 1;
                        }
                    }
                    break;
                case 2:
                    if (y >= laserGuns[i].lineTo.y - 5 && y <= laserGuns[i].moveTo.y + 5) {
                        if (Math.abs(x - laserGuns[i].moveTo.x) <= 7) {
                            hp -= 1;
                        }
                    }
                    break;
                case 3:
                    if (y <= laserGuns[i].lineTo.y + 5 && x >= laserGuns[i].moveTo.y - 5) {
                        if (Math.abs(x - laserGuns[i].moveTo.x) <= 7) {
                            hp -= 1;
                        }
                    }
                    break;
            }
        }
    }
}

function poisonByGas(x, y) {
    let xp = Math.floor((x + 5)/30);
    let yp = Math.floor((y + 5)/30);
    if (grid[xp][yp].gased) {
        player.poisonedStatus = true;
    } else {
        if (player.poisonedStatus) {
            setTimeout(() => {player.poisonedStatus = false}, 1000)
        }
    }
    if (player.poisonedStatus == true) {
        hp -= 0.5;
    }
}