
/**
 * Clase que representa cada "cuadrito" del tablero
 * @param id: El id que tiene cada uno, sirve para hacer el "findElementById"
 * @param weight: Peso que tiene para moverse a dicho elemento
 * @param top: Elemento que se puede tener encima
 * @param right: Elemento que puede estar a nuestro lado derecho
 * @param bottom: Elemento que puede estar debajo de nosotros 
 * @param left: Elemento que puede estar a la izquierda
 * @param isStart: Determina si el elemento ha sido marcado como punto de inicio @default false
 * @param isEnd: Determina si el elemento ha sido marcado como punto final o meta @default false
 * @param isBarrier: Determina si el elemento es una barrera @default false
 * @param isPath: Determina si el elemento es "camino" @default true
 * @summary Los elementos antes dichos no son los hijos, son simplemente los elementos colindantes en el tablero
 */

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

/**
 * Clase que contiene todos los datos y propiedades para mostrar el tablero
 * @param size: El tamaño del tablero (8x8, 10x10, 12x12)
 * @param randomBarriers: Especifica si es necesario generar las barreras de manera aleatoria
 * @param randomStart: Especifica si es necesario definir un punto de inicio alatorio
 * @param randomEnd: Especifica si es necesario definir la meta de manera aleatoria
 */

class Board {
    constructor(size, randomBarriers, randomStart, randomEnd) {
        this.size = size;
        this.randomBarriers = randomBarriers;
        this.randomStart = randomStart;
        this.randomEnd = randomEnd;

        var tempBoard = []; // Arreglo bidimensional que contiene la informacion de los nodos
        var alreadySetStart = false; //Nodo de inicio
        var alreadySetEnd = false; //Nodo meta

        // Se tiene que inicializar los valores de los nodos

        for (var i = 0; i < size; i++) {
            tempBoard[i] = [];
            for (var j = 0; j < size; j++) {
                const uuid = Date.now() + ((Math.random() * 1000).toFixed()); //Genero un ID pseudo-unico
                const weight = Math.floor(Math.random() * 30); // Genero un peso entre 0 y 30
                var isBarr = false; // Valores por default del nodo
                var isStart = false;
                var isEnd = false;
                var isPath = true;
                //Si esta activado el generar las barreras de manera aleatoria, vamos a generar un booleano aleatorio
                if (randomBarriers) {
                    isBarr = Math.floor(((Math.random() * 1000) % 20)) < 5;
                    if (isBarr) {
                        isPath = false;
                        isStart = false;
                        isEnd = false;
                    }
                }
                //Tambien en el caso del nodo de inicio
                if (randomStart && !alreadySetStart) {
                    isStart = Math.floor(((Math.random() * 1000) % 30)) < 3;
                    if (isStart) {
                        alreadySetStart = true;
                        isBarr = false;
                        isPath = false;
                        isEnd = false;
                    }

                }
                //Igual en el caso del nodo meta
                if (randomEnd && !alreadySetEnd) {
                    isEnd = Math.floor(((Math.random() * 1000) % 30)) < 3;
                    if (isEnd) {
                        alreadySetEnd = true;
                        isBarr = false;
                        isPath = false;
                        isStart = false;
                    }
                }
                tempBoard[i][j] = new Square(uuid, weight, null, null, null, null, isStart, isEnd, isBarr, isPath); //Añado al arreglo el nuevo nodo generado
            }
        }
        this.boardData = tempBoard; //Guardo el tablero temporal
    }
}

/**
 * Clase que contiene la logica para el recorrido, validacion de datos y generacion de arbol
 * @property board: El tablero previamente generado
 * @property nodeStart: Referencia del nodo de inicio
 * @property nodeEnd: Referencia del nodo meta
 * @property recorrido: Arreglo que contiene los nodos que se han recorrido hasta el momento para encontrar la solucion
 * @property totalCost: Costo total (peso) de ir desde el inicio al nodo meta (No utilizado)
 */

class Greedy {
    board = null;
    nodeStart = null;
    nodeEnd = null;
    recorrido = [];
    totalCost = 0;

    /**
     * Funcion que permite generar el tablero en el DIV de html
     * Obtiene los datos desde el Selector de tamaño, el checkbox de barreras, inicio y meta
     */
    generateBoard() {
        const opt_size = document.getElementById("opt_size");
        const cb_barriers = document.getElementById("cb_randomBarriers").checked;
        const cb_randStart = document.getElementById("cb_randomStart").checked;
        const cb_randEnd = document.getElementById("cb_randomEnd").checked;

        var size = opt_size.options[opt_size.selectedIndex].value

        this.board = new Board(size, cb_barriers, cb_randStart, cb_randEnd); // Creo el nuevo tablero con los valores obtenidos

        this.drawBoard(); //Dibujo el tablero en el DIV

        var btnSavePrefs = document.getElementById("btnSavePref"); //Boton para guardar los cambios a cada nodo (Edicion de parametros)
        var btnGenPath = document.getElementById("genPath"); //Boton para resolver el camino
        var lblRec = document.getElementById("lblRecorrido") //Etiqueta para mostrar el recorrido

        /**
         * Asignamos un onclickListener al boton de guardar preferencias
         * Al momento de guardar obtengo los datos del panel, actualizo los datos del nodo y redibujo el tablero con los nuevos valores
         */
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

            //Si se ha cambiado el nodo de inicio, se hace la reasignacion
            if (changeStart !== elemRef.isStart) {
                if (this.nodeStart) {
                    this.nodeStart.isStart = false;
                    this.nodeStart.isPath = true;
                }
                this.nodeStart = elemRef.isStart ? elemRef : null;
            }

            //Igualmente con el nodo meta
            if (changeEnd !== elemRef.isEnd) {
                if (this.nodeEnd) {
                    this.nodeEnd.isEnd = false;
                    this.nodeEnd.isPath = true;
                }
                this.nodeEnd = elemRef.isEnd ? elemRef : null;
            }

            //console.log(this.nodeStart);
            //console.log(this.nodeEnd);

            btnGenPath.disabled = !(this.nodeStart && this.nodeEnd); //No podemos generar el camino si no tenemos un inicio y un fin, asi que desabilitamos el boton

            this.drawBoard();
        };

        btnGenPath.style.display = "flex";

        btnGenPath.disabled = !(this.nodeStart && this.nodeEnd);

        //Listener para el boton de generar camino
        btnGenPath.onclick = () => {
            this.recorrido = []; //Limpiamos el arreglo previo del camino
            this.totalCost = 0;
            //Iteramos sobre todo el arreglo del tablero para obtener las referencias de los nodos
            for (var i = 0; i < this.board.size; i++) {
                for (var j = 0; j < this.board.size; j++) {

                    var actualNode = this.board.boardData[i][j]; //Nodo actual

                    //Inicializamos las referencias de los nodos colindantes
                    var topRef = null;
                    var bottomRef = null;
                    var leftRef = null;
                    var rightRef = null;

                    if (i !== 0) leftRef = this.board.boardData[i - 1][j]; //Obtenemos la referencia del nodo izquierdo, si es que tenemos
                    if (i !== this.board.size - 1) rightRef = this.board.boardData[i + 1][j]; //Obtenemos la referencia del nodo derecho
                    if (j !== 0) topRef = this.board.boardData[i][j - 1]; // Obtenemos la referencia del nodo superior
                    if (j !== this.board.size - 1) bottomRef = this.board.boardData[i][j + 1]; //Obtenemos la referencia del nodo inferior

                    actualNode.top = topRef;
                    actualNode.bottom = bottomRef;
                    actualNode.left = leftRef;
                    actualNode.right = rightRef;
                }
            }

            var actNode = this.nodeStart; //Empezamos en el nodo de inicio
            //Comenzamos con el algoritmo Avaro
            while (true) {
                //Evaluamos si ya hemos agregado el nodo actual al arreglo del recorrido
                if (!this.recorrido.find((n) => n === actNode)) {
                    //Si aun no lo hemos agregado, lo hacemos y sumamos su peso
                    this.recorrido.push(actNode);
                    this.totalCost += actNode.weight;
                }

                if (actNode === this.nodeEnd) //Si hemos llegado al nodo final
                    break;

                //Obtenemos las referencias de los nodos colindantes
                var topNode = actNode.top;
                var bottomNode = actNode.bottom;
                var leftNode = actNode.left;
                var rightNode = actNode.right;

                //Buscamos en el arreglo del recorrido los nodos colindantes
                //Esto con la finalidad de no duplicar el elemento "de donde venimos", o bien, el nodo anterior en el que estabamos posicionados
                if (this.recorrido.find(n => n === topNode))
                    topNode = null;
                if (this.recorrido.find(n => n === bottomNode))
                    bottomNode = null;
                if (this.recorrido.find(n => n === leftNode))
                    leftNode = null;
                if (this.recorrido.find(n => n === rightNode))
                    rightNode = null;

                var validNodes = []; //Arreglo de nodos validos (No nulos y no barreras)

                //Aqui es donde validamos que no sean nulos y que no sean barreras
                if (topNode && !topNode.isBarrier) validNodes.push(topNode);
                if (bottomNode && !bottomNode.isBarrier) validNodes.push(bottomNode);
                if (leftNode && !leftNode.isBarrier) validNodes.push(leftNode);
                if (rightNode && !rightNode.isBarrier) validNodes.push(rightNode);

                //Si ya no tenemos nodos validos, quiere decir que hemos llegado a un callejon de barreras o bien, ya no tenemos nodos disponibles a los cuales movernos
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

                //Evaluamos si tenemos el nodo destino en los nodos colindantes
                if (topNode === this.nodeEnd)
                    actNode = topNode;
                else if (bottomNode === this.nodeEnd)
                    actNode = bottomNode;
                else if (leftNode === this.nodeEnd)
                    actNode = leftNode;
                else if (rightNode === this.nodeEnd)
                    actNode = rightNode;
                else {
                    //En el caso de que no, ordenamos de menor a mayor los nodos (por pesos) y obtenemos el mas pequeño
                    validNodes = validNodes.sort((a, b) => a.weight > b.weight);
                    actNode = validNodes[0];
                }
            }

            var weights = []

            var treeData = []; //Arreglo para los datos mostrados en el arbol de recorrido

            //Por cada uno de los elementos en el recorrido
            for (var i = 0; i < this.recorrido.length; i++) {
                let actNode = this.recorrido[i];
                //console.log(actNode);
                if (!treeData.find(n => n.id == actNode.id)) //Busco si ya existe el nodo en el arreglo de datos del arbol
                    //Si no existe, lo añado
                    treeData.push({
                        id: actNode.id,
                        parent: i === 0 ? '' : this.recorrido[i - 1].id, //Si es el primer elemento, es el nodo padre, si no, entonces voy obteniendo el id del nodo (i-1)
                        name: actNode.weight.toString(), //Convierto el peso a string, ya que si hay un valor 0, lo muestra como "Node {numero_nodo}"
                        value: 4100000000 //Valor aleatorio solo para poder mostrar un icono
                    });

                //Mientras no sea el nodo final
                if (actNode !== this.nodeEnd) {
                    //Voy a obtener todos los nodos colindantes, ya que al momento de realizar el recorrido, los evalue para ver quien era la mejor opcion
                    if (actNode.top)
                        if (!treeData.find(n => n.id == actNode.top.id))
                            treeData.push({
                                id: actNode.top.id,
                                parent: actNode.id, //El parent  va a ser el nodo actual
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

            //Aqui, lo que hago es ir pintando de diferente color los nodos que voy recorriendo (excepto el inicio y fin)
            this.recorrido.forEach(nd => {
                weights.push(nd.weight);
                if (nd.id !== this.nodeStart.id && nd.id !== this.nodeEnd.id) {
                    var htmlNode = document.getElementById(nd.id);
                    htmlNode.style.backgroundColor = "#ffd166";
                }
            });

            lblRec.style.display = "flex";

            lblRec.innerHTML = `Recorrido: ${weights.join(", ")}`; //Muestro los valores del recorrido (los pesos de cada nodo que fui recorriendo)

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

            //Muestro el arbol de nodos
            zingchart.render({
                id: 'treeData',
                output: 'canvas',
                data: treeConfig,
            })

        };

    }

    /**
     * Funcion para dibujar el tablero del laberinto en el DIV
     */
    drawBoard() {

        var tblBoard = document.getElementById("tblBoard");
        tblBoard.innerHTML = ""; //Limpio los valores previos del html, para que no haya errores o se amontonen los datos

        var bWidth = tblBoard.offsetWidth; //Obtengo el width del contenedor, para poder determinar un tamaño decente para cada cuadrito
        //console.log(bWidth);

        for (var i = 0; i < this.board.size; i++) {
            var dvRow = document.createElement("div"); //Creo el elemento DIV a inyectar (cols)
            for (var j = 0; j < this.board.size; j++) { 
                const actElem = this.board.boardData[i][j];
                var sqElem = document.createElement("div"); //Creo el elemento DIV a inyectar (rows)
                var sqSize = Math.floor((bWidth / this.board.size)); //Aqui determino el tamaño de cada cuadrito
                sqElem.style.width = `${sqSize}px`; //Asigno el width
                sqElem.style.height = `${sqSize}px`; //Height
                sqElem.style.border = "1px solid black" //Color del borde
                sqElem.style.textAlign = "center"; //Alineacion del texto (peso)
                sqElem.innerText = actElem.weight; //Muestro el valor del peso
                sqElem.style.backgroundColor = "#FFFFFF"; //Color de fondo (blanco por default)
                sqElem.id = actElem.id; //Asigno el id del nodo al id de la TAG (para operar con el mas adelante)

                sqElem.style.cursor = "pointer"; //El cursos va a ser de tipo "pointer"

                sqElem.setAttribute("data-bs-toggle", "offcanvas"); //Para abrir y cerrar el panel de preferencias
                sqElem.setAttribute("data-bs-target", "#ocSqPrefs");

                //console.log(sqBtn);
                if (actElem.isBarrier) {
                    sqElem.style.backgroundColor = "#073b4c"; //Si es una barrera, el fondo es azul marino
                }
                if (actElem.isStart) {
                    this.nodeStart = actElem;
                    sqElem.style.backgroundColor = "#06d6a0"; //Si es el nodo inicio, es de color verde
                }
                if (actElem.isEnd) {
                    this.nodeEnd = actElem;
                    sqElem.style.backgroundColor = "#118ab2"; //Si es el nodo final, es de color azul cielo
                }

                //Cuando se efectue un click en algun elemento del tablero, las propiedades se mandan al panel lateral y podra editar estas
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

    /**
     * Funcion auxiliar que permite buscar un nodo en nuestro tablero
     * @param id: ID del nodo a buscar
     * @returns Nodo con el ID solicitado. Null si es que no se encuentra en el arreglo
     */
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