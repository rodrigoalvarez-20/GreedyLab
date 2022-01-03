
class Square {
    constructor(id, weight, top, right, bottom, left, isStart, isEnd, isBarrier, isPath) {
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
    constructor(size, randomBarriers, randomStart, randomEnd) {
        this.size = size;
        this.randomBarriers = randomBarriers;
        this.randomStart = randomStart;
        this.randomEnd = randomEnd;

        var tempBoard = [];
        var alreadySetStart = false;
        var alreadySetEnd = false;

        for (var i = 0; i < size; i++) {
            tempBoard[i] = [];
            for (var j = 0; j < size; j++) {
                const uuid = Date.now() + ((Math.random() * 1000).toFixed());
                const weight = Math.floor(Math.random() * 30);
                var isBarr = false;
                var isStart = false;
                var isEnd = false;
                var isPath = true;

                if (randomBarriers) {
                    isBarr = Math.floor(((Math.random() * 1000) % 20)) < 5;
                    if (isBarr) {
                        isPath = false;
                        isStart = false;
                        isEnd = false;
                    }
                }

                if (randomStart && !alreadySetStart) {
                    isStart = Math.floor(((Math.random() * 1000) % 30)) < 3;
                    if (isStart) {
                        alreadySetStart = true;
                        isBarr = false;
                        isPath = false;
                        isEnd = false;
                    }

                }

                if (randomEnd && !alreadySetEnd) {
                    isEnd = Math.floor(((Math.random() * 1000) % 30)) < 3;
                    if (isEnd) {
                        alreadySetEnd = true;
                        isBarr = false;
                        isPath = false;
                        isStart = false;
                    }
                }
                tempBoard[i][j] = new Square(uuid, weight, null, null, null, null, isStart, isEnd, isBarr, isPath);
            }
        }
        this.boardData = tempBoard;
    }
}

class Greedy {
    board = null;
    nodeStart = null;
    nodeEnd = null;
    recorrido = [];
    totalCost = 0;

    generateBoard() {
        const opt_size = document.getElementById("opt_size");
        const cb_barriers = document.getElementById("cb_randomBarriers").checked;
        const cb_randStart = document.getElementById("cb_randomStart").checked;
        const cb_randEnd = document.getElementById("cb_randomEnd").checked;

        var size = opt_size.options[opt_size.selectedIndex].value

        this.board = new Board(size, cb_barriers, cb_randStart, cb_randEnd);

        this.drawBoard();


        var btnSavePrefs = document.getElementById("btnSavePref");
        var btnGenPath = document.getElementById("genPath");
        var lblRec = document.getElementById("lblRecorrido")

        btnSavePrefs.onclick = (e) => {
            //console.log(e);
            var elemRef = this.searchTile(e.target.name);
            var rbIsPath = document.getElementById("rbIsPath");
            var rbIsBarr = document.getElementById("rbIsBarrier");
            var rbIsStart = document.getElementById("rbIsStart");
            var rbIsEnd = document.getElementById("rbIsEnd");
            var txtValue = document.getElementById("txtValue");

            var changeStart = elemRef.isStart;
            var changeEnd = elemRef.isEnd;

            elemRef.isBarrier = rbIsBarr.checked;
            elemRef.isPath = rbIsPath.checked;
            elemRef.isStart = rbIsStart.checked;
            elemRef.isEnd = rbIsEnd.checked;
            elemRef.weight = txtValue.value;

            if (changeStart !== elemRef.isStart) {
                if (this.nodeStart) {
                    this.nodeStart.isStart = false;
                    this.nodeStart.isPath = true;
                }
                this.nodeStart = elemRef.isStart ? elemRef : null;
            }


            if (changeEnd !== elemRef.isEnd) {
                if (this.nodeEnd) {
                    this.nodeEnd.isEnd = false;
                    this.nodeEnd.isPath = true;
                }
                this.nodeEnd = elemRef.isEnd ? elemRef : null;
            }

            //console.log(this.nodeStart);
            //console.log(this.nodeEnd);

            btnGenPath.disabled = !(this.nodeStart && this.nodeEnd);

            this.drawBoard();
        };

        btnGenPath.style.display = "flex";

        btnGenPath.disabled = !(this.nodeStart && this.nodeEnd);

        btnGenPath.onclick = () => {
            this.recorrido = [];
            this.totalCost = 0;
            for (var i = 0; i < this.board.size; i++) {
                for (var j = 0; j < this.board.size; j++) {
                    var actualNode = this.board.boardData[i][j];

                    var topRef = null;
                    var bottomRef = null;
                    var leftRef = null;
                    var rightRef = null;

                    if (i !== 0) leftRef = this.board.boardData[i - 1][j];
                    if (i !== this.board.size - 1) rightRef = this.board.boardData[i + 1][j];
                    if (j !== 0) topRef = this.board.boardData[i][j - 1];
                    if (j !== this.board.size - 1) bottomRef = this.board.boardData[i][j + 1];

                    actualNode.top = topRef;
                    actualNode.bottom = bottomRef;
                    actualNode.left = leftRef;
                    actualNode.right = rightRef;
                }
            }

            var actNode = this.nodeStart;
            while (true) {

                if (!this.recorrido.find((n) => n === actNode)) {
                    this.recorrido.push(actNode);
                    this.totalCost += actNode.weight;
                }

                if (actNode === this.nodeEnd)
                    break;

                var topNode = actNode.top;
                var bottomNode = actNode.bottom;
                var leftNode = actNode.left;
                var rightNode = actNode.right;

                if (this.recorrido.find(n => n === topNode))
                    topNode = null;
                if (this.recorrido.find(n => n === bottomNode))
                    bottomNode = null;
                if (this.recorrido.find(n => n === leftNode))
                    leftNode = null;
                if (this.recorrido.find(n => n === rightNode))
                    rightNode = null;

                var validNodes = [];

                if (topNode && !topNode.isBarrier) validNodes.push(topNode);
                if (bottomNode && !bottomNode.isBarrier) validNodes.push(bottomNode);
                if (leftNode && !leftNode.isBarrier) validNodes.push(leftNode);
                if (rightNode && !rightNode.isBarrier) validNodes.push(rightNode);

                if (validNodes.length === 0) {
                    Toastify({
                        text: "No existe un camino posible",
                        duration: 5000,
                        close: true,
                        gravity: "top",
                        position: "right",
                        style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)",
                        },
                        onClick: function () { }
                    }).showToast();
                    break;
                }

                if (topNode === this.nodeEnd)
                    actNode = topNode;
                else if (bottomNode === this.nodeEnd)
                    actNode = bottomNode;
                else if (leftNode === this.nodeEnd)
                    actNode = leftNode;
                else if (rightNode === this.nodeEnd)
                    actNode = rightNode;
                else {
                    validNodes = validNodes.sort((a, b) => a.weight > b.weight);
                    actNode = validNodes[0];
                }
            }

            var weights = []

            var treeData = [];

            for (var i = 0; i < this.recorrido.length; i++) {
                let actNode = this.recorrido[i];
                //console.log(actNode);
                if (!treeData.find(n => n.id == actNode.id))
                    treeData.push({
                        id: actNode.id,
                        parent: i === 0 ? '' : this.recorrido[i - 1].id,
                        name: actNode.weight.toString(),
                        value: 4100000000
                    });

                if (actNode !== this.nodeEnd) {
                    if (actNode.top)
                        if (!treeData.find(n => n.id == actNode.top.id))
                            treeData.push({
                                id: actNode.top.id,
                                parent: actNode.id,
                                name: actNode.top.weight.toString(),
                                value: 4100000000
                            });
                    if (actNode.bottom)
                        if (!treeData.find(n => n.id == actNode.bottom.id))
                            treeData.push({
                                id: actNode.bottom.id,
                                parent: actNode.id,
                                name: actNode.bottom.weight.toString(),
                                value: 4100000000
                            });
                    if (actNode.left)
                        if (!treeData.find(n => n.id == actNode.left.id))
                            treeData.push({
                                id: actNode.left.id,
                                parent: actNode.id,
                                name: actNode.left.weight.toString(),
                                value: 4100000000
                            });
                    if (actNode.right)
                        if (!treeData.find(n => n.id == actNode.right.id))
                            treeData.push({
                                id: actNode.right.id,
                                parent: actNode.id,
                                name: actNode.right.weight.toString(),
                                value: 4100000000
                            });
                }


            }

            //console.log(treeData);

            this.recorrido.forEach(nd => {
                weights.push(nd.weight);
                if (nd.id !== this.nodeStart.id && nd.id !== this.nodeEnd.id) {
                    var htmlNode = document.getElementById(nd.id);
                    htmlNode.style.backgroundColor = "#ffd166";
                }
            });

            lblRec.style.display = "flex";

            lblRec.innerHTML = `Recorrido: ${weights.join(", ")}`;

            let treeConfig = {
                type: 'tree',
                options: {
                    link: {
                        aspect: 'arc'
                    },
                    maxSize: 15,
                    minSize: 5,
                    node: {
                        type: 'circle',
                    }
                },
                series: treeData
            };

            document.getElementById("treeViewer").style.display = "block";

            zingchart.render({
                id: 'treeData',
                output: 'canvas',
                data: treeConfig,
            })

        };

    }

    drawBoard() {

        var tblBoard = document.getElementById("tblBoard");
        tblBoard.innerHTML = "";

        var bWidth = tblBoard.offsetWidth;
        //console.log(bWidth);

        for (var i = 0; i < this.board.size; i++) {
            var dvRow = document.createElement("div");
            for (var j = 0; j < this.board.size; j++) {
                const actElem = this.board.boardData[i][j];
                var sqElem = document.createElement("div");
                var sqSize = Math.floor((bWidth / this.board.size));
                sqElem.style.width = `${sqSize}px`;
                sqElem.style.height = `${sqSize}px`;
                sqElem.style.border = "1px solid black"
                sqElem.style.textAlign = "center";
                sqElem.innerText = actElem.weight;
                sqElem.style.backgroundColor = "#FFFFFF";
                sqElem.id = actElem.id;

                sqElem.style.cursor = "pointer";

                sqElem.setAttribute("data-bs-toggle", "offcanvas");
                sqElem.setAttribute("data-bs-target", "#ocSqPrefs");

                //console.log(sqBtn);
                if (actElem.isBarrier) {
                    sqElem.style.backgroundColor = "#073b4c";
                }
                if (actElem.isStart) {
                    this.nodeStart = actElem;
                    sqElem.style.backgroundColor = "#06d6a0";
                }
                if (actElem.isEnd) {
                    this.nodeEnd = actElem;
                    sqElem.style.backgroundColor = "#118ab2";
                }

                sqElem.onclick = (e) => {
                    var elemRef = this.searchTile(e.target.id);
                    var rbIsPath = document.getElementById("rbIsPath");
                    var rbIsBarr = document.getElementById("rbIsBarrier");
                    var rbIsStart = document.getElementById("rbIsStart");
                    var rbIsEnd = document.getElementById("rbIsEnd");
                    var txtValue = document.getElementById("txtValue");

                    rbIsPath.checked = elemRef.isPath;
                    rbIsBarr.checked = elemRef.isBarrier;
                    rbIsStart.checked = elemRef.isStart;
                    rbIsEnd.checked = elemRef.isEnd;
                    txtValue.value = elemRef.weight;
                    var btnSavePrefs = document.getElementById("btnSavePref");
                    btnSavePrefs.name = e.target.id;
                }

                dvRow.appendChild(sqElem);
            }
            tblBoard.appendChild(dvRow);
        }
    }


    searchTile(id) {
        for (var i = 0; i < this.board.size; i++) {
            for (var j = 0; j < this.board.size; j++) {
                var actualElem = this.board.boardData[i][j];
                if (actualElem.id === id)
                    return actualElem;
            }
        }
        return null;
    }

}

function sayHi() {
    alert("Hola");
}