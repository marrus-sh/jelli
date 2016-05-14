/* jshint asi:true, browser:true */
/* globals ImageBitmap: true, createImageBitmap */


/*

#  letters.js: Text Rendering Engine  #

*/

//  All inside an anonymous function for strictness and proper closure

var Character = (function () {

    "use strict";

    //  Character data:

    function Character(sprites, x, y, dir, step, draw, data) {

        //  Handling arguments and error checking:

        if (typeof sprites !== "object") throw new Error("(character.js) Sprites must be provided in an object.");
        if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(character.js) Initial position must be provided with numbers.");
        if (!(typeof dir === "string" || dir instanceof String || typeof dir === "number" || dir instanceof Number)) throw new Error("(character.js) Character direction must be a string or number.");
        if (!(typeof step === "function" || step instanceof Function)) throw new Error("(character.js) No step function provided");
        if (!(typeof draw === "function" || draw instanceof Function)) throw new Error("(character.js) No draw function provided");

        //  Adding properties:

        Object.defineProperties(this, {
            data: {
                value: data
            },
            dir: {
                value: dir,
                writable: true
            },
            drawFunction: {
                value: draw
            },
            frame : {
                value: 0,
                writable: true
            },
            sprites: {
                value: sprites
            },
            stepFunction: {
                value: step
            },
            x: {
                value: x,
                writable: true
            },
            y: {
                value: y,
                writable: true
            }
        });

    }

    Character.prototype = Object.create(Object.prototype, {
        draw: {
            value: function(context) {
                return this.drawFunction(context, this.sprites[this.dir], this.x, this.y, this.frame);
            }
        },
        step: {
            value: function() {
                return this.stepFunction(this.data);
            }
        }
    });

    return Character;

})();
