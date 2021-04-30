const GIFEncoder = require('gif-encoder-2');
const { createCanvas, loadImage } = require('canvas');
const { writeFile, readFileSync } = require('fs');
const path = require('path');
const { exec } = require("child_process");
const express = require('express');
const app = express();

const w = 260;
const h = 260;

const canvas = createCanvas(w, h);
const ctx = canvas.getContext('2d');


var start = process.hrtime();

var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    start = process.hrtime(); // reset the timer
}


ctx.textAlign = "center";
ctx.textBaseline = "middle";
let drawBackground = () => {
    ctx.fillStyle = "#2f3136"
    ctx.fillRect(0, 0, w, h);
}
var numOrder = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26].reverse();
var numRed = [32,19,21,25,34,27,36,30,23,5,16,1,14,9,18,7,12,3];
var numBlack = [15,4,2,17,6,13,11,8,10,24,33,20,31,22,29,28,35,26];
let subdivisions = numOrder.length;

let ratio = w/500;

let drawBoard = () => {
    drawBackground()
    ctx.beginPath();
    ctx.strokeStyle = "#1c1c1c"; //Circle under the numbers
    ctx.fillStyle = '#1c1c1c';
    ctx.arc(w/2, h/2, 220 * ratio, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    drawOptions();
    ctx.beginPath();
    ctx.arc(w/2, h/2, 150 * ratio, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFFFFF"; // Inner circle
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.stroke();
}

let drawOptions = () => { // Draw the squares (options)
    ctx.font = "700 12px Arial";
    for (let i = 0; i < subdivisions; i++) {
        let trueNum = numOrder[i];
        let angleBetweenSubdivisions = (Math.PI * 2)/subdivisions;
        let n = i/subdivisions * 2 * Math.PI + (0.5 * angleBetweenSubdivisions) // Angle for subdivision start
        let next_n = ((i + 1)/subdivisions) * 2 * Math.PI + (0.5 * angleBetweenSubdivisions) // Angle for next subdivision start (first subdivision end)

        let x1 = w/2 - (150 * ratio * Math.sin(n))
        let x2 = w/2 - (200 * ratio *  Math.sin(n))
        let y1 = h/2 - (150 * ratio * Math.cos(n))
        let y2 = h/2 - (200 * ratio * Math.cos(n))

        let next_x1 = w/2 - (150 * ratio * Math.sin(next_n))
        let next_x2 = w/2 - (200 * ratio * Math.sin(next_n))
        let next_y1 = h/2 - (150 * ratio * Math.cos(next_n))
        let next_y2 = h/2 - (200 * ratio * Math.cos(next_n))

        let midX = (x2 + x1 + next_x1 + next_x2)/4; 
        let midY = (y2 + y1 + next_y1 + next_y2)/4;

        ctx.beginPath();
        ctx.moveTo(x1, y1) //Inner ring
        ctx.lineTo(x2, y2) //Outer Ring
        ctx.lineTo(next_x2, next_y2) 
        ctx.lineTo(next_x1, next_y1) 
        ctx.lineTo(x1, y1)

        if (numBlack.includes(trueNum)) {
            ctx.fillStyle = "#4d4d4d"; // Black
        }
        else if (numRed.includes(trueNum)) {
            ctx.fillStyle = "#ff7575"; // Red
        }
        else {
            ctx.fillStyle = "#7289DA"; // 0 Square
        }
        ctx.stroke();
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "white"; 
        ctx.fillText(trueNum.toString(), midX , midY);
    }
}

async function createSpinGifToTarget (target) {
    
}

//createSpinGifToTarget(30)

app.get('/spin/:target', (req, res) => {
    elapsed_time("Gif Requested")
    let target;
    try {
        target = Number(req.params.target)
    }
    catch {
        res.send("Invalid number supplied");
        res.end();
        return;
    }
    let encoder = new GIFEncoder(w, h, 'neuquant', true);

    
    let speedFactor = 10 //Decrease for less frames; lower load times; faster speed.
    // If you want to add more frames but decrease speed, decrease setDelay and increase speedFactor.
    // If you want to remove frames but increase speed, increase setDelay and decrease speedFactor. Good for optimizing. Creates chopiness.
    encoder.setDelay(40); //doesn't affect encoding speed. make as large as possible without chopiness.
    
    // 10, 40 for 1-1.5 second load
    // 150, 20 for slow rotation. 10 second load.

    let smartScaling = true; // Allows you to use higher min speeds by forcing n times lower speed in the last few degrees.
    let minSpeed = 0.02; //Only applied if smartScaling is enabled. Otherwise 0.002 is used.
    let smartScalingReductionFactor = 5; //lower is faster, but sometimes higher is needed to seem natural.
    let degreesRequiredForSmartScaling = 40;

    encoder.setQuality(30);
    encoder.setThreshold(0.1);
    //encoder.setRepeat(1);
    encoder.start();
    let currentAngle = 0;
    let speed = 0.02;
    let angleBetweenSubdivisions = (Math.PI * 2)/subdivisions;
    let neededAngle = (angleBetweenSubdivisions * numOrder.indexOf(target)) + angleBetweenSubdivisions;
     //Extra spin to make it seem more realistic
    neededAngle += (Math.PI * 2)
    if (Math.round(Math.random()) == 0) {
        neededAngle += (Math.PI * 2)
    }
    neededAngle += (angleBetweenSubdivisions * (Math.random() - 0.5))/2 //Make it have a little margin of error to seem realistic
    loadImage('./discrash.png').then((image) => {
        elapsed_time("Logo image loaded")
        let inSmartScalingZone = false;
        while (currentAngle < (neededAngle)) {
            ctx.clearRect(0, 0, w, h);
            drawBoard();
            ctx.beginPath();
            ctx.globalAlpha = 0.8;
            ctx.strokeStyle = "#7289DA"; //Ball colors
            ctx.fillStyle = '#7289DA';
            ctx.arc(w/2 - (175 * ratio * Math.sin(currentAngle)), h/2 - (175 * ratio * Math.cos(currentAngle)), 20 * ratio, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            if (smartScaling) {
                if (!inSmartScalingZone) {
                    let angleOff = ((neededAngle - currentAngle)/(2 * Math.PI)) * 360
                    if (angleOff < degreesRequiredForSmartScaling) {
                        inSmartScalingZone = true;
                    }
                }
                if (inSmartScalingZone) {
                    speed = ((neededAngle - currentAngle)/speedFactor) + (minSpeed / smartScalingReductionFactor)
                }
                else {
                    speed = ((neededAngle - currentAngle)/speedFactor) + minSpeed
                }
            }
            else {
                speed = ((neededAngle - currentAngle)/speedFactor) + 0.002
            }
            currentAngle += speed;
            ctx.drawImage(image, 150 * ratio, 150 * ratio, 200 * ratio, 200 * ratio);
            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("+100", w/2, h/2 - (65 * ratio));
            encoder.addFrame(ctx)
        }
        
        encoder.finish();
        let buffer = encoder.out.getData();
        elapsed_time("Buffer encoded with gif")
        console.log(buffer[0x30D])
        let offset = 0x30D;
        var y = buffer.slice(0, offset);
        var z = buffer.slice(offset + 19);
        let buf = [y, z]
        buf = Buffer.concat(buf)

        writeFile(path.join(__dirname, 'output', 'output.gif'), buf, error => {
            if (error) {
                console.log(error);
            }
        })
        writeFile(path.join(__dirname, 'output', 'looped.gif'), buffer, error => {
            if (error) {
                console.log(error);
            }
        })
        elapsed_time("Start removing loop")
        exec("gifsicle.exe " + __dirname + "\\output\\looped.gif --no-loopcount > " + __dirname + "\\output\\output.gif", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            elapsed_time("Finished removing loop")
            var file = readFileSync(__dirname + '\\output\\output.gif', 'binary');
            res.setHeader('Content-Length', file.length);
            res.write(file, 'binary');
            res.end();
            elapsed_time("Res sent")
            console.log("----------------------------")
        });
    })
    
    
})

let server = app.listen(8095, () => {
    console.log("Gif Creator Server listening on http://localhost:8095.");
})

server.setTimeout(50000);