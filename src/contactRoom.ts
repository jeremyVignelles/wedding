import CanvasGame from "./canvasGame.js";
import { loadImage, squareSize, Direction, SquarePosition } from "./tools.js";
import { isKeyPressed, ActionKey } from "./keyboardManager.js";

// The keyboard is the key.
console.log("mi");

class ContactRoomGame extends CanvasGame {

    private sprites: HTMLImageElement;
    private spritesDescription = {
        contactHouse: {x: 0, y: 0, width: 9, height: 7},
        wallBottom: { x: 0, y: 7, width: 1, height: 1},
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
            if(document.referrer.endsWith("/Home/Contact"))
            {
                this.playerPosition.pos.y = -6;
                this.playerPosition.direction = Direction.Down;
            }
        }

        this.dialogItems = [
            {
                x: -3,
                y: -4,
                link: "https://lichess.org/",
                dialog: `Pour apprendre et vous perfectionner aux échecs, nous pouvons vous recommander l'excellente plateforme lichess.
                    Jérémy y est inscrit sous le pseudonyme "cube45", peut-être voudrez-vous faire une partie ?`
            },
            {
                x: 3,
                y: -3,
                link: "https://www.youtube.com/watch?v=H7GQFHLDTcg",
                dialog: `On dirait que quelque chose bouge dans la malle...`
            },
            {
                x: 4,
                y: -3,
                link: "https://www.youtube.com/watch?v=H7GQFHLDTcg",
                dialog: `On dirait que quelque chose bouge dans la malle...`
            },
        ];
    }

    /**
     * Initializes all assets for the game
     * This method can be overriden
     */
    protected async initAssets() {
        await super.initAssets();
        this.sprites = await loadImage("/img/salle-contact.png");
        this.patterns = {
            wallBottom: this.createPattern(this.sprites, this.spritesDescription.wallBottom),
        };
    }

    /**
     * Handles key downs/controls
     */
    protected handleControls() {
        super.handleControls();
    
        if(isKeyPressed(ActionKey.a) && (this.playerPosition.direction == Direction.Up && this.playerPosition.pos.y == -3 && this.playerPosition.pos.x == 0)) 
        {
            window.location.href = "/Home/Contact";
        }
    }

    /**
     * Draws the current state of the world.
     */
    protected draw() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        const visibleArea = this.getVisibleArea();

        this.drawImage(this.sprites, this.spritesDescription.contactHouse, { x: -4, y: -6 });

        super.draw();
        
        this.drawPattern(this.patterns.wallBottom, { x: -4, y: 0, width: 4, height: 1});
        this.drawPattern(this.patterns.wallBottom, { x: 1, y: 0, width: 4, height: 1});

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
            left: this.playerPosition.direction != Direction.Left || position.x > -4,
            right: this.playerPosition.direction != Direction.Right || position.x < 2 || (position.x < 4 && position.y > -3),
            up: this.playerPosition.direction != Direction.Up || position.y > -2 || (position.x < 3 && position.y > -3),
            down: this.playerPosition.direction!= Direction.Down || position.y < 0 || position.x == 0,
            a: (this.playerPosition.direction == Direction.Up && position.y == -3 && position.x == 0) || this.getDialogInFront() !== undefined,
            b: true,
            start: true,
            zoomPlus: (this.scaleFactor < this.zoomBounds.max),
            zoomMinus: (this.scaleFactor > this.zoomBounds.min),
        };
    }
}

var game = new ContactRoomGame();
game.run();
