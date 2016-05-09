/* jslint asi:true, browser:true */

var Jo = {
    init: undefined,
    layout: undefined,
    logic: undefined,
    render: undefined,
    setup: undefined,
    window: {
        button: {
            d: 32
        },
        resized: true,
        screen: {
            b: 16,
            w: 256,
            h: 192
        }
    }
}

Jo.init = function() {

    Jo.setup();

}

Jo.layout = function() {

    //  Variable setup:

    var bdy_h = window.innerHeight - 4 * Jo.window.screen.b;
    var bdy_w = window.innerWidth - 4 * Jo.window.screen.b;
    var uni_h = Jo.window.screen.h;
    var uni_w = Jo.window.screen.w;
    var scr_h;
    var scr_w;
    var tmp_h;
    var tmp_w;
    var ctl_d;

    if (typeof document.documentElement.dataset.joCtlsVisible !== "undefined") ctl_d = Jo.window.button.d * 3;
    else ctl_d = 0;

    //  Wide layout:

    if (bdy_w > 2 * uni_w * bdy_h / uni_h) {

        //  Initial width and height setup:

        bdy_h = window.innerHeight - 2 * Jo.window.screen.b;
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

        bdy_w = window.innerWidth - 2 * Jo.window.screen.b;
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

    document.getElementById("jo-cnvs-tp").style.width = scr_w + "px";
    document.getElementById("jo-cnvs-tp").style.height = scr_h + "px";
    document.getElementById("jo-cnvs-bt").style.width = scr_w + "px";
    document.getElementById("jo-cnvs-bt").style.height = scr_h + "px";

}

Jo.logic = function() {

}

Jo.render = function() {

    if (Jo.window.resized) Jo.layout();

    window.requestAnimationFrame(Jo.render);

}

Jo.setup = function() {

    window.addEventListener("resize", function(){Jo.window.resized = true}, false);

    Jo.logic();
    Jo.render();

}

window.addEventListener("load", Jo.init, false);
