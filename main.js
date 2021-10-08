// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.
let streaming = false;

// The various HTML elements we need to configure or control. These
// will be set by the startup() function.
let video;
let canvas;
let startButton;

let context;
let applyEffect;

let tr, tg, tb, ta;
let width, height;
let imageData;

let activeFilter = dark();

function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    startButton = document.getElementById('startButton');
    toggleButton = document.getElementById('toggleButton');
    context = canvas.getContext('2d');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });

    video.addEventListener('canplay', function (ev) {
        if (!streaming) {
            // Set the canvas the same width and height of the video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            width = canvas.width;
            height = canvas.height;

            streaming = true;

            drawFrame(video);
        }
    }, false);

    toggleButton.addEventListener('click', function () {
        applyEffect = !applyEffect;
    });
}

function drawFrame(video) {
    // recopie l'image dans le canevas
    context.drawImage(video, 0, 0);

    if (applyEffect) {
        // extrait le tableau de pixels du canvas
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let pix = imageData.data;

        // PASSAGE EN 1D POUR SIMPLIFIER LA GESTION DU VOISINAGE
        // 1 tab 1D -> 4 tab 2D (r,g,b,a) 
        // déclaration de 4 tableaux à 2 dim (de taille width * height)
        tr = new Array(width).fill().map(() => Array(height));
        tg = new Array(width).fill().map(() => Array(height));
        tb = new Array(width).fill().map(() => Array(height));
        ta = new Array(width).fill().map(() => Array(height));

        separatePixArray(pix);
        grey(); //Apply Filter
        mergePixArray(pix);
    }

    setTimeout(function () {
        drawFrame(video);
    }, 10);
}

function separatePixArray(pix) {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            tr[x][y] = pix[x * 4 + y * (width * 4) + 0];
            tg[x][y] = pix[x * 4 + y * (width * 4) + 1];
            tb[x][y] = pix[x * 4 + y * (width * 4) + 2];
            ta[x][y] = pix[x * 4 + y * (width * 4) + 3];
        }
    }
}

function mergePixArray(pix) {
    // RETOUR EN 1D POUR AFFICHER LES MODIFICATIONS
    // 4 tab 2D (r,g,b,a) -> 1 tab 1D POUR METTRE A JOUR L'IMAGE
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            pix[x * 4 + y * (width * 4) + 0] = tr[x][y];
            pix[x * 4 + y * (width * 4) + 1] = tg[x][y];
            pix[x * 4 + y * (width * 4) + 2] = tb[x][y];
            pix[x * 4 + y * (width * 4) + 3] = ta[x][y];
        }
    }

    // Draw the ImageData at the given (x,y) coordinates.
    context.putImageData(imageData, 0, 0);
}

//========================================//
//                                        //
//                FILTERS                 //
//                                        //
//========================================//

function grey() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            let temp = (tr[x][y] + tg[x][y] + tb[x][y]) / 3
            tr[x][y] = temp;
            tg[x][y] = temp;
            tb[x][y] = temp;
        }
    }
}

function dark() {
    grey();

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            let temp = (tr[x][y] > 128) ? 255 : 0;
            tr[x][y] = temp;
            tg[x][y] = temp;
            tb[x][y] = temp;
            ta[x][y] = 255;
        }
    }
}

function redCanal() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            tg[x][y] = 0;
            tb[x][y] = 0;
        }
    }
}

function greenCanal() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            tr[x][y] = 0;
            tb[x][y] = 0;
        }
    }
}

function blueCanal() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            tr[x][y] = 0;
            tg[x][y] = 0;
        }
    }
}

function purpleCanal() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            tg[x][y] = 0;
        }
    }
}

function invertColors() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            tr[x][y] = 255 - tr[x][y];
            tg[x][y] = 255 - tg[x][y];
            tb[x][y] = 255 - tb[x][y];
        }
    }
}

function verticalFlip() {
    for (var x = 0; x < width; x++) {
        tr[x].reverse();
        tg[x].reverse();
        tb[x].reverse();
        ta[x].reverse();
    }
}

function horizontalFlip() {
    tr.reverse();
    tg.reverse();
    tb.reverse();
    ta.reverse();
}

function glitch() {
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width - 20; x++) {
            tr[x][y] = tr[x + 20][y];
        }
    }

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width - 20; x++) {
            tb[x][y] = tb[x + 20][y];
        }
    }
}
// Set up our event listener to run the startup process
// once loading is complete.
window.addEventListener('load', startup);