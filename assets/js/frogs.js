const frogSketchInst = (sketch) => {
    let backgroundColor;
    let c;
    let frogName;
    let frogAccDesc='';
    let frogColor = '';
    let frogColorMatch;

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

        let frogCenterX = 0
        let frogCenterY = 0
        let [frogChar, frogChar64] = generateFrogChar(sketch)


        // Name
        frogName = frogChar.name
        frogColor = hslToHex(frogChar.hue,100,60)
        frogColorMatch = ntc.name(frogColor);
        sketch.select('.frog-name').html(`This is ${frogName}`)
        // Frog Description
        charStyle = `style="color:${frogColor}; text-shadow: 1px 1px #000000;"`
        if (!frogChar.accessories.length) {
            frogAccDesc=`It is currently wearing <b ${charStyle}>no accessories</b>.`
        } else if (frogChar.accessories.length ===1) {
            frogAccDesc=`It is currently wearing ${frogChar.accessories[0][0]==='glasses'?'':'a '}<b ${charStyle}>${frogChar.accessories[0][0]}</b>.`
        }
        else {
            frogAccDesc=`It is currently wearing `;
            for( let [id_acc,acc] of frogChar.accessories.entries()) {
                frogAccDesc+=`${acc[0]==='glasses'?'':'a '}<b ${charStyle}>${acc[0]}</b>`
                if (id_acc === frogChar.accessories.length-2) {
                    frogAccDesc+=' and ';
                } else if (id_acc === frogChar.accessories.length-1) {
                    frogAccDesc+='.';
                } else {
                    frogAccDesc+=', ';
                }
            }
        }
        sketch.select('.frog-desc-title').html(`Who is ${frogName} ?`)
        sketch.select('.frog-desc-text').html(`<b ${charStyle}>${frogName}</b> is a generative frog. It has been procedurally generated using <a href="https://p5js.org" style="display:inline; text-decoration-line: underline;" target="_blank">p5.js</a> Javascript library.<br><br>`
            +`<b ${charStyle}>${frogName}</b> is around <b ${charStyle}>${Math.round(frogChar.width)} px</b> wide, <b ${charStyle}>${Math.round(frogChar.height)} px</b> tall and its skin is <b ${charStyle}>${frogColorMatch[1]}</b>.<br>`
            +`${frogAccDesc}`)
        // sketch.keyPressed = sketch.redrawSketch;

        // Frog Code

        sketch.push()
        sketch.translate(sketch.width / 2, sketch.height - frogChar.height / 2)

        drawFrog(sketch, frogCenterX, frogCenterY, frogChar)
        sketch.pop()

        sketch.select('#btn-save').style('display', 'flex')
    }

    sketch.redrawSketch = () => {
        sketch.clear()
        sketch.redraw()
    }

    sketch.saveFrog = () => {
        sketch.saveCanvas(`${frogName}`, 'png')
    }

}

let frogCanvas = new p5(frogSketchInst, 'frog-sketch')
init = () => {
    document.getElementById('btn-generate').onclick = function () { frogCanvas.redrawSketch() };
    document.getElementById('btn-save').onclick = function () { frogCanvas.saveFrog() };
}
window.onload = init

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

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
