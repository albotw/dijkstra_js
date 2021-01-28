class HeapNode {
    constructor(k, v) {
        this.key = k;
        this.value = v;
    }
}

class Heap {
    constructor(capacity) {
        this.size = 0;
        this.capacity = capacity;
        this.tab = new Array(capacity);
    }

    inRange(index) {
        return (index >= 0 && index < this.size && index < this.capacity && this.tab[index] != null);
    }

    swap(index1, index2) {
        if (this.inRange(index1) && this.inRange(index2)) {
            let tmp = this.tab[index1];
            this.tab[index1] = this.tab[index2];
            this.tab[index2] = tmp;
        }
    }

    pere(index) {
        let v = index / 2;
        if (this.inRange(v)) {
            return this.tab[v].key;
        }
        else { return null; }
    }

    //? position: int => si mis à 1, retourne le fils droit si mis à 0, retourne le fils gauche.
    fils(index, position) {
        let v = 2 * index + position;
        if (this.inRange(v)) {
            return this.tab[v].key;
        }
        else { return null; }
    }

    downHeap(index) {
        if (this.inRange(index)) {
            if (this.fils(index, 0) != null && this.fils(index, 0) < this.tab[index].key) {
                this.swap(index, 2 * index);
                this.downHeap(2 * index);
            }
            if (this.fils(index, 1) != null && this.fils(index, 1) < this.tab[index].key) {
                this.swap(index, 2 * index + 1);
                this.downHeap(2 * index) + 1;
            }
        }
    }

    upHeap(index) {
        if (this.inRange(index)) {
            if (this.pere(index) > this.tab[index].key) {
                this.swap(index, index / 2);
                this.upHeap(index / 2);
            }
        }
    }

    add(K, V) {
        let n = new HeapNode(K, V);
        if (this.size < this.capacity) {
            this.tab[this.size] = n;
        }

        this.upHeap(this.size);
        this.size++;
    }

    removeRoot() {
        this.swap(0, this.size - 1);
        this.tab[this.size - 1] = null;
        this.downHeap(0);
        this.size--;
    }

    //? update key from value.
    update(V, K) {
        console.log("update");
        for (i = 0; i < this.size; i++) {
            if (this.tab[i].value == V) {
                this.tab[i].key = K;

                if (this.pere(i) > K) {
                    this.upHeap(i);
                    console.log("up");
                }
                else if ((this.fils(i, 0) != null && this.fils(i, 0) < K) || (this.fils(i, 1) != null && this.fils(i, 1) < K)) {
                    this.downHeap(i);
                    console.log("down");
                }

                i = this.size + 1;
            }
        }
    }
}