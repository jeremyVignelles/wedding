// This file has good constants. Is that what you're looking for?

export enum ActionKey {
    left = "left",
    right = "right",
    up = "up",
    down = "down",
    a = "a",
    b = "b",
    start = "start", 
    zoomPlus = "zoomPlus", 
    zoomMinus = "zoomMinus"
};

let keyPressed: {[key in ActionKey]: boolean} = {
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

/**
 * Indicates whether the button was pressed with the mouse or pointer events
 */
let buttonPressed: {[key in ActionKey]: number[]} = {
    left: [],
    right: [],
    up: [],
    down: [],
    a: [],
    b: [],
    start: [],
    zoomPlus: [], 
    zoomMinus: [],
};

const codes: {[key: number]: ActionKey} = {
	37: ActionKey.left, //left arrow
	39: ActionKey.right, //right arrow
	38: ActionKey.up, //top arrow
	40: ActionKey.down, //bottom arrow
	90: ActionKey.up, //z key
 	81: ActionKey.left, //q key
 	83: ActionKey.down, //s key
	68: ActionKey.right, //d key
	65: ActionKey.a, //A key
	66: ActionKey.b, //B key
    13: ActionKey.start, //enter key
    107: ActionKey.zoomPlus, //+ key (numeric pad)
    109: ActionKey.zoomMinus, //- key (numeric pad)
    187: ActionKey.zoomPlus, //+ equal key
    54: ActionKey.zoomMinus, //- minus key of 6
};

export function isKeyPressed(key: ActionKey)
{
    return keyPressed[key] || (buttonPressed[key].length > 0);
}

let keyPressedEventHandler : () => void = () => {};

export function registerKeyPressed(action : () => void)
{
    keyPressedEventHandler = action;
}

const konami = [ActionKey.up, ActionKey.up, ActionKey.down, ActionKey.down, ActionKey.left, ActionKey.right, ActionKey.left, ActionKey.right, ActionKey.b, ActionKey.a, ActionKey.start];
let currentOffset = 0;

window.addEventListener('keydown', e => {
    if(codes[e.keyCode])
    {
        keyPressed[codes[e.keyCode]] = true;

        keyPressedEventHandler();

        if(currentOffset < konami.length && konami[currentOffset] == codes[e.keyCode])
        {
            currentOffset++;
            if(currentOffset == konami.length)
            {
                currentOffset = 0;
                window.location.href = "/Home/Konami"
            }
        }
        else
        {
            currentOffset = 0;
        }
    }
});

window.addEventListener('keyup', e => {
    if(codes[e.keyCode])
    {
        keyPressed[codes[e.keyCode]] = false;
        keyPressedEventHandler();
    }
});

var controlsCanvas = document.getElementById("controlsCanvas") as HTMLCanvasElement;

function onPointerEvent(e: PointerEvent)
{
    if((e.buttons & 1) == 0)
    {// Ignore if no button is pressed
        return;
    }

    // Reset all button presses with this pointer
    for (var k of Object.keys(buttonPressed) as ActionKey[])
    {
        buttonPressed[k] = buttonPressed[k].filter(b => b != e.pointerId);
    }

    const canvasRect = controlsCanvas.getBoundingClientRect();
    
    if(e.clientX >= canvasRect.left && e.clientX < canvasRect.left + 50 && e.clientY >= canvasRect.top && e.clientY < canvasRect.top + 50)
    {// Zoom +
        console.log("zoom +");
        buttonPressed[ActionKey.zoomPlus].push(e.pointerId);
    }
    else if(e.clientX >= canvasRect.left && e.clientX < canvasRect.left + 50 && e.clientY >= canvasRect.top + 100 && e.clientY < canvasRect.top + 150)
    {// Zoom -
        console.log("zoom -");
        buttonPressed[ActionKey.zoomMinus].push(e.pointerId);
    }

    // D-Pad is centered at 95;height-95. Its radius is 85
    const dPadCenter = {x: canvasRect.left + 95, y: canvasRect.top + canvasRect.height - 95};
    const aCenter = {x: canvasRect.left + canvasRect.width - 60, y: canvasRect.top + canvasRect.height - 120};
    const bCenter = {x: canvasRect.left + canvasRect.width - 120, y: canvasRect.top + canvasRect.height - 60};

    const dPadDelta = { x: e.clientX - dPadCenter.x, y: e.clientY - dPadCenter.y };
    let hypothenuse = Math.sqrt(Math.pow(dPadDelta.x, 2) + Math.pow(dPadDelta.y, 2));
    if(hypothenuse <= 85 && hypothenuse > 5)
    {
        // We need to discriminate key presses based on the delta from the D-Pad center
        // Let's draw a quadrant delimited by y=x and y = -x
        if(dPadDelta.y >= dPadDelta.x)
        {// We are below y = x (remember, y is from the top)
            if(dPadDelta.y >= -dPadDelta.x)
            {// Below y = -x too, it's a down
                buttonPressed[ActionKey.down].push(e.pointerId);
            }
            else
            {// Left
                buttonPressed[ActionKey.left].push(e.pointerId);
            }
        }
        else
        {// We are above y=x, two options left, up or right
            if(dPadDelta.y >= -dPadDelta.x)
            {// Below y = -x too, it's a right
                buttonPressed[ActionKey.right].push(e.pointerId);
            }
            else
            {// Up
                buttonPressed[ActionKey.up].push(e.pointerId);
            }
        }
    }
    hypothenuse = Math.sqrt(Math.pow(e.clientX - aCenter.x, 2) + Math.pow(e.clientY - aCenter.y, 2));
    if(hypothenuse <= 30)
    {
        buttonPressed[ActionKey.a].push(e.pointerId);
    }
    hypothenuse = Math.sqrt(Math.pow(e.clientX - bCenter.x, 2) + Math.pow(e.clientY - bCenter.y, 2));
    if(hypothenuse <= 30)
    {
        buttonPressed[ActionKey.b].push(e.pointerId);
    }
    keyPressedEventHandler();
}

window.addEventListener('pointerdown', onPointerEvent);
window.addEventListener('pointermove', onPointerEvent);
window.addEventListener('pointerup', e => {
    // Reset all button presses with this pointer
    for (var k of Object.keys(buttonPressed) as ActionKey[])
    {
        buttonPressed[k] = buttonPressed[k].filter(b => b != e.pointerId);
    }
    keyPressedEventHandler();
});