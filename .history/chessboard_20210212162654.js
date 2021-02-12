let boardSize = 744;
let squareSize = boardSize/8;

// Define aliases
let Application = PIXI.Application,
    loader = new PIXI.Loader(),
    resources = loader.resources,
    Sprite = PIXI.Sprite,
    Point = PIXI.Point,
    TextureCache = PIXI.utils.TextureCache,
    Container = PIXI.Container,
    clg = console.log;


// Properties
const LIGHT = 0xeed3ac;
const DARK =  0xb38967;
const HIGHLIGHT_LIGHT = 0xa64941;
const HIGHLIGHT_DARK = 0x732424;
const CHECKMATE_LIGHT = 0xed6a53;
const CHECKMATE_DARK = 0xd7543e;

const PIECE_ORDER = "kqbnrp";
const FILES = "abcdefgh";
const RANKS = "12345678";

// Setup PIXI, Tink
let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

let app = new PIXI.Application({width: boardSize, height: boardSize, autoDensity: true, antialias: true, resolution: 2});
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.backgroundColor = 0xff00ff;

let chess_controller = new Chess();
let pieceSprites, activeSprite;
let t = new Tink(PIXI, app.renderer.view);
let pointer = t.makePointer();

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

    graphics = drawBoard(boardSize, squareSize);
    boardContainer.addChild(graphics);
	boardContainer.addChild(highlightContainer);

    // Add board to app
    app.stage.addChild(boardContainer);

    // Load piece textures (white, black)
    pieceTextures = loadPieceTextures();
    setupPieces(chess_controller, squareSize, pieceContainer, pieceTextures, highlightContainer);
    
    // Pieces are top level
    app.stage.addChild(pieceContainer);

    pointer.tap = () => onClick();

    // Start game loop
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){


    //Update Tink
    t.update();
}

function onClick(){
    if(activeSprite){
        console.log("active sprite");
        activeSprite = null;
    }else{
        clg("nothing")
    }
}