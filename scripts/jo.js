/* jshint asi:true, browser:true */
/* globals System, Control, Sheet */
/* jshint elision:true */

/*

#  jo.js: A Video Game  #

Requires: system.js, control.js, sheet.js

*/

//  All inside an anonymous function for strictness and proper closure

(function () {

    "use strict";

    var background;
    var control;
    var foreground;
    var letters;
    var mainground;
    var palette = Object.create(null, {
       TRANSPARENT: {value: "transparent"},
       BLACK: {value: "#000000"},
       DARKGREY: {value: "#4f4f4f"},
       GREY: {value: "#777777"},
       WHITE: {value: "#ffffff"},
       RED: {value: "#87372f"},
       CYAN: {value: "#47979f"},
       PURPLE: {value: "#8b3f97"},
       FOREST: {value: "#076323"},
       GREEN: {value: "#579f47"},
       DEEPBLUE: {value: "#002b57"},
       BLUE: {value: "#174b77"},
       YELLOW: {value: "#cbc35f"},
       ORANGE: {value: "#ab7349"},
       BROWN: {value: "#574300"},
       ROSE: {value: "#7f1f39"}
    });
    var resized = true;
    var settings = {
        button_size: 32,
        screen_border: 8,
        screen_width: 250,
        screen_height: 160,
    }
    var system;
    var textground;
    var tiles;

    //  Draw functions:

    function drawBackground() {

        //  Variable setup:

        var grass = tiles.getSprite(0x01);
        var i;

        //  Drawing the background:

        for (i = 0; i < 0x100; i++) {
            grass.draw(i % 0x10 * 0x10 - 3, Math.floor(i / 0x10) * 0x10);
        }

    }

    function drawText() {

        (new LetterString(letters,
                          0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x49, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, null,
                          0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x49, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, null,
                          0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x49, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F, null,
                          0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x49, 0x3A, 0x3B, 0x3C, 0x3D, 0x3E, 0x3F, null,
                          0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x49, 0x4A, 0x4B, 0x4C, 0x4D, 0x4E, 0x4F, null, null,
                          0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x49, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F, null,
                          0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x49, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F, null,
                          0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x49, 0x7A, 0x7B, 0x7C, 0x7D, 0x7E, 0x7F, null,
                          0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x49, 0x8A, 0x8B, 0x8C, 0x8D, 0x8E, 0x8F, null,
                          0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x49, 0x9A, 0x9B, 0x9C, 0x9D, 0x9E, 0x9F, null, null,
                          0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0x49, 0xAA, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF, null,
                          0xB0, 0xB1, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0x49, 0xBA, 0xBB, 0xBC, 0xBD, 0xBE, 0xBF, null,
                          0xC0, 0xC1, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0x49, 0xCA, 0xCB, 0xCC, 0xCD, 0xCE, 0xCF, null,
                          0xD0, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0x49, 0xDA, 0xDB, 0xDC, 0xDD, 0xDE, 0xDF, null,
                          0xE0, 0xE1, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0x49, 0xEA, 0xEB, 0xEC, 0xED, 0xEE, 0xEF, null, null,
                          0xF0, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0x49, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, 0xFF, null
                         )).draw(0, 0)

        opaqueFill(textground.context, palette.YELLOW);

    }

    //  Event handling:

    function handleEvent(e) {

        var k;

        switch (e.type) {

            case "keydown":
                k = e.code || e.key || e.keyIdentifier || e.keyCode;
                if (document.documentElement.hasAttribute("data-jo-touch")) {
                    document.documentElement.removeAttribute("data-jo-touch");
                    resized = true;
                }
                if (!document.documentElement.dataset.joLayout) {
                    setup();
                    break;
                }
                if (k === "Tab" || k === "U+0009" || k === 0x09) {
                    if (!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement)) {
                        if (document.body.requestFullscreen) document.body.requestFullscreen();
                        else if (document.body.mozRequestFullScreen) document.body.mozRequestFullScreen();
                        else if (document.body.webkitRequestFullscreen) document.body.webkitRequestFullscreen();
                        else if (document.body.msRequestFullscreen) document.body.msRequestFullscreen();
                    }
                    else {
                        if (document.exitFullscreen) document.exitFullscreen();
                        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                        else if (document.msExitFullscreen) document.msExitFullscreen();
                    }
                }
                break;

            case "resize":
                resized = true;
                break;

            case "touchstart":
                if (!document.documentElement.hasAttribute("data-jo-touch")) {
                    document.documentElement.setAttribute("data-jo-touch", "");
                    resized = true;
                }
                if (!document.documentElement.dataset.joLayout) {
                    setup();
                    break;
                }
                break;

        }

    }

    //  Initialization:

    function init() {

        //  Making sure modules are loaded:

        if (typeof System === "undefined" || !System) throw new Error("(jo.js) System module not loaded");
        if (typeof Control === "undefined" || !Control) throw new Error("(jo.js) Control module not loaded");

        //  System setup:

        system = new System("2d", "2d", "2d", "2d");

        background = system.screens[0];
        mainground = system.screens[1];
        foreground = system.screens[2];
        textground = system.screens[3];

        textground.canvas.height = foreground.canvas.height = mainground.canvas.height = background.canvas.height = settings.screen_height;
        textground.canvas.width = foreground.canvas.width = mainground.canvas.width = background.canvas.width = settings.screen_width;

        document.body.appendChild(background.canvas);
        document.body.appendChild(mainground.canvas);
        document.body.appendChild(foreground.canvas);
        document.body.appendChild(textground.canvas);

        //  Control setup:

        control = new Control(true);

        control.add("action").addKeys("action", 0x58, "U+0058", "KeyX", "X", "x").linkElement("action", "jo-ctrl-actn");
        control.add("down").addKeys("down", 0x28, "ArrowDown", "Down").linkElement("down", "jo-ctrl-dnrw");
        control.add("exit").addKeys("exit", 0x5A, "U+005A", "KeyZ", "Z", "z").linkElement("exit", "jo-ctrl-exit");
        control.add("left").addKeys("left", 0x25, "ArrowLeft", "Left").linkElement("left", "jo-ctrl-lfrw");
        control.add("look").addKeys("look", 0x53, "U+0053", "KeyS", "S", "s").linkElement("look", "jo-ctrl-look");
        control.add("menu").addKeys("menu", 0x41, "U+0041", "KeyA", "A", "a").linkElement("menu", "jo-ctrl-menu");
        control.add("right").addKeys("right", 0x27, "ArrowRight", "Right").linkElement("right", "jo-ctrl-rtrw");
        control.add("select").addKeys("select", 0x57, "U+0057", "KeyW", "W", "w").linkElement("select", "jo-ctrl-selc");
        control.add("start").addKeys("start", 0x51, "U+0051", "KeyQ", "Q", "q").linkElement("start", "jo-ctrl-strt");
        control.add("up").addKeys("up", 0x26, "ArrowUp", "Up").linkElement("up", "jo-ctrl-uprw");

        //  Sheet setup:

        tiles = new Sheet(background.context, document.getElementById("jo-tiles"), 16, 16);

        //  Letter setup:

        letters = new Letters(new Sheet(textground.context, document.getElementById("jo-letters"), 4, 7));

        //  Adding event listeners:

        document.body.addEventListener("touchmove", function (e) {e.preventDefault();}, false);
        window.addEventListener("keydown", handleEvent, false);
        window.addEventListener("resize", handleEvent, false);
        window.addEventListener("touchstart", handleEvent, false);

    }

    //  Layout:

    function layout() {

        //  Variable setup:

        var body_height = document.body.clientHeight - (2 * settings.screen_border);
        var body_width = document.body.clientWidth - (2 * settings.screen_border);
        var button_area;
        var i;
        var scaled_height;
        var scaled_width;
        var temporary_height;
        var temporary_width;

        if (document.documentElement.hasAttribute("data-jo-touch")) button_area = settings.button_size * 3;
        else button_area = 0;

        //  Controls:

        if (body_width / body_height > settings.screen_width / settings.screen_height) {
            document.documentElement.dataset.joLayout = "horizontal";
            body_width -= 2 * button_area;
        }
        else {
            document.documentElement.dataset.joLayout = "vertical";
            body_height -= button_area;
        }

        //  Sizing:

        if (body_width / body_height > settings.screen_width / settings.screen_height) {
            if (body_height < settings.screen_height) scaled_height = body_height;
            else scaled_height = settings.screen_height * Math.floor(body_height / settings.screen_height);
            scaled_width = Math.floor(settings.screen_width * scaled_height / settings.screen_height);
        }
        else {
            if (body_width < settings.screen_width) scaled_width = body_width;
            else scaled_width = settings.screen_width * Math.floor(body_width / settings.screen_width);
            scaled_height = Math.floor(settings.screen_height * scaled_width / settings.screen_width);
        }

        //  Applying layout:

        for (i = 0; i < system.canvases.length; i++) {
            system.canvases[i].style.width = scaled_width + "px";
            system.canvases[i].style.height = scaled_height + "px";
            system.canvases[i].style.top = "calc(50% - " + ((scaled_height / 2) + settings.screen_border) + "px)";
            system.canvases[i].style.left = "calc(50% - " + ((scaled_width / 2) + settings.screen_border) + "px)";
        }

        //  Set resized equal to false:

        resized = false;

    }

    function Letters(sheet) {

        //  Variable setup:

        var i;

        //  Handling arguments and error checking:

        if (!(sheet instanceof Sheet)) throw new Error("(jo.js) Cannot create letters – no sheet provided.");

        Object.defineProperties(this, {
            size: {
                value: sheet.size
            },
            sheet: {
                value: sheet
            }
        });
        for (i = 0; i < sheet.size; i++) {
            Object.defineProperty(this, i, {
                enumerable: true,
                value: sheet.getSprite(i)
            });
        }

    }

    Letters.prototype = Object.create(Object.prototype, {
        item: {
            value: function (i) {
                return this[i];
            }
        }
    });

    //  Logic function:

    function logic() {

    }

    //  Fills the opaque portions of a canvas with a single colour:

    function opaqueFill(context, colour) {
        context.globalCompositeOperation = "source-in";
        context.fillStyle = colour;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.globalCompositeOperation = "source-over";
    }

    //  Rendering function:

    function render() {

        if (resized) {
            layout();
            drawBackground();
            drawText();
        }

        window.requestAnimationFrame(render);

    }

    //  Setup function:

    function setup() {

        logic();

        window.requestAnimationFrame(render);

    }

    function LetterString(letters /*  Some amount of data  */) {

        //  Variable setup:

        var i;

        //  Handling arguments and error checking:

        if (!(letters instanceof Letters)) throw new Error("(jo.js) Cannot create string – no letters provided.");

        //  Define string:

        Object.defineProperties(this, {
            length: {
                value: arguments.length - 1
            },
            letters: {
                value: letters
            }
        });

        for (i = 1; i < arguments.length; i++) {
            if (arguments[i] === null) {
                Object.defineProperty(this, i - 1, {
                    enumerable: true,
                    value: null
                });
                continue;
            }
            else if (!(typeof arguments[i] === "number" || arguments[i] instanceof Number)) throw new Error("(jo.js) String arguments must be numerical indices or null.");
            else if (arguments[i] > letters.size) throw new Error("(jo.js) String index exceeds size of alphabet.");
            Object.defineProperty(this, i - 1, {
                enumerable: true,
                value: letters.item(arguments[i])
            });
        }

    }

    LetterString.prototype = Object.create(Object.prototype, {

        //  Draw string:

        draw: {
            value: function (x, y) {
                var i;
                var xi;
                if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(jo.js) Cannot draw string – coordinates must be numbers.");
                xi = x;
                for (i = 0; i < this.length; i++) {
                    if (this.item(i) === null) {
                        x = xi;
                        y += this.letters.sheet.sprite_height + 1;
                        continue;
                    }
                    else if (!(this.item(i) instanceof Sheet.Sprite)) throw new Error("(jo.js) String index did not resolve to a sprite.");
                    this.item(i).draw(x, y);
                    x += this.letters.sheet.sprite_width + 1;
                }
            }
        },

        //  Get letter:

        item: {
            value: function (i) {
                return this[i];
            }
        }

    });

    //  Add load listener:

    window.addEventListener("load", init, false);

})();
