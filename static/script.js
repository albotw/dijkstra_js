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
let graphe_previous;
let PCC;
let cptIteration = 0;

let debut;
let fin;


//! UTILITIES FUNCTIONS ============================================================================================================== 

document.addEventListener("DOMContentLoaded", function ()
{
    setupCanvas();
    init();
    registerEventListeners();
})

function setupCanvas()
{
    canvas = document.getElementById("output");
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight;
}

function random(min, max)
{
    return Math.random() * (max - min) + min;
}

function clearOutput()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function registerEventListeners()
{
    document.getElementById("reset").addEventListener('click', reset);
    document.getElementById("generate").addEventListener('click', generateGraphe);
    document.getElementById("apply").addEventListener("click", applyDijkstra);

    document.getElementById("nbPoints").addEventListener("change", function ()
    {
        nbPoints = document.getElementById("nbPoints").value;
    });

    document.getElementById("nbObstacles").addEventListener("change", function ()
    {
        nbObstacles = document.getElementById("nbObstacles").value;
    });

    document.getElementById("R").addEventListener("change", function ()
    {
        R = document.getElementById("R").value;
    });

    document.getElementById("r").addEventListener("change", function ()
    {
        r = document.getElementById("r").value;
    });
}

//! OBJECT FUNCTIONS ==============================================================================================================
class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    static distance(p1, p2)
    {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2.0) + Math.pow(p1.y - p2.y, 2.0));
    }

    print()
    {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
};

class Rectangle
{
    constructor(x, y, width, height)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    randomize()
    {
        this.x = random(0, canvas.width);
        this.y = random(0, canvas.height);
        this.width = random(MIN_RECT_SIZE, MAX_RECT_SIZE);
        this.height = random(MIN_RECT_SIZE, MAX_RECT_SIZE);
    }

    collision(p)
    {
        return ((this.x - DEADZONE) <= p.x)
            && ((this.y - DEADZONE) <= p.y)
            && ((this.x + this.width + DEADZONE) >= p.x)
            && ((this.y + this.height + DEADZONE) >= p.y);
    }

    print()
    {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Sommet
{
    constructor(p)
    {
        this.position = p;
        this.previous = null;
        this.distance = INFINI;
        this.voisins = new Map();
    }

    static compare(a, b)
    {
        if (a.distance < b.distance)
        {
            return -1;
        }
        else if (a.distance > b.distance)
        {
            return 1;
        }
        else { return 0; }
    }
}

//! DIJKSTRA FUNCTIONS ============================================================================================================

function init()
{
    document.getElementById("nbPoints").value = nbPoints;
    document.getElementById("nbObstacles").value = nbObstacles;
    document.getElementById("R").value = R;
    document.getElementById("r").value = r;
}

function reset()
{
    clearOutput();
    graphe_current.length = 0;
    obstacles.length = 0;

}

function generatePoint(modeIteration, ref)
{
    let p = null;
    let restart = false;
    do
    {
        restart = false;
        x = random(0, canvas.width);
        y = random(0, canvas.height);
        p = new Point(x, y);

        //! ce pourquoi javascript pue la merde. si on change _i par i on obtient une boucle infinie.
        //! pourquoi ? parceque l'on appele la fonction dans une boucle for sur i et les deux variables ne sont visiblement 
        //! pas séparées.
        for (let i = 0; i < nbObstacles; i++)
        {
            if (obstacles[i].collision(p))
            {
                restart = true;
            }
        }

        if (modeIteration === true && Point.distance(ref.position, p) > r)
        {
            restart = true;
        }
    } while (restart === true);

    return p;
}

function generateArcs()
{
    for (i = 0; i < graphe_current.length; i++)
    {
        let s = graphe_current[i];
        for (j = 0; j < graphe_current.length; j++)
        {
            let tmp = graphe_current[j];
            let d = Point.distance(s.position, tmp.position);

            if (d <= R)
            {
                s.voisins.set(d, tmp);
            }
        }
    }
    console.log("done arcs");
}

function generateGraphe()
{
    let beginTime = performance.now();
    graphe_current = new Array();
    graphe_previous = new Array();
    obstacles = new Array();

    //? génération des obstacles.
    for (let i = 0; i < nbObstacles; i++)
    {
        let rectangle = new Rectangle(0, 0, 0, 0);
        rectangle.randomize();
        obstacles.push(rectangle);
    }

    //? génération du graphe.
    debut = new Sommet(new Point(5, 5));
    debut.distance = 0;
    graphe_current.push(debut);

    for (let i = 0; i < nbPoints - 2; i++)
    {
        let p = generatePoint(false, null);
        let s = new Sommet(p);
        s.distance = INFINI;
        graphe_current.push(s);
    }

    fin = new Sommet(new Point(canvas.width - 5, canvas.height - 5));
    fin.distance = INFINI;
    graphe_current.push(fin);


    //? recherche des voisins.
    generateArcs();
    let endTime = performance.now();
    console.log("done generator: " + (endTime - beginTime) + " ms");
    render();
}

function render()
{
    let beginTime = performance.now();
    clearOutput();
    ctx.fillStyle = "grey";
    for (i = 0; i < nbObstacles; i++)
    {
        obstacles[i].print();
    }

    ctx.fillStyle = "orange";
    for (i = 0; i < graphe_previous.length; i++)
    {
        current = graphe_previous[i];
        current.position.print();

        for (const value of current.voisins.values())
        {
            ctx.strokeStyle = "orange";
            ctx.beginPath();
            ctx.moveTo(current.position.x, current.position.y);
            ctx.lineTo(value.position.x, value.position.y);
            ctx.stroke();
        }
    }

    ctx.fillStyle = "red";
    for (i = 0; i < graphe_current.length; i++)
    {
        current = graphe_current[i];
        current.position.print();

        for (const value of current.voisins.values())
        {
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo(current.position.x, current.position.y);
            ctx.lineTo(value.position.x, value.position.y);
            ctx.stroke();
        }
    }

    if (PCC != null)
    {
        ctx.strokeStyle = "green";
        for (const point of PCC)
        {
            if (point.previous != null)
            {
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

    let endTime = performance.now();
    console.log("done render: " + (endTime - beginTime) + " ms");
}

function iterations()
{
    if (cptIteration != 0)
    {
        let beginTime = performance.now();
        R = R - (R / 4);
        r = r - (r / 4);

        console.log("R: " + R);
        console.log("r: " + r);

        graphe_current.length = 0;

        debut_p = new Point(5, 5);
        debut = new Sommet(debut_p);
        debut.distance = 0;
        graphe_current.push(debut);

        for (i = 0; i < PCC.length; i++)
        {

            let ref = PCC[i];
            for (j = 0; j < nbPointsIteration; j++)
            {
                let p = generatePoint(true, ref);
                let s = new Sommet(p);
                s.distance = INFINI;
                graphe_current.push(s);
            }
        }

        fin_p = new Point(canvas.width - 5, canvas.height - 5);
        fin = new Sommet(fin_p);
        fin.distance = INFINI;
        graphe_current.push(fin);

        generateArcs();
        let endTime = performance.now();
        console.log("done iterations: " + (endTime - beginTime) + " ms");
    }
}

function applyDijkstra()
{
    console.log("============================================");
    iterations();
    let beginTime = performance.now();
    PCC = [];
    graphe_previous.length = 0;
    let tmp;
    do
    {
        graphe_current.sort(Sommet.compare);
        tmp = graphe_current[0];
        if (tmp != null)
        {
            for ([arc, voisin] of tmp.voisins.entries())
            {
                if (voisin.distance > arc + tmp.distance)
                {
                    voisin.distance = arc + tmp.distance;
                    voisin.previous = tmp;
                }
            }
            graphe_previous.push(tmp);
            graphe_current.shift();
        }
    } while (tmp !== fin);

    tmp = fin;
    while (tmp != null)
    {
        PCC.push(tmp);
        tmp = tmp.previous;
    }
    let endTime = performance.now();
    console.log("done dijkstra: " + (endTime - beginTime) + " ms");
    cptIteration++;
    render();
}