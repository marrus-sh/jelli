/* jslint asi:true, browser:true */
/* globals System, Control */

/*

#  jo.js: A Video Game  #

Requires: system.js, control.js

*/

//  All inside an anonymous function for strictness and proper closure

(function () {

    "use strict";

    var control;
    var settings = {
        button_size: 32,
        screen_border: 8,
        screen_width: 250,
        screen_height: 160,
    }
    var resized = true;
    var system;

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

        system = new System("2d", "2d");

        system.canvases[0].height = settings.screen_height;
        system.canvases[0].width = settings.screen_width;
        system.canvases[1].height = settings.screen_height;
        system.canvases[1].width = settings.screen_width;
        document.body.appendChild(system.canvases[0]);
        document.body.appendChild(system.canvases[1]);

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
        var scaled_height;
        var scaled_width;
        var temporary_height;
        var temporary_width;
        var button_area;

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

        system.canvases[0].style.width = scaled_width + "px";
        system.canvases[0].style.height = scaled_height + "px";
        system.canvases[0].style.top = "calc(50% - " + ((scaled_height / 2) + settings.screen_border) + "px)";
        system.canvases[0].style.left = "calc(50% - " + ((scaled_width / 2) + settings.screen_border) + "px)";
        system.canvases[1].style.width = scaled_width + "px";
        system.canvases[1].style.height = scaled_height + "px";
        system.canvases[1].style.top = "calc(50% - " + ((scaled_height / 2) + settings.screen_border) + "px)";
        system.canvases[1].style.left = "calc(50% - " + ((scaled_width / 2) + settings.screen_border) + "px)";

    }

    function logic() {

    }

    function render() {

        if (resized) layout();

        window.requestAnimationFrame(render);

    }

    function setup() {

        logic();

        window.requestAnimationFrame(render);

    }

    window.addEventListener("load", init, false);

})();
