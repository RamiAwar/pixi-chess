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
let pieceSprites = [], activeSprite = null, isDragging = false;
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
    if(activeSprite != null && !isDragging){

        // -------- Check if valid move --------
        // Get all possible moves for this piece
        valid_moves = chess_controller.moves({square: FILES[activeSprite.file] + RANKS[activeSprite.rank]})
        closest_square = findClosestSquare(pointer.position);
        coords = positionToCoord(closest_square.x, closest_square.y, squareSize);

        // Discard if not turn
        if((chess_controller.turn() == 'w' && activeSprite.isBlack) || (chess_controller.turn() == 'b' && !activeSprite.isBlack)){
            activeSprite = null;
        }

        fromSquareName = FILES[activeSprite.file] + RANKS[activeSprite.rank]
        toSquareName = FILES[closest_square.x] + RANKS[7 - closest_square.y];
        pieceName = activeSprite.piece != 'p' ? activeSprite.piece : '';
        
        description = {
            from: fromSquareName,
            to: toSquareName
        }

        move = chess_controller.move(description);
        clearHighlights();

        if(move === null){
            activeSprite = null;
        }else{
            activeSprite.rank = 7 - closest_square.y;
            activeSprite.file = closest_square.x;

            // Set new position
            activeSprite.position.set(
                coords.x,
                coords.y
            );

            activeSprite = null;
        }
    }
}



function setupPieces(chess_controller, squareSize, pieceContainer, pieceTextures, highlightContainer){
    let board = chess_controller.board();
    for	(let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let piece = board[i][j];

            if(piece != null){
                createPieceSprite(chess_controller, piece, i, j, squareSize, pieceContainer, pieceTextures, highlightContainer);
            }
        }
    }
}


function createPieceSprite(chess_controller, piece, rank, file, squareSize, pieceContainer, pieceTextures, highlightContainer){
    let pieceIndex = PIECE_ORDER.indexOf(piece.type);
    let isBlack = (piece.color == 'b');

    let texture = pieceTextures[pieceIndex][Number(isBlack)];
    let sprite = new PIXI.Sprite(texture);
    let point = positionToCoord(file, rank, squareSize);
    
    sprite.isBlack = isBlack; // Save state inside sprite
    sprite.piece = piece.type;
    sprite.rank = 7 - rank;
    sprite.file = file;

    sprite.position.set(point.x, point.y);
    sprite.width = squareSize;
    sprite.height = squareSize;
    sprite.anchor.set(.5);
    
    pieceContainer.addChild(sprite);
    
    // Add tink
    t.makeInteractive(sprite);
    t.makeDraggable(sprite);

    sprite.press = () => {
        
        // Only set as dragged if this is the currently dragged sprite
        if(pointer.dragSprite === sprite){
            sprite.isDragged = true;
            activeSprite = sprite;
            isDragging = true;

            clearHighlights();
            selectHighlightPosition({x: sprite.file, y: sprite.rank}, squareSize, highlightContainer);

            // Get all possible moves for this piece
            valid_moves = chess_controller.moves({square: FILES[sprite.file] + RANKS[sprite.rank]})
            // Valid move highlighting
            // Add square highlights to board highlights
            for(let i = 0; i < valid_moves.length; i++){
                squareName = sprite.piece == 'p' ? valid_moves[i] : valid_moves[i].slice(-2);
                // TODO: DO NOT highlight if another piece present here!
                highlightSquare(squareName, squareSize, highlightContainer);
            }
        }
    };

    sprite.release = () => {
        if(sprite.isDragged){
            sprite.isDragged = false;
            isDragging = false;
            
            // Find closest square
            closest_square = findClosestSquare(sprite.position);
            coords = positionToCoord(closest_square.x, closest_square.y, squareSize);

            // -------- Check if valid move --------
            // Discard if not turn
            if((chess_controller.turn() == 'w' && sprite.isBlack) || (chess_controller.turn() == 'b' && !sprite.isBlack)){
                // Return to previous position
                coords = positionToCoord(sprite.file, 7 - sprite.rank, squareSize);
                sprite.position.set(coords.x, coords.y);
            }

            fromSquareName = FILES[sprite.file] + RANKS[sprite.rank]
            toSquareName = FILES[closest_square.x] + RANKS[7 - closest_square.y];
            pieceName = sprite.piece != 'p' ? sprite.piece : '';
            
            description = {
                from: fromSquareName,
                to: toSquareName
            }

            move = chess_controller.move(description);

            if(move === null){
                // Return to previous position
                coords = positionToCoord(sprite.file, 7 - sprite.rank, squareSize);
                sprite.position.set(coords.x, coords.y);
            }else{
                clearHighlights();

                sprite.rank = 7 - closest_square.y;
                sprite.file = closest_square.x;

                // Set new position
                sprite.position.set(
                    coords.x,
                    coords.y
                );
            }
        }
    };
}