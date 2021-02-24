const frogSketchInst = (sketch) => {
    let backgroundColor;
    let c;
    let frogName;

    sketch.setup = () => {
        windowWidth = 1000
        windowHeight = 800
        c = sketch.createCanvas(windowWidth, windowHeight);
        c.style('width', '')
        c.style('height', '')

        sketch.rectMode(sketch.CENTER)
        sketch.imageMode(sketch.CENTER)
        sketch.angleMode(sketch.DEGREES)
        sketch.colorMode(sketch.HSL)
        sketch.noLoop()
        backgroundColor = sketch.color(0, 0, 100, 0);

    }

    sketch.draw = () => {
        sketch.clear()
        c.elt.width = windowWidth;
        c.elt.height = windowHeight;
        c.class('canvas-frog');
        sketch.background(backgroundColor);
        sketch.push()
        sketch.translate(sketch.width / 2, sketch.height / 1.75)

        let frogCenterX = 0
        let frogCenterY = 0
        let [frogChar, frogChar64] = generateFrogChar(sketch)

        // Name
        frogName = frogChar.name
        sketch.select('.frog-name').html(`This is ${frogName}`)
        // sketch.keyPressed = sketch.saveFrog;

        // Frog Code


        drawFrog(sketch, frogCenterX, frogCenterY, frogChar)
        sketch.pop()

        sketch.select('#btn-save').style('display','flex')
    }

    sketch.redrawSketch = () => {
        sketch.clear()
        sketch.redraw()
    }

    sketch.saveFrog = () => {
            sketch.saveCanvas(`Frog_${frogName}`,'png')
    }

}

let frogCanvas = new p5(frogSketchInst, 'frog-sketch')
init = () => {
document.getElementById('btn-generate').onclick=function(){frogCanvas.redrawSketch()};
document.getElementById('btn-save').onclick=function(){frogCanvas.saveFrog()};
}
window.onload = init

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}