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
var iGameTimer;
//elapsed time
var iElapsed = iMin = iSec = 0;
//variables saving last scored time and points
var sLastTime, sLastPoints;
//my vars
var trackScore;
var trackTime;

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
    this.p = p; // padd
    this.objs;
    this.colors = ['#9d9d9d', '#f80207', '#feff01', '#0072ff', '#fc01fc', '#03fe03']; // colors for rows
}


function initialise(){
    //canvas
    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');

    width = canvas.width;
    height = canvas.height;

    //pad image
    var padImg = new Image();
    padImg.src = 'images/padd.png';
    padImg.onload = function() {};

    //creating objects
    oBall = new Ball(width / 2, 550, 0.5, -5, 10); // position x, position y, speed/angle x, speed/angle y, radius
    oPadd = new Padd(width / 2, 120, 20, padImg); // position x, width ,height, image 
    oBricks = new Bricks((width / 8) - 1, 20, 6, 8, 5); // width of a single brick, height of a single brick,number of bricks vertically, number of bricks horizontally, brick padding

    //filling bricks
    oBricks.objs = new Array(oBricks.r);
    for (i=0; i < oBricks.r; i++) {
        oBricks.objs[i] = new Array(oBricks.c);
        for (j=0; j < oBricks.c; j++) {
            oBricks.objs[i][j] = 1;
        }
    }

    //initialising sounds
    /*aSounds[0] = new Audio('media/snd1.wav');
    aSounds[0].volume = 0.9;
    aSounds[1] = new Audio('media/snd2.wav');
    aSounds[1].volume = 0.9;
    aSounds[2] = new Audio('media/snd3.wav');
    aSounds[2].volume = 0.9;*/

    iStart = setInterval(drawScene, 10); // loop drawScene
    iGameTimer = setInterval(countTimer, 1000); // inner game timer

    // HTML5 Local storage - get values
    sLastTime = localStorage.getItem('last-time');
    sLastPoints = localStorage.getItem('last-points');

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
    ctx.fillStyle = '#f66';
    ctx.beginPath();
    ctx.arc(oBall.x, oBall.y, oBall.r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    if (bRightBut)
        oPadd.x += 5;
    else if (bLeftBut)
        oPadd.x -= 5;

    // draw Padd (rectangle)
    ctx.drawImage(oPadd.img, oPadd.x, ctx.canvas.height - oPadd.h);

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

    // Drawing text for time and points
    ctx.font = '16px Verdana';
    ctx.fillStyle = '#fff';

    //minutes and seconds
    iMin = Math.floor(iElapsed / 60);
    iSec = iElapsed % 60;
    if (iMin < 10) iMin = "0" + iMin;
    if (iSec < 10) iSec = "0" + iSec;

    //current stats
    ctx.fillText('Time: ' + iMin + ':' + iSec, 600, 520);
    ctx.fillText('Points: ' + iPoints, 600, 550);
    //previous stats
    if (sLastTime != null && sLastPoints != null) {
        ctx.fillText('Last Time: ' + sLastTime, 600, 460);
        ctx.fillText('Last Points: ' + sLastPoints, 600, 490);
    }
    collisionDetection();
}

function allowMouseControl(){
    var iCanvX1 = canvas.offsetLeft;
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

    // mark brick as broken (empty) and reverse brick
    if (oBall.y < oBricks.r * iRowH && iRow >= 0 && iCol >= 0 && oBricks.objs[iRow][iCol] == 1) {
        oBricks.objs[iRow][iCol] = 0;
        oBall.dy = -oBall.dy;
        iPoints++;

        //aSounds[0].play(); // play sound
    }
 
    // when ball hits the sidewall, reverse X position of ball
    if (oBall.x + oBall.dx + oBall.r > ctx.canvas.width || oBall.x + oBall.dx - oBall.r < 0) {
        console.log('hit sidewall')
        oBall.dx = -oBall.dx;
    }

    if (oBall.y + oBall.dy - oBall.r < 0) {
        console.log('dunno what this does');
        oBall.dy = -oBall.dy;

    //if ball hits the PAD, reverse in angle
    } else if (oBall.y + oBall.dy + oBall.r > ctx.canvas.height - oPadd.h) {
        console.log('hit the pad');
        if (oBall.x > oPadd.x && oBall.x < oPadd.x + oPadd.w) {
            oBall.dx = 10 * ((oBall.x-(oPadd.x+oPadd.w/2))/oPadd.w);
            oBall.dy = -oBall.dy;

           // aSounds[2].play(); // play sound
        }
        //if ball hits the very ground GAME OVER
        else if (oBall.y + oBall.dy + oBall.r > ctx.canvas.height) {
            console.log('Game Over') ;
            clearInterval(iStart);
            clearInterval(iGameTimer);
            trackScore = iPoints;
            trackTime = iElapsed;
            console.log(trackScore)
            console.log(trackTime);

            // HTML5 Local storage - save values
            localStorage.setItem('last-time', iMin + ':' + iSec);
            localStorage.setItem('last-points', iPoints);
            clearCanvas();
            //initialise();

           // aSounds[1].play(); // play sound
        }
    }
}
function countTimer() {
    iElapsed++;
}

initialise();