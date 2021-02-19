function generateFrogChar(sketch) {
    let frogWidth = sketch.random(sketch.width / 6, sketch.width / 3.7)
    let frogHeight = sketch.random(sketch.height / 3.1, sketch.height / 3)
    let frogHue = sketch.random(360)
    let frogEyeRadius = 0.15 * frogWidth
    let frogEyeWidth = sketch.random(0.6, 1.5) * frogEyeRadius
    let frogEyeHeight = sketch.random(0.6, 1.5) * frogEyeRadius
    let frogEyeAngle = sketch.random(0, 60)

    let char = {
        width: frogWidth,
        height: frogHeight,
        hue: frogHue,
        eyeRadius: frogEyeRadius,
        eyeWidth: frogEyeWidth,
        eyeHeight: frogEyeHeight,
        eyeAngle: frogEyeAngle,
    }
    let char64 = b64EncodeUnicode(JSON.stringify(char))

    return [char, char64]
}

function drawFrog(sketch, centerX, centerY, frogChar) {
    console.log(frogChar)
    let shadowAlpha = 0.2
    let shadowWeight = 7
    let frogBodyColor = sketch.color(frogChar.hue, 100, 60)
    let frogLegColor = sketch.color(frogChar.hue, 60, 40)
    let frogEyesColor = sketch.color(frogChar.hue, 60, 15)
    let frogChinColor = sketch.color('#e3ffeb')
    let frogDownColor = sketch.color('#cae8d3')

    sketch.push()
    sketch.translate(centerX, centerY)

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
    // sketch.line(-frogChar.width/2,0.49*frogChar.height,-frogChar.width/2,0.08*frogChar.height)
    // sketch.line(frogChar.width/2,0.49*frogChar.height,frogChar.width/2,0.08*frogChar.height)

    // Base body
    sketch.strokeWeight(0)
    sketch.fill(frogBodyColor)
    sketch.rect(0, 0, frogChar.width, frogChar.height, frogChar.width / 2, frogChar.width / 2)

    // Down body
    sketch.strokeWeight(0)
    sketch.fill(frogDownColor)
    sketch.rect(0, 1.12 * frogChar.height / 4, frogChar.width, 0.88 * frogChar.height / 2, 0, 0, frogChar.width / 2)

    // Eyes
    sketch.strokeWeight(0)
    // let eyeRadius = 0.15 * frogChar.width
    // eyeWidth = random(0.6, 1.5) * eyeRadius
    // eyeHeight = random(0.6, 1.5) * eyeRadius
    // eyeAngle = random(40, 50)
    // Left
    drawFrogEye(sketch, -frogChar.width / 2 + frogChar.eyeRadius, -frogChar.height / 2 + frogChar.eyeRadius, frogChar.eyeWidth, frogChar.eyeHeight, frogChar.eyeAngle, frogBodyColor, frogEyesColor)

    // Right
    drawFrogEye(sketch, frogChar.width / 2 - frogChar.eyeRadius, -frogChar.height / 2 + frogChar.eyeRadius, frogChar.eyeWidth, frogChar.eyeHeight, -frogChar.eyeAngle, frogBodyColor, frogEyesColor)

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
    // sketch.noFill()
    sketch.fill(frogDownColor)
    // sketch.stroke(frogDownColor)
    // sketch.strokeWeight(3)
    sketch.arc(0, -frogChar.width / 4, frogChar.eyeWidth, frogChar.eyeHeight / 2, 0, 180, sketch.CHORD)
    // sketch.line(-frogChar.eyeWidth/2,-frogChar.width/4,frogChar.eyeWidth/2,-frogChar.width/4)

    // Nosetrils
    sketch.stroke(frogLegColor)
    sketch.strokeWeight(3)
    sketch.point(-0.02 * frogChar.width, -frogChar.width / 2.2)
    sketch.point(0.02 * frogChar.width, -frogChar.width / 2.2)


    // Bow tie
    let bowTieProb = 0.5;
    if (sketch.random() <= bowTieProb) {
        let bowTieColor = sketch.color('#000000')
        drawBowTie(sketch, 0, 0, frogChar.width, bowTieColor)
    }

    // Necklace
    let necklaceTieProb = 0.5;
    if (sketch.random() <= necklaceTieProb) {
        let neckColor = sketch.color((180 + frogChar.hue) % 360, 80, 60)
        drawNecklace(sketch, 0, frogChar.height / 9 - frogChar.width / 7, frogChar.width, neckColor)
    }


    sketch.pop()


}

function drawNecklace(sketch, centerX, centerY, width, color) {
    sketch.push()
    sketch.translate(centerX, centerY)
    sketch.noFill()
    sketch.stroke(color)
    sketch.strokeWeight(1)
    sketch.arc(0, 0, width, width / 2, 0, 180)

    let nPearls = sketch.floor(sketch.random(14, 18));
    let deltaAngle = 180 / nPearls;
    for (let i = 0; i <= nPearls; i++) {
        sketch.strokeWeight(12)
        sketch.stroke(color)
        sketch.point(width * sketch.cos(i * deltaAngle) / 2, (width / 2) * sketch.sin(i * deltaAngle) / 2)
        sketch.strokeWeight(4)
        sketch.stroke('#FFFFFF')
        sketch.point(width * sketch.cos(i * deltaAngle) / 2.05, (width / 2) * sketch.sin(i * deltaAngle) / 2 - 4)
    }
    sketch.pop()
}

function drawBowTie(sketch, centerX, centerY, width, color) {
    sketch.push()
    sketch.translate(centerX, centerY)
    sketch.strokeWeight(0)
    sketch.fill(color)

    // Right bow tie
    sketch.beginShape()
    sketch.curveVertex(0, 0)
    sketch.curveVertex(0, 0)
    sketch.curveVertex(width / 3, width / 6)
    sketch.curveVertex(width / 3, -width / 6)
    sketch.curveVertex(0, 0)
    sketch.curveVertex(0, 0)
    sketch.endShape()

    // Left bow tie
    sketch.beginShape()
    sketch.curveVertex(0, 0)
    sketch.curveVertex(0, 0)
    sketch.curveVertex(-width / 3, width / 6)
    sketch.curveVertex(-width / 3, -width / 6)
    sketch.curveVertex(0, 0)
    sketch.curveVertex(0, 0)
    sketch.endShape()

    // Center bow tie
    sketch.ellipse(0, 0, width / 7, width / 11)


}

function drawFrogEye(sketch, centerX, centerY, eyeWidth, eyeHeight, eyeAngle, frogBodyColor, frogEyesColor) {
    sketch.push()
    sketch.translate(centerX, centerY)
    sketch.rotate(eyeAngle)
    sketch.fill(frogBodyColor)
    sketch.ellipse(0, 0, 2 * eyeWidth, 2 * eyeHeight)
    sketch.fill('#FFFFFF')
    sketch.ellipse(0, 0, 1.3 * eyeWidth, 1.3 * eyeHeight)
    sketch.fill(frogEyesColor)
    sketch.ellipse(0, 0, eyeWidth, eyeHeight)
    // sketch.rotate(-eyeAngle)
    sketch.fill('#FFFFFF')
    sketch.ellipse(Math.sign(centerX) * 0.3 * eyeWidth, -0.3 * eyeHeight, 0.3 * eyeWidth, 0.3 * eyeHeight)
    sketch.pop()

}