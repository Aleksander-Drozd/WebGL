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

function updateRotation() {
    X = document.getElementById('rotateX').checked;
    Y = document.getElementById('rotateY').checked;
    Z = document.getElementById('rotateZ').checked;
}

function setTexture() {
    _cubeTexture = gl_initTexture('../textures/' + this.id + '.png');
}