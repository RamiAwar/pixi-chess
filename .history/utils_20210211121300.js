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
            let col = ((i+j)%2===0)?lightCol:darkCol;
            graphics.beginFill(col);
            // draw a rectangle
            graphics.drawRect(i*squareSize, j*squareSize, squareSize, squareSize);
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



function setupPieces(chess_controller, squareSize, pieceContainer, pieceTextures){

    let board = chess_controller.board();
    for	(let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let piece = board[i][j];

            if(piece != null){
                createPieceSprite(piece, i, j, squareSize, pieceContainer, pieceTextures);
            }
        }
    }
}

function createPieceSprite(piece, rank, file, squareSize, pieceContainer, pieceTextures){
    let pieceIndex = PIECE_ORDER.indexOf(piece.type);
    let color = (piece.color == 'b');
    let texture = pieceTextures[pieceIndex][color];
    let sprite = new PIXI.Sprite(texture);
    console.log(texture);
    let point = new Point(file*squareSize+squareSize*.5,rank*squareSize+squareSize*.5);
    // let coord = squareCoordFromPoint(pos);
    
    sprite.position.set(point.x, point.y);
    sprite.width = squareSize;
    sprite.height = squareSize;
    sprite.anchor.set(.5);
    
    // Add tink
    t.makeInteractive(sprite);
    t.makeDraggable(sprite);
    sprite.press = () => {

    };

    sprite.release = () => {

    };

    pieceContainer.addChild(sprite);
    console.log(sprite.position.x, sprite.position.y)
}