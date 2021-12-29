class Square {
    constructor(id, weight, top, right, bottom, left, isStart, isEnd, isBarrier, isPath){
        this.id = id;
        this.weight = weight;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
        this.isStart = isStart;
        this.isEnd = isEnd;
        this.isBarrier = isBarrier;
        this.isPath = isPath;
    }
}

class Board {
    constructor(size, randomBarriers, randomStart, randomEnd){
        this.size = size;
        this.randomBarriers = randomBarriers;
        this.randomStart = randomStart;
        this.randomEnd = randomEnd;

        var tempBoard = [];

        for(var i = 0; i < size; i++){
            tempBoard[i] = [];
            for(var j = 0; j < size; j++){
                const uuid = Date.now() + ((Math.random() * 1000).toFixed());
                const weight = Math.floor(Math.random() * 30)
                tempBoard[i][j] = new Square(uuid, weight, null, null, null, null, false, false, false, false);
            }
        }
        

        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                console.log(`[${i},${j}] = ${tempBoard[i][j].weight}`);
            }
        }

        //

    }
}


function generateBoard(){
    const opt_size = window.document.getElementById("opt_size");
    const cb_barriers = window.document.getElementById("cb_randomBarriers")
    const cb_randStart = window.document.getElementById("cb_randomStart");
    const cb_randEnd = window.document.getElementById("cb_randomEnd");

    var size = opt_size.options[opt_size.selectedIndex].value

    var board = new Board(size, false, false, false);


}

function sayHi(){
    alert("Hola");
}