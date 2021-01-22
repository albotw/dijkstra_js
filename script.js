//! GLOBAL VARIABLES ==============================================================================================================
const INFINI = 9999;
const DEADZONE = 2;
const MIN_RECT_SIZE = 50;
const MAX_RECT_SIZE = 80;


let nbPoints = 4000;
let nbObstacles = 20;
let R = 20;
let r = 20;
let nbPointsIteration = 30;


let canvas = document.getElementById("output");
let ctx = canvas.getContext('2d');

let sommets;
let graphe_current;
let graphe_old;
let PCC;

let debut;
let fin;

//! UTILITIES FUNCTION============================================================================================================== 

document.addEventListener("DOMContentLoaded", function () {
    init();
    registerEventListeners();
})

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function clearOuput() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function registerEventListeners() {
    document.getElementById("reset").addEventListener('click', reset);
    document.getElementById("generate").addEventListener('click', generateGraphe);
    document.getElementById("apply").addEventListener("click", applyDijkstra);

    document.getElementById("nbPoints").addEventListener("change", function () {
        nbPoints = document.getElementById("nbPoints").value;
    });

    document.getElementById("nbObstacles").addEventListener("change", function () {
        nbObstacles = document.getElementById("nbObstacles").value;
    });

    document.getElementById("R").addEventListener("change", function () {
        R = document.getElementById("R").value;
    });

    document.getElementById("r").addEventListener("change", function () {
        r = document.getElementById("r").value;
    });
}

//! OBJECT FUNCTIONS ==============================================================================================================

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2.0) + Math.pow(p1.y - p2.y, 2.0));
    }

    print() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
};

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    randomize() {
        this.x = random(0, canvas.width);
        this.y = random(0, canvas.height);
        this.width = random(MIN_RECT_SIZE, MAX_RECT_SIZE);
        this.height = random(MIN_RECT_SIZE, MAX_RECT_SIZE);
    }

    collision(p) {
        return ((this.x - DEADZONE) <= p.x)
            && ((this.y - DEADZONE) <= p.y)
            && ((this.x + this.width + DEADZONE) >= p.x)
            && ((this.y + this.height + DEADZONE) >= p.y);
    }

    print() {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Sommet {
    constructor(p) {
        this.position = p;
        this.previous = null;
        this.distance = INFIFI;
        this.voisins = new Map();
    }

    addVoisin(d, s) {
        this.voisins.set(d, s);
    }
}

//! DIJKSTRA FUNCTIONS ============================================================================================================

function init() {
    document.getElementById("nbPoints").value = nbPoints;
    document.getElementById("nbObstacles").value = nbObstacles;
    document.getElementById("R").value = R;
    document.getElementById("r").value = r;
}

function reset() {
    clearOuput();
    sommets.clear();
    obstacles.clear();
}

function generateGraphe() {
    console.log("--- début génération graphe ---");

    graphe_current = new Array();
    obstacles = new Array();

    //? génération des obstacles.
    for (i = 0; i < nbObstacles; i++) {
        let rectangle = new Rectangle(0, 0, 0, 0);
        rectangle.randomize();
        obstacles.push(rectangle);
    }

    //? génération du graphe.
    debut = new Sommet(new Point(5, 5));
    debut.distance = 0;
    graphe_current.push(debut);

    i = 0;
    do {
        x = random(0, canvas.width);
        y = random(0, canvas.height);
        let point = new Point(x, y);

        collide = false;
        for (j = 0; j < nbObstacles; j++) {
            if (obstacles[j].collision(point)) {
                collide = true;
            }
        }

        if (!collide) {
            tmp = new Sommet(point);
            tmp.distance = INFINI;
            graphe_current.push(tmp);
            i++;
        }
    }
    while (i < nbPoints - 2);

    fin = new Sommet(new Point(canvas.width, canvas.height));
    fin.distance = INFINI;
    graphe_current.push(fin);

    //? recherche des voisins.
    for (i = 0; i < nbPoints; i++) {
        s = graphe_current[i];
        for (j = 0; j < nbPoints; j++) {
            tmp = graphe_current[j];
            d = Point.distance(s, tmp);

            if (d <= R) {
                s.addVoisin(d, tmp);
            }
        }
    }
}

function render() {
    console.log("--- begin render ---");
    ctx.fillStyle = "grey";
    for (i = 0; i < nbObstacles; i++) {
        obstacles[i].print();
    }

    ctx.fillStyle = "red";
    for (i = 0; i < nbPoints; i++) {
        graphe_current[i].position.print();
        for (j = 0; j < graphe_current[i].voisins.size; j++) {
            ctx.beginPath();
            ctx.moveTo(graphe_current[i].position.x, graphe_current[i].position.y);
            ctx.lineTo()
        }
    }
}

function applyDijkstra() {

}