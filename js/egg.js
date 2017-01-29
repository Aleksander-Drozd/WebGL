// zmienne globalne
var gl_canvas;
var gl_ctx;

var _triangleVertexBuffer;
var _triangleFacesBuffer;
var _position;
var _color;
var _PosMatrix;
var _MovMatrix;
var _ViewMatrix;
var _matrixProjection;
var _matrixMovement;
var _matrixView;

var rotationSpeed = 0.001;
var zoomRatio = -6;
var triangleVertices = [];
var triangleFaces = [];
var X, Y, Z;

const N = 40;
var tab;
var paramTab;
var vectors;
var colors;
// var status = 1;
// var azymut, elewacja;
//
// var viewer = [ 0.0, 0.0, 10.0 ];
//
var R = 10;

var pix2anglex;
var pix2angley;

var x_pos_old = 0;
var y_pos_old = 0;

var delta_x = 0;
var delta_y = 0;

// funkcja główna
function runWebGL () {
    getRotation();
    gl_canvas = document.getElementById("canvas");
    gl_ctx = gl_getContext(gl_canvas);
    gl_initShaders();
    gl_initBuffers();
    gl_setMatrix();
    gl_draw();
}

// osie obrotu
function getRotation() {
    X = document.getElementById('rotateX').checked;
    Y = document.getElementById('rotateY').checked;
    Z = document.getElementById('rotateZ').checked;
}

// pobranie kontekstu WebGL
function gl_getContext (canvas) {
    try {
        var ctx = canvas.getContext("webgl");
        ctx.viewportWidth = canvas.width;
        ctx.viewportHeight = canvas.height;
    } catch (e) {}

    if (!ctx) {
        document.write('Unable to initialize WebGL context.')
    }
    return ctx;
}

// shadery
function gl_initShaders () {
    var vertexShader = "\n\
    attribute vec3 position;\n\
      uniform mat4 PosMatrix;\n\
      uniform mat4 MovMatrix;\n\
      uniform mat4 ViewMatrix; \n\
      attribute vec3 color;\n\
      varying vec3 vColor;\n\
      void main(void) {\n\
         gl_Position = PosMatrix * ViewMatrix * MovMatrix * vec4(position, 1.);\n\
         vColor = color;\n\
    }";

    var fragmentShader = "\n\
    precision mediump float;\n\
      varying vec3 vColor;\n\
      void main(void) {\n\
         gl_FragColor = vec4(vColor, 1.);\n\
    }";

    var getShader = function(source, type, typeString) {
        var shader = gl_ctx.createShader(type);
        gl_ctx.shaderSource(shader, source);
        gl_ctx.compileShader(shader);

        if (!gl_ctx.getShaderParameter(shader, gl_ctx.COMPILE_STATUS)) {
            alert('error in' + typeString);
            return false;
        }

        return shader;
    };

    var shader_vertex = getShader(vertexShader, gl_ctx.VERTEX_SHADER, "VERTEX");
    var shader_fragment = getShader(fragmentShader, gl_ctx.FRAGMENT_SHADER, "FRAGMENT");

    var shaderProgram = gl_ctx.createProgram();
    gl_ctx.attachShader(shaderProgram, shader_vertex);
    gl_ctx.attachShader(shaderProgram, shader_fragment);
    gl_ctx.linkProgram(shaderProgram);

    _PosMatrix = gl_ctx.getUniformLocation(shaderProgram, "PosMatrix");
    _MovMatrix = gl_ctx.getUniformLocation(shaderProgram, "MovMatrix");
    _ViewMatrix = gl_ctx.getUniformLocation(shaderProgram, "ViewMatrix");

    _position = gl_ctx.getAttribLocation(shaderProgram, "position");
    _color = gl_ctx.getAttribLocation(shaderProgram, "color");
    gl_ctx.enableVertexAttribArray(_position);
    gl_ctx.enableVertexAttribArray(_color);
    gl_ctx.useProgram(shaderProgram);
}

// bufory

function gl_initBuffers () {
    // var triangleVertices = [
    //     -1, -1, -1, 0, 0, 0,
    //     1, -1, -1,  1, 0, 0,
    //     1, 1, -1,   1, 1, 0,
    //     -1, 1, -1,  0, 1, 0,
    //     -1, -1, 1,  0, 0, 1,
    //     1, -1, 1,   1, 0, 1,
    //     1, 1, 1,    1, 1, 1,
    //     -1, 1, 1,   0, 1, 1
    // ];
    prepareArrays();
    setNet();
    computeCoordinates();
    egg();

    for (let i=0; i<triangleVertices.length / 6; i+=3){
        triangleFaces = triangleFaces.concat([i, i+1, i+2]);
    }

    // console.log('Triangle Verices');
    // console.dir(triangleVertices);
    // console.log('Triangle Faces');
    // console.dir(triangleFaces);
    // console.log('param Tab');
    // console.dir(paramTab);
    // console.log('tab');
    // console.dir(tab);

    _triangleVertexBuffer = gl_ctx.createBuffer();
    gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, _triangleVertexBuffer);
    gl_ctx.bufferData(gl_ctx.ARRAY_BUFFER,
        new Float32Array(triangleVertices),
        gl_ctx.STATIC_DRAW);

    // var triangleFaces = [
    //     0, 1, 2,
    //     0, 2, 3,
    //     4, 5, 6,
    //     4, 6, 7,
    //     0, 3, 7,
    //     0, 4, 7,
    //     1, 2, 6,
    //     1, 5, 6,
    //     2, 3, 6,
    //     3, 7, 6,
    //     0, 1, 5,
    //     0, 4, 5
    // ];

    _triangleFacesBuffer = gl_ctx.createBuffer();
    gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, _triangleFacesBuffer);
    gl_ctx.bufferData(gl_ctx.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(triangleFaces),
        gl_ctx.STATIC_DRAW);
}

function prepareArrays() {
    tab = new Array(N+1);
    paramTab = new Array(N+1);
    vectors = new Array(N+1);
    colors = new Array(N+1);

    for (let i=0; i<N+1; i++){
        tab[i] = new Array(N+1);
        paramTab[i] = new Array(N+1);
        vectors[i] = new Array(N+1);
        colors[i] = new Array(N+1);

        for (let j=0; j<N+1; j++){
            tab[i][j] = new Array(3);
            vectors[i][j] = new Array(3);
            colors[i][j] = new Array(3);
            paramTab[i][j] = new Array(2);
        }
    }
}

function setNet() {
    for (let x = 0; x < N + 1; x++){
        for (let y = 0; y < N + 1; y++){
            paramTab[x][y][0] = (1 / N)*x;
            paramTab[x][y][1] = (1 / N)*y;
        }
    }
}

function computeCoordinates() {
    let ii, jj;
    let xu, xv, yu, yv, zu, zv;

    for (let i = 0; i < N + 1; i++){
        for (let j = 0; j < N + 1; j++){
            ii = i / N;
            jj = j / N;

            tab[i][j][0] = (-90 * Math.pow(paramTab[i][j][0], 5) + 225 * Math.pow(paramTab[i][j][0], 4) - 270 * Math.pow(paramTab[i][j][0], 3) + 180 * Math.pow(paramTab[i][j][0], 2) - 45 * paramTab[i][j][0]) * Math.cos(Math.PI*paramTab[i][j][1]);
            tab[i][j][1] = 160 * Math.pow(paramTab[i][j][0], 4) - 320 * Math.pow(paramTab[i][j][0], 3) + 160 * Math.pow(paramTab[i][j][0], 2) - 5;
            tab[i][j][2] = (-90 * Math.pow(paramTab[i][j][0], 5) + 225 * Math.pow(paramTab[i][j][0], 4) - 270 * Math.pow(paramTab[i][j][0], 3) + 180 * Math.pow(paramTab[i][j][0], 2) - 45 * paramTab[i][j][0]) * Math.sin(Math.PI*paramTab[i][j][1]);

            tab[i][j][0] = tab[i][j][0] / 2;
            tab[i][j][1] = tab[i][j][1] / 2;
            tab[i][j][2] = tab[i][j][2] / 2;

            colors[i][j][0] = Math.random();
            colors[i][j][1] = Math.random();
            colors[i][j][2] = Math.random();

            // xu = (-450 * Math.pow(ii, 4) + 900 * Math.pow(ii, 3) - 810 * Math.pow(ii, 2) + 360 * ii - 45)*Math.cos(Math.PI*jj);
            // xv = Math.PI * (90 * Math.pow(ii, 5) - 225 * Math.pow(ii, 4) + 270 * Math.pow(ii, 3) - 180 * Math.pow(ii, 2) + 45 * ii)*Math.sin(Math.PI*jj);
            // yu = 640 * Math.pow(ii, 3) - 960 * Math.pow(ii, 2) + 320 * ii;
            // yv = 0;
            // zu = (-450 * Math.pow(ii, 4) + 900 * Math.pow(ii, 3) - 810 * Math.pow(ii, 2) + 360 * ii - 45) * Math.sin(Math.PI*jj);
            // zv = -1 * Math.PI * (90 * Math.pow(ii, 5) - 225 * Math.pow(ii, 4) + 270 * Math.pow(ii, 3) - 180 * Math.pow(ii, 2) + 45 * ii) * Math.cos(Math.PI*jj);
            //
            // vectors[i][j][0] = ((yu*zv) - (zu*yv));
            // vectors[i][j][1] = ((zu*xv) - (xu*zv));
            // vectors[i][j][2] = ((xu*yv) - (yu*xv));
            //
            // let dl = (Math.sqrt(Math.pow(vectors[i][j][0], 2) + Math.pow(vectors[i][j][1], 2) + Math.pow(vectors[i][j][2], 2)));
            //
            // vectors[i][j][0] /= dl;
            // vectors[i][j][1] /= dl;
            // vectors[i][j][2] /= dl;
        }
    }
}

function egg() {
    for (let i = 0; i < N; i++){
        for (let j = 0; j < N; j++){
            // glVertex3fv(tab[i][j]);
            triangleVertices = triangleVertices.concat(
                tab[i][j][0], tab[i][j][1], tab[i][j][2],
                colors[i][j][0], colors[i][j][1], colors[i][j][2]);

            // glVertex3fv(tab[i + 1][j]);
            triangleVertices = triangleVertices.concat(
                tab[i + 1][j][0], tab[i + 1][j][1], tab[i + 1][j][2],
                colors[i + 1][j][0], colors[i + 1][j][1], colors[i + 1][j][2]);

            // glVertex3fv(tab[i][j + 1]);
            triangleVertices = triangleVertices.concat(
                tab[i][j + 1][0], tab[i][j + 1][1], tab[i][j + 1][2],
                colors[i][j + 1][0], colors[i][j + 1][1], colors[i][j + 1][2]);


            // glVertex3fv(tab[i][j + 1]);
            triangleVertices = triangleVertices.concat(
                tab[i][j + 1][0], tab[i][j + 1][1], tab[i][j + 1][2],
                colors[i][j + 1][0], colors[i][j + 1][1], colors[i][j + 1][2]);

            // glVertex3fv(tab[i + 1][j]);
            triangleVertices = triangleVertices.concat(
                tab[i + 1][j][0], tab[i + 1][j][1], tab[i + 1][j][2],
                colors[i + 1][j][0], colors[i + 1][j][1], colors[i + 1][j][2]);

            // glVertex3fv(tab[i + 1][j + 1]);
            triangleVertices = triangleVertices.concat(
                tab[i + 1][j + 1][0], tab[i + 1][j + 1][1], tab[i + 1][j + 1][2],
                colors[i + 1][j + 1][0], colors[i + 1][j + 1][1], colors[i + 1][j + 1][2]);
        }
    }
}

// Macierz
function gl_setMatrix () {
    _matrixProjection = MATRIX.getProjection(40,
        gl_canvas.width/gl_canvas.height, 1, 100);
    _matrixMovement = MATRIX.getIdentityMatrix();
    _matrixView = MATRIX.getIdentityMatrix();
    MATRIX.translateZ(_matrixView, zoomRatio);
}

// rysowanie
function gl_draw() {
    gl_ctx.clearColor(0.0, 0.0, 0.0, 0.0);
    gl_ctx.enable(gl_ctx.DEPTH_TEST);
    gl_ctx.depthFunc(gl_ctx.LEQUAL);
    gl_ctx.clearDepth(1.0);
    var timeOld = 0;
    var animate = function (time) {
        var dAngle = rotationSpeed * (time - timeOld);
        if (X) {
            MATRIX.rotateX(_matrixMovement, dAngle);
        }
        if (Y) {
            MATRIX.rotateY(_matrixMovement, dAngle);
        }
        if (Z) {
            MATRIX.rotateZ(_matrixMovement, dAngle);
        }

        timeOld = time;

        gl_ctx.viewport(0.0, 0.0, gl_canvas.width, gl_canvas.height);
        gl_ctx.clear(gl_ctx.COLOR_BUFFER_BIT | gl_ctx.DEPTH_BUFFER_BIT);

        gl_ctx.uniformMatrix4fv(_PosMatrix, false, _matrixProjection);
        gl_ctx.uniformMatrix4fv(_MovMatrix, false, _matrixMovement);
        gl_ctx.uniformMatrix4fv(_ViewMatrix, false, _matrixView);

        gl_ctx.vertexAttribPointer(_position, 3, gl_ctx.FLOAT, false, 4*(3+3), 0);
        gl_ctx.vertexAttribPointer(_color, 3, gl_ctx.FLOAT, false, 4*(3+3), 3*4);

        gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, _triangleVertexBuffer);
        gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, _triangleFacesBuffer);
        gl_ctx.drawElements(gl_ctx.TRIANGLES, triangleFaces.length, gl_ctx.UNSIGNED_SHORT, 0);
        gl_ctx.flush();

        window.requestAnimationFrame(animate);
    };
    animate(0);
}

runWebGL();
