"use-strict";

const renderrerWidth = 256;
const renderrerHeight = 144;
let strechyMode = false;
let currentState = 0; // 0 = landscape, 1 = portrait, 2 = strechy
let dpr = 1;
function onresize() {
    if (!strechyMode && window.innerWidth / window.innerHeight > renderrerWidth / renderrerHeight && currentState != 0) {
        // Landscape
        document.documentElement.style.setProperty("--body-flex-direction", "column");
        document.documentElement.style.setProperty("--renderrer-width", `calc(100vh * (${renderrerWidth} / ${renderrerHeight}))`);
        document.documentElement.style.setProperty("--renderrer-height", "100vh");
        currentState = 0;
    } else if (!strechyMode && window.innerWidth / window.innerHeight < renderrerWidth / renderrerHeight && currentState != 1) {
        // Portrait
        document.documentElement.style.setProperty("--body-flex-direction", "row");
        document.documentElement.style.setProperty("--renderrer-width", "100vw");
        document.documentElement.style.setProperty("--renderrer-height", `calc(100vw * (${renderrerHeight} / ${renderrerWidth}))`);
        currentState = 1;
    } else if (strechyMode && currentState != 2) {
        // Strechy
        document.documentElement.style.setProperty("--body-flex-direction", "column");
        document.documentElement.style.setProperty("--renderrer-width", "100vw");
        document.documentElement.style.setProperty("--renderrer-height", "100vh");
        currentState = 2;
    }
}
addEventListener("resize", onresize);
onresize();

let renderrer = null;
let renderrerContext = null;
let playerSprite = null;
let playerX = 0;
let playerY = 0;
let playerXvel = 0;
let playerYvel = 0;
function init() {
    renderrer = document.querySelector("#renderrer");
    renderrer.width = renderrerWidth;
    renderrer.height = renderrerHeight;
    renderrerContext = renderrer.getContext("2d");
    renderrerContext.imageSmoothingEnabled = false;

    InputJS.Bind("D", "right");
    InputJS.Bind("ArrowRight", "right");
    InputJS.Bind("A", "left");
    InputJS.Bind("ArrowLeft", "left");
    InputJS.Bind(" ", "jump");
    InputJS.Bind("W", "jump");
    InputJS.Bind("ArrowUp", "jump");
    InputJS.Bind("J", "special");
    InputJS.Bind("F", "special");
    InputJS.CreateAxis("move", "left", "right");

    playerSprite = new Image();
    playerSprite.onload = () => {
        update();
    };
    playerSprite.src = "/sprites/Player.png";
}
function draw(sprite, x, y) {
    renderrerContext.drawImage(sprite, x, renderrer.height - (y + sprite.height));
}
function update() {
    const updateStartTime = performance.now();

    /*
    Physics updates look like this
    1 Apply velocity to get target move
    2 Stake claim in the axis of greater motion x > y || y > x
    3 
    */

    InputJS.Update();
    playerXvel = InputJS.GetAxis("move") * 1.5;
    playerYvel -= 0.1;
    if (input_jump && playerY == 0) {
        playerYvel = 3.5;
    }

    playerX += playerXvel;
    playerY += playerYvel;
    if (playerY < 0) {
        playerY = 0;
        playerYvel = 0;
    }

    renderrerContext.fillStyle = "#626262";
    renderrerContext.fillRect(0, 0, renderrer.width, renderrer.height);
    draw(playerSprite, Math.floor(playerX), Math.floor(playerY));

    requestAnimationFrame(update);
    const updateEndTime = performance.now();
    const deltaTime = updateEndTime - updateStartTime;
    console.log(`DeltaMS ${deltaTime}`);
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}