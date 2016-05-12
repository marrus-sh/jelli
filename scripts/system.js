/* jshint asi:true, browser:true */

/*

#  system.js: Multi-Screen Rendering Engine  #

*/

//  All inside an anonymous function for strictness and proper closure

var System = (function () {

    "use strict";

    //  Item list constructor:

    function ItemList(items, process) {
        if (arguments.length < 2)  throw new Error("(system.js) ItemList constructor called with too few arguments.");
        var i;
        Object.defineProperty(this, "length", {
            value: items.length
        });
        for (i = 0; i < items.length; i++) {
            Object.defineProperty(this, i, {
                enumerable: true,
                value: process(items[i], i)
            });
        }
    }

    //  Item list prototype:

    ItemList.prototype = Object.create(Object.prototype, {
        item: {
            value: function (i) {
                return this[i];
            }
        }
    });

    //  Screen constructor:

    function Screen(canvas, context) {

        //  Handling arguments and error checking:

        if (arguments.length < 1)  throw new Error("(system.js) Screen constructor called with too few arguments.");
        if (typeof canvas === "string" || canvas instanceof String) {
            if (!document.getElementById(canvas)) throw new Error("(system.js) Cannot construct Screen – no element found with the given id (" + canvas + ").");
            canvas = document.getElementById(canvas);
        }
        else if (!(canvas instanceof Element)) throw new Error("(system.js) The first argument of the Screen constructor must be an element or string.");
        if (typeof context === "undefined" || context === null) context = "2d";
        else if (!(typeof context === "string" || context instanceof String)) throw new Error("(system.js) The second argument of the System constructor must be a string.");

        //  Property definitions:

        Object.defineProperties(this, {
            canvas: {
                value: canvas
            },
            context: {
                value: canvas.getContext(context)
            }
        });

        if (!this.context) throw new Error("(system.js) Failed to create canvas context `" + context + "`.");

    }

    //  Screen prototype:

    Screen.prototype = Object.create(Object.prototype, {
        height: {
            get: function () {
                return this.canvas.height;
            },
            set: function (n) {
                this.canvas.height = n;
            }
        },
        width: {
            get: function () {
                return this.canvas.width;
            },
            set: function (n) {
                this.canvas.width = n;
            }
        }
    });

    //  System constructor:

    function System(/*  One or more context strings  */) {

        //  Variable setup:

        var i;

        //  Handling arguments and error checking:

        for (i = 0; i < arguments.length; i++) {
            if (!(typeof arguments[i] === "string" || arguments[i] instanceof String)) throw new Error("(system.js) The arguments of the System constructor must be strings.");
        }
        if (i === 0) throw new Error("(system.js) System constructer called without any arguments.");

        //  Defining `this` object properties:

        Object.defineProperty(this, "screens", {
            value: new ItemList(arguments, function(item, i) {
                var canvas = document.createElement("canvas");
                canvas.dataset.systemIndex = i;
                return new Screen(canvas, item);
            })
        });
        Object.defineProperties(this, {
            canvases: {
                value: new ItemList(this.screens, function(item, i) {return item.canvas})
            },
            contexts: {
                value: new ItemList(this.screens, function(item, i) {return item.context})
            }
        });

    }

    //  System prototype:

    System.prototype = Object.create(Object.prototype, {

        //  Event handling:

        handleEvent: {
            value: function (e) {

            }
        }

    });

    //  Other constructors:

    System.ItemList = ItemList;
    System.Screen = Screen;

    return System;

})();
