/* jshint asi:true, browser:true */
/* globals ImageBitmap: true, createImageBitmap */


/*

#  letters.js: Text Rendering Engine  #

*/

//  All inside an anonymous function for strictness and proper closure

var Letters = (function () {

    "use strict";

    //  Drawing a sprite:

    function drawLetter(letters, index, context, x, y) {

        //  Variable setup:

        var i;
        var j;

        //  Handling arguments and error checking:

        if (!(letters instanceof Letters)) throw new Error("(letters.js) Cannot draw letter – no letters provided.");
        if (!(typeof index === "number" || index instanceof Number)) throw new Error("(letter.js) Cannot draw letter – index must be a number.");
        else if (index > letters.size) throw new Error("(letters.js) Cannot draw letter – index out of range.");
        if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(letters.js) Cannot draw letter – rendering context must be 2d.");
        if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(letter.js) Cannot draw letters – coordinates must be numbers.");
        i = index % letters.width;
        j = Math.floor(index / letters.width);

        //  Drawing the letter:

        context.drawImage(letters.canvas, i * letters.letter_width, j * letters.letter_height, letters.letter_width, letters.letter_height, x, y, letters.letter_width, letters.letter_height);

    }

    //  Letter constructor:

    function Letter(letters, index) {

        //  Handling arguments and error checking:

        if (!(letters instanceof Letters)) throw new Error("(letters.js) Cannot create letter – no letters provided.");
        if (!(typeof index === "number" || index instanceof Number)) throw new Error("(letters.js) Cannot create letter – index must be a number.");
        else if (index > letters.size) throw new Error("(letters.js) Cannot create letter – index out of range.");

        //  Creating the letter:

        Object.defineProperties(this, {
            canvas: {
                value: letters.canvas
            },
            draw: {
                value: drawLetter.bind(this, letters, index)
            },
            height: {
                value: letters.letter_height
            },
            index: {
                value: index
            },
            letters: {
                value: letters
            },
            width: {
                value: letters.letter_width
            }
        });

    }

    //  Letter prototyping:

    Letter.prototype = Object.create(Object.prototype, {

    });

    //  Letter block constructor:

    function LetterBlock(letters /*  Some number of strings  */) {

        //  Variable setup:

        var i;

        //  Handling arguments and error checking:

        if (!(letters instanceof Letters)) throw new Error("(letters.js) Cannot create string – no letters provided.");

        //  Creating the block:

        Object.defineProperties(this, {
            length: {
                value: arguments.length - 1
            },
            letters: {
                value: letters
            }
        });

        for (i = 1; i < arguments.length; i++) {
            if (!(typeof arguments[i] === "string" || arguments[i] instanceof String)) throw new Error("(letters.js) Block arguments must be strings.");
            Object.defineProperty(this, i - 1, {
                value: new LetterString(letters, arguments[i])
            });
        }

    }

    //  Letter block prototyping:

    LetterBlock.prototype = Object.create(Object.prototype, {
        draw: {
            value: function (context, x, y) {
                var i;
                if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(letters.js) Cannot draw block – provided context must be 2d.");
                if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(letters.js) Cannot draw block – coordinates must be numbers.");
                for (i = 0; i < this.length; i++) {
                    if (!(this.item(i) instanceof LetterString)) throw new Error("(letters.js) Block index did not resolve to a string.");
                    this.item(i).draw(context, x, y);
                    y += this.letters.letter_height + 1;
                }
            }
        },
        item: {
            value: function (i) {
                return this[i];
            }
        }
    });

    //  Letter string contructor:

    function LetterString(letters, data) {

        //  Variable setup:

        var i;

        //  Handling arguments and error checking:

        if (!(letters instanceof Letters)) throw new Error("(letters.js) Cannot create string – no letters provided.");
        if (!(typeof data === "string" || data instanceof String)) throw new Error("(letters.js) Cannot create string – no data provided.");

        //  Define string:

        Object.defineProperties(this, {
            length: {
                value: data.length
            },
            letters: {
                value: letters
            }
        });

        for (i = 0; i < data.length; i++) {
            if (data.charCodeAt(i) > letters.size) throw new Error("(letters.js) String index exceeds size of letters.");
            Object.defineProperty(this, i, {
                enumerable: true,
                value: letters.item(data.charCodeAt(i))
            });
        }

    }

    //  Letter string prototyping:

    LetterString.prototype = Object.create(Object.prototype, {
        draw: {
            value: function (context, x, y) {
                var i;
                if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(letters.js) Cannot draw string – provided context must be 2d.");
                if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(letters.js) Cannot draw string – coordinates must be numbers.");
                for (i = 0; i < this.length; i++) {
                    if (!(this.item(i) instanceof Letter)) throw new Error("(letters.js) String index did not resolve to a letter.");
                    this.item(i).draw(context, x, y);
                    x += this.letters.letter_width + 1;
                }
            }
        },
        item: {
            value: function (i) {
                return this[i];
            }
        }
    });

    //  Letters constructor:

    function Letters(source, letter_width, letter_height) {

        //  Variable setup:

        var canvas;
        var context;
        var i;
        var source_width;
        var source_height;

        //  Handling arguments and error checking:

        if (!(source instanceof HTMLImageElement || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && source instanceof ImageBitmap))) throw new Error("(letters.js) Rendering source must be an image.")
        if (source instanceof HTMLImageElement && !source.complete) throw new Error("(letters.js) Rendering source has not finished loading.");
        if (!(typeof letter_width === "number" || letter_width instanceof Number) || !(typeof letter_height === "number" || letter_height instanceof Number)) throw new Error("(letters.js) Widths and heights must be numbers.");

        //  Getting width and height:

        if (source.naturalWidth) source_width = source.naturalWidth;
        else source_width = source.width;
        if (source.naturalHeight) source_height = source.naturalHeight;
        else source_height = source.height;

        //  Error-checking width and height:

        if (!Number.isInteger(source_width / letter_width)) throw new Error("(letters.js) Provided width does not perfectly divide source.");
        if (!Number.isInteger(source_height / letter_height)) throw new Error("(letters.js) Provided height does not perfectly divide source.");

        //  Setting up context:

        canvas = document.createElement("canvas");
        canvas.width = source_width;
        canvas.height = source_height;
        context = canvas.getContext("2d");
        context.drawImage(source, 0, 0);

        //  Adding properties:

        Object.defineProperties(this, {
            canvas: {
                value: canvas
            },
            context: {
                value: context
            },
            height: {
                value: source_height / letter_height
            },
            size: {
                value: (source_width / letter_width) * (source_height / letter_height)
            },
            source: {
                value: source
            },
            letter_height: {
                value: letter_height
            },
            letter_width: {
                value: letter_width
            },
            width: {
                value: source_width / letter_width
            }
        });
        for (i = 0; i < this.size; i++) {
            Object.defineProperty(this, i, {
                value: new Letter(this, i)
            });
        }

    }

    //  Letters prototyping:

    Letters.prototype = Object.create(Object.prototype, {
        item: {
            value: function (i) {
                return this[i];
            }
        },
        clearColor: {
            value: function () {
                this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
                this.context.drawImage(this.source, 0, 0);
            }
        },
        createBlock: {
            value: function (/*  Some number of data strings  */) {
                var args = [undefined, this].concat(Array.of.apply(undefined, arguments));
                return new (LetterBlock.bind.apply(LetterBlock, args))();
            }
        },
        createString: {
            value: function (data) {
                if (!(typeof data === "string" || data instanceof String)) throw new Error("(letters.js) Cannot create string – no data provided.");
                return new LetterString(this, data);
            }
        },
        setColor: {
            value: function (color) {
                this.context.globalCompositeOperation = "source-in";
                this.context.fillStyle = color;
                this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
                this.context.globalCompositeOperation = "source-over";
            }
        }
    });

    //  Making other constructors accessible:

    Letters.Block = LetterBlock;
    Letters.Letter = Letter;
    Letters.String = LetterString;

    return Letters;

})();
