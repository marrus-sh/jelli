/* jslint asi:true, browser:true */
/* globals System */

var Jo = {
    ctrl: {
        active: {
            actn: false,
            dnrw: false,
            exit: false,
            lfrw: false,
            look: false,
            menu: false,
            rtrw: false,
            selc: false,
            strt: false,
            uprw: false
        },
        key: {
            0x25: "lfrw",
            0x26: "uprw",
            0x27: "rtrw",
            0x28: "dnrw",
            0x41: "menu",
            0x51: "strt",
            0x53: "look",
            0x57: "selc",
            0x58: "actn",
            0x5A: "exit",
            A: "menu",
            a: "menu",
            ArrowDown: "dnrw",
            ArrowLeft: "lfrw",
            ArrowRight: "rtrw",
            ArrowUp: "uprw",
            Down: "dnrw",
            KeyA: "menu",
            KeyQ: "strt",
            KeyS: "look",
            KeyW: "selc",
            KeyX: "actn",
            KeyZ: "exit",
            Left: "lfrw",
            Q: "strt",
            q: "strt",
            Right: "rtrw",
            S: "look",
            s: "look",
            "U+0041": "menu",
            "U+0051": "strt",
            "U+0053": "look",
            "U+0057": "selc",
            "U+0058": "actn",
            "U+005A": "exit",
            Up: "uprw",
            W: "selc",
            w: "selc",
            X: "actn",
            x: "actn",
            Z: "exit",
            z: "exit",
        }
    },
    handleEvent: undefined,
    init: undefined,
    logic: undefined,
    render: undefined,
    setup: undefined,
    scrn: {
        button: 32,
        border: 24,
        width: 256,
        height: 192,
        layout: undefined,
        resized: true,
    },
    system: undefined
}

Jo.handleEvent = function(e) {

    var k;

    switch (e.type) {

        case "keydown":
            document.documentElement.removeAttribute("data-jo-ctls-visible");
            if (!document.documentElement.dataset.joLayout) {
                Jo.setup();
                break;
            }
            k = e.code || e.key || e.keyIdentifier || e.keyCode;
            if (Jo.ctrl.key[k]) {
                Jo.ctrl.active[Jo.ctrl.key[k]] = true;
            }
            else if (k === "Tab" || k === "U+0009" || k === 0x09) {
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

        case "keyup":
            k = e.code || e.key || e.keyIdentifier || e.keyCode;
            if (Jo.ctrl.key[k]) Jo.ctrl.active[Jo.ctrl.key[k]] = false;
            break;

        case "resize":
            Jo.scrn.resized = true;
            break;

        case "touchstart":
            document.documentElement.setAttribute("data-jo-ctls-visible", "");
            if (!document.documentElement.dataset.joLayout) {
                Jo.setup();
                break;
            }
            if (e.target.id.substr(0, 8) === "jo-ctrl-") Jo.ctrl.active[e.target.id.substr(8)] = true;
            break;

        case "touchend":
            if (e.target.id.substr(0, 8) === "jo-ctrl-") Jo.ctrl.active[e.target.id.substr(8)] = false;
            break;

    }

}

Jo.init = function() {

    if (typeof System === "undefined" || !System) throw new Error("(jo.js) System module not loaded");

    Jo.system = new System("2d", "2d");

    Jo.system.canvases[0].height = Jo.scrn.height;
    Jo.system.canvases[1].height = Jo.scrn.height;
    Jo.system.canvases[0].width = Jo.scrn.width;
    Jo.system.canvases[1].width = Jo.scrn.width;
    document.getElementById("jo-scrn-tp").appendChild(Jo.system.canvases[0]);
    document.getElementById("jo-scrn-bt").appendChild(Jo.system.canvases[1]);

    //  Adding event listeners:

    window.addEventListener("keydown", Jo, false);
    window.addEventListener("keyup", Jo, false);
    window.addEventListener("resize", Jo, false);
    window.addEventListener("touchstart", Jo, false);
    window.addEventListener("touchend", Jo, false);

}

Jo.scrn.layout = function() {

    //  Variable setup:

    var bdy_h = window.innerHeight - 4 * Jo.scrn.border;
    var bdy_w = window.innerWidth - 4 * Jo.scrn.border;
    var uni_h = Jo.scrn.height;
    var uni_w = Jo.scrn.width;
    var scr_h;
    var scr_w;
    var tmp_h;
    var tmp_w;
    var ctl_d;

    if (document.documentElement.hasAttribute("data-jo-ctls-visible")) ctl_d = Jo.scrn.button * 3;
    else ctl_d = 0;

    //  Wide layout:

    if (bdy_w > 2 * uni_w * bdy_h / uni_h) {

        //  Initial width and height setup:

        bdy_h = window.innerHeight - 2 * Jo.scrn.border;
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

        bdy_w = window.innerWidth - 2 * Jo.scrn.border;
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

    Jo.system.canvases[0].style.width = scr_w + "px";
    Jo.system.canvases[0].style.height = scr_h + "px";
    Jo.system.canvases[1].style.width = scr_w + "px";
    Jo.system.canvases[1].style.height = scr_h + "px";

}

Jo.logic = function() {

}

Jo.render = function() {

    var k;

    if (Jo.scrn.resized) Jo.scrn.layout();

    for (k in Jo.ctrl.active) {
        if (Jo.ctrl.active[k]) document.getElementById("jo-ctrl-" + k).setAttribute("data-jo-ctrl-active", "");
        else document.getElementById("jo-ctrl-" + k).removeAttribute("data-jo-ctrl-active");
    }

    window.requestAnimationFrame(Jo.render);

}

Jo.setup = function() {

    //  Calling logic and render functions:

    Jo.logic();
    Jo.render();

}

window.addEventListener("load", Jo.init, false);
