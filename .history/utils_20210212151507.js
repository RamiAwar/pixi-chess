function keyboard(value) {
    let key = {};

    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );
    
    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };
    
    return key;
}


function drawBoard(boardSize, squareSize){
    let graphics = new PIXI.Graphics();

    for	(let i = 0; i <8; i ++) {
        for	(let j = 0; j < 8; j ++){
            let col = ((i+j) % 2 === 0) ? LIGHT : DARK;
            graphics.beginFill(col);
            // draw a rectangle
            graphics.drawRect(i * squareSize, j * squareSize, squareSize, squareSize);
        }
    }

    return graphics;
}

function loadPieceTextures(){

    pieceTextures = new Array(6);

    for (let i = 0; i < 6; i ++){
        pieceTextures[i] = new Array(2);
    }

    // Current piece sizes from image
    let spriteSize = 1000/6.0;
    
    for (let i = 0; i <= 1; i ++) {
        for (let j = 0; j < 6; j++) {
            let rect = new PIXI.Rectangle(spriteSize*j,spriteSize*i,spriteSize,spriteSize);
            let texture = new PIXI.Texture(TextureCache["img/pieces.png"],rect);
            texture.frame = rect;
            pieceTextures[j][i] = texture;
        }
    }
    return pieceTextures;
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

            clearHighlights();
            selectHighlightPosition({x: sprite.position.x, y: sprite.position.y}, squareSize, highlightContainer);

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

function findClosestSquare(position){
    return new Point(
        Math.floor(position.x/squareSize),
        Math.floor(position.y/squareSize)
    )
}

function positionToCoord(i, j, squareSize){
    return new Point(i * squareSize + squareSize * 0.5, j * squareSize + squareSize * 0.5)
}

function highlightSquare(squareName, squareSize, highlightContainer) {
    let position = chess_controller.squareToPosition(squareName);
	let circle = new PIXI.Graphics();
	let col = ((position.x + ( position.y)) % 2 == 0) ? HIGHLIGHT_LIGHT : HIGHLIGHT_DARK;
	circle.beginFill(col);
    circle.drawCircle(position.x * squareSize + squareSize * 0.5, position.y * squareSize + squareSize * 0.5, squareSize/6);
	highlightContainer.addChild(circle);

    // Create special graphics that appears when hovered
    let square = new PIXI.Graphics();
    square.beginFill(col);
	square.drawRect(position.x * squareSize, ( position.y) * squareSize, squareSize, squareSize);
    square.interactive = true;
    square.renderable = false;
    square.mouseover = () => {
        square.renderable = true;
        console.log("hovering")
    }
    square.mouseout = () => {
        square.renderable = false;
    }
    highlightContainer.addChild(square);
}

function selectHighlightPosition(position, squareSize, highlightContainer){
    clg(position)
	let col = ((position.x + ( position.y)) % 2 == 0) ? HIGHLIGHT_LIGHT : HIGHLIGHT_DARK;
	let square = new PIXI.Graphics();
    square.beginFill(col);
	square.drawRect(position.x * squareSize, ( 7 - position.y) * squareSize, squareSize, squareSize);
    highlightContainer.addChild(square);
}

function clearHighlights(){
    for(let i = highlightContainer.children.length-1; i >= 0; i--){
        highlightContainer.children[i].destroy();
    }
}