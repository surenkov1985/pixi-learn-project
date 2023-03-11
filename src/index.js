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
// обособляем загрузку всего контента
// (правда в данный момент он ещё не грузится, как надо, с прогрессбаром, а подгружается налету)
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
// тут можно задать какие то глобальные переменные и константы
let score = 0;
const MAX_LIVES = 3;
let lives = MAX_LIVES;
// лучше использовать глобальные переменные для определения завершения игры или единый state параметр.
// в данном случае можно заюзать переменную isGameOver, указывающу, что жизни кончились
// и наступил гейм овер
let isGameOver = false;
let isGamePlay = false
let isPaused = false;

// //////////////////////////////////////////////////////////////////////// ГЛАВНЫЕ КОНТЕЙНЕРЫ
// тут мы обособляем создание основных верхних контейнеров в нужном порядке,
// чтобы фон был снизу, пузыри под интерфейсом и т.д.

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
// контейнер для попапа
const pauseContainer = new Container();
pauseContainer.visible = false;
gameContainer.addChild(pauseContainer);
// контейнер для главного меню
const menuContainer = new Container();
gameContainer.addChild(menuContainer);

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
pauseBtn.on("pointerdown", onPauseToggle);

headerContainer.addChild(pauseBtn);

function onPauseToggle() {
	isPaused = !isPaused;
	pauseContainer.visible = isPaused;
	// pauseBtn.interactive = !isPaused;
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
		isGameOver = true;
	} else if (lives > MAX_LIVES) {
		lives = MAX_LIVES;
	}

	updateUILives();
}

manageLives();

// //////////////////////////////////////////////////////////////////////// GAMEPLAY
const textures = [
	{ texture: bubbleTexture, prop: "isBubble" },
	{ texture: heartTexture, prop: "isHeart" },
	{ texture: bombTexture, prop: "isBomb" },
];

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

	UIText.text = UIText.scoreText + score;
	console.log("score: " + score, "lives:" + lives);

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

// //////////////////////////////////////////////////////////////////////// UPDATE
app.ticker.add((delta) => {
	if (!delta) return;
	if (isGameOver) return;
	if (isPaused) return;

	if (isGamePlay) {
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

// //////////////////////////////////////////////////////////////////////// PAUSE
// это не попап, это панель паузы. Многие панельки в геймдеве выглядят, как попапы
// чтобы не называть их все попапами, лучше использовать более узкие названия

// я обычно использую шейдинги под панелями, у которых interactive = true
// таким образом клик не проходит на нижележащие интерактивные объекты,
// пока не скроется этот шейдинг.
// Шейдинг можно сделать невидимым и при этом интерактивным, выставив alpha = 0
const pauseShading = new Graphics();
pauseShading.beginFill(0x000000, 0.6);
pauseShading.drawRect(-1000, -1000, 2000, 2000);
pauseShading.endFill();
// pauseShading.alpha = 0;
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
// в другом месте может быть ещё одна кнопка плей, лучше добавить имя панели
// к которой принадлежит эта, учитывая, что у нас тут всё глобальное
const pausePlayBtn = new Sprite(playBtnTexture);
pausePlayBtn.anchor.set(0.5);
pausePlayBtn.scale.set(0.85);
pausePlayBtn.interactive = true;
pausePlayBtn.x = 356;
pausePlayBtn.y = 526;
pausePlayBtn.on("pointerdown", onPauseToggle);
pauseContainer.addChild(pausePlayBtn);

// кнопка выхода
const exitBtn = new Sprite(exitBtnTexture);
exitBtn.anchor.set(0.5);
exitBtn.scale.set(0.85);
exitBtn.interactive = true;
exitBtn.x = 94;
exitBtn.y = 526;
exitBtn.on("pointerdown", ShowMenu)
pauseContainer.addChild(exitBtn);

// /////////////////////////////////////////// МЕНЮ

//  фон меню
const menuBg = new Sprite(menuBgTexture);
menuBg.width = app.screen.width
menuBg.height = app.screen.height;
menuContainer.addChild(menuBg);

// кнопка play в меню
const menuPlayBtn = new Sprite(playBtnTexture)
menuPlayBtn.anchor.set(0.5)
menuPlayBtn.scale.set(2.1)
menuPlayBtn.interactive = true
menuPlayBtn.x = app.screen.width / 2
menuPlayBtn.y = app.screen.height / 2 + 10;
menuPlayBtn.on("pointerdown", startGamePlay)
menuContainer.addChild(menuPlayBtn)

function startGamePlay () {
	hideMenu()
}

function ShowMenu() {
	menuContainer.visible = true;
	isGamePlay = false;
	isPaused = false
	pauseContainer.visible = false
	score = 0
	lives = MAX_LIVES

	for (let i = bubblesContainer.children.length - 1; i >= 0 ; i--) {
		let bubble = bubblesContainer.children[i]
		bubble.destroy()
	}
}

function hideMenu() {
	menuContainer.visible = false;
	isGamePlay = true;
} 


// mainCode /////////////////////////////////////////////////////////////////////////////////////////////

// const gameContainer = new Container();
// gameContainer.x = 0;
// gameContainer.y = 0;

// app.stage.addChild(gameContainer);
// const bubbles = [];

// let sprite = Sprite.from("./static/images/bg-sheet0.png");
// gameContainer.addChild(sprite);
// let bubbleTexture = Texture.from("./static/images/bubble-sheet0.png");
// let heartTexture = Texture.from("./static/images/heart-sheet0.png");
// let bombTexture = Texture.from("./static/images/bomb-sheet0.png");

// let textures = ["./static/images/bubble-sheet0.png", "./static/images/heart-sheet0.png", "./static/images/bomb-sheet0.png"];
// let sprites = [];
// let lives = 5;

// buidSprites(textures)

// function buidSprites(textures) {
// 	if (lives < 0) return;
// 	const index = Math.floor(Math.random() * textures.length);
// 	let scale = 0.8 + Math.random() * 0.3;
// 	let position = { x: Math.random() * app.screen.width, y: app.screen.height + 100 };
// 	const speed = 1.5 + Math.random() * 0.3;
// 	const texture = Texture.from(textures[index]);
// 	const sprite = new Sprite(texture);

// 	sprite.x = position.x;
// 	sprite.y = position.y;
// 	sprite.interactive = true;
// 	sprite.anchor.set(0.5);
// 	sprite.scale.set(scale);
// 	sprite.speed = speed;

// 	sprite.on("pointerdown", onBubbleClick);
// 	// gameContainer.addChild(sprite);
// 	// sprites.push(sprite);

// 	setTimeout(() => {
//         gameContainer.addChild(sprite);
// 		sprites.push(sprite);
// 		buidSprites(textures);
// 	}, 500 + (Math.random() * 2000));
// }

// let bubblesContainer = new Container();

// for (let i = 0; i < 30; i++) {
// 	const texture = PIXI.Texture.from("./static/images/bubble-sheet0.png");
// 	const bubble = new Sprite(texture);
// 	bubble.anchor.set(0.5);
// 	bubble.scale.set(0.2 + Math.random() * 0.2);

// 	bubble.x = (Math.random() - 0.5) * 30;
// 	bubble.y = (Math.random() - 0.5) * 30;
// 	bubble.direction = i + (Math.random() - 0.5) * Math.PI;
// 	bubble.speed = 2.5 + Math.random() * 0.3;
// 	bubbles.push(bubble);

// 	bubblesContainer.addChild(bubble);
// }

// // let bubbleSprite = new Sprite(bubbleTexture);
// // let scale = 0.8;
// // bubbleSprite.x = 100;
// // bubbleSprite.y = app.screen.height + 100;
// // bubbleSprite.interactive = true;
// // bubbleSprite.anchor.set(0.5);
// // bubbleSprite.scale.set(scale);
// let elapsed = 0.0;
// // let count = 0;
// let isBurst = false;
// // let positions = { x: bubbleSprite.x, y: bubbleSprite.y };
// app.ticker.add((delta) => {
// 	if (isBurst) {
// 		for (let i = 0; i < bubbles.length; i++) {
// 			const bubble = bubbles[i];

// 			bubble.y += Math.sin(bubble.direction) * bubble.speed;
// 			bubble.x += Math.cos(bubble.direction) * bubble.speed;
// 			bubble.alpha -= 0.02;
// 		}

// 	}
// 	elapsed += delta;
// 	for (let i = 0; i < sprites.length; i++) {
// 		const sprite = sprites[i];
// 		console.log(sprite.texture == bombTexture);
//         // if (sprite.texture == bubbleTexture || sprite.texture == bombTexture || sprite.texture == heartTexture) {
// 			// sprite.scale.x = sprite.scale + Math.sin((Math.PI * elapsed) / 70.0) / 20;
// 			// sprite.scale.y = sprite.scale - Math.sin((Math.PI * elapsed) / 70.0) / 20;
// 			sprite.y -= sprite.speed;
// 		// }
// 		// if (sprite.y <= -sprite.height) {
// 		// 	console.log(sprite.height);
// 		// 	sprite.y = app.screen.height + 100;
// 		// 	gameContainer.removeChild(sprite);
// 		// 	sprite.destroy();
// 		// 	elapsed = 0.0;
// 		// 	lives -= 1;
// 		// }
// 	}
// 	// if (bubbleSprite.texture == bubbleTexture) {
// 	// 	bubbleSprite.scale.x = scale + Math.sin((Math.PI * elapsed) / 70.0) / 20;
// 	// 	bubbleSprite.scale.y = scale - Math.sin((Math.PI * elapsed) / 70.0) / 20;
// 	// 	bubbleSprite.y -= 1.5;
// 	// 	positions.y = bubbleSprite.y;
// 	// }
// 	// if (!bubbleSprite.destroyed && bubbleSprite.y <= -bubbleSprite.height) {
// 	// 	console.log(bubbleSprite);
// 	// 	bubbleSprite.y = app.screen.height + 100;
// 	// 	gameContainer.removeChild(bubbleSprite);
// 	// 	bubbleSprite.destroy();
// 	// 	elapsed = 0.0;
// 	// }
// });
// // bubbleSprite.on("pointerdown", onBubbleClick);

// // gameContainer.addChild(bubbleSprite);

// function onBubbleClick() {
// 	console.log(this, bubblesContainer);
//     bubblesContainer.x = this.x;
// 	bubblesContainer.y = this.y;
// 	gameContainer.removeChild(this);
// 	this.destroy();
// 	isBurst = true;

// 	gameContainer.addChild(bubblesContainer);
// }
