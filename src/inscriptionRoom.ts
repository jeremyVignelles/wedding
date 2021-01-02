import CanvasGame from "./canvasGame.js";
import { loadImage, squareSize, Direction, SquarePosition } from "./tools.js";
import { isKeyPressed, ActionKey } from "./keyboardManager.js";

// The cake is a lie.
// The cake is a lie.
// The cake is a lie.
// The cake is a lie.
console.log("na");

class InscriptionRoomGame extends CanvasGame {

    private sprites: HTMLImageElement;
    private spritesDescription = {
        inscriptionHouse: {x: 0, y: 0, width: 9, height: 12},
    };

    private exitHouseOverlayOpacity = 0;
    private redirected = false;

    private patterns: { [key:string] : CanvasPattern };

    /**
     * The constructor
     */
    constructor() {
        super();
        this.playerPosition.direction = Direction.Up;
        if(document.referrer)
        {
            if(document.referrer.endsWith("/Home/Inscription"))
            {
                this.playerPosition.pos.y = -6;
                this.playerPosition.direction = Direction.Down;
            }
        }
    }

    /**
     * Initializes all assets for the game
     * This method can be overriden
     */
    protected async initAssets() {
        await super.initAssets();
        this.sprites = await loadImage("/img/inscription-salle.png");
    }

    /**
     * Handles key downs/controls
     */
    protected handleControls() {
        super.handleControls();
    
        if(isKeyPressed(ActionKey.a) && this.enabledControls.a) 
        {
            window.location.href = "/Home/Inscription";
        }
    }

    /**
     * Draws the current state of the world.
     */
    protected draw() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        const visibleArea = this.getVisibleArea();

        this.drawImage(this.sprites, this.spritesDescription.inscriptionHouse, { x: -4, y: -11 });

        super.draw();
        
        // In order to avoid weird things around the carpet, we decided that the wall must be drawn over the 2x of the carpet side.
        // This is why I have 2/32 here, for those 2px over a square of 32.
        /*this.drawPattern(this.patterns.wallBottom, { x: -2, y: 0, width: 2 + (2/32), height: 1});
        this.drawPattern(this.patterns.wallBottom, { x: 1 - (2/32), y: 0, width: 9 + (2/32), height: 1});*/

        if(this.exitHouseOverlayOpacity > 0)
        {
            this.context.fillStyle = "rgba(255, 255, 255, "+this.exitHouseOverlayOpacity+")";
            this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        }
    }

    protected computeAnimations() {
        super.computeAnimations();

        // Exiting the house animation.
        if(this.playerPosition.pos.y > 0 && this.exitHouseOverlayOpacity < 1)
        {
            this.exitHouseOverlayOpacity += 0.05;
            this.needRefresh = true;
            if(this.exitHouseOverlayOpacity >= 0.5 && !this.redirected)
            {
                window.location.pathname = "/";
                this.redirected = true;
            }
        }
    }

    /**
     * After an animation ends, this method is called to get the new list of allowed directions.
     * This effectively tells the collisions
     */
    protected computeEnabledControls()
    {
        const position = {x: Math.round(this.playerPosition.pos.x), y: Math.round(this.playerPosition.pos.y)};

        //At exit
        if(position.y == 1)
        {
            return {
                left: false,
                right: false,
                up: false,
                down: false,
                a: false,
                b: false,
                start: false,
                zoomPlus: false,
                zoomMinus: false,
            };    
        }

        return {
            left: this.playerPosition.direction != Direction.Left,
            right: this.playerPosition.direction != Direction.Right,
            up: this.playerPosition.direction != Direction.Up || position.y > -6,
            down: true,
            a: this.playerPosition.direction == Direction.Up && position.y == -6,
            b: true,
            start: true,
            zoomPlus: (this.scaleFactor < this.zoomBounds.max),
            zoomMinus: (this.scaleFactor > this.zoomBounds.min),
        };
    }
}

var game = new InscriptionRoomGame();
game.run();
