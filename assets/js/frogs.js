const frogSketchInst = (sketch) => {
    let backgroundColor;
    let c;

    sketch.setup = () => {
        windowWidth = 1000
        windowHeight = 500
        c = sketch.createCanvas(windowWidth, windowHeight);
        c.style('width', '')
        c.style('height', '')
        c.mouseClicked(sketch.redrawSketch)

        sketch.rectMode(sketch.CENTER)
        sketch.angleMode(sketch.DEGREES)
        sketch.colorMode(sketch.HSL)
        sketch.noLoop()
        
        backgroundColor = sketch.color(0, 0, 100, 0);
    }

    sketch.draw = () => {
        c.elt.width = windowWidth;
        c.elt.height = windowHeight;

        sketch.background(backgroundColor);
        sketch.push()
        sketch.translate(sketch.width / 2, sketch.height / 2)

        // Show canvas boundaries
        // sketch.stroke(0,1)
        // sketch.noFill()
        // sketch.rect(0,0,sketch.width,sketch.height)

        let frogCenterX = 0
        let frogCenterY = 0
        let [frogChar, frogChar64] = generateFrogChar(sketch)

        // Name
        // sketch.fill('#000000')
        // sketch.textAlign('center')
        // sketch.textSize(18)
        // sketch.text('This is',0,-sketch.height/4-36)
        // sketch.textSize(36)
        // sketch.text(frogChar.name,0,-sketch.height/4)
        sketch.select('.frog-name').html(`This is ${frogChar.name}`)

        // Frog Code


        drawFrog(sketch, frogCenterX, frogCenterY, frogChar)

        sketch.pop()
    }

    sketch.redrawSketch = () => {
        sketch.redraw()
    }

}

let frogCanvas = new p5(frogSketchInst, 'frog-sketch')


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