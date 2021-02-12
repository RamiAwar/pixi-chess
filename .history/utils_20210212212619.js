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
    }
    square.mouseout = () => {
        square.renderable = false;
    }
    highlightContainer.addChild(square);
}

function selectHighlightPosition(position, squareSize, highlightContainer){
	let col = ((position.x + ( position.y)) % 2 == 0) ? HIGHLIGHT_DARK : HIGHLIGHT_LIGHT;
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