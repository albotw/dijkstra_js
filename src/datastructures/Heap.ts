import Point from "./Point";

export interface HeapNode {
    key : number;
    value: Point;
}

export class Heap {
    public size: number;
    public capacity: number;
    public heap: HeapNode[];

    public constructor (capacity: number) {
        this.size = 0;
        this.capacity = capacity;
        this.heap = new Array(capacity);
    }

    private _inRange(index: number) {
        return (index >= 0
                && index < this.size
                && index < this.capacity
                && this.heap[index] != undefined);
    }

    private _swap(index1: number, index2: number) {
        if (this._inRange(index1) && this._inRange(index2)) {
            let tmp = this.heap[index1];
            this.heap[index1] = this.heap[index2];
            this.tab[index2] = tmp;
        }
    }

    public parent (index: number) {
        let v = index / 2;
        if (this._inRange(v)) return this.tab[v].key;
        else return undefined;
    }

    public fils(index: number, position: number) {
        let v = 2 * index + position;
        if (this._inRange(v)) return this.tab[v].key;
        else return null;
    }

    private _downHeap(index) {
        if (this._inRange(index)) {
            if (this.fils(index, 0) != null && this.fils(index, 0) < this.tab[index].key) {
                this._swap(index, 2 * index);
                this._downHeap(2 * index);
            }
            if (this.fils(index, 1) != null && this.fils(index, 1) < this.tab[index].key) {
                this._swap(index, 2 * index + 1);
                this._downHeap(2 * index + 1);
            }
        }
    }

    private _upHeap(index) {
        if (this._inRange(index)) {
            if (this.pere(index) > this.tab[index].key) {
                this.swap(index, index / 2);
                this._upHeap(index / 2);
            }
        }
    }
}