var x_pos_old = 0;
var y_pos_old = 0;

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#rotateX').addEventListener('change', updateRotation);
    document.querySelector('#rotateY').addEventListener('change', updateRotation);
    document.querySelector('#rotateZ').addEventListener('change', updateRotation);
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#cubetexture').addEventListener('click', setTexture);
    document.querySelector('#cubetexture2').addEventListener('click', setTexture);
    document.querySelector('#cubetexture3').addEventListener('click', setTexture);
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#start').addEventListener('click', runWebGL);
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#canvas').addEventListener('mousemove', mouseMoved);
    document.querySelector('#canvas').addEventListener('contextmenu', rightMouseButtonClicked);
});

function mouseMoved(e) {
    // console.dir(e);
    if (e.buttons == 2) { //LMB
        e.preventDefault();
        if(Math.abs(y_pos_old - e.clientY) > 30)
            y_pos_old = e.clientY;

        zoomRatio += (e.clientY - y_pos_old) / 100;
        y_pos_old = e.clientY;
        MATRIX.translateZ(_matrixView, zoomRatio);
    }
}

function rightMouseButtonClicked(e) {
    e.preventDefault();
}

function updateRotation() {
    X = document.getElementById('rotateX').checked;
    Y = document.getElementById('rotateY').checked;
    Z = document.getElementById('rotateZ').checked;
}

function setTexture() {
    _cubeTexture = gl_initTexture('../textures/' + this.id + '.png');
}