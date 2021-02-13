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
let h = new Tink(PIXI, app.renderer.view);
let hointer = h.makePointer();
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

    highlightContainer.interactive = true;
    highlightContainer.on('pointerover', ()=>{
        clg('test')
    })

    pointer.tap = () => onTap();

    // Start game loop
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){
    //Update Tink
    t.update();
    h.update();
}

function onTap(){
    let closest_square = findClosestSquare(pointer.position);
    let squareName = FILES[closest_square.x] + RANKS[7 - closest_square.y];

    // TODO: Handle selection with tap as well for touch devices 
    // if(activeSprite === null){
    //     for(let i = 0; i < pieceContainer.children.length; i++){
    //         if(pieceContainer.children[i].squareName === squareName){
    //             sprite = pieceContainer.children[i];
    //             break;
    //         }
    //     }

    //     if(
    //         (sprite != null) &&
    //         !((chess_controller.turn() == 'w' && sprite.isBlack) || (chess_controller.turn() == 'b' && !sprite.isBlack))
    //     ){
    //         selectSprite(sprite);
    //         return;
    //     }
    if(activeSprite != null && !isDragging){
        // -------- Check if valid move --------
        // Get all possible moves for this piece
        if(activeSprite.rank == 7 - closest_square.y && activeSprite.file == closest_square.x) return;
        // Discard if not turn
        if((chess_controller.turn() == 'w' && activeSprite.isBlack) || (chess_controller.turn() == 'b' && !activeSprite.isBlack)){
            activeSprite = null;
            return;
        }

        // Change selection if same color
        // Get square that was tapped
        let sprite = null;
        for(let i = 0; i < pieceContainer.children.length; i++){
            if(pieceContainer.children[i].squareName === squareName){
                sprite = pieceContainer.children[i];
                break;
            }
        }
        if (sprite != null && activeSprite.isBlack === sprite.isBlack){
            // TODO: Premove
            selectSprite(sprite);
            return;
        }

        // Check if valid move
        coords = positionToCoord(closest_square.x, closest_square.y, squareSize);
        fromSquareName = FILES[activeSprite.file] + RANKS[activeSprite.rank]
        toSquareName = FILES[closest_square.x] + RANKS[7 - closest_square.y];
        pieceName = activeSprite.piece != 'p' ? activeSprite.piece : '';
        
        // TODO: Handle promotion
        if (chess_controller.check_promotion(activeSprite.piece, fromSquareName, toSquareName)){
            clg("promotion")
        }

        description = {
            from: fromSquareName,
            to: toSquareName
        }
        
        move = chess_controller.move(description);

        clearHighlights();

        if(move === null){
            activeSprite = null;
            clg("tap null move")
        }else{
            clg("tap make move")
            makeMove(activeSprite, move, closest_square)
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


function selectSprite(sprite){
    activeSprite = sprite;

    clearHighlights();
    selectHighlightPosition({x: sprite.file, y: sprite.rank}, squareSize, highlightContainer);

    // Get all possible moves for this piece
    valid_moves = chess_controller.moves({verbose: true, square: FILES[sprite.file] + RANKS[sprite.rank]})

    // Valid move highlighting
    // Add square highlights to board highlights
    for(let i = 0; i < valid_moves.length; i++){
        squareName = sprite.piece == 'p' ? valid_moves[i].to : valid_moves[i].to.slice(-2);
        // TODO: DO NOT highlight if another piece present here!
        highlightSquare(squareName, squareSize, highlightContainer);
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
    sprite.squareName = FILES[sprite.file] + RANKS[sprite.rank];

    sprite.position.set(point.x, point.y);
    sprite.width = squareSize;
    sprite.height = squareSize;
    sprite.anchor.set(.5);

    pieceContainer.addChild(sprite);

    // Add tink
    t.makeInteractive(sprite);
    t.makeDraggable(sprite);
    sprite.draggable = false;


    // Upon clicking a sprite, 
    // ---> If not dragging another sprite, start dragging this one
    // But when drag released,
    // ---> If sprite is still in place, want to keep it selected but also draggable
    // This enables click to move functionality
    // ---> If sprite has moved, check move validity
    sprite.press = () => {

        // Check turn
        if((chess_controller.turn() == 'w' && sprite.isBlack) || (chess_controller.turn() == 'b' && !sprite.isBlack)){
            return;
        }
        
        // Allow dragging if:
        // 1) No active piece
        // 2) Active piece but is not being dragged, only selected
        // In both cases, update active piece and start dragging
        // 3) Piece is same color
        if(
            (activeSprite === null && !isDragging) ||
            (activeSprite != null && !activeSprite.isDragged && !isDragging))
        {
            isDragging = true;
            sprite.isDragged = true;
            sprite.draggable = true;
            // Stop interactivity to allow events to pass through sprite
            sprite.interactive = false;

            selectSprite(sprite);
        }
    };

    sprite.release = () => {
        
        isDragging = false;
        
        if(sprite.isDragged){
            sprite.isDragged = false;
            // Restore interactivity
            // sprite.interactive = true;

            // Find closest square
            closest_square = findClosestSquare(sprite.position);

            // If same square, keep selected
            if(sprite.rank == 7 - closest_square.y && sprite.file == closest_square.x){
                // Return to previous position, but keep active sprite
                coords = positionToCoord(sprite.file, 7 - sprite.rank, squareSize);
                sprite.position.set(coords.x, coords.y);
                sprite.draggable = false;
                return;
            }

            // Reset selection, either move or invalid
            clearHighlights();
            sprite.draggable = false;

            coords = positionToCoord(closest_square.x, closest_square.y, squareSize);

            // Discard if not right color
            if((chess_controller.turn() == 'w' && sprite.isBlack) || (chess_controller.turn() == 'b' && !sprite.isBlack)){
                activeSprite = null;
                return;
            }

            fromSquareName = FILES[sprite.file] + RANKS[sprite.rank]
            toSquareName = FILES[closest_square.x] + RANKS[7 - closest_square.y];
            pieceName = sprite.piece != 'p' ? sprite.piece : '';

            // TODO: Handle promotion
            if (chess_controller.check_promotion(sprite.piece, fromSquareName, toSquareName)){
                clg("promotion")
            }

            description = {
                from: fromSquareName,
                to: toSquareName
            }

            move = chess_controller.move(description);

            if(move === null){
                clg("release null move")
                // Return to previous position
                coords = positionToCoord(sprite.file, 7 - sprite.rank, squareSize);
                sprite.position.set(coords.x, coords.y);
                activeSprite = null;
            }else{
                clg("release make move")
                activeSprite = null;
                makeMove(sprite, move, closest_square)
            }
        }
    };
}

function makeMove(sprite, move, closest_square){

    clg(move)

    // Handle capture
    if(move.flags == 'e' || move.flags == 'c'){
        // Remove captured piece
        for(let childIndex = 0; childIndex < pieceContainer.children.length; childIndex++){
            captured_piece = pieceContainer.children[childIndex]
            if(captured_piece.squareName === move.to){
                clg("capture")
                pieceContainer.removeChild(captured_piece);
                t.removeSprite(captured_piece.squareName)
                captured_piece.destroy()
            }
        }
    }

    // TODO: Handle castling

    // Update sprite position
    sprite.rank = 7 - closest_square.y;
    sprite.file = closest_square.x;
    sprite.squareName = FILES[sprite.file] + RANKS[sprite.rank]

    // Set new position
    sprite.position.set(
        coords.x,
        coords.y
    );
}