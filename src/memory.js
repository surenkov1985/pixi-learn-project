import * as PIXI from "pixi.js";
import "./assets/styles/index.scss";

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

// /////////////////////// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ///////////////////////////////////

let DEFAULT_CARD_WIDTH = 100;
let DEFAULT_CARD_HEIGHT = 160;
let DEFAULT_LEVEL = 1;
let level = DEFAULT_LEVEL;
const DEFAULT_CARD_MASK = { rows: 2, cols: 2 };

let clickCount = 0;
let selectedCard = null;
let isSelected = false

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
		monstersNumber: 2,
		rowsDiff: 1,
		colsDiff: 1,
		cardScale: 1,
		DefaultTime: 60,
	},
	2: {
		monstersNumber: 4,
		rowsDiff: 1,
		colsDiff: 2,
		cardScale: 1,
		DefaultTime: 60,
	},
};

// /////////////////////// ГЛАВНЫЕ КОНТЕЙНЕРЫ //////////////////////////////////////

// Контейнер игры
const gameContainer = new Container();
app.stage.addChild(gameContainer);
// Контейнер для фона
const BgContainer = new Container();
gameContainer.addChild(BgContainer);
// Контейнеры для карточек
const cardsContainer = new Container();
cardsContainer.x = app.screen.width / 2;
cardsContainer.y = app.screen.height / 2;
cardsContainer.pivot.x = cardsContainer.width / 2;
cardsContainer.pivot.y = cardsContainer.height / 2;
gameContainer.addChild(cardsContainer);

// /////////////////////// GAMEPLAY ////////////////////////////////////////////////

// Фон игры
const background = new Sprite(backgroundTexture);
background.width = app.screen.width;
background.height = app.screen.height;
BgContainer.addChild(background);

// ///////////////////////////////////

function createShirtCard(type) {
	const shirtCard = new Sprite(shirtCardTexture);

	shirtCard.alpha = 1;
	shirtCard.monsterType = type;
	shirtCard.active = false
	shirtCard.selected = false

	shirtCard.disable = function () {
		this.active = false
		this.visible = false;
		this.selected = false
	};

	shirtCard.enable = function () {
		this.active = true
		this.visible = true;
	};

	return shirtCard;
}

function spawnTypes(number) {
	const arr = []

	for (let i = 1; i <= number; i++) {
		const monster = `monster${i}`;
		arr.push(monster);
		arr.push(monster);
	}
	return arr.sort(() => Math.random() - 0.5);
}

function buildCards(level) {
	const rows = DEFAULT_CARD_MASK.rows * level.rowsDiff;
	const cols = DEFAULT_CARD_MASK.cols * level.colsDiff;

	const monsters = spawnTypes(level.monstersNumber);

	for (let i = 0; i < rows; i++) {
		const cardWidth = DEFAULT_CARD_WIDTH;
		const cardHeight = DEFAULT_CARD_HEIGHT;

		let posY = (i % rows) * (cardHeight + 20);

		for (let j = 0; j < cols; j++) {
			const monster = monsters.shift();
			const card = Pool.getShirtCard(monster);

			card.monsterType = monster;
			card.width = cardWidth;
			card.height = cardHeight;
			card.interactive = true;
			card.x = (j % cols) * (card.width + 20);
			card.y = posY;
			card.on("pointerdown", clickCardHandler);
			cardsContainer.addChild(card);
		}
	}

	cardsContainer.pivot.x = cardsContainer.width / 2;
	cardsContainer.pivot.y = cardsContainer.height / 2 - 20;
	console.log(Pool);
}

function createMonsterCard(type) {
	console.log(type);
	const texture = MONSTER_TYPES[type]["texture"];
	const monsterCard = new Sprite(texture);

	monsterCard.alpha = 1;
	monsterCard.active = false;

	cardsContainer.addChild(monsterCard)

	monsterCard.disable = function () {
		this.active = false;
		this.visible = false;
	};

	monsterCard.enable = function () {
		this.active = true;
		this.visible = true;
	};

	return monsterCard;
}

function createMonsterCardAt(x, y, type) {
	const card = Pool.getMonsterCard(type)

	card.width = DEFAULT_CARD_WIDTH
	card.height = DEFAULT_CARD_HEIGHT
	card.x = x
	card.y = y
}


function clickCardHandler() {
	if (isSelected) return
	this.selected = true;
	isSelected = true
	// const posX = this.x
	// const posY = this.y
	
	// createMonsterCardAt(posX, posY, this.monsterType)
	// if (clickCount > 0) {
	// 	if (selectedCard && selectedCard.monsterType === this.monsterType) {
	// 		let posX = 
	// 		selectedCard.disable();
	// 		this.disable();
	// 		console.log(true, selectedCard, clickCount);
	// 	} else {
	// 		this.texture = shirtCardTexture;
	// 		selectedCard.texture = shirtCardTexture;
	// 		console.log(false, selectedCard, clickCount);
	// 	}
	// 	selectedCard = null;
	// 	clickCount = 0;
	// } else {
	// 	selectedCard = this;
	// 	this.texture = this.monsterTexture;
	// 	clickCount++;
	// }
}

// //////////////////////////////////// ОБНОВЛЕНИЕ ///////////////////////////////

app.ticker.add(delta => {
	if (isSelected) {
		for (let i = cardsContainer.children.length - 1; i >= 0; i--) {
			const card = cardsContainer.children[i]
			
			if (card && card.selected) {
				card.alpha -= 0.05 * delta

				if (card.alpha <= 0) {
					isSelected = false;
					const posX = card.x;
					const posY = card.y;
					createMonsterCardAt(posX, posY, card.monsterType);
					card.disable()
				}
			}
		}
	}
})

// ////////////////////////////////////  POOL  ///////////////////////////////////

const Pool = {
	CACHE: {},
	getShirtCard: function (type) {
		const key = type + "_shirt";
		return this.getFromCache(key, () => createShirtCard(type));
	},
	getMonsterCard: function(type) {
		const key = type + "_card"
		return this.getFromCache(key, () => createMonsterCard(type))
	},

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


buildCards(levelsOptions[level]);
