document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#rotateX').addEventListener('change', getRotation);
    document.querySelector('#rotateY').addEventListener('change', getRotation);
    document.querySelector('#rotateZ').addEventListener('change', getRotation);
});

function getRotation() {
    X = document.getElementById('rotateX').checked;
    Y = document.getElementById('rotateY').checked;
    Z = document.getElementById('rotateZ').checked;
}