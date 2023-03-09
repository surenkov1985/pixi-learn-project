import * as PIXI from "pixi.js";
import "./assets/styles/index.scss";

const App = PIXI.Application,
	Sprite = PIXI.Sprite,
	Texture = PIXI.Texture,
	Container = PIXI.Container;

let app = new App({ width: 450, height: 800, background: 0x227dae });

document.body.appendChild(app.view);

const gameContainer = new Container();
gameContainer.x = 0;
gameContainer.y = 0;

app.stage.addChild(gameContainer);
const bubbles = []

let sprite = Sprite.from("./assets/images/bg-sheet0.png");
gameContainer.addChild(sprite);
let bubbleTexture = PIXI.Texture.from("./assets/images/bubble-sheet0.png");
let bubblesContainer = new Container()
bubblesContainer.width = bubbleTexture.width
bubblesContainer.height = bubbleTexture.height

for (let i = 0; i < 30; i++) {
    const bubble = new Sprite(bubbleTexture)
    bubble.anchor.set(0.5)
    bubble.scale.set(0.2 + Math.random() * 0.2)

    bubble.x = (Math.random() - 0.5) * 30
    bubble.y = (Math.random() - 0.5) * 30
    bubble.direction = i + (Math.random() - 0.5) * Math.PI
    bubble.speed = 2.5 + (Math.random() * 0.3)
    bubbles.push(bubble)
    bubblesContainer.addChild(bubble)
    console.log(bubble.speed);
}

let bubbleSprite = new Sprite(bubbleTexture);
let scale = 0.8
bubbleSprite.x = 100;
bubbleSprite.y = app.screen.height + 100;
// bubbleSprite.y = 100;
bubbleSprite.interactive = true
bubbleSprite.anchor.set(0.5)
bubbleSprite.scale.set(scale);
let elapsed = 0.0
let count = 0
let isBurst = false
app.ticker.add((delta) => {
    if (isBurst){
    for (let i = 0; i < bubbles.length; i ++) {
        const bubble = bubbles[i]

        bubble.x += Math.sin(bubble.direction) * bubble.speed
        bubble.y += Math.cos(bubble.direction) * bubble.speed;
        bubble.alpha -= 0.02
    }}
    elapsed += delta
    if (bubbleSprite.y <= -bubbleSprite.height) {
        bubbleSprite.y = app.screen.height + 100;
        // bubbleSprite.renderable = false
        elapsed = 0.0;
    }
    if (bubbleSprite.texture == bubbleTexture) {
    bubbleSprite.scale.x = scale + Math.sin((Math.PI * elapsed) / 70.0) / 20;
    bubbleSprite.scale.y = scale - Math.sin((Math.PI * elapsed) / 70.0) / 20;
    bubbleSprite.y -= 1.5
}
})

console.log(bubblesContainer);
bubbleSprite.on("pointerdown", onBubbleClick)

gameContainer.addChild(bubbleSprite);

function onBubbleClick() {
    console.log(this.texture === bubbleTexture);
    this.texture = null
    isBurst = true
    this.addChild(bubblesContainer)
}

// let elapsed = 0.0
// app.ticker.add((delta) => {

//     elapsed += delta
//     sprite.x = 100.0 + Math.tan(elapsed / 100.0) * 100.0
//     sprite.y = 100.0 + Math.sin(elapsed / 10.0) * 200.0;

// })

// const container = new PIXI.Container()
// app.stage.addChild(container)

// const texture = PIXI.Texture.from("sample.png")

// for (let i = 0; i < 4; i++) {
//     const sample = new PIXI.Sprite(texture)
//     sample.anchor.set(0.5)
//     sample.x = (i % 2) * 200
//     sample.y = Math.floor(i / 2) * 200
//     container.addChild(sample)
// }

// container.x = app.screen.width / 2
// container.y = app.screen.height / 2

// container.pivot.x = container.width / 2
// container.pivot.y = container.height / 2

// app.ticker.add((delta) => {
//     container.rotation += 0.005 * delta
// })

// let frame = new PIXI.Graphics()
// frame.beginFill(0x666666)
// frame.lineStyle({color: 0xFFFFFF, width: 4, alignment: 0})
// frame.drawRect(0, 0, 208, 208)
// frame.position.set(app.screen.width / 2 - 104, app.screen.height / 2 - 104);
// app.stage.addChild(frame)

// let mask = new PIXI.Graphics()
// mask.beginFill(0xFFFFFF)
// mask.drawRect(0, 0, 200, 200)
// mask.endFill()

// let maskContainer = new PIXI.Container()
// maskContainer.mask = mask
// maskContainer.addChild(mask)
// maskContainer.position.set(4, 4)
// frame.addChild(maskContainer)

// let text = new PIXI.Text(
// 	"This text will scroll up and be masked, so you can see how masking works.  Lorem ipsum and all that.\n\n" +
// 		"You can put anything in the container and it will be masked!",
//         {
//             fontSize:24,
//             fill: 0x1010ff,
//             wordWrap: true,
//             wordWrapWidth: 180
//         }
// );

// text.x = 10
// maskContainer.addChild(text)

// let newElapsed = 0.0
// app.ticker.add((delta) => {
//     newElapsed += delta
//     text.y = 10 + - 100.0 + Math.cos(elapsed/50.0) * 100.0
// })
