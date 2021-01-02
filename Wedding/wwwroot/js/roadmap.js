import { SvgManager } from "./svgManager.js";
// You're looking at the wrong code
console.log("Wrong way.");
class Roadmap {
    constructor() {
        this.currentDisplayedArea = null;
        this.svgManager = new SvgManager("/img/roadmap.svg", document.getElementById("map"), 0.75, 5, this.onAreaClicked.bind(this));
        if (window.print) {
            document.getElementById('print-btn').style.display = '';
        }
    }
    onAreaClicked(id) {
        if (this.currentDisplayedArea !== null) {
            this.currentDisplayedArea.classList.remove('current');
        }
        document.getElementById("no-click").style.display = "none";
        this.currentDisplayedArea = document.getElementById('info-' + id);
        this.currentDisplayedArea.classList.add('current');
    }
}
new Roadmap();
