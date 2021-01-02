let items = {
    "from-south": Array.apply(null, document.querySelectorAll(".from-south")),
    "from-highway": Array.apply(null, document.querySelectorAll(".from-highway")),
    "from-town-hall": Array.apply(null, document.querySelectorAll(".from-town-hall"))
};
if (window.print) {
    document.getElementById('print-btn').style.display = '';
}
function selectFrom(from) {
    for (let i of Array.apply(null, document.querySelectorAll(".show"))) {
        i.classList.remove("show");
    }
    document.querySelector(".select-from.active").classList.remove("active");
    for (let i of items[from]) {
        i.classList.add("show");
    }
    document.getElementById("select-" + from).classList.add("active");
}
selectFrom('from-south');
for (let i of Object.keys(items)) {
    document.getElementById("select-" + i).addEventListener("click", () => selectFrom(i));
}
