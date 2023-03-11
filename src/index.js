import * as PIXI from "pixi.js";
import "./assets/styles/index.scss";
import { Graphics } from "pixi.js";

// ++++++++++++++++++++ MATH
function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max) {
	return Math.random() * (max - min) + min;
}
// ++++++++++++++++++++

// инициализируем приложение
const App = PIXI.Application,
	Sprite = PIXI.Sprite,
	Texture = PIXI.Texture,
	Container = PIXI.Container,
	Text = PIXI.Text,
	TextStyle = PIXI.TextStyle;

let app = new App({ width: 450, height: 800, background: 0x227dae });
document.body.appendChild(app.view);

// //////////////////////////////////////////////////////////////////////// АССЕТЫ (картинки, звуки, шрифты)

const bgTexture = Texture.from("./static/images/bg-sheet0.png");
const headerBgTexture = Texture.from("./static/images/header-sheet0.png");
const heartUiTexture = Texture.from("./static/images/heart2-sheet0.png");
const bubbleTexture = Texture.from("./static/images/bubble-sheet0.png");
const heartTexture = Texture.from("./static/images/heart-sheet0.png");
const bombTexture = Texture.from("./static/images/bomb-sheet0.png");
const pauseBtnTexture = Texture.from("./static/images/pausebtn-sheet0.png");
const pausePopupTexture = Texture.from("./static/images/popup-sheet1.png");
const gameOverPopupTexture = Texture.from("./static/images/popup-sheet0.png");
const exitBtnTexture = Texture.from("./static/images/exitbtn-sheet0.png");
const playBtnTexture = Texture.from("./static/images/playbtn-sheet0.png");
const menuBgTexture = Texture.from("./static/images/menubg-sheet0.png");

// ////////////////////////////////////////////////////////////////////////
let score = 0;
const MAX_LIVES = 3;
let lives = MAX_LIVES;

let isGameOver = false;
let isGameplay = false;
let isPaused = false;

// //////////////////////////////////////////////////////////////////////// ГЛАВНЫЕ КОНТЕЙНЕРЫ

// основной конейнер для всей игры
const gameContainer = new Container();
app.stage.addChild(gameContainer);
// контейнер для фона
const bgContainer = new Container();
gameContainer.addChild(bgContainer);
// контейнер для пузырей
const bubblesContainer = new Container();
gameContainer.addChild(bubblesContainer);
// контейнер для партиклей от взрыва пузырей
const particlesContainer = new Container();
gameContainer.addChild(particlesContainer);
// контейнер для хедера
const headerContainer = new Container();
gameContainer.addChild(headerContainer);
// контейнер для паузы
const pauseContainer = new Container();
// pauseContainer.visible = false;
gameContainer.addChild(pauseContainer);
// контейнер для гейм овера
const gameOverContainer = new Container();
gameContainer.addChild(gameOverContainer);
// контейнер для главного меню
const menuContainer = new Container();
gameContainer.addChild(menuContainer);

// //////////////////////////////////////////////////////////////////////// GAMEPLAY

// //////////////////////////////////////////////////////////////////////// ФОН
const bg = new Sprite(bgTexture);
bgContainer.addChild(bg);

// //////////////////////////////////////////////////////////////////////// HEADER
const headerBg = new Sprite(headerBgTexture);
headerBg.width = app.screen.width;
headerBg.height = 90;
headerContainer.addChild(headerBg);

const heartUiSprite = new Sprite(heartUiTexture);
heartUiSprite.anchor.set(0.5);
heartUiSprite.scale.set(0.9);
heartUiSprite.x = app.screen.width / 2;
heartUiSprite.y = 35;
headerContainer.addChild(heartUiSprite);

const heartsContainer = new Container();
headerContainer.addChild(heartsContainer);

// текст
const textStyle = new TextStyle({
	fontFamily: "Arial",
	fontSize: 26,
	fontWeight: 900,
	fill: 0xffffff,
});

let UIText = new Text(``, textStyle);
UIText.scoreText = "SCORE : ";
UIText.value = 0;
UIText.text = UIText.scoreText + UIText.value;
UIText.x = 15;
UIText.y = 20;
headerContainer.addChild(UIText);

// кнопка паузы
let pauseBtn = new Sprite(pauseBtnTexture);
pauseBtn.anchor.set(0.5);
pauseBtn.scale.set(0.85);
pauseBtn.interactive = true;
pauseBtn.x = 395;
pauseBtn.y = 75;
pauseBtn.on("pointerdown", handlerGameplayPause);

headerContainer.addChild(pauseBtn);

function handlerGameplayPause() {
	showPause();
}

function updateUILives() {
	const initX = heartUiSprite.x + 40;
	const initY = heartUiSprite.y;
	const BETWEEN_X = 32;

	const createLife = () => {
		const life = new Sprite(bubbleTexture);
		life.anchor.set(0.5);
		life.scale.set(0.15);

		return life;
	};
	// создаем иконки жизней, если их недостаточно или они вообще ещё не созданы.
	if (heartsContainer.children.length < lives) {
		while (heartsContainer.children.length < lives) {
			const life = createLife();

			life.x = initX + BETWEEN_X * heartsContainer.children.length;
			life.y = initY;

			heartsContainer.addChild(life);
		}
	}

	for (let i = 0; i < heartsContainer.children.length; i++) {
		const life = heartsContainer.children[i];

		life.visible = lives > i;
	}
}

function manageLives() {
	if (lives <= 0) {
		lives = 0;
		showGameOver();
	} else if (lives > MAX_LIVES) {
		lives = MAX_LIVES;
	}

	updateUILives();
}

function updateScore() {
	UIText.text = UIText.scoreText + score;
}

// manageLives();

// ///////////////////////////////////////////////////
const textures = [
	{ texture: bubbleTexture, prop: "isBubble" },
	{ texture: heartTexture, prop: "isHeart" },
	{ texture: bombTexture, prop: "isBomb" },
];

function startGameplay() {
	resetGameplay();

	isGameplay = true;
}

function resetGameplay() {
	bubblesContainer.removeChildren();
	particlesContainer.removeChildren();
	score = 0;
	lives = MAX_LIVES;

	updateScore();
	manageLives();

	isGameplay = false;
}

function createBubbleAt(x = 0, y = 0) {
	const ind = random(0, textures.length - 1);
	const texture = textures[ind];
	const bubble = new Sprite(texture.texture);
	bubble.anchor.set(0.5);
	bubble.initSpeed = random(2, 3.5);
	bubble.initScale = randomFloat(0.6, 0.8);
	bubble.scale.set(bubble.initScale);
	bubble.elapsed = 0;
	bubble.addRubberScale = 0;
	bubble.interactive = true;
	bubble.x = x;
	bubble.y = y;
	bubble.prop = texture.prop;
	bubble.on("pointerdown", onBubbleClick);

	bubblesContainer.addChild(bubble);

	return bubble;
}

function createParticlesAt(x = 0, y = 0) {
	for (let i = 0; i < 10; i++) {
		const particle = new Sprite(bubbleTexture);
		particle.anchor.set(0.5);
		particle.scale.set(randomFloat(0.2, 0.4));
		particle.direction = randomFloat(0, Math.PI * 2);
		let randDist = random(0, 20);
		particle.x = x + Math.cos(particle.direction) * randDist;
		particle.y = y + Math.sin(particle.direction) * randDist;
		particle.speed = random(3, 5);
		particle.elapsed = 0;
		particle.addRubberScale = 0;

		particlesContainer.addChild(particle);
	}
}

function onBubbleClick(e) {
	if (isGameOver) return;
	if (isPaused) return;

	createParticlesAt(this.x, this.y);

	if (this.prop === "isHeart") {
		score++;
		lives++;

		manageLives();
	}
	if (this.prop === "isBomb") {
		lives--;

		manageLives();
	}
	if (this.prop === "isBubble") {
		score++;
	}

	updateScore();

	this.destroy();
}

function spawnBubble() {
	const x = random(100, app.screen.width - 100);
	const y = app.screen.height + 100;

	createBubbleAt(x, y);
}

const SPAN_BUBBLE_DELAY = 500;
let curSpawnBubbleDelay = 0;
let curBlinkLifeDelay = 500;

// ///////////////////////////////////////// UPDATE
app.ticker.add((delta) => {
	if (!delta) return;
	if (isGameOver) return;
	if (isPaused) return;

	if (isGameplay) {
		curSpawnBubbleDelay -= delta * 10;

		if (curSpawnBubbleDelay < 0) {
			curSpawnBubbleDelay = SPAN_BUBBLE_DELAY;

			spawnBubble();
		}

		for (let i = bubblesContainer.children.length - 1; i >= 0; i--) {
			let bubble = bubblesContainer.children[i];

			if (bubble) {
				bubble.y -= bubble.initSpeed * delta;
				bubble.elapsed += delta;
				bubble.addRubberScale = Math.sin((Math.PI * bubble.elapsed) / 70.0) / 20;
				bubble.scale.x = bubble.initScale + bubble.addRubberScale;
				bubble.scale.y = bubble.initScale - bubble.addRubberScale;

				if (bubble.y <= -bubble.height / 2) {
					if (bubble.prop !== "isBomb") {
						lives--;

						manageLives();
					}
					bubble.destroy();
				}
			}
		}

		for (let i = particlesContainer.children.length - 1; i >= 0; i--) {
			let particle = particlesContainer.children[i];

			if (particle) {
				particle.x += Math.cos(particle.direction) * particle.speed * delta;
				particle.y += Math.sin(particle.direction) * particle.speed * delta;
				particle.alpha -= 0.05 * delta;

				if (particle.alpha <= 0) {
					particle.destroy();
				}
			}
		}
	}
});

// /////////////////////////////////////////////////////////////////////////////////////////////////// PAUSE

const pauseShading = new Graphics();
pauseShading.beginFill(0x000000, 0.6);
pauseShading.drawRect(-1000, -1000, 2000, 2000);
pauseShading.endFill();
pauseShading.interactive = true;
pauseShading.x = app.screen.width / 2;
pauseShading.y = app.screen.height / 2;
pauseContainer.addChild(pauseShading);

// фон панельки паузы
const pauseBg = new Sprite(pausePopupTexture);
pauseBg.anchor.set(0.5);
pauseBg.scale.set(0.85);
pauseBg.x = app.screen.width / 2;
pauseBg.y = app.screen.height / 2;
pauseContainer.addChild(pauseBg);

// кнопка play
const pausePlayBtn = new Sprite(playBtnTexture);
pausePlayBtn.anchor.set(0.5);
pausePlayBtn.scale.set(0.85);
pausePlayBtn.interactive = true;
pausePlayBtn.x = 356;
pausePlayBtn.y = 526;
pausePlayBtn.on("pointerdown", handlerPauseResume);
pauseContainer.addChild(pausePlayBtn);

// кнопка выхода
const exitBtn = new Sprite(exitBtnTexture);
exitBtn.anchor.set(0.5);
exitBtn.scale.set(0.85);
exitBtn.interactive = true;
exitBtn.x = 94;
exitBtn.y = 526;
exitBtn.on("pointerdown", handlerPauseHome);
pauseContainer.addChild(exitBtn);

function handlerPauseResume() {
	hidePause();
}

function handlerPauseHome() {
	hidePause();
	resetGameplay();
	showMenu();
}

function showPause() {
	pauseContainer.visible = true;
	isPaused = true;
}

function hidePause() {
	pauseContainer.visible = false;
	isPaused = false;
}

// ////////////////////////////////////////////////////////////////////////////////////// GAME OVER

const gameOverShading = new Graphics();
gameOverShading.beginFill(0x000000, 0.6);
gameOverShading.drawRect(-1000, -1000, 2000, 2000);
gameOverShading.endFill();
gameOverShading.interactive = true;
gameOverShading.x = app.screen.width / 2;
gameOverShading.y = app.screen.height / 2;
gameOverContainer.addChild(gameOverShading);

//  фон панельки геймовера
const gameOverBg = new Sprite(gameOverPopupTexture);
gameOverBg.anchor.set(0.5);
gameOverBg.scale.set(0.85);
gameOverBg.x = app.screen.width / 2;
gameOverBg.y = app.screen.height / 2;
gameOverContainer.addChild(gameOverBg);

// кнопка плей геймовера
const gameOverPlayBtn = new Sprite(playBtnTexture);
gameOverPlayBtn.anchor.set(0.5);
gameOverPlayBtn.scale.set(0.85);
gameOverPlayBtn.interactive = true;
gameOverPlayBtn.x = 356;
gameOverPlayBtn.y = 526;
gameOverPlayBtn.on("pointerdown", handlerGameOverNew);
gameOverContainer.addChild(gameOverPlayBtn);

// кнопка exit геймовера
const gameOverExitBtn = new Sprite(exitBtnTexture);
gameOverExitBtn.anchor.set(0.5);
gameOverExitBtn.scale.set(0.85);
gameOverExitBtn.interactive = true;
gameOverExitBtn.x = 94;
gameOverExitBtn.y = 526;
gameOverExitBtn.on("pointerdown", handlerGameOverExit);
gameOverContainer.addChild(gameOverExitBtn);

function handlerGameOverExit() {
	hideGameOver();
	resetGameplay();
	showMenu();
}

function handlerGameOverNew() {
	startGameplay();
	hideGameOver();
}

function showGameOver() {
	gameOverContainer.visible = true;
	isGameOver = true;
}

function hideGameOver() {
	gameOverContainer.visible = false;
	isGameOver = false;
}

// ////////////////////////////////////////////////////////////////////////////////////// МЕНЮ

//  фон меню
const menuBg = new Sprite(menuBgTexture);
menuBg.width = app.screen.width;
menuBg.height = app.screen.height;
menuContainer.addChild(menuBg);

// кнопка play в меню
const menuPlayBtn = new Sprite(playBtnTexture);
menuPlayBtn.anchor.set(0.5);
menuPlayBtn.scale.set(2.1);
menuPlayBtn.interactive = true;
menuPlayBtn.x = app.screen.width / 2;
menuPlayBtn.y = app.screen.height / 2 + 10;
menuPlayBtn.on("pointerdown", handlerMenuPlay);
menuContainer.addChild(menuPlayBtn);

function handlerMenuPlay() {
	hideMenu();
	startGameplay();
}

function showMenu() {
	menuContainer.visible = true;
}

function hideMenu() {
	menuContainer.visible = false;
}

// ///////////////////////////////////////////////////////////////////////////////////////////// START
resetGameplay();
hidePause();
hideGameOver();
showMenu();
