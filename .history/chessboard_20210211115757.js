 let boardSize = 700;
let squareSize = boardSize/8;

// Define aliases
let Application = PIXI.Application,
    loader = new PIXI.Loader(),
    resources = loader.resources,
    Sprite = PIXI.Sprite,
    Point = PIXI.Point,
    TextureCache = PIXI.utils.TextureCache,
    Container = PIXI.Container;


// Properties
const lightCol = 0xeed3ac;
const darkCol =  0xb38967;
const highlightCol_light = 0xede06f;
const highlightCol_dark = 0xceb244;
const checkmateHighlight_light = 0xed6a53;
const checkmateHighlight_dark = 0xd7543e;

const PIECE_ORDER = "kqbnrp";
const FILES = "abcdefgh";
const RANKS = "12345678";

// Setup PIXI, Tink
let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

let app = new PIXI.Application({width: boardSize, height: boardSize});
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.backgroundColor = 0xff00ff;

let t = new Tink(PIXI, app.renderer.view);

window.onload=function()
{
    //Add the canvas that Pixi automatically created to the HTML document
    document.body.appendChild(app.view);
}

// Define containers
let boardContainer, pieceContainer, highlightContainer;


// Load assets
loader.add(
    "img/pieces.png"
)
.load(setup);
loader.onProgress.add(()=>{console.log("Loading: " + loader.progress + "%"); });

function setup(){
    boardContainer = new PIXI.Container();
    pieceContainer = new PIXI.Container();
    // Highlights under pieces, child of board
    highlightContainer = new PIXI.Container();
	boardContainer.addChild(highlightContainer);

    graphics = drawBoard(boardSize, squareSize);
    boardContainer.addChild(graphics);

    // Add board to app
    app.stage.addChild(boardContainer);

    // Pieces are top level
    app.stage.addChild(pieceContainer);

    // Load piece textures (white, black)
    // pieceTextures = loadPieceTextures();

}

