// Just tools, what did you expect to find here ?
export var Direction;
(function (Direction) {
    Direction[Direction["Down"] = 0] = "Down";
    Direction[Direction["Left"] = 1] = "Left";
    Direction[Direction["Right"] = 2] = "Right";
    Direction[Direction["Up"] = 3] = "Up";
})(Direction || (Direction = {}));
export const playerSize = { width: 32, height: 48, stepSize: 10 };
export const squareSize = 32;
export function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        }, { once: true });
        image.addEventListener('error', () => {
            reject(`Impossible de charger l'image ${imageUrl}`);
        }, { once: true });
        image.src = imageUrl;
    });
}
export function wait(waitMilliseconds) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, waitMilliseconds);
    });
}
export function nextFrame() {
    return new Promise((resolve) => {
        window.requestAnimationFrame(resolve);
    });
}
export class RateLimiter {
    constructor(execute) {
        this.scheduling = null;
        this.execute = execute;
    }
    start() {
        if (this.scheduling == null) {
            this.scheduling = window.requestAnimationFrame(() => {
                this.scheduling = null;
                this.execute();
            });
        }
    }
}
