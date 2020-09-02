function Tetris(id) {
    this.id = id;

    document.getElementById("play").onclick = this.play.bind(this);
    document.getElementById("submit-score").onclick = this.submit.bind(this);
    document.getElementById("submit-score").style.display = "none";
    document.getElementById("login").onclick = this.login.bind(this);
    document.getElementById("file-input").onchange = this.readFile.bind(this);

    document.getElementById("player-name-wrapper").style.display = "none";
    document.getElementById("play").style.display = "none";
    document.getElementById("player-name-input").addEventListener('input', this.inputHandler.bind(this));
    document.getElementById("permaboard-table").style.visibility = "hidden";
    arweave_handler.init();
    this.displayPermaBoard();
    this.nickname = "";
    this.firstRun = 1;
}

Tetris.prototype = {
    init: function() {
        canvas = document.getElementById("tetrisCanvas");
        this.context = canvas.getContext("2d");

        //Random Selection of Types
        this.type = 1 + Math.floor((Math.random() * 7));
        this.x = 4;
        this.y = 18;
        this.alignment = 0;
        this.timestep = 600;
        this.gridWidth = 300;
        this.gridHeight = this.gridWidth * 2;
        this.rowsHit = 0;
        this.score = 0;
        this.currentlevel = 0;
        this.previouslevel = 0;
        this.pause = 0;
        this.gameOver = 0;


        //Intialize the fields
        this.fields = new Array(20);
        for (i = 0; i < 20; i++) {
            this.fields[i] = new Array(10);
            for (j = 0; j < 10; j++)
                this.fields[i][j] = 0;
        }

        //Draw Tetromino Types
        this.drawTetromino(this.x, this.y, this.type, this.alignment, 1);
        this.plotGrid();
        if (this.firstRun) {
            document.addEventListener('keydown', this.keyPress.bind(this));
        }

        document.getElementById("game-info").innerHTML = "PLAYING";
        document.getElementById("submit-score").style.display = "none";
        document.getElementById("score").innerHTML = this.score.toString();
        document.getElementById("rowsHit").innerHTML = this.rowsHit.toString();
        document.getElementById("level").innerHTML = this.currentlevel.toString();

        var tetrisObject = this;
        clearInterval(this.timer); // Start the game loop
        this.timer = setInterval(function() { tetrisObject.gameLoop() }, this.timestep);
    },
    plotGrid: function() {

        this.context.clearRect(0, 0, this.gridWidth, this.gridHeight);

        for (i = 0; i < 20; i++) {
            for (j = 0; j < 10; j++) {
                this.plotBox(j, i, this.fields[i][j]);
            }
        }
    },
    plotBox: function(x, y, type) {

        var color;

        if (type > 0) {
            switch (type) {
                case 1:
                    this.context.fillStyle = "#FF0080";
                    break;
                case 2:
                    this.context.fillStyle = "#FFCF00";
                    break;
                case 3:
                    this.context.fillStyle = "#AF4FA2";
                    break;
                case 4:
                    this.context.fillStyle = "#C5E946";
                    break;
                case 5:
                    this.context.fillStyle = "#0033CC";
                    break;
                case 6:
                    this.context.fillStyle = "#FF0000";
                    break;
                default:
                    this.context.fillStyle = "#669900";
                    break;
            }
            //    this.context.fillStyle = "#FFCF00";
            squareDim = this.gridWidth / 10;
            gutterSize = parseInt(this.gridWidth / 100);

            pX = x * squareDim;
            pY = (19 - y) * squareDim;

            this.context.fillRect(pX + 2, pY + 2, (squareDim - gutterSize), (squareDim - gutterSize));
        }
    },
    drawTetromino: function(x, y, type, alignment, d) {
        c = -1;
        if (d >= 0) c = type * d;

        valid = true;

        if (type == 1) //I Type
        {
            if (alignment == 0 || alignment == 2) {
                valid = valid && this.setGrid(x - 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
                valid = valid && this.setGrid(x + 2, y, c);
            } else if (alignment == 1 || alignment == 3) {
                valid = valid && this.setGrid(x + 1, y + 1, c);
                valid = valid && this.setGrid(x + 1, y, c);
                valid = valid && this.setGrid(x + 1, y - 1, c);
                valid = valid && this.setGrid(x + 1, y - 2, c);
            }
        }
        if (type == 2) //J Type
        {

            if (alignment == 0) {
                valid = valid && this.setGrid(x - 1, y + 1, c);
                valid = valid && this.setGrid(x - 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
            } else if (alignment == 1) {
                valid = valid && this.setGrid(x + 1, y + 1, c);
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x, y - 1, c);
            } else if (alignment == 2) {
                valid = valid && this.setGrid(x - 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
                valid = valid && this.setGrid(x + 1, y - 1, c);
            } else if (alignment == 3) {
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x, y - 1, c);
                valid = valid && this.setGrid(x - 1, y - 1, c);
            }
        }
        if (type == 3) //L Type
        {
            if (alignment == 0) {
                valid = valid && this.setGrid(x - 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
                valid = valid && this.setGrid(x + 1, y + 1, c);
            } else if (alignment == 1) {
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x, y - 1, c);
                valid = valid && this.setGrid(x + 1, y - 1, c);
            } else if (alignment == 2) {
                valid = valid && this.setGrid(x - 1, y - 1, c);
                valid = valid && this.setGrid(x - 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
            } else if (alignment == 3) {
                valid = valid && this.setGrid(x - 1, y + 1, c);
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x, y - 1, c);
            }
        }
        if (type == 4) // O Type
        {
            valid = valid && this.setGrid(x, y, c);
            valid = valid && this.setGrid(x + 1, y, c);
            valid = valid && this.setGrid(x, y + 1, c);
            valid = valid && this.setGrid(x + 1, y + 1, c);
        }
        if (type == 5) //S Type
        {
            if (alignment == 0 || alignment == 2) {
                valid = valid && this.setGrid(x - 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x + 1, y + 1, c);
            } else if (alignment == 1 || alignment == 3) {
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
                valid = valid && this.setGrid(x + 1, y - 1, c);
            }
        }
        if (type == 6) //T Type
        {
            if (alignment == 0) {
                valid = valid && this.setGrid(x - 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
                valid = valid && this.setGrid(x, y + 1, c);
            } else if (alignment == 1) {
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x, y - 1, c);
                valid = valid && this.setGrid(x + 1, y, c);
            } else if (alignment == 2) {
                valid = valid && this.setGrid(x - 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
                valid = valid && this.setGrid(x, y - 1, c);
            } else if (alignment == 3) {
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x, y - 1, c);
                valid = valid && this.setGrid(x - 1, y, c);
            }
        }
        if (type == 7) // Z Type
        {
            if (alignment == 0 || alignment == 2) {
                valid = valid && this.setGrid(x - 1, y + 1, c);
                valid = valid && this.setGrid(x, y + 1, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x + 1, y, c);
            } else if (alignment == 1 || alignment == 3) {
                valid = valid && this.setGrid(x + 1, y + 1, c);
                valid = valid && this.setGrid(x + 1, y, c);
                valid = valid && this.setGrid(x, y, c);
                valid = valid && this.setGrid(x, y - 1, c);
            }
        }

        return valid;
    },
    setGrid: function(x, y, type) {


        if (x >= 0 && x < 10 && y >= 0 && y < 20) {
            if (type < 0) {
                return this.fields[y][x] == 0;
            } else {
                this.fields[y][x] = type;
                return true;
            }
        }
        return false;
    },
    keyPress: function(e) {

        if (e.keyCode == 37 && !this.pause) {

            this.drawTetromino(this.x, this.y, this.type, this.alignment, 0);
            x2 = this.x - 1;
            if (this.drawTetromino(x2, this.y, this.type, this.alignment, -1)) {
                this.x = x2;
            }

        } else if (e.keyCode == 38 && !this.pause) {

            this.drawTetromino(this.x, this.y, this.type, this.alignment, 0);
            newAlignment = (this.alignment + 1) % 4;
            if (this.drawTetromino(this.x, this.y, this.type, newAlignment, -1)) {
                this.alignment = newAlignment;
            }

        } else if (e.keyCode == 39 && !this.pause) {

            this.drawTetromino(this.x, this.y, this.type, this.alignment, 0);
            x2 = this.x + 1;
            if (this.drawTetromino(x2, this.y, this.type, this.alignment, -1)) {
                this.x = x2;
            }

        } else if (e.keyCode == 40 && !this.pause) {

            this.drawTetromino(this.x, this.y, this.type, this.alignment, 0);
            y2 = this.y - 1;
            if (this.drawTetromino(this.x, y2, this.type, this.alignment, -1)) {
                this.y = y2;
            }

        } else if (e.keyCode == 27 && !this.gameOver) {

            if (!this.pause) {
                this.pause = 1;
                document.getElementById("game-info").innerHTML = "PAUSED";
                document.getElementById("play").style.display = "block";
            } else {
                this.pause = 0;
                document.getElementById("game-info").innerHTML = "PLAYING";
                document.getElementById("play").style.display = "none";
            }

        }


        this.drawTetromino(this.x, this.y, this.type, this.alignment, 1);
        this.plotGrid();
    },
    gameLoop: function() {
        if (!this.pause) {

            this.drawTetromino(this.x, this.y, this.type, this.alignment, 0);

            y2 = this.y - 1;
            if (this.drawTetromino(this.x, y2, this.type, this.alignment, -1)) {
                this.y = y2;
            } else {
                this.drawTetromino(this.x, this.y, this.type, this.alignment, 1);

                this.checkLines();

                type2 = 1 + Math.floor((Math.random() * 7));
                x2 = 4;
                y2 = 18;
                newAlignment = 0;

                if (this.drawTetromino(x2, y2, type2, newAlignment, -1)) {
                    this.type = type2;
                    this.x = x2;
                    this.y = y2;
                    this.alignment = newAlignment;
                } else {

                    document.getElementById("gameover").currentTime = 0;
                    document.getElementById("gameover").play();
                    this.pause = 1;
                    this.gameOver = 1;
                    document.getElementById("play").style.display = "block";
                    document.getElementById("submit-score").style.display = "block";
                    document.getElementById("game-info").innerHTML = "GAME OVER";
                    this.firstRun = 0;
                    //    document.removeEventListener('keydown', this.keyPress.bind(this));
                    return;
                }
            }

            this.drawTetromino(this.x, this.y, this.type, this.alignment, 1);
            this.plotGrid();

        }

    },
    roundRect: function(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke === 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
        ctx.shadowBlur = 10;
        ctx.shadowColor = fill;
    },
    play: function() {

        if (this.gameOver || !this.pause) {
            this.init();
            document.getElementById("play").style.display = "none";
            document.getElementById("player-name-input").style.display = "none";
            document.getElementById("player-name").innerHTML = this.nickname;
        } else if (this.pause) {
            this.pause = 0;
            document.getElementById("play").style.display = "none";
            document.getElementById("game-info").innerHTML = "PLAYING";
        }
    },
    submit: function() {

        if (!arweave_handler.loggedIn) {
            document.getElementById("game-info").innerHTML = "Please login before submitting your score !";
            return;
        }

        if (this.nickname.trim() === '') {
            document.getElementById("game-info").innerHTML = "Please enter your name !";
            document.getElementById("player-name-input").focus();
            return;
        }

        arweave_handler.submitTrans(JSON.stringify({ 'name': this.nickname, 'score': this.score })).then((response) => {

            if (response.status === 200) {
                document.getElementById("game-info").innerHTML = "Score submitted to Arweave.Take a small break while it gets mined!";
                document.getElementById("submit-score").style.display = "none";
            } else {
                document.getElementById("game-info").innerHTML = "Error: " + response.statusText + ". Please try again later.";
            }

        });

    },
    checkLines: function() {
        for (i = 0; i < 20; i++) {
            full = true;
            for (j = 0; j < 10; j++) {
                full = full && (this.fields[i][j] > 0);
            }

            if (full) {

                //Loop over the remaining lines
                for (ii = i; ii < 19; ii++) {
                    for (j = 0; j < 10; j++) {
                        this.fields[ii][j] = this.fields[ii + 1][j];
                    }
                }

                for (j = 0; j < 10; j++) {
                    this.fields[19][j] = 0;
                }

                this.rowsHit++;
                this.score += 60;
                this.currentlevel = parseInt(this.score / 300);

                if (this.previouslevel < this.currentlevel) {
                    this.timestep = (this.timestep / 2);
                    clearInterval(this.timer); // Start the game loop
                    tetrisObject = this;
                    this.timer = setInterval(function() { tetrisObject.gameLoop() }, this.timestep);
                    this.previouslevel = this.currentlevel;
                }

                document.getElementById("score").innerHTML = this.score.toString();
                document.getElementById("rowsHit").innerHTML = this.rowsHit.toString();
                document.getElementById("level").innerHTML = this.currentlevel.toString();
                document.getElementById("rowhit").currentTime = 0;
                document.getElementById("rowhit").play();

                i--;
            }
        }
    },
    login: function() {
        console.log("logging in", arweave_handler.arweave);
        document.getElementById("file-input").click();
    },
    readFile: function(e) {
        var file = e.target.files[0];
        var file_reader = new FileReader();
        file_reader.onload = function(event) {
            var jwk = event.target.result;
            jwk = JSON.parse(jwk);
            arweave_handler.init().then(function() {
                arweave_handler.login(jwk);
            });
        };
        file_reader.readAsText(file);
    },
    inputHandler: function(e) {
        console.log(e.target.value);
        this.nickname = e.target.value.toString();
        if (this.nickname.length > 5) {
            document.getElementById("play").style.display = "block";
            document.getElementById("game-info").innerHTML = "Time to Play!";
        } else {
            document.getElementById("play").style.display = "none";
            document.getElementById("game-info").innerHTML = "Name with minimum 5 characters";
        }
    },
    displayPermaBoard: function() {
        arweave_handler.getPermaBoard().then((permaboard) => {
            if (document.getElementById("spinner")) {
                document.getElementById("spinner").remove();
                document.getElementById("permaboard-table").style.visibility = "visible";
            }

            // console.log(permaboard);

            for (let i = 0; i < (permaboard.length > 10 ? 10 : permaboard.length); i++) {

                var player = permaboard[i].name;
                var score = permaboard[i].score.toString();

                var playerCell = document.createElement("TD");
                var playerCellText = document.createTextNode(player);
                playerCell.appendChild(playerCellText);

                var scoreCell = document.createElement("TD");
                var scoreCellText = document.createTextNode(score);
                scoreCell.appendChild(scoreCellText);

                var row = document.createElement("TR");
                row.appendChild(playerCell);
                row.appendChild(scoreCell);

                document.getElementById("permaboard-table").appendChild(row);

            }


        });
    }
}

window.Tetris = Tetris;