import { RateLimiter } from "./tools.js";
// It's like SVG pan zoom, but that would be way too easy and much less fun to use an existing library, right?
export class SvgManager {
    constructor(file, container, minZoom, maxZoom, onClick) {
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.onClick = onClick;
        this.container = container;
        this.loaded = new Promise((resolve, reject) => {
            this.container.addEventListener('load', () => {
                this.svgDoc = this.container.contentDocument;
                this.attachPanZoomEvents();
                for (let area of Array.from(this.svgDoc.getElementsByClassName('hot-area'))) {
                    area.addEventListener('click', this.onAreaClicked.bind(this));
                }
                resolve();
            });
        });
        this.container.data = file;
    }
    onAreaClicked(ev) {
        if (this.onClick) {
            this.onClick(ev.currentTarget.id);
        }
    }
    attachPanZoomEvents() {
        const self = this;
        // Pointer events (inspired from https://developer.mozilla.org/fr/docs/Web/API/Pointer_events/gestes_pincer_zoom)
        let pointersCache = [];
        const svgRootElement = this.svgDoc.firstElementChild;
        const drawingBounds = {
            x: svgRootElement.viewBox.baseVal.x,
            y: svgRootElement.viewBox.baseVal.y,
            width: svgRootElement.viewBox.baseVal.width,
            height: svgRootElement.viewBox.baseVal.height,
        };
        window.addEventListener('beforeprint', function () {
            svgRootElement.setAttribute("viewBox", `${drawingBounds.x} ${drawingBounds.y} ${drawingBounds.width} ${drawingBounds.height}`);
        });
        window.addEventListener('afterprint', function () {
            refreshViewBox();
        });
        const rateLimiter = new RateLimiter(refreshViewBox);
        let svgDimensions = this.container.getBoundingClientRect();
        window.addEventListener('resize', () => {
            svgDimensions = this.container.getBoundingClientRect();
            rateLimiter.start();
        });
        let currentPanZoom = {
            centerX: drawingBounds.x + drawingBounds.width / 2,
            centerY: drawingBounds.y + drawingBounds.height / 2,
            zoom: (svgDimensions.width / svgDimensions.height > drawingBounds.width / drawingBounds.height)
                // Wider than image, scale based on height, otherwise scale on width
                ? svgDimensions.height / drawingBounds.height
                : svgDimensions.width / drawingBounds.width,
        };
        if (currentPanZoom.zoom < this.minZoom) {
            this.minZoom = currentPanZoom.zoom;
        }
        rateLimiter.start();
        this.svgDoc.addEventListener('wheel', (evt) => {
            if (evt.deltaY == 0) {
                return;
            }
            var svgCenter = {
                x: svgDimensions.left + svgDimensions.width / 2,
                y: svgDimensions.top + svgDimensions.height / 2
            };
            let deltaX = (evt.clientX - svgCenter.x) / currentPanZoom.zoom;
            let deltaY = (evt.clientY - svgCenter.y) / currentPanZoom.zoom;
            let oldZoom = currentPanZoom.zoom;
            if (evt.deltaY < 0) {
                if (currentPanZoom.zoom + 0.1 > this.maxZoom) {
                    return;
                }
                currentPanZoom.zoom += 0.1;
            }
            else {
                if (currentPanZoom.zoom - 0.1 < this.minZoom) {
                    return;
                }
                currentPanZoom.zoom -= 0.1;
            }
            currentPanZoom.centerX += deltaX - deltaX / (currentPanZoom.zoom / oldZoom);
            currentPanZoom.centerY += deltaY - deltaY / (currentPanZoom.zoom / oldZoom);
            rateLimiter.start();
        });
        svgRootElement.addEventListener('pointerdown', (ev) => {
            pointersCache = pointersCache.filter(p => p.id != ev.pointerId); // Just in case
            //svgRootElement.setPointerCapture(ev.pointerId);
            pointersCache.push({
                id: ev.pointerId,
                x: ev.clientX,
                y: ev.clientY,
            });
        });
        svgRootElement.addEventListener('pointermove', (ev) => {
            ev.preventDefault();
            var pointer = pointersCache.find(p => p.id == ev.pointerId);
            if (!pointer) {
                return;
            }
            let lastDistance = null;
            let lastPosition = pointersCache.reduce((acc, val) => {
                return {
                    x: acc.x + val.x,
                    y: acc.y + val.y
                };
            }, { x: 0, y: 0 });
            lastPosition.x /= pointersCache.length;
            lastPosition.y /= pointersCache.length;
            if (pointersCache.length == 2) { // two fingers
                lastDistance = Math.sqrt(Math.pow(pointersCache[1].x - pointersCache[0].x, 2) + Math.pow(pointersCache[1].y - pointersCache[0].y, 2));
            }
            pointer.x = ev.clientX;
            pointer.y = ev.clientY;
            if (pointersCache.length == 2) { // two fingers
                const newDistance = Math.sqrt(Math.pow(pointersCache[1].x - pointersCache[0].x, 2) + Math.pow(pointersCache[1].y - pointersCache[0].y, 2));
                currentPanZoom.zoom *= newDistance / lastDistance;
            }
            let newPosition = pointersCache.reduce((acc, val) => {
                return {
                    x: acc.x + val.x,
                    y: acc.y + val.y
                };
            }, { x: 0, y: 0 });
            newPosition.x /= pointersCache.length;
            newPosition.y /= pointersCache.length;
            currentPanZoom.centerX -= (newPosition.x - lastPosition.x) / currentPanZoom.zoom;
            currentPanZoom.centerY -= (newPosition.y - lastPosition.y) / currentPanZoom.zoom;
            rateLimiter.start();
        });
        svgRootElement.addEventListener('pointerup', removePointer.bind(this));
        svgRootElement.addEventListener('pointercancel', removePointer.bind(this));
        function removePointer(ev) {
            pointersCache = pointersCache.filter(p => p.id != ev.pointerId); // remove the pointer
            //Pointer released already
            //svgRootElement.releasePointerCapture(ev.pointerId);
        }
        function refreshViewBox() {
            if (currentPanZoom.zoom < self.minZoom) {
                currentPanZoom.zoom = self.minZoom;
            }
            else if (currentPanZoom.zoom > self.maxZoom) {
                currentPanZoom.zoom = self.maxZoom;
            }
            // Width/ height of the visible area
            const width = svgDimensions.width / currentPanZoom.zoom;
            const height = svgDimensions.height / currentPanZoom.zoom;
            const margin = 75;
            if (currentPanZoom.centerX - width / 2 > drawingBounds.x + drawingBounds.width - margin) {
                currentPanZoom.centerX = drawingBounds.x + drawingBounds.width - margin + width / 2;
            }
            else if (currentPanZoom.centerX + width / 2 < drawingBounds.x + margin) {
                currentPanZoom.centerX = drawingBounds.x + margin - width / 2;
            }
            const x = currentPanZoom.centerX - width / 2;
            if (currentPanZoom.centerY - height / 2 > drawingBounds.y + drawingBounds.height - margin) {
                currentPanZoom.centerY = drawingBounds.y + drawingBounds.height - margin + height / 2;
            }
            else if (currentPanZoom.centerY + height / 2 < drawingBounds.y + margin) {
                currentPanZoom.centerY = drawingBounds.y + margin - height / 2;
            }
            const y = currentPanZoom.centerY - height / 2;
            svgRootElement.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
        }
    }
}
