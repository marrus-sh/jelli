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
    var scrn = {
        button: 32,
        border: 24,
        width: 250,
        height: 160,
        resized: true,
    }
    var system;

    //  Event handling:

    function handleEvent(e) {

        var k;

        switch (e.type) {

            case "keydown":
                k = e.code || e.key || e.keyIdentifier || e.keyCode;
                if (document.documentElement.hasAttribute("data-jo-ctls-visible")) {
                    document.documentElement.removeAttribute("data-jo-ctls-visible");
                    scrn.resized = true;
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
                scrn.resized = true;
                break;

            case "touchstart":
                if (!document.documentElement.hasAttribute("data-jo-ctls-visible")) {
                    document.documentElement.setAttribute("data-jo-ctls-visible", "");
                    scrn.resized = true;
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

        system.canvases[0].height = scrn.height;
        system.canvases[1].height = scrn.height;
        system.canvases[0].width = scrn.width;
        system.canvases[1].width = scrn.width;
        document.getElementById("jo-scrn-tp").appendChild(system.canvases[0]);
        document.getElementById("jo-scrn-bt").appendChild(system.canvases[1]);

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

        var bdy_h = window.innerHeight - 4 * scrn.border;
        var bdy_w = window.innerWidth - 4 * scrn.border;
        var uni_h = scrn.height;
        var uni_w = scrn.width;
        var scr_h;
        var scr_w;
        var tmp_h;
        var tmp_w;
        var ctl_d;

        if (document.documentElement.hasAttribute("data-jo-ctls-visible")) ctl_d = scrn.button * 3;
        else ctl_d = 0;

        //  Wide layout:

        if (bdy_w > 2 * uni_w * bdy_h / uni_h) {

            //  Initial width and height setup:

            bdy_h = window.innerHeight - 2 * scrn.border;
            if (bdy_h < uni_h) scr_h = bdy_h;
            else scr_h = uni_h * Math.floor(bdy_h / uni_h);
            scr_w = Math.floor(uni_w * scr_h / uni_h);
            if (bdy_w / 2 < scr_w) {
                if (bdy_w < 2 * uni_w) scr_w = Math.floor(bdy_w / 2);
                else scr_w = uni_w * Math.floor(bdy_w / (2 * uni_w));
                scr_h = Math.floor(uni_h * scr_w / uni_w);
            }

            //  Choosing layout and finalizing sizes:

            if (bdy_h === scr_h || bdy_w - (scr_w * 2) > ctl_d) {
                document.documentElement.dataset.joLayout = "4";
                tmp_w = bdy_w - ctl_d;
                if (tmp_w / 2 < scr_w) {
                    if (tmp_w < 2 * uni_w) scr_w = Math.floor(tmp_w / 2);
                    else scr_w = uni_w * Math.floor(tmp_w / (2 * uni_w));
                    scr_h = Math.floor(uni_h * scr_w / uni_w);
                }
            }

            else {
                document.documentElement.dataset.joLayout = "3";
                tmp_h = bdy_h - ctl_d;
                if (tmp_h < scr_h) {
                    if (tmp_h < uni_h) scr_h = tmp_h;
                    else scr_h = uni_h * Math.floor(tmp_h / uni_h);
                    scr_w = Math.floor(uni_w * scr_h / uni_h);
                }
            }

        }

        //  Narrow layout:

        else {

            //  Initial width and height setup:

            bdy_w = window.innerWidth - 2 * scrn.border;
            if (bdy_w < uni_w) scr_w = bdy_w;
            else scr_w = uni_w * Math.floor(bdy_w / uni_w);
            scr_h = Math.floor(uni_h * scr_w / uni_w);
            if (bdy_h / 2 < scr_h) {
                if (bdy_h < 2 * uni_h) scr_h = Math.floor(bdy_h / 2);
                else scr_h = uni_h * Math.floor(bdy_h / (2 * uni_h));
                scr_w = Math.floor(uni_w * scr_h / uni_h);
            }

            //  Choosing layout and finalizing sizes:

            if (bdy_w === scr_w || bdy_h - (scr_h * 2) > ctl_d) {
                document.documentElement.dataset.joLayout = "2";
                tmp_h = bdy_h - ctl_d;
                if (tmp_h / 2 < scr_h) {
                    if (tmp_h < 2 * uni_h) scr_h = Math.floor(tmp_h / 2);
                    else scr_h = uni_h * Math.floor(tmp_h / (2 * uni_h));
                    scr_w = Math.floor(uni_w * scr_h / uni_h);
                }
            }

            else {
                document.documentElement.dataset.joLayout = "1";
                tmp_w = bdy_w - uni_h;
                if (tmp_w < scr_w) {
                    if (tmp_w < uni_w) scr_w = tmp_w;
                    else scr_w = uni_w * Math.floor(tmp_w / uni_w);
                    scr_h = Math.floor(uni_h * scr_w / uni_w);
                }
            }

        }

        //  Applying layout:

        system.canvases[0].style.width = scr_w + "px";
        system.canvases[0].style.height = scr_h + "px";
        system.canvases[1].style.width = scr_w + "px";
        system.canvases[1].style.height = scr_h + "px";

    }

    function logic() {

    }

    function render() {

        if (scrn.resized) layout();

        window.requestAnimationFrame(render);

    }

    function setup() {

        logic();

        window.requestAnimationFrame(render);

    }

    window.addEventListener("load", init, false);

})();
