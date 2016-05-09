/* jslint asi:true, browser:true */

var Jo = {
    init: undefined,
    layout: undefined,
    logic: undefined,
    render: undefined,
    setup: undefined,
    window: {
        resized: true
    }
}

Jo.init = function() {

    Jo.setup();

}

Jo.layout = function() {

    //  Variable setup:

    var bdy_h = window.innerHeight;
    var bdy_w = window.innerWidth;
    var scr_h;
    var scr_w;
    var tmp_h;
    var tmp_w;
    var ctl_d;

    if (typeof document.documentElement.dataset.joCtlsVisible !== undefined) ctl_d = 192;
    else ctl_d = 0;

    //  Wide layout:

    if (bdy_w > 8 * bdy_h / 3) {

        //  Initial width and height setup:

        if (bdy_h < 192) scr_h = bdy_h;
        else scr_h = 192 * Math.floor(bdy_h / 192);
        scr_w = Math.floor(4 * scr_h / 3);
        if (bdy_w / 2 < scr_w) {
            if (bdy_w < 512) scr_w = Math.floor(bdy_w / 2);
            else scr_w = 256 * Math.floor(bdy_w / 512);
            scr_h = Math.floor(3 * scr_w / 4);
        }

        //  Choosing layout and finalizing sizes:

        if (bdy_h === scr_h || bdy_w - (scr_w * 2) > 192) {
            document.documentElement.dataset.joLayout = "4";
            tmp_w = bdy_w - 192;
            if (tmp_w / 2 < scr_w) {
                if (tmp_w < 512) scr_w = Math.floor(tmp_w / 2);
                else scr_w = 256 * Math.floor(tmp_w / 512);
                scr_h = Math.floor(3 * scr_w / 4);
            }
        }

        else {
            document.documentElement.dataset.joLayout = "3";
            tmp_h = bdy_h - 96;
            if (tmp_h < scr_h) {
                if (tmp_h < 192) scr_h = tmp_h;
                else scr_h = 192 * Math.floor(tmp_h / 192);
                scr_w = Math.floor(4 * scr_h / 3);
            }
        }

    }

    //  Narrow layout:

    else {

        //  Initial width and height setup:

        if (bdy_w < 256) scr_w = bdy_w;
        else scr_w = 256 * Math.floor(bdy_w / 256);
        scr_h = Math.floor(3 * scr_w / 4);
        if (bdy_h / 2 < scr_h) {
            if (bdy_h < 384) scr_h = Math.floor(bdy_h / 2);
            else scr_h = 192 * Math.floor(bdy_h / 384);
            scr_w = Math.floor(4 * scr_h / 3);
        }

        //  Choosing layout and finalizing sizes:

        if (bdy_w === scr_w || bdy_h - (scr_h * 2) > 192) {
            document.documentElement.dataset.joLayout = "2";
            tmp_h = bdy_h - 192;
            if (tmp_h / 2 < scr_h) {
                if (tmp_h < 384) scr_h = Math.floor(tmp_h / 2);
                else scr_h = 192 * Math.floor(tmp_h / 384);
                scr_w = Math.floor(4 * scr_h / 3);
            }
        }

        else {
            document.documentElement.dataset.joLayout = "1";
            tmp_w = bdy_w - 192;
            if (tmp_w < scr_w) {
                if (tmp_w < 256) scr_w = tmp_w;
                else scr_w = 256 * Math.floor(tmp_w / 256);
                scr_h = Math.floor(3 * scr_w / 4);
            }
        }

    }

    //  Applying layout:

    document.getElementById("jo-cnvs-tp").width = scr_w;
    document.getElementById("jo-cnvs-tp").height = scr_h;
    document.getElementById("jo-cnvs-bt").width = scr_w;
    document.getElementById("jo-cnvs-bt").height = scr_h;

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
