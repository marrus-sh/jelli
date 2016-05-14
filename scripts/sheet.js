/* jshint asi:true, browser:true */
/* globals ImageBitmap: true, createImageBitmap */


/*

#  sheet.js: Sprite Rendering Engine  #

*/

//  All inside an anonymous function for strictness and proper closure

var Sheet = (function () {

    "use strict";

    //  Drawing a sprite:

    function drawSprite(sheet, start_index, context, x, y /*  Optional frame  */) {

        //  Variable setup:

        var i;
        var index;
        var j;

        //  Handling arguments and error checking:

        if (!(sheet instanceof Sheet)) throw new Error("(sheet.js) Cannot draw sprite – no sheet provided.");
        if (!(typeof start_index === "number" || start_index instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite – index must be a number.");
        else if (start_index > sheet.size) throw new Error("(sheet.js) Cannot draw sprite – index out of range.");
        if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(sheet.js) Cannot draw sprite – rendering context must be 2d.");
        if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite – coordinates must be numbers.");
        if (arguments.length >= 6) {
            if (!(typeof arguments[5] === "number" || arguments[5] instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite – frame must be a number.");
            else if (start_index + arguments[5] > sheet.size) throw new Error("(sheet.js) Cannot draw sprite – frame out of range.");
            index = start_index + arguments[5];
        }
        else index = start_index;
        i = index % sheet.width;
        j = Math.floor(index / sheet.width);

        //  Drawing the sprite:

        context.drawImage((sheet.image || sheet.source), i * sheet.sprite_width, j * sheet.sprite_height, sheet.sprite_width, sheet.sprite_height, x, y, sheet.sprite_width, sheet.sprite_height);

    }

    //  Sprite constructor:

    function Sprite(sheet, index /*  Optional length  */) {

        //  Variable setup:

        var length;

        //  Handling arguments and error checking:

        if (!(sheet instanceof Sheet)) throw new Error("(sheet.js) Cannot create sprite – no sheet provided.");
        if (!(typeof index === "number" || index instanceof Number)) throw new Error("(sheet.js) Cannot create sprite – index must be a number.");
        else if (index > sheet.size) throw new Error("(sheet.js) Cannot create sprite – index out of range.");
        if (arguments.length >= 3) {
            if (!(typeof arguments[2] === "number" || arguments[2] instanceof Number)) throw new Error("(sheet.js) Cannot create sprite – length must be a number.");
            else if (index + arguments[2] - 1 >= sheet.size) throw new Error("(sheet.js) Cannot create sprite – length out of range.");
            length = arguments[2];
        }
        else length = 1;

        //  Creating the image:

        Object.defineProperties(this, {
            draw: {
                value: drawSprite.bind(this, sheet, index)
            },
            height: {
                value: sheet.sprite_height
            },
            index: {
                value: index
            },
            frames: {
                value: length
            },
            sheet: {
                value: sheet
            },
            width: {
                value: sheet.sprite_width
            }
        });

    }

    //  Sprite prototyping:

    Sprite.prototype = Object.create(Object.prototype, {

    })

    //  Sprite sheet constructor:

    function Sheet(source, sprite_width, sprite_height) {

        //  Variable setup:

        var source_width;
        var source_height;

        //  Handling arguments and error checking:

        if (!(source instanceof HTMLImageElement || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && source instanceof ImageBitmap))) throw new Error("(sheet.js) Rendering source must be an image.")
        if (source instanceof HTMLImageElement && !source.complete) throw new Error("(sheet.js) Rendering source has not finished loading.");
        if (!(typeof sprite_width === "number" || sprite_width instanceof Number) || !(typeof sprite_height === "number" || sprite_height instanceof Number)) throw new Error("(sheet.js) Widths and heights must be numbers.");

        //  Getting width and height:

        if (source.naturalWidth) source_width = source.naturalWidth;
        else source_width = source.width;
        if (source.naturalHeight) source_height = source.naturalHeight;
        else source_height = source.height;

        //  Error-checking width and height:

        if (!Number.isInteger(source_width / sprite_width)) throw new Error("(sheet.js) Provided width does not perfectly divide source.");
        if (!Number.isInteger(source_height / sprite_height)) throw new Error("(sheet.js) Provided height does not perfectly divide source.");

        //  Adding properties:

        Object.defineProperties(this, {
            height: {
                value: source_height / sprite_height
            },
            size: {
                value: (source_width / sprite_width) * (source_height / sprite_height)
            },
            source: {
                value: source
            },
            sprite_height: {
                value: sprite_height
            },
            sprite_width: {
                value: sprite_width
            },
            width: {
                value: source_width / sprite_width
            }
        });

    }

    //  Sprite sheet prototyping:

    Sheet.prototype = Object.create(Object.prototype, {
        drawIndex: {
            value: function(context, index, x, y) {
                if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(sheet.js) Cannot draw sprite at index – rendering context must be 2d.");
                if (!(typeof index === "number" || index instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite at index – none provided.");
                else if (index >= this.size) throw new Error("(sheet.js) Cannot draw sprite at index – index out of range.");
                if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite at index – coordinates must be numbers.");
                return drawSprite(this, index, context, x, y);
            }
        },
        getSprite: {
            value: function (index /*  Optional length  */) {
                var length;
                if (!(typeof index === "number" || index instanceof Number)) throw new Error("(sheet.js) Cannot get sprite – index must be a number.");
                if (arguments.length >= 2) {
                    if (!(typeof arguments[1] === "number" || arguments[1] instanceof Number)) throw new Error("(sheet.js) Cannot get sprite – length must be a number.");
                    length = arguments[1];
                }
                else length = 1;
                return new Sprite(this, index, length);
            }
        }
    });

    //  Conveinence functions for drawing an arbitrary sprite:

    Sheet.draw = function(context, sprite, x, y /*  Optional frame  */) {
        if (!(sprite instanceof Sprite)) throw new Error("(sprite.js) Cannot draw sprite – none provided.");
        if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(sheet.js) Cannot draw sprite – rendering context must be 2d.");
        if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite – coordinates must be numbers.");
        if (arguments.length >= 5) {
            if (!(typeof arguments[4] === "number" || arguments[4] instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite – frame must be a number.");
            return sprite.draw(context, x, y, arguments[4])
        }
        return sprite.draw(context, x, y)
    }
    Sheet.drawSheetAtIndex = function(context, sheet, index, x, y) {
        if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(sheet.js) Cannot draw sprite at index – rendering context must be 2d.");
        if (!(sheet instanceof Sheet)) throw new Error("(sprite.js) Cannot draw sprite – no sheet provided.");
        if (!(typeof index === "number" || index instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite at index – none provided.");
        else if (index >= this.size) throw new Error("(sheet.js) Cannot draw sprite at index – index out of range.");
        if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(sheet.js) Cannot draw sprite at index – coordinates must be numbers.");
        return sheet.drawIndex(context, index, x, y);
    }

    //  Making other constructors accessible:

    Sheet.Sprite = Sprite;

    return Sheet;

})()
