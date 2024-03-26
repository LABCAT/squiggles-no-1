import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/squiggles-no-1.ogg";
import midi from "../audio/squiggles-no-1.mid";

/**
 * Blobs No. 2
 */
const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[8].notes; // Combintor 1 - Pseudo Arpeggiator 1 
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        }

        p.radius = 40;

        p.altitude = (Math.sqrt(3) / 2) * p.radius;

        p.hexagons = []; 
        p.hexagonPattern = null;
        p.rotations = [];

        p.colourScheme = [];

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.generateColourScheme();
            p.resetArcs();
        }

        p.draw = () => {
            p.background(p.colourScheme.bg);
            p.hexagons.forEach((hexagon, index) => {
                hexagon.rotation += (p.rotations[index] - hexagon.rotation) * 0.09;
                p.push();
                p.translate(hexagon.x + p.radius, hexagon.y + p.radius);
                p.rotate(hexagon.rotation);
                p.translate(-(hexagon.x + p.radius), -(hexagon.y + p.radius));
                p.image(p.hexagonPattern, hexagon.x, hexagon.y);
                p.pop();
            });

            if(p.audioLoaded && p.song.isPlaying()){
                
            }
        }

        p.resetArcs = () => {
            p.radius = p.random(p.width / 24, p.width / 96);
            p.altitude = (Math.sqrt(3) / 2) * p.radius;
            p.hexagons = []; 
            p.hexagonPattern = null;
            p.rotations = [];
            let hexagonMask = p.createGraphics(p.radius * 2, p.radius * 2);
            hexagonMask.beginShape();
            for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / 6) {
                let x = p.sin(a) * p.radius + p.radius;
                let y = p.cos(a) * p.radius + p.radius;
                hexagonMask.vertex(x, y);
            }
            hexagonMask.endShape();

            let hexagonLines = p.createGraphics(p.radius * 2, p.radius * 2);
            hexagonLines.noFill();
            hexagonLines.strokeWeight(p.radius / 2);
            hexagonLines.stroke(p.colourScheme.innerStroke);
            hexagonLines.ellipse(p.radius - p.altitude, p.radius - p.radius / 2, p.radius, p.radius);
            hexagonLines.ellipse(p.radius + p.altitude * 2, p.radius, p.radius * 3, p.radius * 3);
            hexagonLines.ellipse(
                p.radius + p.altitude,
                p.radius + p.radius * 1.5,
                p.radius * 3,
                p.radius * 3
            );
            hexagonLines.strokeWeight(p.radius / 4);
            hexagonLines.stroke(p.colourScheme.outerStroke);
            hexagonLines.ellipse(p.radius - p.altitude, p.radius - p.radius / 2, p.radius, p.radius);
            hexagonLines.ellipse(p.radius + p.altitude * 2, p.radius, p.radius * 3, p.radius * 3);
            hexagonLines.ellipse(
                p.radius + p.altitude,
                p.radius + p.radius * 1.5,
                p.radius * 3,
                p.radius * 3
            );

            p.hexagonPattern = p.createGraphics(p.radius * 2, p.radius * 2);
            p.hexagonPattern.image(hexagonMask, 0, 0);
            p.hexagonPattern.drawingContext.globalCompositeOperation = "source-in";
            p.hexagonPattern.image(hexagonLines, 0, 0);

            for (let x = -p.radius; x < p.width; x += p.altitude * 2) {
                let rowCount = 0;
                for (let y = -p.radius; y < p.height; y += p.radius * 1.5) {
                    p.hexagons.push({
                        x: x + (rowCount % 2 === 0 ? 0 : p.altitude),
                        y: y,
                        rotation: 0,
                    });
                    p.rotations.push((p.TWO_PI / 6) * p.floor(p.random(6)));
                    rowCount++;
                }
            }
        }

        p.generateColourScheme = () => {
            const randomColor = require('randomcolor');
            const colours = randomColor({
                luminosity: Math.random() < 0.2 ? 'bright' : 'light',
                format: 'rgb',
                count: 3
            });
            p.colourScheme = {
                innerStroke: colours[0],
                outerStroke: colours[1],
                bg: Math.random() < 0.2 ? colours[2] : '#ffffff',
            }
        }

        p.executeCueSet1 = ({currentCue}) => {
            if(currentCue % 42 === 1) {
                p.generateColourScheme();
                
            }
            if ((currentCue % 42 >= 29 && currentCue % 42 <= 42) || currentCue % 42 === 0 || currentCue > 210) {
                p.generateColourScheme();
                p.resetArcs();
            }
            else {
                const maxLoops = p.radius <= p.width / 48 ? 6 : 2;
                for (let i = 0; i < maxLoops; i++) {
                    const x = p.random(0, p.width);
                    const y = p.random(0, p.height);
                
                    let closestIndex = 0;
                    let closestDistance = 9999;
                    p.hexagons.forEach((hexagon, index) => {
                        let d = p.dist(x, y, hexagon.x + p.radius, hexagon.y + p.radius);
                        if (d < closestDistance) {
                            closestDistance = d;
                            closestIndex = index;
                        }
                    });
                    p.rotations[closestIndex] += p.TWO_PI / 6;
                    
                }
            }
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
