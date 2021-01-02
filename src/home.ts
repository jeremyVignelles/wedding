import CanvasGame from "./canvasGame.js";
import { loadImage, squareSize, Direction } from "./tools.js";

// These aren't the droids you're looking for
console.log("Assembler les indices des 3 salles tu devras, et la clé de l'énigme tu trouveras.");
console.log("Press enter for START.");

class HomeGame extends CanvasGame {
    private lastUpdateDate = new Date(2020, 7, 6, 13, 15).getTime();
    private lastUpdate = `Dernières nouveautés :
        06/08/2020 :
        Le nouveau plan d'accès est (enfin) en ligne !
        28/07/2020 : 
        Modification du livre de la Mairie (infos pratiques) 
        Les mariés seront désormais masqués lors de la cérémonie civile et il y a des travaux sur le parking de la Mairie d'Olivet.
        13/07/2020 : 
        Ajout du livre de la Mairie (infos pratiques)
        Attention travaux sur le chemin pour aller d'Olivet à La Ferté-St-Aubin, nous aurons mis à jour la carte !
        20/06/2020 :
        Ajout de l'adresse de la Devantière sur le plan interactif
        Ajout d'indices pour les musclés du clavier. Amis développeurs, inspectez mieux !`;
    private lastVisit = 0;

    private drawingBounds = {
        minX: -28,
        minY: -12,
        maxX: 50,
        maxY: 12,
        // Computed in the ctor
        x: 0,// == minX, but we need to pass a rect to some functions.
        y: 0,
        width: 0,
        height: 0,
    };
    private sprites: HTMLImageElement;
    private spritesDescription = {
        grass:          {x: 0, y: 0, width: 1, height: 1},
        tree:           {x: 0, y: 6, width: 4, height: 5},
        house:          {x: 0, y: 11, width: 5, height: 9},
        sandUpLeft:     {x: 5, y: 18, width: 1, height: 1},
        sandUp:         {x: 6, y: 18, width: 1, height: 1},
        sandUpRight:    {x: 7, y: 18, width: 1, height: 1},
        sandLeft:       {x: 5, y: 19, width: 1, height: 1},
        sand:           {x: 6, y: 19, width: 1, height: 1},
        sandRight:      {x: 7, y: 19, width: 1, height: 1},
        sandDownLeft:   {x: 5, y: 20, width: 1, height: 1},
        sandDown:       {x: 6, y: 20, width: 1, height: 1},
        sandDownRight:  {x: 7, y: 20, width: 1, height: 1},
        grassUpLeft:     {x: 5, y: 22, width: 1, height: 1},
        grassUp:         {x: 6, y: 22, width: 1, height: 1},
        grassUpRight:    {x: 7, y: 22, width: 1, height: 1},
        grassLeft:       {x: 5, y: 23, width: 1, height: 1},
        grassRight:      {x: 7, y: 23, width: 1, height: 1},
        grassDownLeft:   {x: 5, y: 24, width: 1, height: 1},
        grassDown:       {x: 6, y: 24, width: 1, height: 1},
        grassDownRight:  {x: 7, y: 24, width: 1, height: 1},
        cone:            {x: 3, y: 22, width: 1, height: 1},
        topBorder:       {x: 6, y: 25, width: 1, height: 2},
        bottomBorder:    {x: 6, y: 28, width: 1, height: 2},
        exitSign:        {x: 3, y: 23, width: 2, height: 2},
        hagrid:          {x: 0, y: 28, width: 3, height: 3},
        newsDisabled:    {x: 3, y: 27, width: 1, height: 2},
        newsEnabled:     {x: 4, y: 27, width: 1, height: 2},
    };

    private patterns: { [key:string] : CanvasPattern };

    private houses = [
        {url:"/Home/Infos"},
        {url:"/Home/InscriptionRoom"},
        {url:"/Home/ContactRoom"},
    ];
    private pathBounds = {
        minX: -5,
        maxX: 28,//this.houses.length*10-2
        width: 0,//Computed in constructor
    }

    private enterHouseOverlayOpacity = 0;
    private redirected = false;

    public constructor()
    {
        super();
        this.playerPosition.pos.x = -3;
        this.playerPosition.direction = Direction.Right;
        if(document.referrer)
        {
            for(let i = 0; i < this.houses.length; i ++)
            {
                if(document.referrer.endsWith(this.houses[i].url))
                {
                    this.playerPosition.pos.x = i * 10;
                    this.playerPosition.direction = Direction.Down;
                    break;
                }
            }
        }
        this.drawingBounds.x = this.drawingBounds.minX,
        this.drawingBounds.y = this.drawingBounds.minY,
        this.drawingBounds.width = this.drawingBounds.maxX - this.drawingBounds.minX + 1;
        this.drawingBounds.height = this.drawingBounds.maxY - this.drawingBounds.minY + 1;
        this.pathBounds.width = this.pathBounds.maxX - this.pathBounds.minX + 1;
        this.dialogItems = [
            {
                x:-3,
                y: -1,
                dialog: `Bonjour, appuyez sur A (en bas à droite) pour faire défiler le dialogue.
                Je m'appelle Hagrid et je vous souhaite la bienvenue dans ce monde de jeu vidéo imaginé par Aurélie et Jérémy.
                Pour zoomer utilisez les boutons + et - à gauche de ce texte. 
                Pour vous déplacer dans ce monde vous pourrez utiliser à la fin de ce dialogue, les boutons de la croix en bas à gauche. 
                Pour interagir avec les personnes et certains objets, tournez-vous dans leur direction puis, appuyez sur A. 
                Les plus aventuriers découvrirons l'utilité du bouton B par eux-mêmes.
                Ici, vous trouverez toutes les informations utiles et une salle pour répondre à l'invitation. 
                Pour votre confort, nous vous invitons à vous mettre en mode paysage si vous êtes sur un smartphone ou une tablette.
                Revenez régulièrement, nous mettrons à jour le site avec les dernières nouveautés. Les mises à jour seront annoncées sur le panneau NEW sur la première maison !`
            },
            {
                x: 1,
                y: -1,
                dialog: this.lastUpdate
            }
        ];

        let lastVisit = window.localStorage.getItem("lastVisit");
        if(!lastVisit)
        {
            let alreadyVisited = window.localStorage.getItem("visit");
            if(!alreadyVisited)
            {// Compatibility with the "visit" local storage
                this.playerPosition.direction = Direction.Up;
                this.playerPosition.pos.x = -3;
                this.currentDialog = {
                    text: this.dialogItems[0].dialog,
                    link: undefined,
                    firstDisplayedCharacter: 0,
                    currentDisplay: null,
                };

                this.lastVisit = new Date().getTime();
                window.localStorage.setItem("lastVisit", this.lastVisit.toString());
            }
        } else {
            this.lastVisit = parseInt(lastVisit);
        }
    }

    /**
     * Initializes all assets for the game
     * This method can be overriden
     */
    protected async initAssets() {
        await super.initAssets();
        this.sprites = await loadImage("/img/sprites_outdoor.png");
        this.patterns = {
            grassUp: this.createPattern(this.sprites, this.spritesDescription.grassUp),
            grassLeft: this.createPattern(this.sprites, this.spritesDescription.grassLeft),
            grass: this.createPattern(this.sprites, this.spritesDescription.grass),
            grassRight: this.createPattern(this.sprites, this.spritesDescription.grassRight),
            grassDown: this.createPattern(this.sprites, this.spritesDescription.grassDown),
            sandUp: this.createPattern(this.sprites, this.spritesDescription.sandUp),
            sandLeft: this.createPattern(this.sprites, this.spritesDescription.sandLeft),
            sand: this.createPattern(this.sprites, this.spritesDescription.sand),
            sandRight: this.createPattern(this.sprites, this.spritesDescription.sandRight),
            sandDown: this.createPattern(this.sprites, this.spritesDescription.sandDown),
            topBorder: this.createPattern(this.sprites, this.spritesDescription.topBorder),
            bottomBorder: this.createPattern(this.sprites, this.spritesDescription.bottomBorder),
            tree: this.createPattern(this.sprites, this.spritesDescription.tree),
            forest: this.createForestPattern()
        };
    }

    /**
     * Handles key downs/controls
     */
    protected handleControls() {
        let wasNewsDialogOpen = (this.currentDialog && this.currentDialog.text == this.dialogItems[1].dialog);

        super.handleControls();

        if(wasNewsDialogOpen && !this.currentDialog)
        {// The news dialog was displayed, but not anymore, just update the last visit
            this.lastVisit = new Date().getTime();
            window.localStorage.setItem("lastVisit", this.lastVisit.toString());
        }
    }

    /**
     * Draws the current state of the world.
     */
    protected draw() {
        this.drawPattern(this.patterns.grass, this.drawingBounds);
        //draw path
        this.drawPattern(this.patterns.sand, {x: this.drawingBounds.minX, y: -1, width: this.drawingBounds.width, height: 3});
        this.drawPattern(this.patterns.grassDown, {x: this.drawingBounds.minX, y: -1, width: this.drawingBounds.width, height: 1});
        this.drawPattern(this.patterns.grassUp, {x: this.drawingBounds.minX, y: 1, width: this.drawingBounds.width, height: 1});
        // Cones
        this.drawImage(this.sprites, this.spritesDescription.cone, {x: this.pathBounds.maxX + 1, y: 0 });

        //Hagrid
        this.drawImage(this.sprites, this.spritesDescription.hagrid, {x: -1 - this.spritesDescription.hagrid.width, y: -this.spritesDescription.hagrid.height});

        this.drawForest();
        
        // From 0 to maxX, there is a width of maxX + 1, plus the square because it starts at -1, so width: maxX+2
        this.drawPattern(this.patterns.topBorder, {x: -1, y: -2, width: this.pathBounds.maxX + 2, height: 2});
        /*this.drawPattern(this.patterns.bottomBorder, {x: this.pathBounds.minX, y: 1, width: this.pathBounds.width, height: 2});
        this.drawImage(this.sprites, {x: 5, y: 25, width: 1, height: 5 }, {x: this.pathBounds.minX - 1, y: -2})
        this.drawImage(this.sprites, {x: 7, y: 25, width: 1, height: 5 }, {x: this.pathBounds.maxX + 1, y: -2});*/
        for(var i = 0;i < this.houses.length; i ++)
        {
            this.drawImage(this.sprites, this.spritesDescription.house, {x: -1 + 10* i, y: -9});

            // draw labels
            this.drawImage(this.sprites, {x: 0, y: 22 + 2*i, width: 3, height: 2}, {x: 10* i, y: -4});
        }

        if(this.lastUpdateDate > this.lastVisit)
        {
            this.drawImage(this.sprites, this.spritesDescription.newsEnabled, {x: 1, y: -2});
        }
        else
        {
            this.drawImage(this.sprites, this.spritesDescription.newsDisabled, {x: 1, y: -2});
        }

        if(this.enterHouseOverlayOpacity > 0)
        {
            this.context.fillStyle = "rgba(0, 0, 0, "+this.enterHouseOverlayOpacity+")";
            this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        }

        super.draw();

        this.drawImage(this.sprites, this.spritesDescription.exitSign, {x: -2 - this.spritesDescription.exitSign.width, y: 0});
    }

    private drawForest()
    {
        //Top
        this.drawPattern(this.patterns.forest, 
            {
                x: this.drawingBounds.minX,
                y: this.drawingBounds.minY,
                width : this.drawingBounds.width,
                height: -6 - this.drawingBounds.minY
            });
        // Finish the top row
        this.drawPattern(this.patterns.tree,
            {
                x: this.drawingBounds.minX + 2,
                y: -9,
                width : this.drawingBounds.width,
                height: this.spritesDescription.tree.height
            });
        
        
        // Start the left column. Because of spacing issues and only two trees fit, do that by hand rather than with a pattern
        this.drawImage(this.sprites, this.spritesDescription.tree, { x: -8, y: -6 });
        this.drawImage(this.sprites, this.spritesDescription.tree, { x: -8, y: 0 });

        // Left
        this.drawPattern(this.patterns.forest,
            {
                x: this.drawingBounds.minX,
                y: -6,
                width: -6 - this.drawingBounds.minX,
                height: 12,
            });
        
        // Start the right column. Because of spacing issues and only two trees fit, do that by hand rather than with a pattern
        const rightX = Math.ceil((this.houses.length * 10) / this.spritesDescription.tree.width) * this.spritesDescription.tree.width;
        this.drawImage(this.sprites, this.spritesDescription.tree, { x: rightX, y: -6 });
        this.drawImage(this.sprites, this.spritesDescription.tree, { x: rightX, y: 0 });
        
        // Right
        this.drawPattern(this.patterns.forest,
            {
                x: rightX + 2,
                y: -6 -3,
                width: this.drawingBounds.maxX - rightX,
                height: 12 + 3,
            });
        
        // Start the bottom row with isolated trees
        this.drawPattern(this.patterns.tree,
            {
                x: this.drawingBounds.minX + 2,
                y: 3,
                width : this.drawingBounds.width,
                height: this.spritesDescription.tree.height
            });

        // Bottom
        this.drawPattern(this.patterns.forest, 
            {
                x: this.drawingBounds.minX,
                y: 6,
                width : this.drawingBounds.width,
                height: this.drawingBounds.maxY - 5
            });
        
    }

    protected computeAnimations() {
        super.computeAnimations();

        // Entering in a house (or the forest) animation.
        if((this.playerPosition.pos.y < 0 || this.playerPosition.pos.x < -4) && this.enterHouseOverlayOpacity < 1)
        {
            this.enterHouseOverlayOpacity += 0.05;
            this.needRefresh = true;
            if(this.enterHouseOverlayOpacity >= 0.5 && !this.redirected)
            {
                if(this.playerPosition.pos.y < 0)
                {// house
                    var houseNumber = Math.round(this.playerPosition.pos.x) / 10;
                    window.location.pathname = this.houses[houseNumber].url;
                }
                else
                {
                    window.location.pathname = "/Account/Logout"
                }
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
        if(this.currentDialog !== null)
        {
            return {
                left: false,
                right: false,
                up: false,
                down: false,
                a: this.isDialogReadyForNext(),
                b: true,
                start: false,
                zoomPlus: (this.scaleFactor < this.zoomBounds.max),
                zoomMinus: (this.scaleFactor > this.zoomBounds.min),
            };
        }

        const position = {x: Math.round(this.playerPosition.pos.x), y: Math.round(this.playerPosition.pos.y)};
        //In a door or at exit
        if(position.y == -1 || position.x == -5)
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
            left: this.playerPosition.direction != Direction.Left || position.x > this.pathBounds.minX,
            right: this.playerPosition.direction != Direction.Right ||position.x < this.pathBounds.maxX,
            up: this.playerPosition.direction != Direction.Up ||position.x%10 == 0,
            down: this.playerPosition.direction != Direction.Down ||false,
            a: this.getDialogInFront() !== undefined,
            b: true,
            start: true,
            zoomPlus: (this.scaleFactor < this.zoomBounds.max),
            zoomMinus: (this.scaleFactor > this.zoomBounds.min),
        };
    }

    /**
     * Uses a tree and tile it to create a forest
     */
    protected createForestPattern()
    {
        // Despite being expressed with width/height, this method assumes a tree of 4x5
        var canvas = document.createElement('canvas');
        canvas.width = squareSize * this.spritesDescription.tree.width
        canvas.height = squareSize * (this.spritesDescription.tree.height + 1);

        const trees = [
            {x: -2, y: -3},
            {x: 2, y: -3},
            {x: 0, y: 0},
            {x: -2, y: 3},
            {x: 2, y: 3},
        ];

        for(var t of trees)
        {
            canvas.getContext("2d").drawImage(
                this.sprites,
                this.spritesDescription.tree.x * squareSize,
                this.spritesDescription.tree.y * squareSize,
                this.spritesDescription.tree.width * squareSize,
                this.spritesDescription.tree.height * squareSize,
                t.x * squareSize,
                t.y * squareSize,
                this.spritesDescription.tree.width * squareSize,
                this.spritesDescription.tree.height * squareSize);
        }
        return this.context.createPattern(canvas, "repeat");
    }
}

var game = new HomeGame();
game.run();