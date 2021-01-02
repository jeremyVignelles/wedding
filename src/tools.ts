// Just tools, what did you expect to find here ?

export enum Direction {
    Down = 0,
    Left = 1,
    Right = 2,
    Up = 3
}

/**
 * Represents a position in the game, in squareSize units
 */
export interface SquarePosition {
    x: number,
    y: number,
}

/**
 * Position of an item in a spritesheet,
 * expressed as multiples of squareSize
*/
export interface SpritesMetrics {
    x: number,
    y: number,
    width: number,
    height: number
}

export interface DialogItem {
    x: number,
    y: number,
    link?: string | undefined,
    dialog: string
}

export const playerSize = {width:32, height: 48, stepSize: 10};
export const squareSize = 32;

export function loadImage(imageUrl: string) : Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        }, { once : true });
        image.addEventListener('error', () => {
            reject(`Impossible de charger l'image ${imageUrl}`);
        }, { once : true });

        image.src = imageUrl;
    });
}

export function wait(waitMilliseconds: number)
{
    return new Promise((resolve) => {
        window.setTimeout(resolve, waitMilliseconds);
    });
}

export function nextFrame()
{
    return new Promise((resolve) => {
        window.requestAnimationFrame(resolve);
    });
}

export class RateLimiter {
    private execute: () => void;
    private scheduling: number | null = null;

    constructor(execute: () => void) {
        this.execute = execute;
    }

    start() {
        if(this.scheduling == null)
        {
            this.scheduling = window.requestAnimationFrame(() => {
                this.scheduling = null;
                this.execute();
            });
        }
    }
}