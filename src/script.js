/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById('collision-canvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
ctx.font = '50px Impact';

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let explosions = [];
class Explosion {
    constructor(x,y,size){
        this.spriteWidth = 200;
        this.spriteHeight = 179; 
        this.width = this.spriteWidth * 0.7;
        this.height = this.spriteHeight * 0.7;
        this.x = x; 
        this.y = y; 
        this.img = new Image();
        this.img.src = "assets/boom.png"
        this.frame = 0;
        this.timer = 0;
        this.angle = Math.random() * 6.2; //Roughly 1 rad
        this.sound = new Audio();
        this.sound.src = 'assets/boom.wav';
        this.sound.volume = 0.2; //Make it less loud
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
    }
    update(deltaTime){
        if (this.frame === 0) this.sound.play();
        this.timer++;
        if (this.timer % 5 === 0){
            this.frame++;
        }
    }
    drawWithoutRotate() {
        this.x = this.x - this.width/2;
        this.y = this.y - this.height/2;
        ctx.drawImage(this.img, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.img, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 0 - this.width/2, 0 - this.height/2, this.width, this.height);
        ctx.restore();
    }
}

let ravens = [];
class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifer = Math.random() * 0.6 + 0.4
        this.width = this.spriteWidth * this.sizeModifer;
        this.height = this.spriteHeight * this.sizeModifer;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3; 
        this.directionY = Math.random() * 5 - 2.5; 
        this.markedForDeletion = false;
        this.img = new Image();
        this.img.src = 'assets/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.ravenColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.ravenColor[0] + ',' + this.ravenColor[1] + ',' + this.ravenColor[2] + ')'
    }
    update(deltaTime) {
        if (this.y < 0 || this.y > (canvas.height - this.height)) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++; 
            this.timeSinceFlap = 0;
        }
    }
    draw() {
        //ctx.strokeRect(this.x, this.y, this.width, this.height);
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height)
        ctx.drawImage(this.img, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
}

function drawScore (score) {
    ctx.fillStyle = 'black'
    ctx.fillText('Score: ' + score, 50, 75)
    ctx.fillStyle = 'white'
    ctx.fillText('Score: ' + score, 55, 80)
}

window.addEventListener('click', function(e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor.data[3])
    const pc = detectPixelColor.data
    ravens.forEach(raven => {
        if (raven.ravenColor[0] === pc[0] && raven.ravenColor[1] === pc[1] && raven.ravenColor[2] === pc[2]) {
            raven.markedForDeletion = true;
            score++;
        }
    });
});

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height)
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;
    if (timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        // Don't entirely understand this
        ravens.sort(function(a,b) {
            return a.width - b.width;
        });
    };
    drawScore(score);
    [...ravens].forEach(object => object.update(deltaTime));
    [...ravens].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.markedForDeletion);
    requestAnimationFrame(animate)
}
animate(0);