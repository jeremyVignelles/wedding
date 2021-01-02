import {SvgManager} from "./svgManager.js";

// This book contains no cheat code, but does predicts the future.
console.log("C'est long d'écrire un livre mine de rien...");


class TownHallBook {
    svgManager:SvgManager;
    constructor() {
        this.svgManager = new SvgManager("/img/townHallBook.svg", document.getElementById("map") as HTMLObjectElement, 0.75, 5, this.onAreaClicked.bind(this));
    }

    onAreaClicked(id: string)
    {
        const pages = this.svgManager.svgDoc.getElementsByClassName("double-page");
        const leftButton = this.svgManager.svgDoc.getElementById("navigation-left");
        const rightButton = this.svgManager.svgDoc.getElementById("navigation-right");

        let currentSelection = 0;
        for(let i = 0; i < pages.length; i++)
        {
            if(pages[i].classList.contains("current"))
            {
                pages[i].classList.remove("current");
                currentSelection = i;
                break;
            }
        }

        leftButton.classList.remove("hidden");
        rightButton.classList.remove("hidden");

        switch(id)
        {
            case "navigation-left":
                currentSelection--;
                break;
            case "navigation-right":
                currentSelection++;
                break;
        }

        if(currentSelection < 1)
        {
            leftButton.classList.add("hidden");
        }

        if(currentSelection >= pages.length - 1)
        {
            rightButton.classList.add("hidden");
        }

        pages[currentSelection].classList.add("current");
    }
}

new TownHallBook();