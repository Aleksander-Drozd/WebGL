document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#rotateX').addEventListener('change', updateRotation);
    document.querySelector('#rotateY').addEventListener('change', updateRotation);
    document.querySelector('#rotateZ').addEventListener('change', updateRotation);
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#cubetexture').addEventListener('click', setTexture('cubetexture'));
    document.querySelector('#cubetexture2').addEventListener('click', setTexture('cubetexture2'));
    document.querySelector('#cubetexture3').addEventListener('click', setTexture('cubetexture3'));
});

function updateRotation() {
    X = document.getElementById('rotateX').checked;
    Y = document.getElementById('rotateY').checked;
    Z = document.getElementById('rotateZ').checked;
}

function setTexture(id) {
    gl_initTexture(id + '.png');
}