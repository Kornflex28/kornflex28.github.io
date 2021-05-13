const FROG_ACCESSORIES = [
    {
        name: 'glasses',
        prob: 0.4,
        draw: (sketch) => {
            let params = {
                glassesWidthFactor: sketch.random(0.9, 1.5),
                glassesCenterXFactor: -sketch.random(0.2, 0.4),
                glassesCenterYFactor: -sketch.random(0, 0.15)
            }
            let emptyFun = (sketch, x, y, frogChar, accParams) => { return }
            return [emptyFun, params]
        }
    },
    {
        name: 'bow tie',
        prob: .5,
        draw: (sketch) => {
            let params = {
                factorWidth: sketch.random(0.5, 1),
                factorHeight: sketch.random(0.5, 1)
            }
            return [drawBowTie, params]
        },
    },
    {
        name: 'necklace',
        prob: .5,
        draw: (sketch) => {
            let params = {
                necklaceHue: sketch.random(360),
                nPearls: sketch.floor(sketch.random(3, 18)),
            }
            return [drawNecklace, params]
        },
    },
    {
        name: 'top hat',
        prob: .5,
        draw: (sketch) => {
            let params = {
                hatHue: sketch.random(360),
                hatWidthFactor: sketch.random(0.26, 0.35),
                hatAngle: sketch.random(-5, 5),
            }
            return [drawTopHat, params]
        },
    }
]

const FROG_TEXTURES = [
    {
        name: 'none',
        draw: (sketch) => { }
    },
    {
        name: 'straight lines',
        draw: (sketch) => {
            let params = {
                linesAngle: sketch.random([0, 90]),
                step: sketch.random(sketch.width / 50, sketch.width / 30)
            }
            return [textureLines, params]
        },
    },
    {
        name: 'crosses',
        draw: (sketch) => {
            let params = {
                crossesAngle: sketch.random(0,180),
                step: sketch.random(sketch.width / 50, sketch.width / 30)
            }
            return [textureCrosses, params]
        },
    },
]

function generateFrogChar(sketch) {
    let frogWidth = sketch.random(sketch.width / 3, sketch.width / 2.6)
    let frogHeight = sketch.random(sketch.width / 2, sketch.width / 1.5)
    let frogHue = sketch.random(360)
    let frogEyeRadius = 0.15 * frogWidth
    let frogEyeWidth = sketch.random(0.6, 1.5) * frogEyeRadius
    let frogEyeHeight = sketch.random(0.6, 1.5) * frogEyeRadius
    let frogEyeAngle = sketch.random(0, 60)

    let frogAccessories = []
    for (let acc of FROG_ACCESSORIES) {
        if (sketch.random() <= acc.prob) {
            frogAccessories.push([acc.name, acc.draw(sketch)])
        }
    };
    let frogTexture = sketch.random(FROG_TEXTURES)

    let frogNameGenerator = NameGen.compile("(bl|b|t<v>|tl|p<v>(<v>|)|pl|fl|dl|d)<v>(<v>|)(b|bl|d|fl)(<V>|l|bl)");
    let frogName = frogNameGenerator.toString()
    frogName = frogName.charAt(0).toUpperCase() + frogName.slice(1);

    let char = {
        width: frogWidth,
        height: frogHeight,
        hue: frogHue,
        eyeRadius: frogEyeRadius,
        eyeWidth: frogEyeWidth,
        eyeHeight: frogEyeHeight,
        eyeAngle: frogEyeAngle,
        name: frogName,
        accessories: frogAccessories,
        texture: frogTexture,
    }
    let char64 = b64EncodeUnicode(JSON.stringify(char))

    return [char, char64]
}


function drawFrog(sketch, centerX, centerY, frogChar) {
    // console.log(frogChar)
    let shadowAlpha = 0.2
    let shadowWeight = frogChar.width / 50;
    let frogBodyColor = sketch.color(frogChar.hue, 100, 60)
    let frogLegColor = sketch.color(frogChar.hue, 60, 40)
    let frogEyesColor = sketch.color(frogChar.hue, 60, 15)
    let frogChinColor = sketch.color('#e3ffeb')
    let frogDownColor = sketch.color('#cae8d3')

    sketch.push()
    sketch.translate(centerX, centerY)

    ////// Frog //////

    // Frog shadow
    sketch.fill(0, shadowAlpha)
    sketch.strokeWeight(0)
    let frogShadowHeight = frogChar.height / 15
    sketch.ellipse(0, frogChar.height / 2 - frogShadowHeight / 2, 2.5 * frogChar.width, frogShadowHeight)

    // Left and right foots
    sketch.strokeWeight(0)
    sketch.fill(frogLegColor)
    footHeight = frogShadowHeight / 2
    sketch.rect(0, (frogChar.height - footHeight) / 2, 2 * frogChar.width, footHeight)
    footRadius = 2 * footHeight
    sketch.arc(-frogChar.width + footRadius, frogChar.height / 2 - 0.9 * footHeight, 2 * footRadius, 1.5 * footRadius, 180, 0)
    sketch.arc(frogChar.width - footRadius, frogChar.height / 2 - 0.9 * footHeight, 2 * footRadius, 1.5 * footRadius, 180, 0)


    // Left leg
    sketch.strokeWeight(0)
    sketch.fill(frogLegColor)
    sketch.push()
    sketch.stroke(0)
    sketch.strokeWeight(8)
    let leftLegAngle = -30
    let leftLegX = - 1.2 * frogChar.width / 2
    let leftLegY = 0.94 * sketch.cos(-leftLegAngle) * frogChar.height / 4
    sketch.translate(leftLegX, leftLegY)
    sketch.rotate(leftLegAngle)
    sketch.strokeWeight(0)
    sketch.ellipse(0, 0, frogChar.width / 2.7, frogChar.height / 1.5)
    sketch.pop()

    // Right leg
    sketch.strokeWeight(0)
    sketch.fill(frogLegColor)
    sketch.push()
    sketch.stroke(0)
    sketch.strokeWeight(8)
    let rightLegAngle = 30
    let rightLegX = 1.2 * frogChar.width / 2
    let rightLegY = 0.94 * sketch.cos(-rightLegAngle) * frogChar.height / 4
    sketch.translate(rightLegX, rightLegY)
    sketch.rotate(rightLegAngle)
    sketch.strokeWeight(0)
    sketch.ellipse(0, 0, frogChar.width / 2.7, frogChar.height / 1.5)
    sketch.pop()

    // Base body Shadow
    sketch.stroke(0, shadowAlpha)
    sketch.strokeWeight(shadowWeight)
    sketch.noFill()
    sketch.rect(0, 1.12 * frogChar.height / 4, frogChar.width, 0.7 * frogChar.height / 2, 0.01 * frogChar.width, 0.01 * frogChar.width, frogChar.width / 2.5)

    // Base body
    baseBodyShape = sketch.createGraphics(sketch.width, sketch.height)
    baseBodyShape.class('frog-sketch-utils')
    baseBodyShape.rectMode(sketch.CENTER)
    baseBodyShape.angleMode(sketch.DEGREES)
    baseBodyShape.translate(baseBodyShape.width / 2, baseBodyShape.height / 2)
    baseBodyShape.noFill()

    baseBodyShape.strokeWeight(0)
    baseBodyShape.fill(frogBodyColor)
    baseBodyShape.rect(0, 0, frogChar.width, frogChar.height, frogChar.width / 2, frogChar.width / 2)

    baseBodyShape.fill(frogBodyColor)
    baseBodyShape.push()
    baseBodyShape.translate(-frogChar.width / 2 + frogChar.eyeRadius, -frogChar.height / 2 + frogChar.eyeRadius)
    baseBodyShape.rotate(frogChar.eyeAngle)
    baseBodyShape.ellipse(0, 0, 2 * frogChar.eyeWidth, 2 * frogChar.eyeHeight)
    baseBodyShape.pop()

    baseBodyShape.push()
    baseBodyShape.translate(frogChar.width / 2 - frogChar.eyeRadius, -frogChar.height / 2 + frogChar.eyeRadius)
    baseBodyShape.rotate(-frogChar.eyeAngle)
    baseBodyShape.ellipse(0, 0, 2 * frogChar.eyeWidth, 2 * frogChar.eyeHeight)
    baseBodyShape.pop()

    if (frogChar.texture.name === 'none') {
        sketch.image(baseBodyShape, 0, 0)
        baseBodyShape.remove()
    } else {
        let [textureFun, textureParams] = frogChar.texture.draw(sketch)
        textureFun(sketch, sketch.width / 2, sketch.height / 2, frogChar, baseBodyShape, textureParams)
    }

    // Down body
    sketch.strokeWeight(0)
    sketch.fill(frogDownColor)
    sketch.rect(0, 1.12 * frogChar.height / 4, frogChar.width, 0.88 * frogChar.height / 2, 0, 0, frogChar.width / 2)

    // Nosetrils
    sketch.stroke(frogLegColor)
    sketch.strokeWeight(frogChar.width / 80)
    sketch.point(-0.1 * frogChar.width, -frogChar.width / 2.2)
    sketch.point(0.1 * frogChar.width, -frogChar.width / 2.2)

    // Eyes
    sketch.strokeWeight(0)
    // Left
    drawFrogEye(sketch, -frogChar.width / 2 + frogChar.eyeRadius, -frogChar.height / 2 + frogChar.eyeRadius, frogChar, frogBodyColor, frogEyesColor)
    // Right
    drawFrogEye(sketch, frogChar.width / 2 - frogChar.eyeRadius, -frogChar.height / 2 + frogChar.eyeRadius, frogChar, frogBodyColor, frogEyesColor)

    // Chin shadow
    sketch.stroke(0, shadowAlpha)
    sketch.strokeWeight(shadowWeight)
    sketch.noFill()
    sketch.arc(0, frogChar.height / 8.5, 0.99 * frogChar.width, 1.01 * frogChar.width, 192, -12, sketch.OPEN)

    // Chin
    sketch.strokeWeight(0)
    sketch.fill(frogChinColor)
    sketch.circle(0, frogChar.height / 9, frogChar.width)

    // Top chin
    sketch.fill(frogDownColor)
    sketch.arc(0, -frogChar.width / 4, frogChar.eyeWidth, frogChar.eyeHeight / 2, 0, 180, sketch.CHORD)


    ////// Accesories //////
    if (frogChar.accessories.length) {
        for (let [_, [accDraw, accParams]] of frogChar.accessories) {
            accDraw(sketch, 0, 0, frogChar, accParams)
        }
    }

    sketch.pop()
    return sketch


    // 
}

function textureLines(sketch, centerX, centerY, frogChar, baseBodyShape, params) {
    // Base body texture
    baseBodyShapeTexture = sketch.createGraphics(sketch.width, sketch.height)
    baseBodyShapeTexture.class('frog-sketch-utils')
    baseBodyShapeTexture.rectMode(sketch.CENTER)
    baseBodyShapeTexture.angleMode(sketch.DEGREES)
    baseBodyShapeTexture.translate(centerX, centerY)

    baseBodyShapeTexture.strokeWeight(0)
    baseBodyShapeTexture.fill(sketch.color(frogChar.hue, 100, 60))
    baseBodyShapeTexture.rect(0, 0, baseBodyShape.width, baseBodyShape.height)
    baseBodyShapeTexture.push()
    baseBodyShapeTexture.stroke(0, 20)
    baseBodyShapeTexture.strokeWeight(5)
    baseBodyShapeTexture.rotate(params.linesAngle)
    baseBodyShapeTexture.translate(-baseBodyShape.width / 2, -baseBodyShape.height / 2)
    for (let i = 0; i < 1.17 * baseBodyShapeTexture.width / params.step; i++) {
        baseBodyShapeTexture.line(i * params.step, 0, 0, i * params.step)
    }
    baseBodyShapeTexture.pop()


    baseBody = baseBodyShapeTexture.get()
    baseBody.mask(baseBodyShape.get())
    sketch.image(baseBody, 0, 0)
    baseBodyShape.remove()
    baseBodyShapeTexture.remove()
}


function textureCrosses(sketch, centerX, centerY, frogChar, baseBodyShape, params) {
    // Base body texture
    baseBodyShapeTexture = sketch.createGraphics(sketch.width, sketch.height)
    baseBodyShapeTexture.class('frog-sketch-utils')
    baseBodyShapeTexture.rectMode(sketch.CENTER)
    baseBodyShapeTexture.angleMode(sketch.DEGREES)
    baseBodyShapeTexture.translate(centerX, centerY)

    baseBodyShapeTexture.strokeWeight(0)
    baseBodyShapeTexture.fill(sketch.color(frogChar.hue, 100, 60))
    baseBodyShapeTexture.rect(0, 0, baseBodyShape.width, baseBodyShape.height)
    baseBodyShapeTexture.push()
    baseBodyShapeTexture.stroke(0, 10)
    baseBodyShapeTexture.strokeWeight(3)
    baseBodyShapeTexture.rotate(params.crossesAngle)
    baseBodyShapeTexture.translate(-baseBodyShape.width / 2, -baseBodyShape.height / 2)
    let lineLength = baseBodyShapeTexture.width / (6 * params.step)
    for (let i = 0; i < baseBodyShapeTexture.width / params.step; i++) {
        for (let j = 0; j < baseBodyShapeTexture.width / params.step; j++) {
            baseBodyShapeTexture.line(i * params.step-lineLength, j * params.step, i * params.step+lineLength, j * params.step)
            baseBodyShapeTexture.line(i * params.step, j * params.step-lineLength, i * params.step, j * params.step+lineLength)
        }
    }
    baseBodyShapeTexture.pop()


    baseBody = baseBodyShapeTexture.get()
    baseBody.mask(baseBodyShape.get())
    sketch.image(baseBody, 0, 0)
    baseBodyShape.remove()
    baseBodyShapeTexture.remove()
}

function drawNecklace(sketch, centerX, centerY, frogChar, params) {
    let color = sketch.color(params.necklaceHue, 80, 60)
    let width = frogChar.width
    sketch.push()
    sketch.translate(centerX, centerY - frogChar.width / 31.5)
    sketch.noFill()
    sketch.stroke(color)
    sketch.strokeWeight(1)
    sketch.arc(0, 0, width, width / 2, 0, 180)

    let deltaAngle = 180 / params.nPearls;
    for (let i = 0; i <= params.nPearls; i++) {
        sketch.strokeWeight(0.05 * frogChar.width)
        sketch.stroke(color)
        sketch.point(width * sketch.cos(i * deltaAngle) / 2, (width / 2) * sketch.sin(i * deltaAngle) / 2)
        sketch.strokeWeight(0.02 * frogChar.width)
        sketch.stroke('#FFFFFF')
        sketch.point(width * sketch.cos(i * deltaAngle) / 2.02, (width / 2) * sketch.sin(i * deltaAngle) / 2 - 4)
    }
    sketch.pop()
}

function drawBowTie(sketch, centerX, centerY, frogChar, params) {
    let color = sketch.color('#000000')
    let width = frogChar.width * params.factorWidth
    let height = frogChar.width * params.factorHeight

    sketch.push()
    sketch.translate(centerX, centerY)
    sketch.strokeWeight(0)
    sketch.fill(color)

    // Right bow tie
    sketch.beginShape()
    sketch.curveVertex(0, 0)
    sketch.curveVertex(0, 0)
    sketch.curveVertex(width / 3, height / 6)
    sketch.curveVertex(width / 3, -height / 6)
    sketch.curveVertex(0, 0)
    sketch.curveVertex(0, 0)
    sketch.endShape()

    // Left bow tie
    sketch.beginShape()
    sketch.curveVertex(0, 0)
    sketch.curveVertex(0, 0)
    sketch.curveVertex(-width / 3, height / 6)
    sketch.curveVertex(-width / 3, -height / 6)
    sketch.curveVertex(0, 0)
    sketch.curveVertex(0, 0)
    sketch.endShape()

    // Center bow tie
    sketch.ellipse(0, 0, width / 7, height / 11)


}

function drawTopHat(sketch, centerX, centerY, frogChar, params) {

    let hatWidth = frogChar.width * params.hatWidthFactor
    sketch.push()
    sketch.translate(centerX, centerY)
    sketch.rotate(params.hatAngle)
    // Shadow
    sketch.noStroke()
    sketch.fill(0, 0.2);
    sketch.ellipse(0, -frogChar.height / 2.1, hatWidth, hatWidth / 3)

    // Top hat
    sketch.stroke(sketch.color(params.hatHue, 100, 40))
    sketch.strokeWeight(3)
    sketch.fill(sketch.color(params.hatHue, 100, 60));
    sketch.beginShape()
    sketch.curveVertex(hatWidth / 2, -frogChar.height / 2.1)
    sketch.curveVertex(hatWidth / 2, -frogChar.height / 2.1)
    sketch.curveVertex(0, -frogChar.height / 2.15)
    sketch.curveVertex(-hatWidth / 2, -frogChar.height / 2.1)
    sketch.curveVertex(-hatWidth / 1.7, -frogChar.height / 2)
    sketch.curveVertex(-hatWidth / 2.1, -frogChar.height / 1.9)
    sketch.curveVertex(-hatWidth / 2, -frogChar.height / 1.5)
    sketch.curveVertex(hatWidth / 2, -frogChar.height / 1.5)
    sketch.curveVertex(hatWidth / 2.1, -frogChar.height / 1.9)
    sketch.curveVertex(hatWidth / 1.7, -frogChar.height / 2)
    sketch.curveVertex(hatWidth / 2, -frogChar.height / 2.1)
    sketch.curveVertex(hatWidth / 2, -frogChar.height / 2.1)

    sketch.endShape()

    sketch.stroke('#FFFFFF')
    sketch.strokeWeight(10)
    sketch.noFill();
    sketch.line(-hatWidth / 2.1, -frogChar.height / 1.9, hatWidth / 2.1, -frogChar.height / 1.9)

    sketch.pop()

}

function drawFrogEye(sketch, centerX, centerY, frogChar, frogBodyColor, frogEyesColor) {

    let glasses = frogChar.accessories.filter(acc => acc[0] === "glasses")

    sketch.push()
    sketch.translate(centerX, centerY)
    sketch.rotate(-Math.sign(centerX) * frogChar.eyeAngle)
    sketch.fill('#FFFFFF')
    sketch.ellipse(0, 0, 1.3 * frogChar.eyeWidth, 1.3 * frogChar.eyeHeight)
    sketch.fill(frogEyesColor)
    sketch.ellipse(0, 0, frogChar.eyeWidth, frogChar.eyeHeight)
    sketch.fill('#FFFFFF')
    sketch.ellipse(Math.sign(centerX) * 0.3 * frogChar.eyeWidth, -0.3 * frogChar.eyeHeight, 0.3 * frogChar.eyeWidth, 0.3 * frogChar.eyeHeight)

    // Draw glasses
    if (glasses.length) {
        let glassesParams = glasses[0][1][1]
        let glassesWidth = glassesParams.glassesWidthFactor * sketch.max(frogChar.eyeWidth, frogChar.eyeHeight)
        let glassesCenterX = glassesParams.glassesCenterXFactor * centerX
        let glassesCenterY = glassesParams.glassesCenterYFactor * centerY

        sketch.rotate(Math.sign(centerX) * frogChar.eyeAngle)
        sketch.fill(0, 0.1)
        sketch.stroke(0, 1)
        sketch.strokeWeight(3)
        sketch.ellipse(glassesCenterX, glassesCenterY, glassesWidth, glassesWidth)
        sketch.noFill()

        if (centerX > 0) {
            sketch.strokeWeight(4)
            sketch.arc(-centerX, glassesCenterY, 2 * (centerX + glassesCenterX - glassesWidth / 2), 0.3 * glassesWidth, 180, 0)
        }
    }

    sketch.pop()

}