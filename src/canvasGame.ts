import { loadImage, nextFrame, wait, Direction, playerSize, SpritesMetrics, SquarePosition, squareSize, DialogItem } from "./tools.js";
import { isKeyPressed, ActionKey, registerKeyPressed } from "./keyboardManager.js";

// Some games have cheat codes, you know? I'm not saying this one does, but I'm not saying it doesn't.

export default class CanvasGame {
    protected canvas: HTMLCanvasElement;
    protected canvasSize= {width: 1400, height: 900};
    protected zoomBounds= {min: 1.0, max: 3.0};
    protected dialogTextPadding = 20;
    protected characterTypingInterval = 20;// Number of ms that it takes to write a character.
    protected context: CanvasRenderingContext2D;

    protected controlsCanvas: HTMLCanvasElement;
    protected controlsContext: CanvasRenderingContext2D;
    protected controlsButtons: HTMLImageElement;
    protected controlsButtonsDescriptions = {
        // expressed in multiples of 50px (width * height = 50 * 50)
        up:             {x: 1, y: 0},
        right:          {x: 2, y: 1},
        down:           {x: 1, y: 2},
        left:           {x: 0, y: 1},
        fullscreenOn:   {x: 2, y: 0},
        fullscreenOff:  {x: 2, y: 2},
    };

    protected player: HTMLImageElement;
    protected playerPosition = {
        pos: {x:0, y:0} as SquarePosition,
        direction: Direction.Down,
        walkingAnimation: null as null | {
            from: SquarePosition,
            to: SquarePosition,
            startedAt: number,
            stoppingAt: number,
            stepsCount: number,
            walkingStep: 0|1|2|3
        }
    };

    protected enabledControls= {
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

    protected scaleFactor = 1;
    protected scaleAnimation: null | {
        from: number,
        to: number,
        startedAt: number,
        stoppingAt: number,
    } = null;
    protected needRefresh = true;

    protected dialogItems: DialogItem[] = [];
    protected currentDialog: {
        text: string,
        link: string | undefined,
        firstDisplayedCharacter:number,
        currentDisplay: { // The current lines of text that should be displayed (i.e, the area in the text that starts at firstDisplayedCharacter)
            lines: string[], // The lines of text that should be displayed on the current part of the dialog,
            currentCursor: number, // The index of the next character to be written
            length: number, // The length, in characters of the current display (sum of the characters in lines).
            sliceLength: number, // The raw length, in characters, of the current display (including new lines and leading spaces)
            startedAt: number, // The date at which the animation of this part started
        } | null
    }|null = null;
    // Dummy values, overriden by resize
    protected dialogRect= {
        x:0,
        y:10,
        width: 0,
        height: 130,
        innerTextX: 0,
        innerTextY: 10 + this.dialogTextPadding,
        innerTextWidth: 0,
        innerTextHeight: 130 - 2 * this.dialogTextPadding,
    };
    protected dialogLocked = false;// Dialogs are locked for 500ms after closing to avoid reopening

    /**
     * The constructor
     */
    public constructor() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.controlsCanvas = document.getElementById("controlsCanvas") as HTMLCanvasElement;
        window.addEventListener('resize', () => {
            this.refreshCanvasSize();
        });
        let zoomString = window.localStorage.getItem("zoomLevel");
        if(zoomString)
        {
            let zoom = parseFloat(zoomString);
            if(zoom >= this.zoomBounds.min || zoom <= this.zoomBounds.max)
            {
                this.scaleFactor = zoom;
            }
        }
        this.refreshCanvasSize();

        this.context = this.canvas.getContext("2d");
        this.controlsContext = this.controlsCanvas.getContext("2d");
        //when a key is pressed, we often need to refresh the controlsCanvas
        registerKeyPressed(()=>this.needRefresh = true);
    }

    public scaleTo(scalingFactor: number)
    {
        this.scaleAnimation = {
            from: this.scaleFactor,
            to: scalingFactor,
            startedAt: new Date().getTime(),
            stoppingAt: new Date().getTime() + 400
        }
        window.localStorage.setItem("zoomLevel", scalingFactor.toString());
        this.refreshCanvasSize();
        this.enabledControls = this.computeEnabledControls();
    }

    public moveTo(target: SquarePosition)
    {
        const xDistance = Math.abs(target.x - this.playerPosition.pos.x);
        const yDistance = Math.abs(target.y - this.playerPosition.pos.y);

        // Where to turn?
        if(xDistance > yDistance)
        {
            // Horizontally
            this.playerPosition.direction = (target.x > this.playerPosition.pos.x) ? Direction.Right : Direction.Left;
        }
        else
        {
            // Vertically
            this.playerPosition.direction = (target.y >= this.playerPosition.pos.y) ? Direction.Down : Direction.Up;
        }

        const distance2d = Math.sqrt(xDistance * xDistance + yDistance * yDistance) * squareSize;

        this.playerPosition.walkingAnimation = {
            from: this.playerPosition.pos,
            to : target,
            startedAt: new Date().getTime(),
            stoppingAt: new Date().getTime() + (isKeyPressed(ActionKey.b) ? 100 : 200),
            walkingStep: 1,
            stepsCount: distance2d / playerSize.stepSize
        };
    }

    /**
     * Initializes all assets for the game
     * This method can be overridden
     */
    protected async initAssets() {
        this.player = await loadImage("/img/character.png");
        this.controlsButtons = await loadImage("/img/controlsButtons.png");
    }

    /**
     * Handles key downs/controls
     */
    protected handleControls() {
        if(this.playerPosition.walkingAnimation == null)
        {
            const pos = this.playerPosition.pos;
            if(isKeyPressed(ActionKey.left) && this.enabledControls.left) {
                if(this.playerPosition.direction != Direction.Left)
                    this.playerPosition.direction = Direction.Left;
                else
                    this.moveTo({ x: pos.x - 1, y: pos.y });
            } else if(isKeyPressed(ActionKey.right) && this.enabledControls.right) {
                if(this.playerPosition.direction != Direction.Right)
                    this.playerPosition.direction = Direction.Right;
                else
                    this.moveTo({ x: pos.x + 1, y: pos.y });
            } else if(isKeyPressed(ActionKey.up) && this.enabledControls.up) {
                if(this.playerPosition.direction != Direction.Up)
                    this.playerPosition.direction = Direction.Up;
                else
                    this.moveTo({ x: pos.x, y: pos.y - 1});
            } else if(isKeyPressed(ActionKey.down) && this.enabledControls.down) {
                if(this.playerPosition.direction != Direction.Down)
                    this.playerPosition.direction = Direction.Down;
                else
                    this.moveTo({ x: pos.x, y: pos.y + 1});
            }
            this.enabledControls = this.computeEnabledControls();
        }

        if(this.scaleAnimation == null)
        {
            if(isKeyPressed(ActionKey.zoomPlus) && this.enabledControls.zoomPlus)
            {
                this.scaleTo(this.scaleFactor + 0.5);
            }
            else if(isKeyPressed(ActionKey.zoomMinus) && this.enabledControls.zoomMinus)
            {
                this.scaleTo(this.scaleFactor - 0.5);
            }
        }

        if(this.enabledControls.a && isKeyPressed(ActionKey.a))
        {
            if(this.currentDialog === null)
            {
                var dialog = this.getDialogInFront();
                if(dialog)
                {
                    this.currentDialog = {
                        text: dialog.dialog,
                        link: dialog.link,
                        firstDisplayedCharacter: 0,
                        currentDisplay: null,
                    };
                }
            }
            else if(this.isDialogReadyForNext())
            {// Character animation finished, next step
                if(this.currentDialog.currentDisplay != null &&
                    ((this.currentDialog.firstDisplayedCharacter + this.currentDialog.currentDisplay.sliceLength < this.currentDialog.text.length)
                    || this.currentDialog.link))
                {// More things to show!
                    this.currentDialog.firstDisplayedCharacter += this.currentDialog.currentDisplay.sliceLength;
                    this.currentDialog.currentDisplay = null;
                    // Animation computation will compute the new target
                }
                else
                { // EOF and no link, closing
                    this.closeDialog();
                }

                // Prevent nasty things from happening because rescan of the button is happening too fast
                this.lockUnlockDialog();
            }
        }

        if(this.currentDialog !== null && isKeyPressed(ActionKey.b))
        {// B cancels the dialog
            this.closeDialog();
        }
    }

    /**
     * Computes the animations steps before drawing
     */
    protected computeAnimations() {
        // Player walking animation
        if(this.playerPosition.walkingAnimation != null)
        {
            const now = new Date().getTime();
            const animation = this.playerPosition.walkingAnimation;
            if (now > animation.stoppingAt)
            {
                this.playerPosition.pos = animation.to;
                this.playerPosition.walkingAnimation = null;
                this.enabledControls = this.computeEnabledControls();
                this.needRefresh = true;
                return;
            }

            let progress = (now - animation.startedAt) / (animation.stoppingAt - animation.startedAt);
            animation.walkingStep = ((Math.floor(progress * animation.stepsCount) + 1) % 4) as 0|1|2|3;
            this.playerPosition.pos = {
                x: animation.from.x + (animation.to.x - animation.from.x) * progress,
                y: animation.from.y + (animation.to.y - animation.from.y) * progress,
            }
            this.needRefresh = true;
        }

        // Scaling animation
        if(this.scaleAnimation != null)
        {
            const now = new Date().getTime();
            if(now > this.scaleAnimation.stoppingAt)
            {
                this.scaleFactor = this.scaleAnimation.to;
                this.scaleAnimation = null;
                this.refreshCanvasSize();
                this.enabledControls = this.computeEnabledControls();
                this.needRefresh = true;
                return;
            }

            let progress = (now - this.scaleAnimation.startedAt) / (this.scaleAnimation.stoppingAt - this.scaleAnimation.startedAt);
            this.scaleFactor = this.scaleAnimation.from + progress * (this.scaleAnimation.to - this.scaleAnimation.from);
            this.refreshCanvasSize();
            this.needRefresh = true;
        }

        if(this.currentDialog !== null)
        {
            if(this.scaleAnimation !== null)
            {
                this.currentDialog.currentDisplay = null;
            } else {
                const now = new Date().getTime();
                if(this.currentDialog.firstDisplayedCharacter == this.currentDialog.text.length)
                {// Show the button
                    if(this.currentDialog.link)
                    {
                        var button = document.getElementById('dialogLink');
                        if(!button)
                        {
                            button = this.createDialogButton();
                        }
                        const buttonWidth = this.scaleFactor * 100;
                        const buttonHeight = this.scaleFactor * 30;
                        const buttonX = this.dialogRect.x + (this.dialogRect.width - buttonWidth) / 2;
                        const buttonY = this.dialogRect.y + (this.dialogRect.height - buttonHeight) / 2;
                        const canvasSize = this.controlsCanvas.getBoundingClientRect();
                        button.style.top = canvasSize.top + buttonY + "px";
                        button.style.left = canvasSize.left + buttonX + "px";
                        button.style.width = buttonWidth + "px";
                        button.style.height = buttonHeight + "px";
                        button.style.backgroundSize = this.scaleFactor * 200 + "px";
        
                        let sourceText = 0;
                        if(this.currentDialog.link.startsWith("https://www.facebook.com"))
                        {
                            sourceText = 1;
                        }
                
                        const image = (button.firstChild as HTMLImageElement);
                        image.style.left = - buttonWidth + "px";
                        image.style.top = (-sourceText * 30 * this.scaleFactor) + 'px';
                    }
                }
                else if(this.currentDialog.currentDisplay === null)
                {// Recompute the new target
                    const remainingText = this.currentDialog.text.substring(this.currentDialog.firstDisplayedCharacter);
                    let sliceLength = 0;
                    let lines: string[] = [];
                    let currentLineStart = 0;

                    this.controlsContext.font = this.getDialogFont();

                    const fontHeight = this.controlsContext.measureText("M").width + 5;
                    for(; fontHeight * (lines.length + 1) <= this.dialogRect.innerTextHeight; sliceLength++)
                    {
                        if(sliceLength == remainingText.length || remainingText[sliceLength] == '\n')
                        {// New line!
                            lines.push(remainingText.substring(currentLineStart, sliceLength).trim());
                            if(lines.length == 1 && lines[0] == '')
                            {// Empty lines are useless at the beginning of a dialog.
                                lines.splice(0, 1);
                            }
                            currentLineStart = sliceLength + 1;
                            
                            if(sliceLength == remainingText.length)
                            {
                                break;
                            }
                            continue;
                        }

                        if(remainingText[sliceLength] == ' ' || remainingText[sliceLength] == '\t' || remainingText[sliceLength] == '\r')
                        {// Spaaaaaace !!!
                            if(currentLineStart == sliceLength)
                            {// at the beginning of a line, skip it
                                currentLineStart = sliceLength + 1;
                            }
                            // Just continue, the space doesn't add visible width
                            continue;
                        }

                        // It's a real character
                        const textMeasures = this.controlsContext.measureText(remainingText.substring(currentLineStart, sliceLength + 1));
                        if(textMeasures.width > this.dialogRect.innerTextWidth)
                        {
                            let splitPosition = sliceLength;
                            // Go backwards to find the latest space
                            // If not found, we split at the current position, in the middle of the word
                            for(;sliceLength > currentLineStart; sliceLength--)
                            {
                                if(remainingText[sliceLength] == ' ' || remainingText[sliceLength] == '-')
                                {
                                    splitPosition = sliceLength;
                                    break;
                                }
                            }
                            
                            // If not found, we still break in the middle of that word.
                            sliceLength = splitPosition - 1;

                            lines.push(remainingText.substring(currentLineStart, sliceLength + 1).trim());
                            currentLineStart = sliceLength + 1;
                        }
                    }

                    this.currentDialog.currentDisplay = {
                        currentCursor:0,
                        lines: lines,
                        length: lines.reduce((prev, current) => current.length + prev, 0),
                        sliceLength: sliceLength,
                        startedAt: now
                    };
                }
                else if(
                    this.currentDialog.currentDisplay.currentCursor < this.currentDialog.currentDisplay.length &&
                    Math.floor((now - this.currentDialog.currentDisplay.startedAt) / this.characterTypingInterval) > this.currentDialog.currentDisplay.currentCursor)
                {// A new character needs to be shown
                    this.currentDialog.currentDisplay.currentCursor = Math.floor((now - this.currentDialog.currentDisplay.startedAt) / this.characterTypingInterval);
                    if(this.currentDialog.currentDisplay.currentCursor >= this.currentDialog.currentDisplay.length)
                    {// Oops, too far
                        this.currentDialog.currentDisplay.currentCursor = this.currentDialog.currentDisplay.length;
                        this.enabledControls = this.computeEnabledControls();
                    }
                    this.needRefresh = true;
                }
            }
        }
    }

    /**
     * After an animation ends, this method is called to get the new list of allowed directions.
     * This effectively tells the collisions
     */
    protected computeEnabledControls()
    {
        return {
            left: true,
            right: true,
            up: true,
            down: true,
            a: false,
            b: true,
            start: true, 
            zoomPlus: (this.scaleFactor < 3),
            zoomMinus: (this.scaleFactor > 0.5),
        };
    }

    /**
     * Draws the current state of the world.
     * This method is overriden in the child classes, this one only draws the player
     */
    protected draw() {
        // Draw player
        this.context.drawImage(
            this.player,
            // Source positions
            (this.playerPosition.walkingAnimation != null) ? this.playerPosition.walkingAnimation.walkingStep * playerSize.width : 0,
            this.playerPosition.direction * playerSize.height,
            playerSize.width,
            playerSize.height,
            // Target positions
            Math.round((this.canvasSize.width - playerSize.width) / 2),
            Math.round((this.canvasSize.height + squareSize) / 2 - playerSize.height),
            playerSize.width,
            playerSize.height
        );

        // Draw controls
        this.drawControls();
    }

    /**
     * Draws the image on the canvas at the specified position
     */
    protected drawImage(img: HTMLImageElement, imageMetrics: SpritesMetrics, point: SquarePosition)
    {
        if(!this.isVisible({x: point.x, y: point.y, width: imageMetrics.width, height: imageMetrics.height}))
        {
            return;
        }

        // viewport's x and y
        const visibleArea = this.getVisibleArea();

        this.context.drawImage(
            img,
            // Source positions
            imageMetrics.x * squareSize,
            imageMetrics.y * squareSize,
            imageMetrics.width * squareSize,
            imageMetrics.height * squareSize,
            // Target positions
            Math.round((point.x - visibleArea.minX) * squareSize),
            Math.round((point.y - visibleArea.minY) * squareSize),
            imageMetrics.width * squareSize,
            imageMetrics.height * squareSize
        );
    }

    /**
     * Draws the pattern on the canvas at the specified position
     */
    protected drawPattern(pattern: CanvasPattern, target: SpritesMetrics)
    {
        if(!this.isVisible(target))
        {
            return;
        }

        const visibleArea = this.getVisibleArea();

        this.context.fillStyle = pattern;
        this.context.save();

        const offset = {
            x: Math.round((target.x - visibleArea.minX) * squareSize),
            y: Math.round((target.y - visibleArea.minY) * squareSize)
        };

        this.context.translate(offset.x, offset.y);
        this.context.fillRect(
            0,
            0,
            target.width * squareSize,
            target.height * squareSize
        );
        this.context.translate(-offset.x, -offset.y);
    }

    /**
     * Uses a portion of the sprites sheet as a tiling pattern, and returns the created pattern
     */
    protected createPattern(img: HTMLImageElement, imageMetrics: SpritesMetrics)
    {
        const canvas = document.createElement('canvas');
        canvas.width = squareSize * imageMetrics.width
        canvas.height = squareSize * imageMetrics.height;
        canvas.getContext("2d").drawImage(
            img,
            imageMetrics.x * squareSize,
            imageMetrics.y * squareSize,
            imageMetrics.width * squareSize,
            imageMetrics.height * squareSize,
            0,
            0,
            imageMetrics.width * squareSize,
            imageMetrics.height * squareSize);
        return this.context.createPattern(canvas, "repeat");
    }

    private drawControls()
    {
        this.controlsContext.clearRect(0, 0, this.controlsCanvas.width, this.controlsCanvas.height);
        const canvasSize = this.controlsCanvas.getBoundingClientRect();
        this.controlsContext.font = (30) + "px Arial";
        
        //zoom +
        this.controlsContext.fillStyle = this.enabledControls.zoomPlus ? (isKeyPressed(ActionKey.zoomPlus) ? "#555" : "#333") : "rgba(48, 48, 48, 0.5)";
        this.controlsContext.fillRect(0, 0, 50, 50);
        this.controlsContext.textAlign = "center";
        this.controlsContext.textBaseline = "alphabetic";
        this.controlsContext.fillStyle = "white";
        this.controlsContext.fillText("‎+" , 25, 35);

        //zoom -
        this.controlsContext.fillStyle = this.enabledControls.zoomMinus ? (isKeyPressed(ActionKey.zoomMinus) ? "#555" : "#333") : "rgba(48, 48, 48, 0.5)";
        this.controlsContext.fillRect(0, 100, 50, 50);
        this.controlsContext.textAlign = "center";
        this.controlsContext.textBaseline = "alphabetic";
        this.controlsContext.fillStyle = "white";
        this.controlsContext.fillText("-", 25, 135);

        //zoom icon
        this.controlsContext.fillStyle = "#222";
        this.controlsContext.fillRect(0, 50, 50, 50);
        this.controlsContext.textAlign = "center";
        this.controlsContext.textBaseline = "alphabetic";
        this.controlsContext.fillStyle = "white";
        this.controlsContext.font = "15px Arial";
        this.controlsContext.strokeStyle = "white";
        this.controlsContext.lineWidth = 1;
        this.controlsContext.strokeText("🔍", 25, 70);
        this.controlsContext.strokeText("x" + this.scaleFactor.toString().substring(0, 3), 25, 90);

        //MENU

        
        // D-Pad
        this.controlsContext.fillStyle = "rgba(128, 128, 128, 0.8)";
        this.controlsContext.beginPath();
        this.controlsContext.arc(95, canvasSize.height - 95, 85, 0, 2 * Math.PI);
        this.controlsContext.fill();

        // Middle
        this.controlsContext.fillStyle = "#222";
        this.controlsContext.fillRect(70, canvasSize.height - 120, 50, 50);

        // UP
        this.controlsContext.fillStyle = isKeyPressed(ActionKey.up) ? "#555" : "#333";
        if(!this.enabledControls.up)
        {
            this.controlsContext.globalAlpha = 0.2;
        }
        this.controlsContext.fillRect(70, canvasSize.height - 170, 50, 50);
        this.controlsContext.drawImage(
            this.controlsButtons,
            50 * this.controlsButtonsDescriptions.up.x,
            50 * this.controlsButtonsDescriptions.up.y,
            50,
            50,
            70,
            canvasSize.height - 170,
            50,
            50);
        this.controlsContext.globalAlpha = 1;

        // RIGHT
        this.controlsContext.fillStyle = isKeyPressed(ActionKey.right) ? "#555" : "#333";
        if(!this.enabledControls.right)
        {
            this.controlsContext.globalAlpha = 0.2;
        }
        this.controlsContext.fillRect(120, canvasSize.height - 120, 50, 50);
        this.controlsContext.drawImage(
            this.controlsButtons,
            50 * this.controlsButtonsDescriptions.right.x,
            50 * this.controlsButtonsDescriptions.right.y,
            50,
            50,
            120,
            canvasSize.height - 120,
            50,
            50);
        this.controlsContext.globalAlpha = 1;

        // DOWN
        this.controlsContext.fillStyle = isKeyPressed(ActionKey.down) ? "#555" : "#333";
        if(!this.enabledControls.down)
        {
            this.controlsContext.globalAlpha = 0.2;
        }
        this.controlsContext.fillRect(70, canvasSize.height - 70, 50, 50);
        this.controlsContext.drawImage(
            this.controlsButtons,
            50 * this.controlsButtonsDescriptions.down.x,
            50 * this.controlsButtonsDescriptions.down.y,
            50,
            50,
            70,
            canvasSize.height - 70,
            50,
            50);
        this.controlsContext.globalAlpha = 1;

        //LEFT
        this.controlsContext.fillStyle = isKeyPressed(ActionKey.left) ? "#555" : "#333";
        if(!this.enabledControls.left)
        {
            this.controlsContext.globalAlpha = 0.2;
        }
        this.controlsContext.fillRect(20, canvasSize.height - 120, 50, 50);
        this.controlsContext.drawImage(
            this.controlsButtons,
            50 * this.controlsButtonsDescriptions.left.x,
            50 * this.controlsButtonsDescriptions.left.y,
            50,
            50,
            20,
            canvasSize.height - 120,
            50,
            50);
        this.controlsContext.globalAlpha = 1;

        // B
        this.controlsContext.fillStyle = this.enabledControls.b ? "#333" : "rgba(85, 85, 85, 0.5)";
        this.controlsContext.beginPath();
        this.controlsContext.arc(canvasSize.width - 120, canvasSize.height - 60, 30, 0, 2 * Math.PI);
        this.controlsContext.fill();

        this.controlsContext.beginPath();
        this.controlsContext.fillStyle = this.enabledControls.b ? (isKeyPressed(ActionKey.b) ? "#FF0000" : "#B00000") : "rgba(176, 0, 0, 0.25)";
        this.controlsContext.arc(canvasSize.width - 120, canvasSize.height - 60, 26, 0, 2 * Math.PI);
        this.controlsContext.fill();

        // A
        this.controlsContext.fillStyle = this.enabledControls.a ? "#333" : "rgba(85, 85, 85, 0.5)";
        this.controlsContext.beginPath();
        this.controlsContext.arc(canvasSize.width - 60, canvasSize.height - 120, 30, 0, 2 * Math.PI);
        this.controlsContext.fill();

        this.controlsContext.beginPath();
        this.controlsContext.fillStyle = this.enabledControls.a ? (isKeyPressed(ActionKey.a) ? "#00FF00" : "#00B000") : "rgba(0, 176, 0, 0.5)";
        this.controlsContext.arc(canvasSize.width - 60, canvasSize.height - 120, 26, 0, 2 * Math.PI);
        this.controlsContext.fill();

        // Buttons texts
        this.controlsContext.font = "30px Arial";
        this.controlsContext.textAlign = "center";
        this.controlsContext.textBaseline = "alphabetic";
        this.controlsContext.fillStyle = this.enabledControls.b ? "#000": "#888";
        this.controlsContext.fillText("B", canvasSize.width - 120, canvasSize.height - 50);
        this.controlsContext.fillStyle = this.enabledControls.a ? "#000": "#888";
        this.controlsContext.fillText("A", canvasSize.width - 60, canvasSize.height - 110);

        // Dialogs
        if(this.currentDialog !== null)
        {
            this.controlsContext.fillStyle = "#1F4971";
            this.controlsContext.strokeStyle = "#FFFFFF";
            this.controlsContext.lineWidth = 5;
            this.controlsContext.strokeRect(this.dialogRect.x, this.dialogRect.y, this.dialogRect.width, this.dialogRect.height);
            this.controlsContext.fillRect(this.dialogRect.x, this.dialogRect.y, this.dialogRect.width, this.dialogRect.height);

            if(this.currentDialog.firstDisplayedCharacter < this.currentDialog.text.length && this.currentDialog.currentDisplay !== null && this.currentDialog.currentDisplay.currentCursor > 0)
            {
                this.controlsContext.textAlign = "left";
                this.controlsContext.textBaseline = "top";
                this.controlsContext.font = this.getDialogFont();
                this.controlsContext.fillStyle = "#FFFFFF";
                let charWrittenCount = 0;
                const lineHeight = this.controlsContext.measureText("M").width + 5;
                let i = 0;
                for(let l of this.currentDialog.currentDisplay.lines)
                {
                    const charsToWrite = Math.min(this.currentDialog.currentDisplay.currentCursor - charWrittenCount, l.length);
                    if(charsToWrite == 0)
                    {
                        i++;
                        continue;
                    }

                    this.controlsContext.fillText(
                        l.substring(0, charsToWrite),
                        this.dialogRect.innerTextX,
                        this.dialogRect.innerTextY + i * lineHeight 
                    );

                    charWrittenCount += charsToWrite;
                    if(charWrittenCount == this.currentDialog.currentDisplay.currentCursor)
                    {
                        break;
                    }
                    i++;
                }
            }

            if(this.isDialogReadyForNext())
            {
                this.controlsContext.fillStyle = "#333";
                this.controlsContext.beginPath();
                this.controlsContext.arc(this.dialogRect.innerTextX + this.dialogRect.innerTextWidth / 2, this.dialogRect.y + this.dialogRect.height, 20, 0, 2 * Math.PI);
                this.controlsContext.fill();

                this.controlsContext.beginPath();
                this.controlsContext.fillStyle = "#00B000";
                this.controlsContext.arc(this.dialogRect.innerTextX + this.dialogRect.innerTextWidth / 2, this.dialogRect.y + this.dialogRect.height, 16, 0, 2 * Math.PI);
                this.controlsContext.fill();

                this.controlsContext.font = "20px Arial";
                this.controlsContext.textAlign = "center";
                this.controlsContext.textBaseline = "middle";
                this.controlsContext.fillStyle = "#000";
                this.controlsContext.fillText("A", this.dialogRect.innerTextX + this.dialogRect.innerTextWidth / 2, this.dialogRect.y + this.dialogRect.height);
            }
        }
    }

    /**
     * Runs the game's loop
     */
    public async run() {
        await this.initAssets();
        this.enabledControls = this.computeEnabledControls();

        while(true)
        {
            this.handleControls();
            this.computeAnimations();
            if(this.needRefresh)
            {
                this.draw();
                this.needRefresh = false;
            }
            await nextFrame();
        }
    }

    /**
     * Tells if a sprite, defined by the given ImageMetrics is in the visible area
     */
    protected isVisible(imageMetrics: SpritesMetrics): boolean {
        const visibleArea = this.getVisibleArea();

        return imageMetrics.x + imageMetrics.width >= visibleArea.minX &&
            imageMetrics.y + imageMetrics.height >= visibleArea.minY &&
            imageMetrics.x <= visibleArea.maxX &&
            imageMetrics.y <= visibleArea.maxY;
    }

    /**
     * Gets the visible area in terms of squareSize units (as floating point numbers)
     */
    protected getVisibleArea()
    {
        return {
            minX: this.playerPosition.pos.x + 0.5 - (this.canvasSize.width / squareSize) / 2,
            minY: this.playerPosition.pos.y + 0.5 - (this.canvasSize.height / squareSize) / 2,

            maxX: this.playerPosition.pos.x + 0.5 + (this.canvasSize.width / squareSize) / 2,
            maxY: this.playerPosition.pos.y + 0.5 + (this.canvasSize.height / squareSize) / 2
        };
    }

    /**
     * Locks the dialogs controls for 500ms to avoid double clicks
     */
    protected async lockUnlockDialog()
    {
        this.dialogLocked = true;
        await wait(500);
        this.dialogLocked = false;
        this.needRefresh = true;
    }

    /**
     * Gets a boolean indicating whether there is something we can interact with in front of the player
     */
    protected getDialogInFront(): DialogItem | undefined
    {
        if(this.dialogLocked)
        {// The last dialog was closed less than 500ms ago, prevent a new dialog from reopening
            return undefined;
        }

        const position = {x: Math.round(this.playerPosition.pos.x), y: Math.round(this.playerPosition.pos.y)};
        switch(this.playerPosition.direction)
        {
            case Direction.Left: position.x--; break;
            case Direction.Right: position.x++; break;
            case Direction.Up: position.y--; break;
            case Direction.Down: position.y++; break;
        }

        return this.dialogItems.find(d => d.x == position.x && d.y == position.y);
    }

    protected getDialogFont()
    {
        return (16 * this.scaleFactor) + "px Arial";
    }

    /**
     * Refreshes the canvas size so that 1 screen px = 1 canvas px
     */
    private refreshCanvasSize() {
        const size = this.canvas.getBoundingClientRect();
        
        this.canvasSize.width = size.width / this.scaleFactor;
        this.canvasSize.height = size.height / this.scaleFactor;

        this.canvas.width = this.canvasSize.width;
        this.canvas.height = this.canvasSize.height;
        this.controlsCanvas.width = size.width;
        this.controlsCanvas.height = size.height;

        // Dialogs
        const oldWidth = this.dialogRect.width;
        this.dialogRect.width = Math.min(800, size.width - 150);
        this.dialogRect.x = (size.width - this.dialogRect.width) / 2;

        this.dialogRect.innerTextX = this.dialogRect.x + this.dialogTextPadding;
        this.dialogRect.innerTextWidth = this.dialogRect.width - 2 * this.dialogTextPadding;
        if(this.currentDialog != null && oldWidth != this.dialogRect.width)
        {
            this.currentDialog.currentDisplay = null;// Force recomputation of the current dialog layout
        }

        this.needRefresh = true;
    }

    /**
     * Returns a boolean value indicating whether the dialog is ready to show the next thing
     */
    protected isDialogReadyForNext() : boolean
    {
        return !this.dialogLocked && this.currentDialog != null &&
        ((this.currentDialog.firstDisplayedCharacter == this.currentDialog.text.length && this.currentDialog.link !== undefined) || // link page
        (this.currentDialog.currentDisplay && this.currentDialog.currentDisplay.currentCursor == this.currentDialog.currentDisplay.length))
    }

    private closeDialog()
    {
        this.currentDialog = null;
        var link = document.getElementById('dialogLink');
        if(link)
        {
            link.remove();
        }
    }

    private createDialogButton()
    {
        var link = document.createElement('a');
        link.id = "dialogLink";
        link.href = this.currentDialog.link;
        if(!this.currentDialog.link.startsWith('/'))
        {
            link.target = "_blank";
        }
        var textImageContent = document.createElement('img');
        textImageContent.src = "/img/buttons.png";
        link.appendChild(textImageContent);
        document.body.appendChild(link);
        return link;
    }
}