import * as PIXI from "pixi.js"
import "./assets/styles/index.scss"

const App = PIXI.Application,
    Sprite = PIXI.Sprite,
    Texture = PIXI.Texture,
    Container = PIXI.Container

let app = new App({width: 450, height: 800,background: 0x227DAE})

document.body.appendChild(app.view)

app.renderer.view.style.background = 0x227DAE;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";




let sprite = PIXI.Sprite.from("./assets/images/bg-sheet0.png")
app.stage.addChild(sprite)
let header = PIXI.Texture.from("./assets/images/header-sheet0.png")
let headerSprite = new Sprite(header)
header.x= 0
header.y = 0
app.stage.addChild(headerSprite)
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