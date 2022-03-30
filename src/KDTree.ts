export interface Node {
    coords: number[];
    left: Node;
    right: Node;
}

export function createNode(x : number, y : number) : Node {
    return {coords: [x, y], left: undefined, right: undefined};
}

export class KDTree{
    public root: Node;

    public constructor() {
        this.root = undefined;
    }

    public insert(insert: Node) {
        this._insert(this.root, insert, 0);
    }

    private _insert(current : Node, insert : Node, level: number) {
        if (this.root == undefined) {
            this.root = insert;
        }
        else {
            let axis = level % 2;
            if (current.coords[axis] > insert.coords[axis]) {
                if (current.left == undefined) current.left = insert;
                else this._insert(current.left, insert, ++level);
            }
            else{
                if (current.right == undefined) current.right = insert;
                else this._insert(current.right, insert, ++level);
            }
        }
    }

    public nearestNeighbour(target: Node) {
        return this._nearestNeighbour(this.root, target, 0);
    }

    private _nearestNeighbour(current: Node, target: Node, level: number) : Node {
        let axis = level % 2;
        let next, other, best, tmp : Node;
        if (current == undefined) return undefined;

        if (current.coords[axis] >  target.coords[axis]){
            next = current.right;
            other = current.left;
        }
        else {
            next = current.left;
            other = current.right;
        }

        tmp = this._nearestNeighbour(next, target, ++level);
        best = this.closest(target, current, tmp);

        let rPrime = Math.pow((target.coords[axis] - current.coords[axis]), 2);
        let r = this.distance(target, best);

        if (r >= rPrime) {
            tmp = this._nearestNeighbour(other, target, ++level);
            best = this.closest(target, tmp, best);
        }

        return best;
    }


    public distance (a: Node, b: Node) : number {
        return Math.pow((b.coords[0] - a.coords[0]), 2) + Math.pow((b.coords[1] - a.coords[1]), 2);
    }

    public closest(target : Node, a: Node, b: Node)  : Node {
        if (b == undefined) return a;
        else if (a == undefined) return b;

        let distTargetToA = this.distance(target, a);
        let distTargetToB = this.distance(target, b);

        //le != 0 permet de cibler des points de l'arbre comme cible.
        if (distTargetToA <= distTargetToB && distTargetToA != 0.0) return a;
        else if (distTargetToA > distTargetToB && distTargetToB != 0.0) return b;
    }
}