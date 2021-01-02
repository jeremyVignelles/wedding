import { SvgManager } from "./svgManager.js";
// Making a table map is really hard
console.log("If only it was easy as Math.random()");
export class TableMap {
    constructor(tables, guests) {
        this.currentDisplayedArea = null;
        this.firstNameMapping = {};
        this.seatedGuests = {};
        this.seatedCount = 0;
        this.chairSize = 42;
        this.svgNamespace = "http://www.w3.org/2000/svg";
        this.tables = tables;
        this.guests = guests;
        for (let t of this.tables) {
            this.seatedGuests[t.id] = [];
            for (let i = 0; i < t.capacity; i++) {
                this.seatedGuests[t.id].push(null);
            }
        }
        this.svgManager = new SvgManager("/img/tableMap.svg", document.getElementById("map"), 0.25, 10, this.onAreaClicked.bind(this));
        this.svgManager.loaded.then(() => {
            this.writeTables();
            this.writeGuestsForm();
        });
    }
    writeTables() {
        let tableNumber = 0;
        const tableDetailContainer = document.getElementById("table-detail");
        for (let t of this.tables) {
            if (t.capacity !== 1) { // Don't show the table on childs chairs
                let newTable = this.svgManager.svgDoc.createElementNS(this.svgNamespace, "circle");
                newTable.setAttribute("class", "furniture table");
                newTable.setAttribute("id", `table-${tableNumber}`);
                newTable.setAttribute("cx", t.x.toString());
                newTable.setAttribute("cy", t.y.toString());
                newTable.setAttribute("r", t.radius.toString());
                this.svgManager.svgDoc.firstChild.appendChild(newTable);
                let tableText = this.svgManager.svgDoc.createElementNS(this.svgNamespace, "text");
                tableText.innerHTML = t.name;
                tableText.setAttribute("class", "chair-text");
                tableText.setAttribute("x", t.x.toString());
                tableText.setAttribute("y", t.y.toString());
                this.svgManager.svgDoc.firstChild.appendChild(tableText);
            }
            const tableDetail = document.createElement("div");
            tableDetail.classList.add("table");
            tableDetailContainer.appendChild(tableDetail);
            const tableDetailTitle = document.createElement("h3");
            tableDetailTitle.innerText = t.name;
            tableDetail.appendChild(tableDetailTitle);
            let chairCount = t.capacity;
            for (var chairNumber = 0; chairNumber < chairCount; chairNumber++) {
                let group = this.svgManager.svgDoc.createElementNS(this.svgNamespace, "g");
                group.setAttribute("transform", `rotate(${t.angle + chairNumber * 360 / chairCount} ${t.x} ${t.y}) translate(${t.x - this.chairSize / 2}, ${t.y - this.chairSize - t.radius})`);
                let newChair = this.svgManager.svgDoc.createElementNS(this.svgNamespace, "rect");
                newChair.setAttribute("class", "furniture chair");
                newChair.setAttribute("id", `chair-${tableNumber}-${chairNumber}`);
                newChair.setAttribute("x", "0");
                newChair.setAttribute("y", "0");
                newChair.setAttribute("width", this.chairSize.toString());
                newChair.setAttribute("height", this.chairSize.toString());
                group.appendChild(newChair);
                let chairText = this.svgManager.svgDoc.createElementNS(this.svgNamespace, "text");
                if (t.capacity !== 1) { // Don't show the 0 on childs chairs
                    chairText.innerHTML = chairNumber.toString();
                }
                chairText.setAttribute("class", "chair-text");
                chairText.setAttribute("x", (this.chairSize / 2).toString());
                chairText.setAttribute("y", "8");
                group.appendChild(chairText);
                let guestNameText = this.svgManager.svgDoc.createElementNS(this.svgNamespace, "text");
                guestNameText.setAttribute("class", "chair-guest-name-text");
                guestNameText.setAttribute("id", `chair-guest-name-text-${tableNumber}-${chairNumber}`);
                guestNameText.setAttribute("x", (this.chairSize / 2).toString());
                guestNameText.setAttribute("y", (this.chairSize / 2).toString());
                group.appendChild(guestNameText);
                let chairWineIcon = this.svgManager.svgDoc.createElementNS(this.svgNamespace, "image");
                chairWineIcon.setAttribute("class", "chair-wine-icon");
                chairWineIcon.setAttributeNS("http://www.w3.org/1999/xlink", "href", "/img/wine.svg");
                chairWineIcon.setAttribute("x", ((this.chairSize - 20) / 2).toString());
                chairWineIcon.setAttribute("y", "60");
                chairWineIcon.setAttribute("width", "20");
                chairWineIcon.setAttribute("height", "20");
                group.appendChild(chairWineIcon);
                let chairFoodWarningIcon = this.svgManager.svgDoc.createElementNS(this.svgNamespace, "image");
                chairFoodWarningIcon.setAttribute("class", "chair-food-warning-icon");
                chairFoodWarningIcon.setAttributeNS("http://www.w3.org/1999/xlink", "href", "/img/warning.svg");
                chairFoodWarningIcon.setAttribute("x", ((this.chairSize - 20) / 2).toString());
                chairFoodWarningIcon.setAttribute("y", "40");
                chairFoodWarningIcon.setAttribute("width", "20");
                chairFoodWarningIcon.setAttribute("height", "20");
                group.appendChild(chairFoodWarningIcon);
                this.svgManager.svgDoc.firstChild.appendChild(group);
                const chairDiv = document.createElement("div");
                chairDiv.id = `chair-detail-${tableNumber}-${chairNumber}`;
                chairDiv.innerHTML = `${chairNumber}: <span id="chair-detail-guest-name-${tableNumber}-${chairNumber}"></span><img class="wine-icon" src="/img/wine.svg" /><img class="food-warning-icon" src="/img/warning.svg" /><p id="chair-food-instructions-${tableNumber}-${chairNumber}" class="chair-food-instructions"></p>`;
                tableDetail.appendChild(chairDiv);
            }
            tableNumber++;
        }
    }
    writeGuestsForm() {
        const form = document.getElementById("table-map-form");
        for (let g of this.guests) {
            let fieldset = document.createElement("fieldset");
            fieldset.id = "fieldset-" + g.id;
            if (!this.firstNameMapping[g.firstName]) {
                this.firstNameMapping[g.firstName] = [];
            }
            this.firstNameMapping[g.firstName].push(g.lastName);
            let legend = document.createElement("legend");
            legend.innerText = g.firstName + " " + g.lastName;
            fieldset.appendChild(legend);
            let guestIdHidden = document.createElement("input");
            guestIdHidden.type = "hidden";
            guestIdHidden.name = "guest-id[]";
            guestIdHidden.id = "guest-id-" + g.id;
            guestIdHidden.value = g.id.toString();
            fieldset.appendChild(guestIdHidden);
            let tableSelect = document.createElement("select");
            tableSelect.name = "table-select[]";
            tableSelect.id = "table-select-" + g.id;
            tableSelect.dataset["guest"] = g.id.toString();
            tableSelect.addEventListener('change', this.onTableSelectChanged.bind(this));
            let defaultOption = document.createElement("option");
            defaultOption.value = "null";
            tableSelect.options.add(defaultOption);
            let tableCapacity = null;
            for (let t of this.tables) {
                let option = document.createElement("option");
                option.value = t.id.toString();
                if (g.tableId === t.id) {
                    option.selected = true;
                    tableCapacity = t.capacity;
                }
                option.innerText = t.name;
                tableSelect.options.add(option);
            }
            fieldset.appendChild(tableSelect);
            let seatSelect = document.createElement("select");
            seatSelect.name = "seat-select[]";
            seatSelect.id = "seat-select-" + g.id;
            seatSelect.dataset["guest"] = g.id.toString();
            seatSelect.addEventListener('change', this.onSeatSelectChanged.bind(this));
            fieldset.appendChild(seatSelect);
            let defaultSeatOption = document.createElement("option");
            defaultSeatOption.value = "null";
            seatSelect.options.add(defaultSeatOption);
            form.appendChild(fieldset);
            if (g.tableId !== null) {
                this.refreshTableSeats(g);
                if (g.seatNumber !== null) {
                    if (tableCapacity === null || g.seatNumber >= tableCapacity || this.seatedGuests[g.tableId][g.seatNumber] !== null) {
                        fieldset.classList.add("error");
                    }
                    else {
                        this.seatedGuests[g.tableId][g.seatNumber] = g;
                        this.seatedCount++;
                    }
                }
            }
        }
        let submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.innerText = "Enregistrer";
        form.appendChild(submitButton);
        document.getElementById("invited-count").innerText = this.guests.length.toString();
        this.refreshSeatedCount();
        for (let t of this.tables) {
            for (let i = 0; i < t.capacity; i++) {
                this.refreshSeatDisplay(t.id, i);
            }
        }
    }
    onTableSelectChanged(ev) {
        const selectElement = ev.target;
        const fieldset = selectElement.parentElement;
        const guest = this.guests.find(g => g.id === parseInt(selectElement.dataset["guest"]));
        this.removeGuestFromSeat(guest);
        fieldset.classList.remove("error");
        if (selectElement.value !== "null") {
            guest.tableId = parseInt(selectElement.value);
            guest.seatNumber = 0;
            this.addGuestToSeat(guest);
        }
        else {
            guest.tableId = null;
            guest.seatNumber = null;
        }
        this.refreshTableSeats(guest);
    }
    onSeatSelectChanged(ev) {
        const selectElement = ev.target;
        const fieldset = selectElement.parentElement;
        const guest = this.guests.find(g => g.id === parseInt(selectElement.dataset["guest"]));
        this.removeGuestFromSeat(guest);
        fieldset.classList.remove("error");
        if (selectElement.value !== "") {
            guest.seatNumber = parseInt(selectElement.value);
            this.addGuestToSeat(guest);
        }
        else {
            guest.seatNumber = null;
        }
    }
    addGuestToSeat(guest) {
        if (this.seatedGuests[guest.tableId][guest.seatNumber] === null) {
            this.seatedGuests[guest.tableId][guest.seatNumber] = guest;
            this.seatedCount++;
            this.refreshSeatDisplay(guest.tableId, guest.seatNumber);
            this.refreshSeatedCount();
        }
        else {
            document.getElementById("fieldset-" + guest.id).classList.add("error");
        }
    }
    removeGuestFromSeat(guest) {
        if (guest.tableId !== null && guest.seatNumber !== null && this.seatedGuests[guest.tableId][guest.seatNumber] === guest) { // withdraw the guest from its chair
            // finds if another guest was pretending to be on that chair too.
            let conflictingGuest = this.guests.find(g => g.id !== guest.id && g.tableId == guest.tableId && g.seatNumber == guest.seatNumber);
            if (conflictingGuest) {
                this.seatedGuests[guest.tableId][guest.seatNumber] = conflictingGuest;
            }
            else {
                this.seatedGuests[guest.tableId][guest.seatNumber] = null;
            }
            this.seatedCount--;
            this.refreshSeatDisplay(guest.tableId, guest.seatNumber);
            this.refreshSeatedCount();
        }
    }
    refreshTableSeats(g) {
        var seatSelect = document.getElementById("seat-select-" + g.id);
        if (g.tableId == null) {
            while (seatSelect.options.length > 1) {
                seatSelect.options.remove(1);
            }
            return;
        }
        let t = this.tables.find(t => t.id == g.tableId);
        while (t.capacity + 1 < seatSelect.options.length) { // The new capacity is lower than the current capacity, remove seats
            seatSelect.options.remove(seatSelect.options.length - 1);
        }
        while (seatSelect.options.length < t.capacity + 1) {
            let option = document.createElement("option");
            let value = seatSelect.options.length - 1;
            option.value = value.toString();
            option.innerText = value.toString();
            if (g.seatNumber === value) {
                option.selected = true;
            }
            seatSelect.options.add(option);
        }
    }
    /**
     * Refreshes the display of the given svg seat
     */
    refreshSeatDisplay(tableId, seatNumber) {
        const guest = this.seatedGuests[tableId][seatNumber];
        const svgChair = this.svgManager.svgDoc.getElementById(`chair-${tableId}-${seatNumber}`);
        const svgGuestName = this.svgManager.svgDoc.getElementById(`chair-guest-name-text-${tableId}-${seatNumber}`);
        const detailChair = document.getElementById(`chair-detail-${tableId}-${seatNumber}`);
        const detailChairGuestName = document.getElementById(`chair-detail-guest-name-${tableId}-${seatNumber}`);
        const foodInstructionsChair = document.getElementById(`chair-food-instructions-${tableId}-${seatNumber}`);
        if (guest === null) {
            svgChair.classList.remove("filled", "child");
            svgChair.parentElement.classList.remove("wine", "food-warning");
            detailChair.classList.remove("child", "wine", "food-warning");
            svgGuestName.innerHTML = "";
            detailChairGuestName.innerHTML = "";
            foodInstructionsChair.innerHTML = "";
        }
        else {
            svgChair.classList.add("filled");
            if (guest.age <= 2) {
                svgChair.classList.add("child");
                detailChair.classList.add("child");
            }
            if (guest.alcohol === true) {
                svgChair.parentElement.classList.add("wine");
                detailChair.classList.add("wine");
            }
            if (guest.foodInstructions) {
                svgChair.parentElement.classList.add("food-warning");
                detailChair.classList.add("food-warning");
                foodInstructionsChair.innerText = guest.foodInstructions;
            }
            let guestName = guest.firstName;
            if (this.firstNameMapping[guest.firstName].length !== 1) {
                guestName = guest.firstName + " " + guest.lastName[0];
            }
            svgGuestName.innerHTML = guestName;
            detailChairGuestName.innerHTML = guestName;
        }
    }
    refreshSeatedCount() {
        document.getElementById("seated-count").innerText = this.seatedCount.toString();
        document.getElementById("remaining-count").innerText = (this.guests.length - this.seatedCount).toString();
    }
    onAreaClicked(id) {
        /*if(this.currentDisplayedArea !== null) {
            this.currentDisplayedArea.classList.remove('current');
        }
        
        document.getElementById("no-click").style.display = "none";
        this.currentDisplayedArea = document.getElementById('info-' + id);
        this.currentDisplayedArea.classList.add('current');*/
    }
}
