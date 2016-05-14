/* jshint asi:true, browser:true */
/* globals System, Control, Sheet, Letters, Character, Tiles */
/* jshint elision:true */

/*

#  jo.js: A Video Game  #

Requires: system.js, control.js, sheet.js

*/

//  All inside an anonymous function for strictness and proper closure

(function () {

    "use strict";

    var background;
    var character_sheet;
    var characters = [];
    var control;
    var direction = Object.create(null, {
        DOWN: {value: 0},
        LEFT: {value: 1},
        UP: {value: 2},
        RIGHT: {value: 3}
    });
    var foreground;
    var letters;
    var mainground;
    var map = "AQEBAQEBAQEBMQEBAQEBAQEBAQEBAQEBATEBAQEBAQEBAQEBAQEBATU3NAEBAQEBMDAwMDAwMDA6ATgwMDABAQEBAQEBAQEBMzkyAQEBAQEBAQEBAQEBAQExAQEBAQEBAQEBAQEBAQEBMQEBAQEBAQEBAQEBAQEBATEBAQEBAQEBAQEBATMwMDA6AQEBAQEBAQEBAQEBAQEBMQEBAQEBAQ==";
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
    var settings = Object.create(null, {
        BUTTON_AREA: {value: 75},
        LETTER_WIDTH: {value: 4},
        LETTER_HEIGHT: {value: 7},
        SCREEN_BORDER: {value: 8},
        SCREEN_WIDTH: {value: 250},
        SCREEN_HEIGHT: {value: 160},
        SPRITE_HEIGHT: {value: 16},
        SPRITE_WIDTH: {value: 16},
        SPRITES_WIDE: {value: 16},
        VIEWPORT_X: {value: 3},
        VIEWPORT_Y: {value: 0}
    });
    var structures;
    var system;
    var textground;
    var tiles;

    //  Draw functions:

    function drawBackground() {

        //  Drawing the background:

        tiles.drawMap(background.context, map, -settings.VIEWPORT_X, -settings.VIEWPORT_Y, settings.SPRITE_WIDTH, settings.SPRITE_HEIGHT, settings.SPRITES_WIDE);

    }

    function drawText() {

        letters.setColor(palette.YELLOW);
        letters.createBlock(
            "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x49\x0A\x0B\x0C\x0D\x0E\x0F",
            "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x49\x1A\x1B\x1C\x1D\x1E\x1F",
            "\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x49\x2A\x2B\x2C\x2D\x2E\x2F",
            "\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x49\x3A\x3B\x3C\x3D\x3E\x3F",
            "\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x49\x4A\x4B\x4C\x4D\x4E\x4F",
            "",
            "\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x49\x5A\x5B\x5C\x5D\x5E\x5F",
            "\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x49\x6A\x6B\x6C\x6D\x6E\x6F",
            "\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x49\x7A\x7B\x7C\x7D\x7E\x7F",
            "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x49\x8A\x8B\x8C\x8D\x8E\x8F",
            "\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x49\x9A\x9B\x9C\x9D\x9E\x9F",
            "",
            "\xA0\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\x49\xAA\xAB\xAC\xAD\xAE\xAF",
            "\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\x49\xBA\xBB\xBC\xBD\xBE\xBF",
            "\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\x49\xCA\xCB\xCC\xCD\xCE\xCF",
            "\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\x49\xDA\xDB\xDC\xDD\xDE\xDF",
            "\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\x49\xEA\xEB\xEC\xED\xEE\xEF",
            "",
            "\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\x49\xFA\xFB\xFC\xFD\xFE\xFF"
        ).draw(textground.context, 0, 0);

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
        if (typeof Sheet === "undefined" || !Sheet) throw new Error("(jo.js) Sheet module not loaded");
        if (typeof Letters === "undefined" || !Letters) throw new Error("(jo.js) Letters module not loaded");
        if (typeof Character === "undefined" || !Character) throw new Error("(jo.js) Character module not loaded");
        if (typeof Tiles === "undefined" || !Tiles) throw new Error("(jo.js) Tiles module not loaded");

        //  System setup:

        system = new System("2d", "2d", "2d", "2d");

        background = system.screens[0];
        mainground = system.screens[1];
        foreground = system.screens[2];
        textground = system.screens[3];

        textground.canvas.height = foreground.canvas.height = mainground.canvas.height = background.canvas.height = settings.SCREEN_HEIGHT;
        textground.canvas.width = foreground.canvas.width = mainground.canvas.width = background.canvas.width = settings.SCREEN_WIDTH;

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

        character_sheet = new Sheet(document.getElementById("jo-characters"), settings.SPRITE_WIDTH, settings.SPRITE_HEIGHT);

        //  Letter setup:

        letters = new Letters(document.getElementById("jo-letters"), settings.LETTER_WIDTH, settings.LETTER_HEIGHT);

        //  Tiles setup:

        tiles = new Tiles(new Sheet(document.getElementById("jo-tiles"), settings.SPRITE_WIDTH, settings.SPRITE_HEIGHT), document.getElementById("jo-tiles").dataset.joCollisions, Sheet.drawSheetAtIndex);

        //  Adding event listeners:

        document.body.addEventListener("touchmove", function (e) {e.preventDefault();}, false);
        window.addEventListener("keydown", handleEvent, false);
        window.addEventListener("resize", handleEvent, false);
        window.addEventListener("touchstart", handleEvent, false);

    }

    //  Layout:

    function layout() {

        //  Variable setup:

        var body_height = document.body.clientHeight - 2 * settings.SCREEN_BORDER;
        var body_width = document.body.clientWidth - 2 * settings.SCREEN_BORDER;
        var button_area;
        var i;
        var scaled_height;
        var scaled_width;
        var temporary_height;
        var temporary_width;

        if (document.documentElement.hasAttribute("data-jo-touch")) button_area = settings.BUTTON_AREA;
        else button_area = 0;

        //  Controls:

        if (body_width / body_height > settings.SCREEN_WIDTH / settings.SCREEN_HEIGHT) {
            document.documentElement.dataset.joLayout = "horizontal";
            body_width -= 2 * button_area;
        }
        else {
            document.documentElement.dataset.joLayout = "vertical";
            body_height -= button_area;
        }

        //  Sizing:

        if (body_width / body_height > settings.SCREEN_WIDTH / settings.SCREEN_HEIGHT) {
            if (body_height < settings.SCREEN_HEIGHT) scaled_height = body_height;
            else scaled_height = settings.SCREEN_HEIGHT * Math.floor(body_height / settings.SCREEN_HEIGHT);
            scaled_width = Math.floor(settings.SCREEN_WIDTH * scaled_height / settings.SCREEN_HEIGHT);
        }
        else {
            if (body_width < settings.SCREEN_WIDTH) scaled_width = body_width;
            else scaled_width = settings.SCREEN_WIDTH * Math.floor(body_width / settings.SCREEN_WIDTH);
            scaled_height = Math.floor(settings.SCREEN_HEIGHT * scaled_width / settings.SCREEN_WIDTH);
        }

        //  Applying layout:

        for (i = 0; i < system.canvases.length; i++) {
            system.canvases[i].style.width = scaled_width + "px";
            system.canvases[i].style.height = scaled_height + "px";
            if (document.documentElement.dataset.joLayout === "vertical") system.canvases[i].style.top = "calc(50% - " + (scaled_height / 2 + settings.SCREEN_BORDER + button_area / 2) + "px)";
            else system.canvases[i].style.top = "calc(50% - " + (scaled_height / 2 + settings.SCREEN_BORDER) + "px)";
            system.canvases[i].style.left = "calc(50% - " + (scaled_width / 2 + settings.SCREEN_BORDER) + "px)";
        }

        //  Set resized equal to false:

        resized = false;

    }

    //  Logic function:

    function logic() {

        characters[0].step();

        window.setTimeout(logic, 1000/60);

    }

    //  Rendering function:

    function render() {

        if (resized) {
            layout();
            drawBackground();
            drawText();
        }

        //  Mainground drawing:

        mainground.context.clearRect(0, 0, mainground.canvas.width, mainground.canvas.height);
        characters[0].draw(mainground.context, characters[0].data.frame);

        window.requestAnimationFrame(render);

    }

    //  Setup function:

    function setup() {

        characters[0] = new Character([
            character_sheet.getSprite(0, 2),
            character_sheet.getSprite(2, 2),
            character_sheet.getSprite(4, 2),
            character_sheet.getSprite(6, 2)
        ], 0, 0, direction.DOWN, function () {
            if (control.isActive("up")) {
                this.dir = direction.UP;
                this.y--;
            }
            if (control.isActive("down")) {
                this.dir = direction.DOWN;
                this.y++;
            }
            if (control.isActive("left")) {
                this.dir = direction.LEFT;
                this.x--;
            }
            if (control.isActive("right")) {
                this.dir = direction.RIGHT;
                this.x++;
            }
            if (control.isActive("up") || control.isActive("down") || control.isActive("left") || control.isActive("right")) {
                this.data.timer++;
                if (!(this.data.timer %= 15)) this.frame = ++this.frame % 2;
            }
        }, Sheet.draw, {
            frame: 0,
            timer: 0
        });

        logic();

        window.requestAnimationFrame(render);

    }

    //  Add load listener:

    window.addEventListener("load", init, false);

})();
