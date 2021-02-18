let backgroundColor;
let c;
let PALETTE_BODY;
let PALETTE_LEGS;
let PALETTE_EYES;


function setup() {
    windowSize = 700
    c = createCanvas(windowSize, windowSize);
    c.parent("frog");
    // c = createCanvas(windowSize, windowSize,SVG);
    rectMode(CENTER)
    angleMode(DEGREES)
    colorMode(HSL)
    noLoop()
    // frameRate(1)
    backgroundColor = 220;

    PALETTE_FROG = [{ body: '#5fde82', leg: '#31a880' },
                    { body: '#fa3737', leg: '#cc4343' },
                    { body: '#ff931f', leg: '#bf772a' },
                    { body: '#ffe53b', leg: '#b09d1e' },
                    { body: '#24d3ff', leg: '#189aba' },
                    { body: '#ff931f', leg: '#bf772a' },
                   ]
    PALETTE_EYES = ['#062e63']
}

function mousePressed() {
    clear()
    redraw()
}


function draw() {

    background(backgroundColor);
    push()
    translate(width / 2, height / 2)

    w = random(width / 6, width / 3.7)
    h = height / 3
    drawFrog(0, 0, w, h)
    pop()
}

function drawFrog(centerX, centerY, w, h) {
    let shadowAlpha = 0.2
    let shadowWeight = 7
    let frogHue = random(360);
    let frogBodyColor = color(frogHue,100,60)
    let frogLegColor = color(frogHue,60,40)
    let frogEyesColor = color(frogHue,60,15)

    push()
    translate(centerX, centerY)

    // Frog shadow
    fill(0, shadowAlpha)
    strokeWeight(0)
    let frogShadowHeight = h / 15
    ellipse(0, h / 2 - frogShadowHeight / 2, 2.5 * w, frogShadowHeight)

    // Left and right foots
    strokeWeight(0)
    fill(frogLegColor)
    footHeight = frogShadowHeight / 2
    rect(0, (h - footHeight) / 2, 2 * w, footHeight)
    footRadius = 2 * footHeight
    arc(-w + footRadius, h / 2 - 0.9 * footHeight, 2 * footRadius, 1.5 * footRadius, 180, 0)
    arc(w - footRadius, h / 2 - 0.9 * footHeight, 2 * footRadius, 1.5 * footRadius, 180, 0)


    // Left leg
    strokeWeight(0)
    fill(frogLegColor)
    push()
    stroke(0)
    strokeWeight(8)
    let leftLegAngle = -30
    let leftLegX = - 1.2 * w / 2
    let leftLegY = 0.94 * cos(-leftLegAngle) * h / 4
    translate(leftLegX, leftLegY)
    rotate(leftLegAngle)
    point(0, 0)
    strokeWeight(0)
    ellipse(0, 0, w / 2.7, h / 1.5)
    pop()

    // Right leg
    strokeWeight(0)
    fill(frogLegColor)
    push()
    stroke(0)
    strokeWeight(8)
    let rightLegAngle = 30
    let rightLegX = 1.2 * w / 2
    let rightLegY = 0.94 * cos(-rightLegAngle) * h / 4
    translate(rightLegX, rightLegY)
    rotate(rightLegAngle)
    strokeWeight(0)
    ellipse(0, 0, w / 2.7, h / 1.5)
    pop()

    // Base body Shadow
    stroke(0,shadowAlpha)
    strokeWeight(shadowWeight)
    noFill()
    rect(0, 1.12 * h / 4, w, 0.7 * h / 2, 0.01*w, 0.01*w, w /2.5)
    // line(-w/2,0.49*h,-w/2,0.08*h)
    // line(w/2,0.49*h,w/2,0.08*h)

    // Base body
    strokeWeight(0)
    fill(frogBodyColor)
    rect(0, 0, w, h, w / 2, w / 2)

    // Down body
    strokeWeight(0)
    fill('#cae8d3')
    rect(0, 1.12 * h / 4, w, 0.88 * h / 2, 0, 0, w / 2)
    
    // Chin shadow
    stroke(0, shadowAlpha)
    strokeWeight(shadowWeight)
    noFill()
    arc(0, h / 8.5, 0.99*w, 1.01*w, 192, -12, OPEN)

    // Chin
    strokeWeight(0)
    fill('#e3ffeb')
    circle(0, h / 9, w)

    // Eyes
    strokeWeight(0)
    let eyeRadius = 0.15 * w
    eyeWidth = random(0.6, 1.5) * eyeRadius
    eyeHeight = random(0.6, 1.5) * eyeRadius
    eyeAngle = random(40, 50)
    // Left
    drawFrogEye(-w / 2 + eyeRadius, -h / 2 + eyeRadius, eyeWidth, eyeHeight, eyeAngle, frogBodyColor, frogEyesColor)

    // Right
    drawFrogEye(w / 2 - eyeRadius, -h / 2 + eyeRadius, eyeWidth, eyeHeight, -eyeAngle, frogBodyColor, frogEyesColor)


    pop()


}

function drawFrogEye(centerX, centerY, eyeWidth, eyeHeight, eyeAngle, frogBodyColor, frogEyesColor) {
    push()
    translate(centerX, centerY)
    rotate(eyeAngle)
    fill(frogBodyColor)
    ellipse(0, 0, 2 * eyeWidth, 2 * eyeHeight)
    fill('#FFFFFF')
    ellipse(0, 0, 1.3 * eyeWidth, 1.3 * eyeHeight)
    fill(frogEyesColor)
    ellipse(0, 0, eyeWidth, eyeHeight)
    // rotate(-eyeAngle)
    fill('#FFFFFF')
    ellipse(Math.sign(centerX) * 0.3 * eyeWidth, -0.3 * eyeHeight, 0.3 * eyeWidth, 0.3 * eyeHeight)
    pop()

}