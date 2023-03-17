import { sound } from "@pixi/sound";
import gsap from "gsap";
import * as PIXI from "pixi.js";
import "../assets/styles/index.scss";

// инициализация приложения

const App = PIXI.Application,
	Sprite = PIXI.Sprite,
	Texture = PIXI.Texture,
	Container = PIXI.Container,
	Text = PIXI.Text,
	TextStyle = PIXI.TextStyle;

const app = new App({ width: 960, height: 600, background: 0x000000 });
document.body.appendChild(app.view);

globalThis.__PIXI_APP__ = app;

// /////////////////////// АССЕТЫ (картинки, звуки, шрифты) ////////////////////////

sound.add("soundTrack", "./static/audio/memory/soundtrack.ogg");
// sound.play("soundTrack", { loop: true });

const backgroundTexture = Texture.from("./static/images/memory/background-default-000.jpg");
const shirtCardTexture = Texture.from("./static/images/memory/card-shirt-sheet0.png");

// текстуры монстров
const monster1Texture = Texture.from("./static/images/memory/card1-sheet0.png");
const monster2Texture = Texture.from("./static/images/memory/card2-sheet0.png");
const monster3Texture = Texture.from("./static/images/memory/card3-sheet0.png");
const monster4Texture = Texture.from("./static/images/memory/card4-sheet0.png");
const monster5Texture = Texture.from("./static/images/memory/card5-sheet0.png");
const monster6Texture = Texture.from("./static/images/memory/card6-sheet0.png");
const monster7Texture = Texture.from("./static/images/memory/card7-sheet0.png");
const monster8Texture = Texture.from("./static/images/memory/card8-sheet0.png");
const monster9Texture = Texture.from("./static/images/memory/card9-sheet0.png");
const monster10Texture = Texture.from("./static/images/memory/card10-sheet0.png");
const monster11Texture = Texture.from("./static/images/memory/card11-sheet0.png");
const monster12Texture = Texture.from("./static/images/memory/card12-sheet0.png");
const monster13Texture = Texture.from("./static/images/memory/card13-sheet0.png");
const monster14Texture = Texture.from("./static/images/memory/card14-sheet0.png");
const monster15Texture = Texture.from("./static/images/memory/card15-sheet0.png");
const monster16Texture = Texture.from("./static/images/memory/card16-sheet0.png");
const exitBtnTexture = Texture.from("./static/images/memory/buttonexit-sheet0.png");
const audioOffBtnTexture = Texture.from("./static/images/memory/buttonaudio-sheet0.png");
const audioOnBtnTexture = Texture.from("./static/images/memory/buttonaudio-sheet1.png");
const moreGamesBtnTexture = Texture.from("./static/images/memory/buttonfullscreen-sheet0.png");

// /////////////////////// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ///////////////////////////////////

let DEFAULT_CARD_WIDTH = 100;
let DEFAULT_CARD_HEIGHT = 160;
let DEFAULT_BUTTON_WIDTH = 72;
let DEFAULT_SCORE = 0;
let DEFAULt_SCALE = 0.5;

let score = DEFAULT_SCORE;
let scoreIndex = 10;
let bonusIndex = 1;
let bonusTime;

let DEFAULT_LEVEL = 1;
let level = DEFAULT_LEVEL;
let levelTime;

let clickCount = 0;
let firstCard = null;
let secondCard = null;
let isSelected = false;
let isPaused = false;

const MONSTER_TYPES = {
	monster1: { texture: monster1Texture },
	monster2: { texture: monster2Texture },
	monster3: { texture: monster3Texture },
	monster4: { texture: monster4Texture },
	monster5: { texture: monster5Texture },
	monster6: { texture: monster6Texture },
	monster7: { texture: monster7Texture },
	monster8: { texture: monster8Texture },
	monster9: { texture: monster9Texture },
	monster10: { texture: monster10Texture },
	monster11: { texture: monster11Texture },
	monster12: { texture: monster12Texture },
	monster13: { texture: monster13Texture },
	monster14: { texture: monster14Texture },
	monster15: { texture: monster15Texture },
	monster16: { texture: monster16Texture },
};

const levelsOptions = {
	1: {
		// monstersNumber: 2,	// в целом, не нужный параметр, т.к. монстров будет rows * cols / 2, т.е. можно высчитать в процессе
		rows: 2,
		cols: 2,
		cardScale: 1,
		DefaultTime: 20,
	},
	2: {
		// monstersNumber: 4,
		rows: 2,
		cols: 4,
		cardScale: 1,
		DefaultTime: 40,
	},
};

// /////////////////////// ГЛАВНЫЕ КОНТЕЙНЕРЫ //////////////////////////////////////

// Контейнер игры
const gameContainer = new Container();
app.stage.addChild(gameContainer);
// Контейнер для фона
const BgContainer = new Container();
gameContainer.addChild(BgContainer);
// контейнеры для монстров
const monstersContainer = new Container();
monstersContainer.x = app.screen.width / 2;
monstersContainer.y = app.screen.height / 2;
gameContainer.addChild(monstersContainer);
// Контейнеры для карточек
const cardsContainer = new Container();
cardsContainer.x = app.screen.width / 2;
cardsContainer.y = app.screen.height / 2;
gameContainer.addChild(cardsContainer);
// контейнер интерфейса
const UIContainer = new Container();
gameContainer.addChild(UIContainer);
// контейнер для таймера
const timerUIContainer = new Container();
UIContainer.addChild(timerUIContainer);
// контейнер для отображения очков в интерфейсе
const scoreUIContainer = new Container();
UIContainer.addChild(scoreUIContainer);
// контейнер для кнопок управления в интефейсе
const controlsContainer = new Container();
UIContainer.addChild(controlsContainer);
// контейнер для паузы
const pauseContainer = new Container();
gameContainer.addChild(pauseContainer);

// ////////////////////////  USER INTEFACE  ////////////////////////////////////////

const textStyle = new TextStyle({
	fontFamily: "Roboto",
	fontSize: 28,
	fontWeight: 600,
	fill: 0xffffff,
});

// текст таймера
const timerUI = new Text("", textStyle);
timerUI.timeText = "TIME: ";
timerUI.minutes = "00";
timerUI.seconds = "00";
timerUI.text = timerUI.timeText + timerUI.minutes + ":" + timerUI.seconds;
timerUI.anchor.y = 0.5;
timerUI.x = 10;
timerUI.y = 50;
UIContainer.addChild(timerUI);

// текст таймера бонусного времени
const bonusTimeText = new Text("", textStyle);
bonusTimeText.timeText = "Bonus Timer: ";
bonusTimeText.minutes = "";
bonusTimeText.seconds = "";
bonusTimeText.DefaultTime = 4;
bonusTimeText.time = bonusTimeText.DefaultTime;
bonusTimeText.text = bonusTimeText.timeText + bonusTimeText.minutes + ":" + bonusTimeText.seconds;
bonusTimeText.anchor.y = 0.5;
bonusTimeText.visible = false;
bonusTimeText.x = 10;
bonusTimeText.y = app.screen.height - 40;
UIContainer.addChild(bonusTimeText);

function updateTimer(time, elem) {
	const timeData = {
		minutes: 0,
		seconds: 0,
	};

	timeData.minutes = Math.floor(time / 60)
		.toString()
		.padStart(2, "0");
	timeData.seconds = (time % 60).toString().padStart(2, "0");

	elem.text = elem.timeText + timeData.minutes + ":" + timeData.seconds;
}

function startTimer(time, elem) {
	if (time < 0) return timer;
	if (isPaused) return timer;
	let timer = time;

	updateTimer(timer, elem);
	timer -= 1;

	setTimeout(() => {
		startTimer(timer , elem);
	}, 1000);
}

levelTime = startTimer(20, timerUI);

// текст очков
const scoreUI = new Text("", textStyle);
scoreUI.scoreText = "SCORE: ";
scoreUI.value = score;
scoreUI.text = scoreUI.scoreText + scoreUI.value;
scoreUI.anchor.set(0.5);
scoreUI.x = app.screen.width / 2;
scoreUI.y = 50;
UIContainer.addChild(scoreUI);

function updateScore() {
	scoreUI.text = scoreUI.scoreText + score;
}

// кнопка exit
const exitBtn = new Sprite(exitBtnTexture);
exitBtn.initScale = DEFAULt_SCALE;
exitBtn.scale.set(exitBtn.initScale);
exitBtn.anchor.set(0.5);
exitBtn.interactive = true;
exitBtn.cursor = "pointer";
exitBtn.on("pointerdown", handlerExitGameBtn);
exitBtn.x = app.screen.width - 50;
exitBtn.y = 50;
UIContainer.addChild(exitBtn);

function handlerExitGameBtn() {
	buttonAnimation(this);
	isPaused = true;
	console.log("paused");
}

// кнопка отключения звука
const offAudioBtn = new Sprite(audioOffBtnTexture);
offAudioBtn.initScale = DEFAULt_SCALE;
offAudioBtn.scale.set(offAudioBtn.initScale);
offAudioBtn.anchor.set(0.5);
offAudioBtn.interactive = true;
offAudioBtn.cursor = "pointer";
offAudioBtn.on("pointerdown", handlerMuteToggle);
offAudioBtn.x = exitBtn.x - DEFAULT_BUTTON_WIDTH - 10;
offAudioBtn.y = 50;
UIContainer.addChild(offAudioBtn);

function handlerMuteToggle() {
	sound.toggleMuteAll();
	buttonAnimation(this, () => {
		offAudioBtn.texture = offAudioBtn.texture === audioOffBtnTexture ? audioOnBtnTexture : audioOffBtnTexture;
	});
}

// кнопка more game
const moreGamesBtn = new Sprite(moreGamesBtnTexture);
moreGamesBtn.initScale = DEFAULt_SCALE;
moreGamesBtn.scale.set(moreGamesBtn.initScale);
moreGamesBtn.anchor.set(0.5);
moreGamesBtn.interactive = true;
moreGamesBtn.cursor = "pointer";
moreGamesBtn.x = app.screen.width - 50;
moreGamesBtn.y = app.screen.height - 50;
UIContainer.addChild(moreGamesBtn);
moreGamesBtn.on("pointerdown", handlerMoreGamesBtn);

function handlerMoreGamesBtn() {
	buttonAnimation(this, () => {
		window.open("http://localhost:3001");
	});
}

function buttonAnimation(elem, callback) {
	gsap.timeline()
		.to(elem.scale, { x: elem.initScale * 0.9, y: elem.initScale * 0.9, duration: 0.1 })
		.to(elem.scale, { x: elem.initScale, y: elem.initScale, duration: 0.1 })
		.then(() => {
			if (callback) callback();
		});
}

// /////////////////////// GAMEPLAY ////////////////////////////////////////////////

// Фон игры
const background = new Sprite(backgroundTexture);
background.width = app.screen.width;
background.height = app.screen.height;
BgContainer.addChild(background);

// ///////////////////////////////////

function spawnTypes(number) {
	const arr = [];

	for (let i = 1; i <= number; i++) {
		const monster = `monster${i}`;
		arr.push(monster);
		arr.push(monster);
	}
	return arr.sort(() => Math.random() - 0.5);
}

// function createShirtCard(type) {
// 	const shirtCard = new Sprite(shirtCardTexture);
//
// 	shirtCard.width = DEFAULT_CARD_WIDTH;
// 	shirtCard.height = DEFAULT_CARD_HEIGHT;
// 	shirtCard.alpha = 1;
// 	shirtCard.monsterType = type;
// 	shirtCard.active = false;
// 	shirtCard.selected = false;
// 	shirtCard.interactive = true;
// 	shirtCard.on("pointerdown", onCardHandler);
//
// 	cardsContainer.addChild(shirtCard);
//
// 	shirtCard.disable = function () {
// 		this.active = false;
// 		this.visible = false;
// 		this.selected = false;
// 	};
//
// 	shirtCard.enable = function () {
// 		this.active = true;
// 		this.visible = true;
// 		this.alpha = 1;
// 	};
//
// 	return shirtCard;
// }

// function createdShirtCardAt(x, y, type) {
// 	const card = Pool.getShirtCard(type);
// 	card.x = x;
// 	card.y = y;
// 	return card;
// }

function spawnCardAt(x, y, type) {
	const card = Pool.getCard(type);
	card.x = x;
	card.y = y;
	cardsContainer.addChild(card);
	return card;
}

function buildCards(level) {
	const rows = level.rows;
	const cols = level.cols;
	const monstersCount = cols * rows / 2;
	const monsters = spawnTypes(monstersCount);

	for (let i = 0; i < rows; i++) {
		let posY = (i % rows) * (DEFAULT_CARD_HEIGHT + 20);

		for (let j = 0; j < cols; j++) {
			const posX = (j % cols) * (DEFAULT_CARD_WIDTH + 20);
			// const monster = monsters.shift();
			const monster = monsters.pop();		// pop - берет объект с конца массива, поэтому работает значительно быстрее, чем shift. Если нет острой необходимости, то лучше использовать pop
			// const card = createdShirtCardAt(posX, posY, monster);
			const card = spawnCardAt(posX, posY, monster);
			card.setState('shirt');
		}
	}

	cardsContainer.pivot.x = cardsContainer.width / 2;
	cardsContainer.pivot.y = cardsContainer.height / 2 - 20;
	monstersContainer.pivot.x = cardsContainer.pivot.x;
	monstersContainer.pivot.y = cardsContainer.pivot.y;
}

// function createMonsterCard(type) {
// 	const texture = MONSTER_TYPES[type]["texture"];
// 	const monsterCard = new Sprite(texture);
//
// 	monsterCard.width = DEFAULT_CARD_WIDTH;
// 	monsterCard.height = DEFAULT_CARD_HEIGHT;
// 	monsterCard.monsterType = type;
// 	monsterCard.alpha = 1;
// 	monsterCard.active = false;
//
// 	monstersContainer.addChild(monsterCard);
//
// 	monsterCard.disable = function () {
// 		this.active = false;
// 		this.visible = false;
// 	};
//
// 	monsterCard.enable = function () {
// 		this.alpha = 1;
// 		this.active = true;
// 		this.visible = true;
// 	};
//
// 	return monsterCard;
// }

// function createMonsterCardAt(x, y, type) {
// 	const card = Pool.getMonsterCard(type);
//
// 	card.x = x;
// 	card.y = y;
//
// 	return card;
// }

function onCardHandler() {
	if (isSelected) return;
	isSelected = true;

	const card = this.holder;

	// const posX = this.x;
	// const posY = this.y;
	// console.log(this.monsterType);
	console.log(card.type);
	// const monsterCard = createMonsterCardAt(posX, posY, this.monsterType);
	// console.log(monsterCard);

	if (!firstCard) {
		firstCard = card;
	} else if (!secondCard) {
		secondCard = card;
	}

	card.setState('face', true, () => {
		isSelected = false;

		if (firstCard && secondCard) {
			checkCards(firstCard, secondCard);

			firstCard = null;
			secondCard = null;
		}
	});

	// gsap.timeline()
	// 	.to(this, {
	// 		alpha: 0,
	// 		duration: 0.5,
	// 	})
	// 	.then(() => {
	// 		isSelected = false;
	// 		this.disable();
	//
	// 		if (firstCard && secondCard) {
	// 			checkCards(firstCard, secondCard);
	// 			firstCard = null;
	// 			secondCard = null;
	// 			isSelected = false;
	// 		}
	// 	});
}

function checkCards(firstCard, secondCard) {
	if (firstCard.type === secondCard.type) {
		score += scoreIndex * bonusIndex;

		updateScore();

		firstCard.animateHide();
		secondCard.animateHide();

		// for (let i = 0; i < monstersContainer.children.length; i++) {
		// 	const card = monstersContainer.children[i];
		// 	card.alpha = 1;
		// 	const posX = card.x;
		// 	const posY = card.y;
		//
		// 	gsap.to(card, {
		// 		alpha: 0,
		// 		duration: 0.5,
		// 	}).then(() => {
		// 		card.disable();
		// 	});
		// }
	} else {
		firstCard.setState('shirt', true);
		secondCard.setState('shirt', true);

		// for (let i = 0; i < monstersContainer.children.length; i++) {
		// 	const card = monstersContainer.children[i];
		// 	card.alpha = 1;
		// 	const posX = card.x;
		// 	const posY = card.y;
		//
		// 	const shirtCard = createdShirtCardAt(posX, posY, card.monsterType);
		// 	card.disable();
		// }
	}
}

// //////////////////////////////////// ОБНОВЛЕНИЕ ///////////////////////////////

// app.ticker.add((delta) => {

// });

// ////////////////////////////////////  КАРТА  ///////////////////////////////////
class Card extends PIXI.Container {
	constructor(type) {
		super();

		this.type = type;
		this.state = 'face';	// face, shirt
		this.selected = false;
		this.active = false;

		this.shirt = new PIXI.Sprite(shirtCardTexture);
		this.shirt.width = DEFAULT_CARD_WIDTH;
		this.shirt.height = DEFAULT_CARD_HEIGHT;
		this.shirt.anchor.set(0.5);
		this.addChild(this.shirt);

		this.face = new PIXI.Sprite(MONSTER_TYPES[type]["texture"]);
		this.face.width = DEFAULT_CARD_WIDTH;
		this.face.height = DEFAULT_CARD_HEIGHT;
		this.face.anchor.set(0.5);
		this.addChild(this.face);

		const touchMargin = 5;	// увеличиваем немного зону тача, чтобы на мобилках пальцем было проще попасть
		const touchWidth = DEFAULT_CARD_WIDTH + touchMargin * 2;
		const touchHeight = DEFAULT_CARD_HEIGHT + touchMargin * 2;
		this.touchZone = new PIXI.Graphics();
		this.touchZone.beginFill(0x00ff00, 0.2);
		this.touchZone.drawRect(-touchWidth / 2, -touchHeight / 2, touchWidth, touchHeight);
		this.touchZone.endFill();
		this.addChild(this.touchZone);
		this.touchZone.alpha = 0;
		this.touchZone.interactive = true;
		this.touchZone.holder = this;
		this.touchZone.on("pointerdown", onCardHandler);
	}

	setState(state = this.state, isAnim = false, callback) {
		this.state = state;

		if (isAnim) {
			if (this.timelineShowFace) this.timelineShowFace.kill();
			if (this.timelineShowShirt) this.timelineShowShirt.kill();

			if (state === 'face') {
				this.timelineShowFace = gsap.timeline({onComplete: () => {
						if (callback) callback();
					}})
					.to(this.shirt, {alpha: 0, duration: 0.2})
					.to(this.face, {alpha: 1, duration: 0.2})
			} else {
				this.timelineShowShirt = gsap.timeline({onComplete: () => {
						if (callback) callback();
					}})
					.to(this.face, {alpha: 0, duration: 0.2})
					.to(this.shirt, {alpha: 1, duration: 0.2})
			}
		} else {
			if (state === 'face') {
				this.face.alpha = 1;
				this.shirt.alpha = 0;
			} else {
				this.face.alpha = 0;
				this.shirt.alpha = 1;
			}
		}
	}

	animateHide() {
		this.timelineHide = gsap.timeline({onComplete: () => {
				this.disable();
			}})
			.to(this, {alpha: 0, duration: 0.2})
	}


	reset() {
		if (this.timelineHide) this.timelineHide.kill();
		if (this.timelineShowFace) this.timelineShowFace.kill();
		if (this.timelineShowShirt) this.timelineShowShirt.kill();

		this.selected = false;
		this.alpha = 1;
		this.rotation = 0;
		this.scale.set(1);
	}

	enable() {
		this.alpha = 1;
		this.active = true;
		this.visible = true;
	}

	disable() {
		this.active = false;
		this.visible = false;
		this.reset();
	}
}

// ////////////////////////////////////  POOL  ///////////////////////////////////

const Pool = {
	CACHE: {},
	getCard: function (type) {
		const key = 'card_' + type;
		return this.getFromCache(key, () => new Card(type));
	},
	// getShirtCard: function (type) {
	// 	const key = type + "_shirt";
	// 	return this.getFromCache(key, () => createShirtCard(type));
	// },
	// getMonsterCard: function (type) {
	// 	const key = type + "_card";
	// 	return this.getFromCache(key, () => createMonsterCard(type));
	// },

	getFromCache: function (key, callback) {
		if (!this.CACHE[key]) this.CACHE[key] = [];

		let stream = this.CACHE[key];

		let i = 0;
		let len = stream.length;
		let item;

		if (len === 0) {
			stream[0] = callback(key);
			item = stream[0];
			item.enable();

			return item;
		}

		while (i <= len) {
			if (!stream[i]) {
				stream[i] = callback(key);
				item = stream[i];
				item.enable();
				break;
			} else if (!stream[i].active) {
				item = stream[i];
				item.enable();
				break;
			} else {
				i++;
			}
		}

		return item;
	},
};

// //////////////////////////////////// СТАРТ ///////////////////////////////

buildCards(levelsOptions[level]);
