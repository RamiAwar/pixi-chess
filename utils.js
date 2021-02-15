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
    // let rect = new PIXI.Rectangle(0, 0, 480, 480)
    // let tex = new PIXI.Texture(TextureCache["img/rook.png"], rect);
    // tex.frame = rect
    // pieceTextures[4][0] = tex

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

function getPieceAt(squareName, pieceContainer){
    for(let childIndex = 0; childIndex < pieceContainer.children.length; childIndex++){
        if(pieceContainer.children[childIndex].squareName === squareName){
            return pieceContainer.children[childIndex];
        }
    }
    return null;
}

function getPiece(piece, color, pieceContainer){
    for(let childIndex = 0; childIndex < pieceContainer.children.length; childIndex++){
        if(pieceContainer.children[childIndex].piece === piece && pieceContainer.children[childIndex].color == color){
            return pieceContainer.children[childIndex];
        }
    }
    console.log("ERROR: Piece not found!");
    return null;
}

function placePiece(sprite, squareName){
    let position = chess_controller.squareToPosition(squareName)
    let coords = positionToCoord(sprite.file, sprite.rank, squareSize);
    sprite.file = position.x
    sprite.rank = 7 - position.y
    sprite.squareName = FILES[sprite.file] + RANKS[sprite.rank]
    sprite.position.set(coords.x, coords.y)

}

function highlightSquare(squareName, squareSize, highlightContainer, pieceContainer) {
    
    let piece = null;
    let position = chess_controller.squareToPosition(squareName);
    let color = ((position.x + ( position.y)) % 2 == 0) ? HIGHLIGHT_LIGHT : HIGHLIGHT_DARK;

    // Check if square has a piece (if so draw boundary only)
    piece = getPieceAt(squareName, pieceContainer)

    // If so, draw boundary only
    if(piece != null){
        let boundaries = new PIXI.Graphics();
        boundaries.beginFill(color);
        boundaries.drawRect(position.x * squareSize, (position.y) * squareSize, squareSize, squareSize);
        boundaries.beginHole();
        boundaries.drawRoundedRect(position.x * squareSize, (position.y) * squareSize, squareSize, squareSize, squareSize/3);
        // boundaries.drawCircle(position.x * squareSize + squareSize * 0.5, position.y * squareSize + squareSize * 0.5, squareSize/3);
        boundaries.endHole();
        boundaries.endFill();
        highlightContainer.addChild(boundaries);
    }else{
    // Otherwise, draw circle in the middle
        let circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(position.x * squareSize + squareSize * 0.5, position.y * squareSize + squareSize * 0.5, squareSize/6);
        circle.endFill();
        highlightContainer.addChild(circle);
    }

    // Create special graphics that appears when hovered
    let square = new PIXI.Graphics();
    square.beginFill(color);
	square.drawRect(position.x * squareSize, position.y * squareSize, squareSize, squareSize);
    square.endFill();
    
    square.renderable = false;
    square.interactive = true;
    
    square.on("pointerover", () => {
        square.renderable = true;
    })
    square.on("pointerout", () => {
        square.renderable = false;
    });
    highlightContainer.addChild(square);
}

function selectHighlightPosition(position, squareSize, highlightContainer){
	let color = ((position.x + ( position.y)) % 2 == 0) ? HIGHLIGHT_LIGHT : HIGHLIGHT_DARK;
	let square = new PIXI.Graphics();
    square.beginFill(color);
	square.drawRect(position.x * squareSize, ( 7 - position.y) * squareSize, squareSize, squareSize);
    highlightContainer.addChild(square);
}

function highlightKing(sprite){
    let position = chess_controller.squareToPosition(sprite.squareName);
    let color = ((position.x + ( position.y)) % 2 == 0) ? HIGHLIGHT_LIGHT : HIGHLIGHT_DARK;
    let circle = new PIXI.Graphics();
    let star = new PIXI.Graphics();

    let badgePosition = new Point(position.x * squareSize + squareSize * 0.9, position.y * squareSize + squareSize * 0.1)
    let badgeRadius = squareSize / 6
    
    star.beginFill(0xffffff);
    star.drawStar(badgePosition.x, badgePosition.y, 5, badgeRadius - 5);
    star.endFill();

    circle.beginFill(0xBF1304);
    circle.drawCircle(badgePosition.x, badgePosition.y, badgeRadius);
    circle.endFill();

    checkHighlightContainer.addChild(circle);
    checkHighlightContainer.addChild(star);
}

function clearHighlights(){
    for(let i = highlightContainer.children.length-1; i >= 0; i--){
        highlightContainer.children[i].destroy();
    }
}

function clearCheckHighlights(){
    for(let i = checkHighlightContainer.children.length-1; i >= 0; i--){
        checkHighlightContainer.children[i].destroy();
    }
}