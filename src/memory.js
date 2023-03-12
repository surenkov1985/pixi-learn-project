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

// /////////////////////// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ///////////////////////////////////

let defaultCardsMask = { rows: 2, cols: 2 };

// /////////////////////// ГЛАВНЫЕ КОНТЕЙНЕРЫ //////////////////////////////////////

// Контейнер игры
const gameContainer = new Container();
app.stage.addChild(gameContainer);
// Контейнер для фона
const BgContainer = new Container();
gameContainer.addChild(BgContainer);
// Контейнеры для карточек
const cardsContainer = new Container();
cardsContainer.x = app.screen.width / 2
cardsContainer.y = app.screen.height / 2 
cardsContainer.pivot.x = cardsContainer.width / 2;
cardsContainer.pivot.y = cardsContainer.height / 2
gameContainer.addChild(cardsContainer);

// /////////////////////// GAMEPLAY ////////////////////////////////////////////////

// Фон игры
const background = new Sprite(backgroundTexture);
background.width = app.screen.width;
background.height = app.screen.height;
BgContainer.addChild(background);

// Построение карточек
for (let i = 0; i < defaultCardsMask.rows; i++) {
    const cardWidth = 100
    const cardHeight = 160
    let posY = (i % defaultCardsMask.rows) * (cardHeight + 20);
	for (let j = 0; j < defaultCardsMask.cols; j++) {
		const card = new Sprite(shirtCardTexture);
		// card.anchor.set(1);
		card.width = cardWidth;
		card.height = cardHeight;
		card.interactive = true;
		card.x = (j % defaultCardsMask.cols) * (card.width + 20);
		card.y = posY;
		cardsContainer.addChild(card);
	}
}
cardsContainer.pivot.x = cardsContainer.width / 2;
cardsContainer.pivot.y = cardsContainer.height / 2 - 20;
console.log(cardsContainer)
