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



function setupBoard(){
    let pieceOrder = "KQBNRP";
    let startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    
    let boardLayout = startFen.split(' ')[0];
    let rankLayouts = boardLayout.split('/');

    for	(let rankIndex = 0; rankIndex < rankLayouts.length; rankIndex++) {
        let fileIndex = 0;
        for (let j = 0; j < rankLayouts[rankIndex].length; j++) {
            let char = rankLayouts[rankIndex][j];
            let num = parseFloat(char);
            if (!isNaN(num) && isFinite(num)) {
                fileIndex +=Number(parseFloat(char));
            }
            else {
                let colourIndex = (char.toUpperCase() == char)?0:1; // 0 = white, 1 = black
                let isWhite = colourIndex == 0;
                let pieceIndex = pieceOrder.indexOf(char.toUpperCase());
                let texture = pieceTextures[pieceIndex][colourIndex];
                let sprite = new PIXI.Sprite(texture);

                let pos = new Point(fileIndex*size+size*.5,rankIndex*size+size*.5);
                let coord = squareCoordFromPoint(pos);
                
                initPieceSprite(sprite, pos,size,isWhite);
                fileIndex+=1;
                
                if (char == 'k') {
                    blackKingCoord = coord;
                }
            }

        }
    }
}