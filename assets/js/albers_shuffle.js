/** @type {HTMLCanvasElement} */
const bgCanvas = document.getElementById("bg");
const bgCtx = bgCanvas.getContext("2d");

const canvas = document.getElementById("fg");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const COLOR_VARIETY = 10;
const TILING_SIZE = 100;
const MOVE_SPEED = TILING_SIZE / 2;
let colors = [];
const tiles = []; //what's the difference between let and const?

let lastTime = performance.now(); //get a time mark as soon as the script starts?

//ctx.imageSmoothingEnabled = false;

function resize() {
  const ratio = window.devicePixelRatio || 1;
  [bgCanvas, canvas].forEach(c => {
    c.width = window.innerWidth * ratio;
    c.height = window.innerHeight * ratio;
    const cctx = c.getContext("2d");
    cctx.setTransform(1, 0, 0, 1, 0, 0); 
    cctx.scale(ratio, ratio);
  });
}
window.addEventListener("resize", resize);
resize();

// load the image and (somehow) sample 5 colors from it
let img = new Image();
img.src = "../assets/photos/amsterdam_clean.jpeg";
img.onload = () => {
  // Draw image offscreen and sample a few colors
  const tmp = document.createElement("canvas");
  const tctx = tmp.getContext("2d");
  tmp.width = img.width;
  tmp.height = img.height;
  tctx.drawImage(img, 0, 0);
  const data = tctx.getImageData(0, 0, img.width, img.height).data; //creates a huge array with four (rgba) values for each pixel

  for (let i = 0; i < COLOR_VARIETY; i++) {
    const x = Math.floor(Math.random() * img.width);
    const y = Math.floor(Math.random() * img.height);
    const idx = 4 * (y * img.width + x); // describes how to find the correct 4 values in the data array for a given (x,y) coordinate pair
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    colors.push(`rgb(${r},${g},${b})`);
  }

  for (let x = 0; x <= bgCanvas.width; x += TILING_SIZE) {
  for (let y = 0; y <= bgCanvas.height; y += TILING_SIZE) {
    const colorValue = Math.floor(Math.random() * colors.length);
    const color = colors[colorValue];
    bgCtx.fillStyle = color;
    bgCtx.fillRect(x, y, TILING_SIZE, TILING_SIZE);
  }
}

  for (let x = 0; x <= canvas.width; x += TILING_SIZE){
    for (let y = 0; y <= canvas.height; y += TILING_SIZE){
        const tile = new SimpleTile(x, y);
        tile.draw(); //draw an object of the tile class on each part of the grid
        tiles.push(tile); //add this object to the tiles array (for animate())
        }
  }

  // Start animation using the animate function declared below
  requestAnimationFrame(animate);
};

class SimpleTile{
    constructor(x, y, baseColor){
        this.startX = x; // stores the start position independently of the current position
        this.x = x;
        this.y = y;
        this.speed = MOVE_SPEED; // pixels
        this.direction = Math.random() < 0.5 ? -1 : 1; // randomly either 1 or -1
        this.size = TILING_SIZE; // pixels
        this.colorValue = Math.floor(Math.random() * COLOR_VARIETY);
        this.baseColor = typeof baseColor == "undefined"
            ? colors[this.colorValue]
            : baseColor;
        this.progress = 0; //starts at 0, ends at 1
        this.seed = Math.random();
    }

    update(delta){
        // update/track progress based on time elapsed, not based on framerate (?)
        this.progress += (this.speed * delta / 1000) / this.size;
        // for example, this might equal: (100 px/s * delta / 1000) / 100px
        // then, if the first update is called 300 ms in, delta = 300ms - 0ms = 300ms (see definition i function animate())
        // (100px/s * 300ms / 1000ms) / 100px = (100 px/s * 0.3s) / 100px = 30px / 100px = 0.3

        // make sure the animation doesn't overshoot 100%
        if (this.progress >= 1) {
            this.progress = 1;
        }
        // move the tile in the right direction, tracking progress
        this.x = this.startX + this.progress * this.size * this.direction;
    }

    draw() {
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(Math.round(this.x), this.y, this.size, this.size);
    }
}

class OpeningGrillTile{
    constructor(x, y, baseColor){
        this.startX = x;
        this.x = x;
        this.y = y;
        this.size = TILING_SIZE;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.grates = [2, 4, 8][Math.floor(Math.random() * 3)];
        this.speed = MOVE_SPEED;
        this.topColorValue = Math.floor(Math.random() * COLOR_VARIETY);
        this.baseColor = baseColor;
        this.topColor = colors[this.topColorValue];
        this.progress = 0;
        this.seed = Math.random();
    }

    draw() {
        const stripeHeight = TILING_SIZE / this.grates;

        // draw background across the whole tile in the baseColor
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(this.startX, this.y, this.size, this.size);

        // for every other grate, draw it extending downwards depending on this.progress
        for (let g = 0; g < this.grates; g++){
            const isTop = g % 2 == 0;
            if (isTop == true) {
                ctx.fillStyle = this.topColor;
                ctx.fillRect(this.startX, this.y + g * stripeHeight, this.size, stripeHeight * this.progress);
            }
        }
    }

    update(delta) {
        // move progress based on time
        this.progress += (this.speed * delta / 1000) / this.size;
        if (this.progress >= 1) this.progress = 1;
    }
}

class MovingGrillTile{
    constructor(x, y, baseColor, topColor, grates){
        this.startX = x;
        this.x = x;
        this.y = y;
        this.size = TILING_SIZE;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.grates = grates;
        this.speed = MOVE_SPEED;
        this.topColorValue = Math.floor(Math.random() * COLOR_VARIETY);
        this.baseColor = baseColor;
        this.topColor = topColor;
        this.progress = 0;
        this.seed = Math.random(); // decides if it closes or spawns another MovingGrillTile
    }

    draw() {
        const stripeHeight = TILING_SIZE / this.grates;

        // draw background across the whole tile in the baseColor
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // for every other grate, draw it extending downwards depending on this.progress
        for (let g = 0; g < this.grates; g++){
            const isTop = g % 2 == 0;
            if (isTop == true) {
                ctx.fillStyle = this.topColor;
                ctx.fillRect(this.x, this.y + g * stripeHeight, this.size, stripeHeight);
            } else {
                ctx.fillStyle = this.baseColor;
                ctx.fillRect(this.x, this.y + g * stripeHeight, this.size, stripeHeight);  
            }
        }
    }

    update(delta) {
        // move progress based on time
        this.progress += (this.speed * delta / 1000) / this.size;
        if (this.progress >= 1) this.progress = 1;

        this.x = this.startX + this.progress * this.size * this.direction;
    }
}

class ClosingGrillTile{
    constructor(x, y, baseColor, topColor, grates){
        this.startX = x;
        this.x = x;
        this.y = y;
        this.size = TILING_SIZE;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.grates = grates;
        this.speed = MOVE_SPEED;
        this.topColorValue = Math.floor(Math.random() * COLOR_VARIETY);
        this.baseColor = topColor;
        this.topColor = baseColor;
        this.progress = 0;
        this.seed = Math.random();
    }

    draw() {
        const stripeHeight = TILING_SIZE / this.grates;

        // draw background across the whole tile in the baseColor
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(this.startX, this.y, this.size, this.size);

        // for every other grate, draw it extending downwards depending on this.progress
        for (let g = 0; g < this.grates; g++){
            const isTop = g % 2 == 0;
            if (isTop == false) {
                ctx.fillStyle = this.topColor;
                ctx.fillRect(this.startX, this.y + g * stripeHeight, this.size, stripeHeight * (1 - this.progress));
            }
        }
    }

    update(delta) {
        // move progress based on time
        this.progress += (this.speed * delta / 1000) / this.size;
        if (this.progress >= 1) this.progress = 1;
    }
}

function animate(now) {
    const delta = now - lastTime;
    lastTime = now;

    // Clear the canvas once per frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // go through all the tiles and do ...
    for (let i = 0; i < tiles.length; i++) {
        // update them according to their class, draw them
        const tile = tiles[i]
        tile.update(delta);
        tile.draw();

        // keep an eye on their progress, and when they're done:
        if (tile.progress >= 1) {
        const x = tile.x;
        const y = tile.y;
        const baseColor = tile.baseColor;
        const topColor = tile.topColor;
        const grates= tile.grates;

        let newTile;

        if (tile instanceof OpeningGrillTile) {
            tile.seed > 0.1
            ? newTile = new MovingGrillTile(x, y, baseColor, topColor, grates)
            : newTile = new ClosingGrillTile(x, y, baseColor, topColor, grates)
        } else if (tile instanceof MovingGrillTile) {
            tile.seed > 0.5
            ? newTile = new MovingGrillTile(x, y, baseColor, topColor, grates)
            : newTile = new ClosingGrillTile(x, y, baseColor, topColor, grates)
        } else if (tile instanceof ClosingGrillTile) {
            tile.seed > 0.2
            ? newTile = new SimpleTile(x, y, baseColor)
            : newTile = new OpeningGrillTile(x, y, baseColor, topColor, grates)
        } else if (tile instanceof SimpleTile) {
            tile.seed > 0.3
            ? newTile = new SimpleTile(x, y, baseColor)
            : newTile = new OpeningGrillTile(x, y, baseColor, topColor, grates)        
        };

        // fallback
        if (!newTile) newTile = new SimpleTile(x, y);

        tiles[i] = newTile;
        }
    }

    requestAnimationFrame(animate); // ?
}

// create a few other tile classes: four subtiles, stripey tiles, et cetera that all move horizontally
// fix the stupid gap issue
// have each tile randomly create one other type of tile where it ends

