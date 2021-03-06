// |streaming| indicates whether or not we're currently streaming
// video from the camera. Obviously, we start at false.
let streaming = false;

// The various HTML elements we need to configure or control. These
// will be set by the startup() function.
let video;
let canvas;
let context;

let tr, tg, tb, ta;
let width, height;
let imageData;

let applyEffect = false;
let applyHorizontalFlip = false;
let applyVerticalFlip = false;

let selectedFilter;

function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    let toggleButton = document.getElementById('toggleButton');
    let horizontalFlipButton = document.getElementById('horizontalFlipButton');
    let verticalFlipButton = document.getElementById('verticalFlipButton');
    let filterSelector = document.getElementById('filterSelector');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((err) => {
            console.log("An error occurred: " + err);
        });

    video.addEventListener('canplay', (ev) => {
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

    toggleButton.addEventListener('click', () => applyEffect = !applyEffect);
    horizontalFlipButton.addEventListener('click', () => applyHorizontalFlip = !applyHorizontalFlip);
    verticalFlipButton.addEventListener('click', () => applyVerticalFlip = !applyVerticalFlip);
    filterSelector.addEventListener('change', () => selectedFilter = filterSelector.value);
}

function drawFrame(video) {
    // Recopie l'image dans le canvas
    context.drawImage(video, 0, 0);

    if (applyEffect) {
        // Extrait le tableau de pixels du canvas
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let pix = imageData.data;

        // PASSAGE EN 1D POUR SIMPLIFIER LA GESTION DU VOISINAGE
        // 1 tab 1D -> 4 tab 2D (r,g,b,a) 
        // D??claration de 4 tableaux ?? 2 dim (de taille width * height)
        tr = new Array(width).fill().map(() => Array(height));
        tg = new Array(width).fill().map(() => Array(height));
        tb = new Array(width).fill().map(() => Array(height));
        ta = new Array(width).fill().map(() => Array(height));

        separatePixArray(pix);

        applyHorizontalFlip && horizontalFlip(); //Apply HorizontalFlip
        applyVerticalFlip && verticalFlip(); //Apply VerticalFlip
        brightness(); //Apply Brightness
        contrast(); //Apply Contrast

        applyFilter(); //Apply Filter

        mergePixArray(pix);
    }

    //Utilisation de requestAnimationFrame() au lieu de setTimeout() afin d'optimiser
    window.requestAnimationFrame(function () {
        drawFrame(video);
    });
}

function applyFilter() {
    switch (selectedFilter) {
        case 'grey':
            grey();
            break;
        case 'dark':
            dark();
            break;
        case 'negative':
            negative();
            break;
        case 'redCanal':
            redCanal();
            break;
        case 'greenCanal':
            greenCanal();
            break;
        case 'blueCanal':
            blueCanal();
            break;
        case 'purpleCanal':
            purpleCanal();
            break;
        case 'extrude':
            extrude();
            break;
        case 'glitch':
            glitch();
            break;
        default:
            applyEffect = !applyEffect
            alert('Please select a filter');
            break;
    }
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

    let range = document.getElementById('sensibilityRange');
    let sensibility = 128 * (1 - range.value / 10);

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            let temp = (tr[x][y] > sensibility) ? 255 : 0;
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

function negative() {
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
    let range = document.getElementById('sensibilityRange');
    let offset = 10 * parseInt(range.value);

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width - offset; x++) {
            tr[x][y] = tr[x + offset][y];
        }
    }

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width - offset; x++) {
            tb[x][y] = tb[x + offset][y];
        }
    }
}

function extrude() {
    dark();

    let range = document.getElementById('sensibilityRange');

    for (let i = 0; i < range.value; i++) {
        let tr2 = new Array(width).fill().map(() => Array(height));
        let tg2 = new Array(width).fill().map(() => Array(height));
        let tb2 = new Array(width).fill().map(() => Array(height));
        let ta2 = new Array(width).fill().map(() => Array(height));

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                tr2[x][y] = tr[x][y];
                tg2[x][y] = tg[x][y];
                tb2[x][y] = tb[x][y];
                ta2[x][y] = ta[x][y];
            }
        }

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                if (tr[x][y] === 0 && tg[x][y] === 0 && tb[x][y] === 0 && ta[x][y] === 255) {
                    if ((y - 1) in tr[x] &&
                        (y + 1) in tr[x] &&
                        (x - 1) in tr &&
                        (x + 1) in tr &&
                        y in tr[x - 1] &&
                        y in tr[x + 1]
                    ) {
                        tr2[x - 1][y] = 0;
                        tr2[x + 1][y] = 0;
                        tr2[x][y - 1] = 0;
                        tr2[x][y + 1] = 0;

                        tg2[x - 1][y] = 0;
                        tg2[x + 1][y] = 0;
                        tg2[x][y - 1] = 0;
                        tg2[x][y + 1] = 0;

                        tb2[x - 1][y] = 0;
                        tb2[x + 1][y] = 0;
                        tb2[x][y - 1] = 0;
                        tb2[x][y + 1] = 0;
                    }
                }
            }
        }

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                tr[x][y] = tr2[x][y];
                tg[x][y] = tg2[x][y];
                tb[x][y] = tb2[x][y];
            }
        }
    }
}

function brightness() {

    let brightnessRange = document.getElementById('brightnessRange');
    let brightness = brightnessRange.value;

    //On return quand brightness est ?? 0 pour optimiser la vid??o si on ne souhaite pas augmenter ou diminuer le brightness
    if (brightness === 0) return;

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            tr[x][y] += 255 * (brightness / 100);
            tg[x][y] += 255 * (brightness / 100);
            tb[x][y] += 255 * (brightness / 100);
        }
    }
}

function contrast() {

    let contrastRange = document.getElementById('contrastRange');
    let contrast = parseInt(contrastRange.value);

    //On return quand contrast est ?? 0 pour optimiser la vid??o si on ne souhaite pas augmenter ou diminuer le contrast
    if (contrast === 0) return;

    let factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            trContrast = factor * (tr[x][y] - 128) + 128;
            tgContrast = factor * (tr[x][y] - 128) + 128;
            tbContrast = factor * (tr[x][y] - 128) + 128;

            tr[x][y] = trContrast < 0 ? 0 : (trContrast > 255 ? 255 : trContrast);
            tg[x][y] = tgContrast < 0 ? 0 : (tgContrast > 255 ? 255 : tgContrast);
            tb[x][y] = tbContrast < 0 ? 0 : (tbContrast > 255 ? 255 : tbContrast);
        }
    }
}

// Set up our event listener to run the startup process
// once loading is complete.
window.addEventListener('load', startup);