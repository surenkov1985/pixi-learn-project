import * as PIXI from "pixi.js";
import "./assets/styles/index.scss";

const App = PIXI.Application,
	Sprite = PIXI.Sprite,
	Texture = PIXI.Texture,
	Container = PIXI.Container,
	Text = PIXI.Text,
	TextStyle = PIXI.TextStyle;

let score = 0;
let lives = 3;
let isBombCheck = false

let app = new App({ width: 450, height: 800, background: 0x227dae });

document.body.appendChild(app.view);

// AlexCode

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max) {
	return Math.random() * (max - min) + min;
}

const gameContainer = new Container();
app.stage.addChild(gameContainer);

// фон
const bg = Sprite.from("./static/images/bg-sheet0.png");
gameContainer.addChild(bg);

// контейнер для пузырей
const bubblesContainer = new Container();
gameContainer.addChild(bubblesContainer);
// контейнер для партиклей от взрыва пузырей
const particlesContainer = new Container();
gameContainer.addChild(particlesContainer);
// контейнер для хедера
const headerContainer = new Container();
gameContainer.addChild(headerContainer);

// хедер
const headerSprite = Sprite.from("./static/images/header-sheet0.png");
const heartUiTexture = Sprite.from("./static/images/heart2-sheet0.png");
const heartsContainer = new Container();
headerSprite.width = app.screen.width;
headerSprite.height = 90;
headerContainer.addChild(headerSprite);

heartUiTexture.scale.set(0.9);
heartUiTexture.x = app.screen.width / 2;
heartUiTexture.y = 35;
heartUiTexture.anchor.set(0.5);

headerContainer.addChild(heartUiTexture);
headerContainer.addChild(heartsContainer)

// текст
const textStyle = new TextStyle({
	fontFamily: "Arial",
	fontSize: 26,
	fontWeight: 900,
	fill: 0xffffff,
});

let UIText = new Text(``, textStyle);
UIText.x = 15;
UIText.y = 20;
UIText.scoreText = "SCORE : ";
UIText.value = 0;
UIText.text = UIText.scoreText + UIText.value;
headerContainer.addChild(UIText);

const bubbleTexture = Texture.from("./static/images/bubble-sheet0.png");
const heartTexture = Texture.from("./static/images/heart-sheet0.png");
const bombTexture = Texture.from("./static/images/bomb-sheet0.png");

const textures = [
	{ texture: bubbleTexture, prop: "isBubble" },
	{ texture: heartTexture, prop: "isHeart" },
	{ texture: bombTexture, prop: "isBomb" },
];

createLifesAt(lives);

function createLifesAt(lifeValue) {
	let posX = heartUiTexture.x + 40;
	let posY = heartUiTexture.y;
	const dist = 32;
    
	if (!heartsContainer.children.length) {

		for (let i = 0; i < lifeValue; i++) {
			const life = new Sprite(bubbleTexture);
            life.alpha = 1
            life.elapsed = 0
			life.anchor.set(0.5);
			life.scale.set(0.15);
			life.x = posX;
			life.y = posY;
			heartsContainer.addChild(life);
			posX += dist;
		}
		
	} else if (heartsContainer.children.length > lifeValue) {
        
        for (let i = heartsContainer.children.length - 1; i >= lifeValue; i--) {
            let heart = heartsContainer.children[i]
            heart.destroy()
        }
		
	} else if (heartsContainer.children.length < lifeValue) {
        
        const life = new Sprite(bubbleTexture);
		posX += dist * heartsContainer.children.length;
        life.alpha = 1;
        life.elapsed = 0
		life.anchor.set(0.5);
		life.scale.set(0.15);
		life.x = posX;
		life.y = posY;
		heartsContainer.addChild(life);
	}
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
	createParticlesAt(this.x, this.y);
	if (this.prop === "isHeart") {
		lives = lives === 3 ? lives : lives + 1;
		score++;
        createLifesAt(lives);
	}
	if (this.prop === "isBomb") {
		lives--;
        // isBombCheck = true
		createLifesAt(lives)
        
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

app.ticker.add((delta) => {
	if (!delta) return;
	if (lives <= 0) return;

	curSpawnBubbleDelay -= delta * 10;

	if (curSpawnBubbleDelay < 0) {
		curSpawnBubbleDelay = SPAN_BUBBLE_DELAY;

		spawnBubble();
	}

    
        // for (let i = heartsContainer.children.length - 1; i >= 0; i--) {
		// 	let heart = heartsContainer.children[i];
        //     if (isBombCheck) {
                // heart.elapsed += delta;
                // console.log(heart.elapsed);
				// if (i >= lives) {
				// 	heart.destroy();
				// }
				// curBlinkLifeDelay -= delta * 10;
				// if (curBlinkLifeDelay < 0) {
				// 	isBombCheck = false;
				// 	heart.alpha = 1;
				// 	curBlinkLifeDelay = SPAN_BUBBLE_DELAY;
				// 	heart.elapsed = 0;
				// } else {
				// 	heart.alpha = 1 + Math.sin((Math.PI * heart.elapsed) / 10.0) * 100;
				// }
            // }

			

			// heart.alpha = 1 + Math.sin((Math.PI * heart.elapsed) / 10.0) * 100;
		// }
    

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
                    createLifesAt(lives);
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
});

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
