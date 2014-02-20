    // inner variables
    var canvas, ctx;
    var width, height;
    var iStart = 0;
    var bRightBut = false;
    var bLeftBut = false;
    //object variables
    var oBall, oPadd, oBricks;
    //sound array
    var aSounds = [];
    //scored points
    var iPoints = 0;
    var nBricks =0

    //functions for creating objects
    function Ball(x, y, dx, dy, r) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.r = r;
    }
    function Padd(x, w, h, img) {
        this.x = x;
        this.w = w;
        this.h = h;
        this.img = img;
    }
    function Bricks(w, h, r, c, p) {
        this.w = w;
        this.h = h;
        this.r = r; // rows
        this.c = c; // cols
        this.p = p; // padding
        this.objs;
    	this.colors = ['white']; // colors for rows
    }

    function initialise(){
        //canvas
        canvas = document.getElementById('scene');
        ctx = canvas.getContext('2d');
        nBricks = 0;
        width = canvas.width;
        height = canvas.height;

        //pad image
        var padImg = new Image();
        padImg.src = 'images/paddWhite.png';
        padImg.onload = function() {};

        //creating objects
        oBall = new Ball(width / 2, 550, 0.5, -5, 10); // position x, position y, speed/angle x, speed/angle y, radius
        oPadd = new Padd(width / 2, 120, 20, padImg); // position x, width ,height, image
        oBricks = new Bricks((width / 6 -5) - 1, 20, 10, 6, 5); // width of a single brick, height of a single brick,number of bricks vertically, number of bricks horizontally, brick padding

        //filling bricks
        oBricks.objs = new Array(oBricks.r);
        for (i=0; i < oBricks.r; i++) {
            oBricks.objs[i] = new Array(oBricks.c);
            for (j=0; j < oBricks.c; j++) {
                //randomly distribute the bricks
                if (nBricks < 30 && (Math.random() < 0.5) == true){
                oBricks.objs[i][j] = 0;
                }else if(nBricks < 30)  {
                oBricks.objs[i][j] = 1;
                nBricks++
                }
            }
        }
        console.log(nBricks);

        iStart = setInterval(drawScene, 10); // loop drawScene

        allowMouseControl();
        allowKeyboardControl();
    };

    function clearCanvas() { // clear canvas function
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // fill background
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    function drawScene() {
        clearCanvas();

        // draw Ball
		ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(oBall.x, oBall.y, oBall.r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        if (bRightBut && oPadd.x < width-120){
            oPadd.x += 10;
        }
        else if (bLeftBut &&  oPadd.x > 0){
            oPadd.x -= 10;
        }

        // draw Padd (rectangle)
        ctx.drawImage(oPadd.img, oPadd.x, ctx.canvas.height - 30);

        // draw bricks (from array of its objects)
        for (i=0; i < oBricks.r; i++) {
            ctx.fillStyle = oBricks.colors[i];
            for (j=0; j < oBricks.c; j++) {
                if (oBricks.objs[i][j] == 1) {
                    ctx.beginPath();
                    ctx.rect((j * (oBricks.w + oBricks.p)) + oBricks.p, (i * (oBricks.h + oBricks.p)) + oBricks.p, oBricks.w, oBricks.h);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }

        oBall.x += oBall.dx;
        oBall.y += oBall.dy;

        collisionDetection();
    }

    function allowMouseControl(){
        var iCanvX1 = $(canvas).offset().left;
        var iCanvX2 = iCanvX1 + width;
        canvas.onmousemove = function(e) { // binding mousemove event
            if (e.pageX > iCanvX1 && e.pageX < iCanvX2) {
                oPadd.x = Math.max(e.pageX - iCanvX1 - (oPadd.w/2), 0);
                oPadd.x = Math.min(ctx.canvas.width - oPadd.w, oPadd.x);
            }
        };
    }

    function allowKeyboardControl(){

        document.onkeydown = function(event){ // keyboard-down alerts
            switch (event.keyCode) {
                case 37: // 'Left' key
                    bLeftBut = true;
                    break;
                case 39: // 'Right' key
                    bRightBut = true;
                    break;
            }
        };
        document.onkeyup = function(event){ // keyboard-up alerts
            switch (event.keyCode) {
                case 37: // 'Left' key
                    bLeftBut = false;
                    break;
                case 39: // 'Right' key
                    bRightBut = false;
                    break;
            }
        };
    }

    function collisionDetection(){
         // collision detection
        iRowH = oBricks.h + oBricks.p;
        iRow = Math.floor(oBall.y / iRowH);
        iCol = Math.floor(oBall.x / (oBricks.w + oBricks.p));

        // mark brick as broken (empty) and reverse ball
        if (oBall.y < oBricks.r * iRowH && iRow >= 0 && iCol >= 0 && oBricks.objs[iRow][iCol] == 1) {
            oBricks.objs[iRow][iCol] = 0;
            oBall.dy = -oBall.dy;
            iPoints++;
            if (iPoints % 2 === 0){
                oBall.dy = oBall.dy*1.1;
            }

            if (iPoints === 5){
            	clearInterval(iStart);
                iPoints = 0;
                $("#winScreenDiv").show();
           		clearCanvas();
            }

        }

        // when ball hits the sidewall, reverse X position of ball
        if (oBall.x + oBall.dx + oBall.r > ctx.canvas.width || oBall.x + oBall.dx - oBall.r < 0) {
            console.log('hit sidewall')
            oBall.dx = -oBall.dx;
        }

        if (oBall.y + oBall.dy - oBall.r < 0) {
            console.log('hit the very top');
            oBall.dy = -oBall.dy;

        //if ball hits the PAD, reverse in angle
        } else if (oBall.y + oBall.dy + oBall.r > ctx.canvas.height - 25) {
            console.log('hit the pad');
            if (oBall.x > oPadd.x && oBall.x < oPadd.x + oPadd.w) {
                oBall.dx = 10 * ((oBall.x-(oPadd.x+oPadd.w/2))/oPadd.w);
                oBall.dy = -oBall.dy;

            }
            //if ball hits the very ground GAME OVER
            else if (oBall.y + oBall.dy + oBall.r > ctx.canvas.height +10) {
                console.log('Game Over');
                clearInterval(iStart);
                iPoints = 0;
                clearCanvas();
                $("#loseScreenDiv").show();

            }
        }
    }

    function introScreen(){
        $( "#startGameButton" ).click(function() {
          $( "#introScreenDiv" ).remove();
          initialise();
        });
    }

    $( ".restartGameButton" ).click(function() {
        /*$.post("https://api.scoreoid.com/v1/createScore", {api_key:"4fe408d16ed751b2504ef2c2e3f5a4ca61551a1d",game_id:"b93478f923",response:"json", username: 'Bobro', score: 357},
           function(response) {
             console.log(response);
           });*/
          $("#loseScreenDiv").hide();
          $("#winScreenDiv").hide();
          initialise();
    });

    introScreen();