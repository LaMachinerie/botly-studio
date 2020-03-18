var Turtle = Turtle || {};

Turtle.pluginID = undefined;

Turtle.width = 1000;
Turtle.height = 1000;

Turtle.x = Turtle.width / 2;
Turtle.y = Turtle.height / 2;
Turtle.heading = 0;

Turtle.factor = 1;

Turtle.interpreter = null;
Turtle.pidList = [];
Turtle.pause = 10;
Turtle.penDownValue = true;
Turtle.fastMode = false;
Turtle.speedSlider = null;

Turtle.penCtx = null;
Turtle.ctx = null;

Turtle.init = function() {

    console.log('[Plugin] : Turtle initialized');
    Turtle.pluginID = BotlyAPI.myID('turtle');

    var options = {
        trackMouseDrag: true,
        trackWheel: true,
        layers_nicknames: ['paper', 'grid', 'pen', 'turtle'],
        height: 1000,
        width: 1000,
        div: document.getElementById('canvasContainer'),
        smoothing: false
    }
    Turtle.canvas = new Canvas(options);
    Turtle.canvas.getLayer('grid').show();

    Turtle.ctx = Turtle.canvas.getContext('turtle')
    Turtle.penCtx = Turtle.canvas.getContext('pen');

    var sliderSvg = document.getElementById('speed_slider');
    Turtle.speedSlider = new Slider(10, 35, 130, sliderSvg);


    document.getElementById("centerClipPath").addEventListener("click", function() {
        Turtle.canvas.resetTransform(Turtle.canvas);
    });
    document.getElementById("zoomInClipPath").addEventListener("click", function() {
        Turtle.canvas.zoom(5, Turtle.canvas);
    });
    document.getElementById("zoomOutClipPath").addEventListener("click", function() {
        Turtle.canvas.zoom(-5, Turtle.canvas);
    });

    Turtle.reset();
    Turtle.display();

    BotlyAPI.changeTabEvents[Turtle.pluginID] = Turtle.changeTabEvent;
    BotlyAPI.renderContents[Turtle.pluginID] = Turtle.renderCode;

    Turtle.changeTabEvent();
};

Turtle.changeTabEvent = function() {
    BotlyAPI.resetPluginButtons();
    BotlyAPI.addFloatingButtons("brush", Turtle.executeNormal);
    BotlyAPI.addFloatingButtons("mdi-eraser", Turtle.reset);
    BotlyAPI.addFloatingButtons("fast_forward", Turtle.executeFast);
    BotlyAPI.addFloatingButtons("photo", Turtle.saveCanvas);
    BotlyAPI.setPluginButtons();
}

Turtle.renderCode = function() {

}

Turtle.display = function() {

    var w = Turtle.width,
        h = Turtle.height;

    var ctx = Turtle.canvas.getContext('turtle');
    Turtle.canvas.getLayer('turtle').clear();
    // Make the turtle the colour of the pen.
    // ctx.strokeStyle = penCtx.strokeStyle;
    // ctx.fillStyle = penCtx.fillStyle;
    ctx.strokeStyle = '#EA7D00';
    ctx.fillStyle = '#EA7D00';

    // Draw the turtle body.
    var radius = 10 * Turtle.penCtx.lineWidth;
    ctx.beginPath();
    ctx.arc(Turtle.x, Turtle.y, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw the turtle head.
    var WIDTH = 0.3;
    var HEAD_TIP = 10;
    var ARROW_TIP = 4;
    var BEND = 6;
    var radians = 2 * Math.PI * Turtle.heading / 360;
    var tipX = Turtle.x + (radius + HEAD_TIP) * Math.sin(radians);
    var tipY = Turtle.y - (radius + HEAD_TIP) * Math.cos(radians);
    radians -= WIDTH;
    var leftX = Turtle.x + (radius + ARROW_TIP) * Math.sin(radians);
    var leftY = Turtle.y - (radius + ARROW_TIP) * Math.cos(radians);
    radians += WIDTH / 2;
    var leftControlX = Turtle.x + (radius + BEND) * Math.sin(radians);
    var leftControlY = Turtle.y - (radius + BEND) * Math.cos(radians);
    radians += WIDTH;
    var rightControlX = Turtle.x + (radius + BEND) * Math.sin(radians);
    var rightControlY = Turtle.y - (radius + BEND) * Math.cos(radians);
    radians += WIDTH / 2;
    var rightX = Turtle.x + (radius + ARROW_TIP) * Math.sin(radians);
    var rightY = Turtle.y - (radius + ARROW_TIP) * Math.cos(radians);
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.bezierCurveTo(leftControlX, leftControlY,
        rightControlX, rightControlY, rightX, rightY);
    ctx.closePath();
    ctx.fill();

    Turtle.canvas.render();
}

Turtle.reset = function() {

    var w = Turtle.width,
        h = Turtle.height;

    // Starting location and heading of the turtle.

    Turtle.x = Turtle.width / 2;
    Turtle.y = Turtle.height / 2;
    Turtle.heading = 0;
    Turtle.penDownValue = true;
    Turtle.visible = true;
    Turtle.canvas.clear();
    // Clear the canvas.
    Turtle.penCtx.strokeStyle = '#525252';
    Turtle.penCtx.fillStyle = '#525252';
    Turtle.penCtx.lineWidth = 1;
    Turtle.penCtx.lineCap = 'round';
    Turtle.penCtx.font = 'normal 18pt Arial';

    var ctx = Turtle.canvas.getContext('paper');
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h);

    var ctx = Turtle.canvas.getContext('grid');
    drawGrid(ctx, w, h);

    Turtle.display();

    // Kill all tasks.
    for (var i = 0; i < Turtle.pidList.length; i++) {
        window.clearTimeout(Turtle.pidList[i]);
    }
    Turtle.pidList.length = 0;
    Turtle.interpreter = null;
    BotlyAPI.downlightBlocks();

}

Turtle.saveCanvas = function() {
    var canvas = Turtle.canvas._cvs;
    Turtle.hideGrid();
    Turtle.hide();
    var img = canvas.toDataURL("image/png");
    var filename = document.getElementById("sketch_name").value;

    var pom = document.createElement('a');
    pom.setAttribute('href', img);
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
    Turtle.showGrid();
    Turtle.show();
}

Turtle.showGrid = function() {
    Turtle.canvas.getLayer('grid').show();
    Turtle.canvas.render();
}
Turtle.hideGrid = function() {
    Turtle.canvas.getLayer('grid').hide();
    Turtle.canvas.render();
}
Turtle.toggleGrid = function() {
    Turtle.canvas.getLayer('grid').toggle();
    Turtle.canvas.render();
}

Turtle.show = function() {
    Turtle.canvas.getLayer('turtle').show();
    Turtle.canvas.render();
}
Turtle.hide = function() {
    Turtle.canvas.getLayer('turtle').hide();
    Turtle.canvas.render();
}
Turtle.toggle = function() {
    Turtle.canvas.getLayer('turtle').toggle();
    Turtle.canvas.render();
}


function drawGrid(context, w, h) {
    // Box width
    var bw = w;
    // Box height
    var bh = h;
    // Padding
    var p = 50;

    for (var x = 0; x <= bw - 50; x += 50) {
        context.moveTo(0 + x + p, p);
        context.lineTo(0 + x + p, bh - p);
    }

    for (var x = 0; x <= bh - 50; x += 50) {
        context.moveTo(p, 0 + x + p);
        context.lineTo(bw - p, 0 + x + p);
    }
    context.strokeStyle = "#e8e8e8";
    context.lineWidth = 2;
    context.stroke();
}




Turtle.initInterpreter = function(interpreter, scope) {
    // API
    var wrapper;
    wrapper = function(distance, id) {
        Turtle.move(distance, id);
    };
    interpreter.setProperty(scope, 'avancer',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(distance, id) {
        Turtle.move(-distance, id);
    };
    interpreter.setProperty(scope, 'reculer',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(angle, id) {
        Turtle.turn(angle, id);
    };
    interpreter.setProperty(scope, 'droite',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(angle, id) {
        Turtle.turn(-angle, id);
    };
    interpreter.setProperty(scope, 'gauche',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(id) {
        Turtle.penDown(false, id);
    };
    interpreter.setProperty(scope, 'leverCrayon',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
        Turtle.penDown(true, id);
    };
    interpreter.setProperty(scope, 'poserCrayon',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(angle, distance, id) {
        Turtle.turnGo(angle, distance, id);
    };
    interpreter.setProperty(scope, 'turnGo',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(width, id) {
        Turtle.penWidth(width);
    };
    interpreter.setProperty(scope, 'penWidth',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(colour) {
        Turtle.penColour(colour);
    };
    interpreter.setProperty(scope, 'penColour',
        interpreter.createNativeFunction(wrapper));

    wrapper = function() {
        Turtle.isVisible(false);
    };
    interpreter.setProperty(scope, 'hideTurtle',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
        Turtle.isVisible(true);
    };
    interpreter.setProperty(scope, 'showTurtle',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(text) {
        Turtle.drawPrint(text);
    };
    interpreter.setProperty(scope, 'print',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(font, size, style) {
        Turtle.drawFont(font, size, style);
    };
    interpreter.setProperty(scope, 'font',
        interpreter.createNativeFunction(wrapper));

    wrapper = function() {
        console.log("Not implemented");
    };
    interpreter.setProperty(scope, 'none',
        interpreter.createNativeFunction(wrapper));
};


/**
 * Execute the user's code.  Heaven help us...
 */
Turtle.execute = function() {
    Turtle.reset();
    if (!('Interpreter' in window)) {
        // Interpreter lazy loads and hasn't arrived yet.  Try again later.
        setTimeout(Turtle.execute, 250);
        return;
    }


    Blockly.selected && Blockly.selected.unselect();
    var code = BotlyAPI.getCode('Javascript');
    Turtle.interpreter = new Interpreter(code, Turtle.initInterpreter);
    Turtle.pidList.push(setTimeout(Turtle.executeChunk_, 80));
};



Turtle.executeFast = function() {
    Turtle.fastMode = true;
    Turtle.execute();
}

Turtle.executeNormal = function() {
    Turtle.fastMode = false;
    Turtle.execute();
}


Turtle.map = function(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};


/**
 * Execute a bite-sized chunk of the user's code.
 * @private
 */

Turtle.executeChunk_ = function() {
    var loopCount = 0;
    // All tasks should be complete now.  Clean up the PID list.
    BotlyAPI.downlightBlocks();
    Turtle.pidList.length = 0;
    var stepSpeed = Turtle.speedSlider.getValue();
    Turtle.pause = Turtle.map(stepSpeed, 0, 1, 20, 0) + 1;
    var go;
    do {
        try {
            go = Turtle.interpreter.step();
        } catch (e) {
            // User error, terminate in shame.
            alert(e);
            go = false;
        }
        if (go && Turtle.pause && !Turtle.fastMode) {
            // The last executed command requested a pause.
            go = false;
            Turtle.pidList.push(
                setTimeout(Turtle.executeChunk_, Turtle.pause));
        } else if (go && Turtle.pause && Turtle.fastMode) {
            if (loopCount < 10000) {
                loopCount++;
            } else {
                BotlyAPI.downlightBlocks();
                loopCount = 0;
                M.toast({ html: 'Botly-Studio à arreté une simulation infini' })
                return;
            }
        }
    } while (go);
    // Wrap up if complete.
    if (!Turtle.pause) {
        // Image complete; allow the user to submit this image to Reddit.
        Turtle.canSubmit = true;
    }
};


/**
 * Highlight a block and pause.
 * @param {string=} id ID of block.
 */
Turtle.animate = function(id) {
    Turtle.display();
    if (id) {
        BotlyAPI.highlightBlock(id);
        // Scale the speed non-linearly, to give better precision at the fast end.
        var stepSpeed = 1000 * Math.pow(1 - Turtle.speedSlider.getValue(), 2);
        Turtle.pause = Math.max(1, stepSpeed);
    }
};


/**
 * Move the turtle forward or backward.
 * @param {number} distance Pixels to move.
 * @param {string=} id ID of block.
 */
Turtle.move = function(distance, id) {
    if (Turtle.penDownValue) {
        Turtle.penCtx.beginPath();
        Turtle.penCtx.moveTo(Turtle.x, Turtle.y);
    }
    if (distance) {
        Turtle.x += distance * Turtle.factor * Math.sin(2 * Math.PI * Turtle.heading / 360);
        Turtle.y -= distance * Turtle.factor * Math.cos(2 * Math.PI * Turtle.heading / 360);
        var bump = 0;
    } else {
        // WebKit (unlike Gecko) draws nothing for a zero-length line.
        var bump = 0.1;
    }
    if (Turtle.penDownValue) {
        Turtle.penCtx.lineTo(Turtle.x, Turtle.y + bump);
        Turtle.penCtx.stroke();
    }
    Turtle.animate(id);
};



/**
 * Turn the turtle left or right.
 * @param {number} angle Degrees to turn clockwise.
 * @param {string=} id ID of block.
 */
Turtle.turn = function(angle, id) {
    Turtle.heading += angle;
    Turtle.heading %= 360;
    if (Turtle.heading < 0) {
        Turtle.heading += 360;
    }
    Turtle.animate(id);
};


Turtle.turnGo = function(angle, distance, id) {
    Turtle.turn(angle);
    Turtle.move(distance);
}

/**
 * Lift or lower the pen.
 * @param {boolean} down True if down, false if up.
 * @param {string=} id ID of block.
 */
Turtle.penDown = function(down, id) {
    Turtle.penDownValue = down;
    Turtle.animate(id);
};

/**
 * Change the thickness of lines.
 * @param {number} width New thickness in pixels.
 * @param {string=} id ID of block.
 */
Turtle.penWidth = function(width, id) {
    Turtle.penCtx.lineWidth = width;
    Turtle.animate(id);
};

/**
 * Change the colour of the pen.
 * @param {string} colour Hexadecimal #rrggbb colour string.
 * @param {string=} id ID of block.
 */
Turtle.penColour = function(colour, id) {
    Turtle.penCtx.strokeStyle = colour;
    Turtle.penCtx.fillStyle = colour;
    Turtle.animate(id);
};

/**
 * Make the turtle visible or invisible.
 * @param {boolean} visible True if visible, false if invisible.
 * @param {string=} id ID of block.
 */
Turtle.isVisible = function(visible, id) {
    Turtle.visible = visible;
    Turtle.animate(id);
};

/**
 * Print some text.
 * @param {string} text Text to print.
 * @param {string=} id ID of block.
 */
Turtle.drawPrint = function(text, id) {
    Turtle.penCtx.save();
    Turtle.penCtx.translate(Turtle.x, Turtle.y);
    Turtle.penCtx.rotate(2 * Math.PI * (Turtle.heading - 90) / 360);
    Turtle.penCtx.fillText(text, 0, 0);
    Turtle.penCtx.restore();
    Turtle.animate(id);
};

/**
 * Change the typeface of printed text.
 * @param {string} font Font name (e.g. 'Arial').
 * @param {number} size Font size (e.g. 18).
 * @param {string} style Font style (e.g. 'italic').
 * @param {string=} id ID of block.
 */
Turtle.drawFont = function(font, size, style, id) {
    Turtle.penCtx.font = style + ' ' + size + 'pt ' + font;
    Turtle.animate(id);
};



/**
 * Determine if this event is unwanted.
 * @param {!Event} e Mouse or touch event.
 * @return {boolean} True if spam.
 */
Turtle.eventSpam = function(e) {
    // Touch screens can generate 'touchend' followed shortly thereafter by
    // 'click'.  For now, just look for this very specific combination.
    // Some devices have both mice and touch, but assume the two won't occur
    // within two seconds of each other.
    var touchMouseTime = 2000;
    if (e.type == 'click' &&
        Turtle.eventSpam.previousType_ == 'touchend' &&
        Turtle.eventSpam.previousDate_ + touchMouseTime > Date.now()) {
        e.preventDefault();
        e.stopPropagation();
        return true;
    }
    // Users double-click or double-tap accidentally.
    var doubleClickTime = 400;
    if (Turtle.eventSpam.previousType_ == e.type &&
        Turtle.eventSpam.previousDate_ + doubleClickTime > Date.now()) {
        e.preventDefault();
        e.stopPropagation();
        return true;
    }
    Turtle.eventSpam.previousType_ = e.type;
    Turtle.eventSpam.previousDate_ = Date.now();
    return false;
};