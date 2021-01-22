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

//! UTILITIES FUNCTIONS ============================================================================================================== 

document.addEventListener("DOMContentLoaded", function () {
    init();
    registerEventListeners();
})

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function clearOutput() {
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
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
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
        this.distance = INFINI;
        this.voisins = new Map();
    }

    static compare(a, b) {
        if (a.distance < b.distance) {
            return -1;
        }
        else if (a.distance > b.distance) {
            return 1;
        }
        else { return 0; }
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
    clearOutput();
    graphe_current.length = 0;
    obstacles.length = 0;

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

    fin = new Sommet(new Point(canvas.width - 5, canvas.height - 5));
    fin.distance = INFINI;
    graphe_current.push(fin);

    console.log("--- fin génération points ---");
    console.log("--- début test voisins ---");

    //? recherche des voisins.
    for (i = 0; i < nbPoints; i++) {
        s = graphe_current[i];
        for (j = 0; j < nbPoints; j++) {
            tmp = graphe_current[j];
            d = Point.distance(s.position, tmp.position);

            if (d <= R) {
                s.voisins.set(d, tmp);
            }
        }
    }

    console.log("--- fin génération graphes ---");
    render();
}

function render() {
    console.log("--- begin render ---");
    clearOutput();
    ctx.fillStyle = "grey";
    for (i = 0; i < nbObstacles; i++) {
        obstacles[i].print();
    }

    ctx.fillStyle = "red";
    for (i = 0; i < graphe_current.length; i++) {
        current = graphe_current[i];
        current.position.print();

        for (const value of current.voisins.values()) {
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo(current.position.x, current.position.y);
            ctx.lineTo(value.position.x, value.position.y);
            ctx.stroke();
        }
    }

    if (PCC != null) {
        ctx.strokeStyle = "green";
        for (const point of PCC) {
            if (point.previous != null) {
                ctx.beginPath();
                ctx.moveTo(point.position.x, point.position.y);
                ctx.lineTo(point.previous.position.x, point.previous.position.y);
                ctx.stroke();
            }
        }
    }

    ctx.fillStyle = "cyan";
    debut.position.print();
    fin.position.print();
    console.log("--- end render ---");
}

function applyDijkstra() {
    PCC = new Array();
    console.log("--- debut dijkstra ---");
    let tmp;
    do {
        graphe_current.sort(Sommet.compare);
        tmp = graphe_current[0];
        if (tmp != null) {
            for (const [arc, voisin] of tmp.voisins.entries()) {
                if (voisin.distance > arc + tmp.distance) {
                    voisin.distance = arc + tmp.distance;
                    voisin.previous = tmp;
                }
            }

            graphe_current.shift();
        }
    } while (tmp != fin);

    console.log("--- fin dijkstra ---");

    tmp = fin;
    while (tmp != null) {
        PCC.push(tmp);
        tmp = tmp.previous;
    }
    console.log(PCC.length);
    render();
}