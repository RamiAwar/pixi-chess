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


function drawBoard(boardSize){
    let graphics = new PIXI.Graphics();
    let size = boardSize / 8;
    for	(let i = 0; i <8; i ++) {
        for	(let j = 0; j < 8; j ++){
            let col = ((i+j)%2===0)?lightCol:darkCol;
            graphics.beginFill(col);
            // draw a rectangle
            graphics.drawRect(i*size, j*size, size, size);
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



function setupBoard(chess_controller){
    
    let board = chess_controller.board()
    
    for	(let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let piece = board[i][j];

            if(piece != null){
                drawPiece(piece, i, j);
            }
        }
    }
}

function createPieceSprite(piece, rank, file, pieceContainer){
    let pieceIndex = pieceOrder.indexOf(piece.type);
    let texture = pieceTextures[pieceIndex][(piece.color == 'b')];
    let sprite = new PIXI.Sprite(texture);

    let pos = new Point(fileIndex*size+size*.5,rankIndex*size+size*.5);
    let coord = squareCoordFromPoint(pos);
    
    sprite.position.set(point.x, point.y);
    sprite.width = size;
    sprite.height = size;
    sprite.anchor.set(.5);

    pieceContainer.addChild(sprite);
    
    let squareIndex = indexFromCoord(squareCoordFromPoint(point));
    allSprites.append(sprite);
}