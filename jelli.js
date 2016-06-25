/* jshint asi:true, browser:true, devel:true */
/* globals ImageBitmap */

/*

#  Jelli Game Engine  #

*/

//  This sets up the init, step, and draw functions:

function defineFunctions(function_object) {

    "use strict";

    var elt;
    var script;
    var scripts;

    scripts = document.getElementsByTagName("script");
    elt = script = scripts[scripts.length - 1];
    while ((elt = elt.parentElement)) {
        if (elt.classList.contains("character") || elt.classList.contains("area") || elt === document.body) break;
    }
    if (!elt) return;

    elt.functions = function_object;
    Object.freeze(function_object);

}

//  All inside an anonymous function for strictness and proper closure:

var Game = (function () {

    "use strict";

    /*
        Each of the following closures are independent modules which do not rely upon one another.
        This allows for easy re-use of some or all of this program elsewhere.
    */

    //  Screen:

    var Screen = (function () {

        //  Screen constructor:

        function Screen(canvas, context) {

            //  Setting up variables:

            var doc;

            //  Handling arguments:

            if (canvas instanceof HTMLCanvasElement) doc = canvas.ownerDocument;
            else canvas = doc.getElementById(String(canvas));
            if (typeof context === "undefined" || context === null) context = "2d";
            else if (!(typeof context === "string" || context instanceof String)) context = String(context);

            //  Property definitions:

            Object.defineProperties(this, {
                canvas: {
                    value: canvas
                },
                context: {
                    value: canvas ? canvas.getContext(context) : undefined
                },
                ownerDocument: {
                    value: doc
                }
            });

        }

        //  Screen prototype:

        Screen.prototype = Object.create(Object.prototype, {
            clear: {
                value: function () {
                    if (this.context instanceof CanvasRenderingContext2D) this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    else if (this.context instanceof WebGLRenderingContext) this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
                }
            },
            height: {
                get: function () {
                    return this.canvas ? this.canvas.height : undefined;
                },
                set: function (n) {
                    if (!this.canvas) return;
                    this.canvas.height = n;
                }
            },
            width: {
                get: function () {
                    return this.canvas ? this.canvas.width : undefined;
                },
                set: function (n) {
                    if (!this.canvas) return;
                    this.canvas.width = n;
                }
            }
        });

        return Screen;

    })();

    //  Control:

    var Control = (function () {

        //  Control constructor:

        function Control(shouldUpdateDOM /*  Optional document  */) {

            //  Setting up variables:

            var doc;

            //  Handling arguments:

            if (arguments[1] instanceof Document) doc = arguments[1];
            else doc = document;

            //  Property definitions:

            Object.defineProperties(this, {
                controls: {
                    value: {}
                },
                ownerDocument: {
                    value: doc
                },
                keys: {
                    value: {}
                }
            });

            //  Event handling and rendering:

            window.addEventListener("keydown", this, false);
            window.addEventListener("keyup", this, false);
            if (shouldUpdateDOM) window.requestAnimationFrame(this.updateDOM.bind(this));

        }

        //  Control prototyping:

        Control.prototype = Object.create(Object.prototype, {

            add: {
                value: function (name) {
                    if (name === undefined) return;
                    this.controls[name] = false;
                    return this;
                }
            },

            addKeys: {
                value: function (name /*  One or more keys  */) {
                    var i;
                    var n;
                    if (name === undefined || this.controls[name] === undefined) return;
                    for (i = 1; i < arguments.length; i++) {
                        n = arguments[i]
                        this.keys[n] = name;
                    }
                    return this;
                }
            },

            getName: {
                value: function (key) {
                    if (key === undefined) return;
                    return this.keys[key];
                }
            },

            handleEvent: {
                value: function (e) {
                    var k;
                    if (!(e instanceof Event)) return;
                    switch (e.type) {
                        case "mousedown":
                            if (this.isDefined(e.currentTarget.dataset.control)) this.toggle(e.currentTarget.dataset.control, true);
                            break;
                        case "mouseout":
                            if (e.buttons & 1 && this.isDefined(e.currentTarget.dataset.control)) this.toggle(e.currentTarget.dataset.control, false);
                            break;
                        case "mouseover":
                            if (e.buttons & 1 && this.isDefined(e.currentTarget.dataset.control)) this.toggle(e.currentTarget.dataset.control, true);
                            break;
                        case "mouseup":
                            if (this.isDefined(e.currentTarget.dataset.control)) this.toggle(e.currentTarget.dataset.control, false);
                            break;
                        case "keydown":
                            k = e.code || e.key || e.keyIdentifier || e.keyCode;
                            if (this.isKeyDefined(k)) this.toggleKey(k, true);
                            break;
                        case "keyup":
                            k = e.code || e.key || e.keyIdentifier || e.keyCode;
                            if (this.isKeyDefined(k)) this.toggleKey(k, false);
                            break;
                        case "touchstart":
                            if (this.isDefined(e.currentTarget.dataset.control)) this.toggle(e.currentTarget.dataset.control, true);
                            break;
                        case "touchend":
                            if (this.isDefined(e.currentTarget.dataset.control)) this.toggle(e.currentTarget.dataset.control, false);
                            break;
                    }
                }
            },

            isActive: {
                value: function (name) {
                    if (name === undefined || this.controls[name] === undefined) return undefined;
                    return !!this.controls[name];
                }
            },

            isDefined: {
                value: function (name) {
                    if (name === undefined) return;
                    return this.controls[name] !== undefined;
                }
            },

            isKeyActive: {
                value: function (key) {
                    var name;
                    if (key === undefined) return;
                    name = this.keys[key];
                    if (name === undefined || this.controls[name] === undefined) return undefined;
                    return !!this.controls[name];
                }
            },

            isKeyDefined: {
                value: function (key) {
                    var name;
                    if (key === undefined) return;
                    return this.keys[key] !== undefined;
                }
            },

            linkElement: {
                value: function (name, element) {
                    if (name === undefined || this.controls[name] === undefined) return;
                    if (!(element instanceof Element)) element = this.ownerDocument.getElementById(element);
                    if (!element) return;
                    element.dataset.control = name;
                    if (this.controls[name]) element.setAttribute("data-control-active", "");
                    element.addEventListener("mousedown", this, false);
                    element.addEventListener("mouseout", this, false);
                    element.addEventListener("mouseover", this, false);
                    element.addEventListener("mouseup", this, false);
                    element.addEventListener("touchstart", this, false);
                    element.addEventListener("touchend", this, false);
                    return this;
                }
            },

            remove: {
                value: function (name) {
                    var i;
                    var elements = this.ownerDocument.querySelectorAll("*[data-control='" + name + "']");
                    for (i in this.keys) {
                        if (this.keys[i] === name) delete this.keys[i];
                    }
                    for (i = 0; i < elements.length; i++) {
                        elements.item(i).removeAttribute("data-control");
                        elements.item(i).removeAttribute("data-control-active");
                    }
                    delete this.controls[name];
                    return this;
                }
            },

            removeKeys: {
                value: function (/*  One or more keys  */) {
                    var i;
                    for (i = 0; i < arguments.length; i++) {
                        delete this.keys[arguments[i]];
                    }
                    return this;
                }
            },

            toggle: {
                value: function (name, to) {
                    if (name === undefined || this.controls[name] === undefined) return;
                    if (to !== undefined) this.controls[name] = !!to;
                    else this.controls[name] = !this.controls[name];
                    return this.controls[name];
                }
            },

            toggleKey: {
                value: function (key, to) {
                    var name;
                    if (key === undefined) return;
                    name = this.keys[key];
                    if (name === undefined || this.controls[name] === undefined) return;
                    if (to !== undefined) this.controls[name] = !!to;
                    else this.controls[name] = !this.controls[name];
                    return this.controls[name];
                }
            },

            unlinkElement: {
                value: function (element) {
                    if (name === undefined || this.controls[name] === undefined) return;
                    if (!(element instanceof Element)) element = this.ownerDocument.getElementById(element);
                    if (!element) return;
                    element.removeAttribute("data-control");
                    element.removeAttribute("data-control-active");
                    element.removeEventListener("mousedown", this, false);
                    element.removeEventListener("mouseup", this, false);
                    element.removeEventListener("touchstart", this, false);
                    element.removeEventListener("touchend", this, false);
                    return this;
                }
            },

            updateDOM: {
                value: function (shouldRepeat) {
                    var i;
                    var elements = this.ownerDocument.querySelectorAll("*[data-control]");
                    for (i = 0; i < elements.length; i++) {
                        if (this.controls[elements.item(i).dataset.control]) elements.item(i).setAttribute("data-control-active", "");
                        else if (this.controls[elements.item(i).dataset.control] !== undefined) elements.item(i).removeAttribute("data-control-active");
                    }
                    if (shouldRepeat) window.requestAnimationFrame(this.updateDOM.bind(this));
                }
            }

        });

        return Control;

    })();

    //  Sheet:

    var Sheet = (function () {

        //  Drawing a sprite:

        function drawSprite(sheet, start_index, context, x, y /*  Optional frame  */) {

            //  Variable setup:

            var i;
            var j;

            //  Handling arguments:

            if (isNaN(start_index = Number(start_index))) start_index = 0;
            if (isNaN(x = Number(x))) x = 0;
            if (isNaN(y = Number(y))) y = 0;
            if (!isNaN(arguments[5])) start_index += Number(arguments[5]);
            if (!(sheet instanceof Sheet) || start_index >= sheet.size || !(context instanceof CanvasRenderingContext2D)) return;
            i = start_index % sheet.width;
            j = Math.floor(start_index / sheet.width);

            //  Drawing the sprite:

            if (((sheet.source instanceof HTMLImageElement && sheet.source.complete) || sheet.source instanceof SVGImageElement || sheet.source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && (sheet.source instanceof ImageBitmap || sheet.image instanceof ImageBitmap))) && !isNaN(i) && !isNaN(j) && Number(sheet.sprite_width) && Number(sheet.sprite_height)) context.drawImage((typeof createImageBitmap !== "undefined" && sheet.image instanceof ImageBitmap ? sheet.image : sheet.source), i * sheet.sprite_width, j * sheet.sprite_height, sheet.sprite_width, sheet.sprite_height, x, y, sheet.sprite_width, sheet.sprite_height);

        }

        //  Sprite constructor:

        function Sprite(sheet, index /*  Optional length  */) {

            //  Variable setup:

            var length;

            //  Handling arguments:

            if (isNaN(index = Number(index))) index = 0;
            if (isNaN(length = Number(arguments[2]))) length = 1;

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

            //  Handling arguments:

            if (!(source instanceof HTMLImageElement || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && source instanceof ImageBitmap))) source = undefined;
            if (isNaN(sprite_width = Number(sprite_width))) sprite_width = 0;
            if (isNaN(sprite_height = Number(sprite_height))) sprite_height = 0;

            //  Getting width and height:

            if (!source || isNaN(source_width = Number(source.naturalWidth !== undefined ? source.naturalWidth : source.width))) source_width = 0;
            if (!source || isNaN(source_height = Number(source.naturalHeight !== undefined ? source.naturalHeight : source.height))) source_height = 0;

            //  Adding properties:

            Object.defineProperties(this, {
                height: {
                    value: sprite_height ? source_height / sprite_height : undefined
                },
                size: {
                    value: sprite_width && sprite_height ? (source_width / sprite_width) * (source_height / sprite_height) : undefined
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
                    value: sprite_width ? source_width / sprite_width : undefined
                }
            });

        }

        //  Sprite sheet prototyping:

        Sheet.prototype = Object.create(Object.prototype, {
            drawIndex: {
                value: function(context, index, x, y) {
                    if (isNaN(index = Number(index))) index = 0;
                    if (isNaN(x = Number(x))) x = 0;
                    if (isNaN(y = Number(y))) y = 0;
                    if (!(context instanceof CanvasRenderingContext2D) || index >= this.size) return;
                    return drawSprite(this, index, context, x, y);
                }
            },
            getSprite: {
                value: function (index /*  Optional length  */) {
                    var length;
                    if (isNaN(index = Number(index))) index = 0;
                    if (isNaN(length = Number(length))) length = 1;
                    return new Sprite(this, index, length);
                }
            }
        });

        //  Conveinence functions for drawing an arbitrary sprite:

        Sheet.draw = function(context, sprite, x, y /*  Optional frame  */) {
            if (!(sprite instanceof Sprite) || (context instanceof CanvasRenderingContext2D));
            if (isNaN(x = Number(x))) x = 0;
            if (isNaN(y = Number(y))) y = 0;
            return isNaN(arguments[4]) ? sprite.draw(context, x, y) : sprite.draw(context, x, y, arguments[4]);
        }
        Sheet.drawSheetAtIndex = function(context, sheet, index, x, y) {
            if (!(sheet instanceof Sheet) || (context instanceof CanvasRenderingContext2D));
            if (isNaN(index = Number(index))) index = 0;
            if (isNaN(x = Number(x))) x = 0;
            if (isNaN(y = Number(y))) y = 0;
            return sheet.drawIndex(context, index, x, y);
        }

        //  Making other constructors accessible:

        Sheet.Sprite = Sprite;

        return Sheet;

    })();

    //  Letters:

    var Letters = (function () {

        //  Drawing a letter:

        function drawLetter(letters, index, context, x, y) {

            //  Variable setup:

            var i;
            var j;

            //  Handling arguments:

            if (isNaN(index = Number(index))) index = 0;
            if (isNaN(x = Number(x))) x = 0;
            if (isNaN(y = Number(y))) y = 0;
            if (!(letters instanceof Letters) || index > letters.size || !(context instanceof CanvasRenderingContext2D)) return;
            i = index % letters.width;
            j = Math.floor(index / letters.width);

            //  Drawing the letter:

            if (letters.canvas instanceof HTMLCanvasElement && !isNaN(i) && !isNaN(j) && Number(letters.letter_width) && Number(letters.letter_height)) context.drawImage(letters.canvas, i * letters.letter_width, j * letters.letter_height, letters.letter_width, letters.letter_height, x, y, letters.letter_width, letters.letter_height);

        }

        //  Letter constructor:

        function Letter(letters, index) {

            //  Handling arguments:

            if (!(letters instanceof Letters)) letters = undefined;
            if (isNaN(index = Number(index))) index = 0;

            //  Creating the letter:

            Object.defineProperties(this, {
                canvas: {
                    value: letters ? letters.canvas : undefined
                },
                draw: {
                    value: drawLetter.bind(this, letters, index)
                },
                height: {
                    value: letters ? letters.letter_height : undefined
                },
                index: {
                    value: index
                },
                letters: {
                    value: letters
                },
                width: {
                    value: letters ? letters.letter_width : undefined
                }
            });

        }

        //  Letter prototyping:

        Letter.prototype = Object.create(Object.prototype, {

        });

        //  Letter block constructor:

        function LetterBlock(letters, context, x, y /*  Some number of strings  */) {

            //  Variable setup:

            var i;

            //  Handling arguments:

            if (!(context instanceof CanvasRenderingContext2D)) context = undefined;
            if (!(letters instanceof Letters)) letters = undefined;
            if (isNaN(x = Number(x))) x = 0;
            if (isNaN(y = Number(y))) y = 0;

            //  Creating the block:

            for (i = 4; i < arguments.length; i++) {
                Object.defineProperty(this, i - 4, {value: new LetterString(letters, arguments[i])});
            }

            Object.defineProperties(this, {
                context: {
                    value: context
                },
                delIndex: {
                    get: function () {
                        var i;
                        var n;
                        for (n = 0, i = 0; i < this.height && this[i].delIndex === this[i].length; i++) {
                            n += this[i].length;
                        }
                        if (i < this.height) return n + this[i].delIndex;
                        return n;
                    },
                    set: function (n) {
                        var i;
                        for (i = 0; i < this.height && n > this[i].length; i++) {
                            n -= this[i].length;
                        }
                        if (i < this.height) this[i].delIndex = n;
                        while (++i < this.height) {
                            this[i].delIndex = 0;
                        }
                    }
                },
                drawIndex: {
                    get: function () {
                        var i;
                        var n;
                        for (n = 0, i = 0; i < this.height && this[i].drawIndex === this[i].length; i++) {
                            n += this[i].length;
                        }
                        if (i < this.height) return n + this[i].drawIndex;
                        return n;
                    },
                    set: function (n) {
                        var i;
                        for (i = 0; i < this.height && n > this[i].length; i++) {
                            n -= this[i].length;
                        }
                        if (i < this.height) this[i].drawIndex = n;
                        while (++i < this.height) {
                            this[i].drawIndex = 0;
                        }
                    }
                },
                height: {
                    value: i - 4
                },
                index: {
                    get: function () {
                        var i;
                        var n;
                        for (n = 0, i = 0; i < this.height && this[i].index === this[i].length; i++) {
                            n += this[i].length;
                        }
                        if (i < this.height) return n + this[i].index;
                        return n;
                    },
                    set: function (n) {
                        var i;
                        for (i = 0; i < this.height && n > this[i].length; i++) {
                            n -= this[i].length;
                        }
                        if (i < this.height) this[i].index = n;
                        while (++i < this.height) {
                            this[i].index = 0;
                        }
                    }
                },
                length: {
                    get: function () {
                        var i;
                        var n;
                        for (n = 0, i = 0; i < this.height; i++) {
                            n += this[i].length;
                        }
                        return n;
                    }
                },
                letters: {
                    value: letters
                },
                x: {
                    get: function () {return x;},
                    set: function (n) {
                        if (!isNaN(n)) {
                            x = Number(n);
                            this.delIndex = 0;
                            this.drawIndex = 0;
                            this.index = 0;
                        }
                    }
                },
                y: {
                    get: function () {return y;},
                    set: function (n) {
                        if (!isNaN(n)) {
                            y = Number(n);
                            this.delIndex = 0;
                            this.drawIndex = 0;
                            this.index = 0;
                        }
                    }
                }
            });

        }

        //  Letter block prototyping:

        LetterBlock.prototype = Object.create(Object.prototype, {
            advance: {
                value: function (/*  Optional amount  */) {
                    var i = this.index;
                    if (!isNaN(arguments[0])) i += Number(arguments[0]);
                    else i++;
                    if (i < 0) i = 0;
                    else if (i > this.length) i = this.length;
                    this.index = i;
                    if (this.delIndex > i) this.delIndex = i;
                }
            },
            clear: {
                value: function () {
                    this.delIndex = 0;
                    this.index = 0;
                }
            },
            draw: {
                value: function () {
                    var i;
                    var y = this.y;
                    for (i = 0; i < this.height; i++) {
                        if (!(this[i] instanceof LetterString)) return;
                        this[i].draw(this.context, this.x, y);
                        y += this.letters.letter_height + 1;
                    }
                }
            },
            fill: {
                value: function () {
                    this.index = this.length;
                }
            },
            item: {
                value: function (n) {
                    var i;
                    if (isNaN(n)) return;
                    for (i = 0; i < this.height && n > this[i].length; i++) {
                        n -= this[i].length;
                    }
                    return (i < this.height) ? this[i].item(n) : null;
                }
            },
            line: {
                value: function (n) {
                    return this[n] instanceof LetterString ? this[n] : null;
                }
            }
        });

        //  Letter string contructor:

        function LetterString(letters, data) {

            //  Variable setup:

            var i;
            var delIndex;
            var drawIndex;
            var index;

            //  Handling arguments:

            if (!(letters instanceof Letters)) letters = undefined;
            data = String(data);

            //  Define string:

            Object.defineProperties(this, {
                delIndex: {
                    get: function () {return delIndex},
                    set: function (n) {if (!isNaN(n)) delIndex = Number(n);}
                },
                drawIndex: {
                    get: function () {return drawIndex},
                    set: function (n) {if (!isNaN(n)) drawIndex = Number(n);}
                },
                index: {
                    get: function () {return index},
                    set: function (n) {if (!isNaN(n)) index = Number(n);}
                },
                length: {
                    value: data.length
                },
                letters: {
                    value: letters
                }
            });

            for (i = 0; i < data.length; i++) {
                Object.defineProperty(this, i, {
                    enumerable: true,
                    value: letters ? letters.item(data.charCodeAt(i)) : null
                });
            }

        }

        //  Letter string prototyping:

        LetterString.prototype = Object.create(Object.prototype, {
            advance: {
                value: function (/*  Optional amount  */) {
                    var i = this.index;
                    if (!isNaN(arguments[0])) i += Number(arguments[0]);
                    else i++;
                    if (i < 0) i = 0;
                    else if (i > this.length) i = this.length;
                    this.index = i;
                    if (this.delIndex > i) this.delIndex = i;
                }
            },
            clear: {
                value: function () {
                    this.delIndex = 0;
                    this.index = 0;
                }
            },
            draw: {
                value: function (context, x, y) {
                    if (isNaN(x = Number(x))) x = 0;
                    if (isNaN(y = Number(y))) y = 0;
                    if (!(context instanceof CanvasRenderingContext2D) || !(this.letters instanceof Letters) || !Number(this.letters.letter_width) || !Number(this.letters.letter_height)) return;
                    if (this.drawIndex > this.length) this.drawIndex = this.length;
                    if (this.drawIndex < 0) this.drawIndex = 0;
                    if (this.delIndex > this.index) this.delIndex = this.index;
                    if (this.delIndex < 0) this.delIndex = 0;
                    if (this.drawIndex > this.delIndex) {
                        context.clearRect(x + this.delIndex * (this.letters.letter_width + 1), y, (this.drawIndex - this.delIndex) * (this.letters.letter_width + 1), this.letters.letter_height + 1);
                        this.drawIndex = this.delIndex;
                    }
                    while (this.drawIndex < this.length && this.drawIndex < this.index) {
                        if (!(this.item(this.drawIndex) instanceof Letter)) continue;
                        this.item(this.drawIndex).draw(context, x + this.drawIndex * (this.letters.letter_width + 1), y);
                        this.drawIndex++;
                    }
                    this.delIndex = this.drawIndex;
                }
            },
            fill: {
                value: function () {
                    this.index = this.length;
                }
            },
            item: {
                value: function (n) {
                    return this[n] instanceof Letter ? this[n] : null;
                }
            }
        });

        //  Letters constructor:

        function Letters(source, letter_width, letter_height  /*  Optional document  */) {

            //  Variable setup:

            var canvas;
            var context;
            var doc;
            var i;
            var source_width;
            var source_height;

            //  Handling arguments:

            if (!(source instanceof HTMLImageElement || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && source instanceof ImageBitmap))) source = undefined;
            if (isNaN(letter_width = Number(letter_width))) letter_width = 0;
            if (isNaN(letter_height = Number(letter_height))) letter_height = 0;
            doc = arguments[3] instanceof Document ? arguments[3] : document;

            //  Getting width and height:

            if (!source || isNaN(source_width = Number(source.naturalWidth !== undefined ? source.naturalWidth : source.width))) source_width = 0;
            if (!source || isNaN(source_height = Number(source.naturalHeight !== undefined ? source.naturalHeight : source.height))) source_height = 0;

            //  Setting up context:

            if (source) {
                canvas = document.createElement("canvas");
                canvas.width = source_width;
                canvas.height = source_height;
                context = canvas.getContext("2d");
                if (!(source instanceof HTMLImageElement) || source.complete) context.drawImage(source, 0, 0);
            }
            else canvas = context = null;

            //  Adding properties:

            Object.defineProperties(this, {
                canvas: {
                    value: canvas
                },
                color: {
                    value: undefined,
                    writable: true
                },
                context: {
                    value: context
                },
                height: {
                    value: letter_height ? source_height / letter_height : 0
                },
                size: {
                    value: letter_width && letter_height ? (source_width / letter_width) * (source_height / letter_height) : 0
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
                    value: letter_width ? source_width / letter_width : 0
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
                    return this[i] instanceof Letter ? this[i] : null;
                }
            },
            clearColor: {
                value: function () {
                    if (this.color === undefined) return;
                    if (this.context instanceof CanvasRenderingContext2D) {
                        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
                        if (!((this.source instanceof HTMLImageElement && this.source.complete) || this.source instanceof SVGImageElement || this.source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && this.source instanceof ImageBitmap))) this.context.drawImage(this.source, 0, 0);
                    }
                    this.color = undefined;
                }
            },
            createBlock: {
                value: function (context, x, y /*  Some number of data strings  */) {
                    var args = [null, this].concat(Array.prototype.slice.call(arguments));
                    return new (LetterBlock.bind.apply(LetterBlock, args))();
                }
            },
            createString: {
                value: function (data) {
                    return new LetterString(this, data);
                }
            },
            setColor: {
                value: function (color) {
                    if (color === undefined || this.color === (color = String(color))) return;
                    if (this.context instanceof CanvasRenderingContext2D) {
                        this.context.globalCompositeOperation = "source-in";
                        this.context.fillStyle = color;
                        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
                        this.context.globalCompositeOperation = "source-over";
                    }
                    this.color = color;
                }
            }
        });

        //  Making other constructors accessible:

        Letters.Block = LetterBlock;
        Letters.Letter = Letter;
        Letters.String = LetterString;

        return Letters;

    })();

    //  Tileset:

    var Tileset = (function () {

        //  Base64 handling:

        function decode64(base64) {

            //  Setting up variables:

            var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/-_";
            var data;
            var i;
            var n;
            var placeholders;
            var values = Object.create(null);

            //  Handling arguments:

            base64 = String(base64);
            if (base64.length % 4) throw new Error("Could not decode Base64-encoded data: String length not a multiple of 4.");

            //  Setting up values:

            for (i = 0; i < 64; i++) {
                values[code[i]] = i;
            }

            //  Finding out how many placeholders there are:

            placeholders = ((base64[base64.length - 2] === "=") + (base64[base64.length - 1] === "="));

            //  Setting up the array:

            if (typeof Uint8Array !== 'undefined') data = new Uint8Array(3 * base64.length / 4 - placeholders);
            else data = new Array(3 * base64.length / 4 - placeholders);

            //  Loading data:

            for (i = 0; i < base64.length - 4; i++) {
                n = (values[base64[4 * i]] << 18) | (values[base64[4 * i + 1]] << 12) | (values[base64[4 * i + 2]] << 6) | values[base64[4 * i + 3]];
                data[3 * i] = (n >> 16) & 0xFF;
                data[3 * i + 1] = (n >> 8) & 0xFF;
                data[3 * i + 2] = n & 0xFF;
            }

            switch (placeholders) {

                case 0:
                    n = (values[base64[4 * i]] << 18) | (values[base64[4 * i + 1]] << 12) | (values[base64[4 * i + 2]] << 6) | values[base64[4 * i + 3]];
                    data[3 * i] = (n >> 16) & 0xFF;
                    data[3 * i + 1] = (n >> 8) & 0xFF;
                    data[3 * i + 2] = n & 0xFF;
                    break;

                case 1:
                    n = (values[base64[4 * i]] << 10) | (values[base64[4 * i + 1]] << 4) | (values[base64[4 * i + 2]] >> 2);
                    data[3 * i] = (n >> 8) & 0xFF;
                    data[3 * i + 1] = n & 0xFF;
                    break;

                case 2:
                    n = (values[base64[4 * i]] << 2) | (values[base64[4 * i + 1]] >> 4);
                    data[3 * i] = n & 0xFF;
                    break;

            }

            return data;

        }

        //  Map constructor:

        function Map(tileset, context, map, tiles_wide /*  x, y (if not provided, the map will be centred on the screen), origin_x, origin_y (if not provided, initialized to (0,0))  */) {

            //  Setting up variables:

            var decoded_map;
            var tiles_tall;
            var origin_x;
            var origin_y;
            var x;
            var y;

            //  Handling arguments and error checking:

            if (!(context instanceof CanvasRenderingContext2D)) context = undefined;
            if (!(tileset instanceof Tileset)) tileset = undefined;
            if (isNaN(tiles_wide = Number(tiles_wide))) tiles_wide = 0;
            decoded_map = decode64(map);
            tiles_tall = tiles_wide ? Math.ceil(decoded_map.length / tiles_wide) : 0;
            x = arguments[4] === undefined && context && tileset ? Math.floor((context.canvas.width - tileset.tile_width * tiles_wide) / 2) : isNaN(arguments[4]) ? 0 : Number(arguments[4]);
            y = arguments[5] === undefined && context && tileset ? Math.floor((context.canvas.width - tileset.tile_width * tiles_tall) / 2) : isNaN(arguments[5]) ? 0 : Number(arguments[5]);
            if (isNaN(origin_x = Number(origin_x))) origin_x = 0;
            if (isNaN(origin_y = Number(origin_y))) origin_y = 0;

            //  Making the map:

            Object.defineProperties(this, {
                context: {
                    value: context
                },
                map: {
                    value: decoded_map
                },
                origin_x: {
                    get: function () {return origin_x},
                    set: function (n) {if (!isNaN(n)) origin_x = Number(n);}
                },
                origin_y: {
                    get: function () {return origin_y},
                    set: function (n) {if (!isNaN(n)) origin_y = Number(n);}
                },
                tile_height: {
                    value: tileset ? tileset.tile_height : 0
                },
                tile_width: {
                    value: tileset ? tileset.tile_width : 0
                },
                tiles_tall: {
                    value: tiles_tall
                },
                tiles_wide: {
                    value: tiles_wide
                },
                tileset: {
                    value: tileset
                },
                x: {
                    get: function () {return x},
                    set: function (n) {if (!isNaN(n)) x = Number(n);}
                },
                y: {
                    get: function () {return y},
                    set: function (n) {if (!isNaN(n)) y = Number(n);}
                },
            });

        }

        //  Map prototyping:

        Map.prototype = Object.create(Object.prototype, {
            collides: {
                value: function (sx, sy) {
                    var collision;
                    var x;
                    var y;
                    if (!(this.tileset instanceof Tileset)) return;
                    if (isNaN(sx = Number(sx)) || isNaN(sy = Number(sy))) return null;
                    x = isNaN(this.x) ? sx : sx - Number(this.x);
                    y = isNaN(this.y) ? sy : sy - Number(this.y);
                    if (x < 0 || x >= this.tile_width * this.tiles_wide || y < 0 || y >= this.tile_height * this.tiles_tall) return 0x0;
                    collision = this.tileset.getCollision(this.map[Math.floor(x / this.tile_width) + Math.floor(y / this.tile_height) * this.tiles_wide]);
                    if ((0 <= x && x % this.tile_width <= this.tile_width / 2) || (0 > x && x % this.tile_width <= -this.tile_width / 2)) {
                        return ((0 <= y && y % this.tile_height <= this.tile_height / 2) || (0 > y && y % this.tile_height <= -this.tile_height / 2)) ? collision & 0x1 : collision & 0x4;
                    }
                    else {
                        return ((0 <= y && y % this.tile_height <= this.tile_height / 2) || (0 > y && y % this.tile_height <= -this.tile_height / 2)) ? collision & 0x2 : collision & 0x8;
                    }
                }
            },
            draw: {
                value: function () {
                    var i;
                    if (!(this.context instanceof CanvasRenderingContext2D) || !Number(this.tile_width) || !Number(this.tile_height) || !Number(this.tiles_wide) || typeof this.map !== "object") return;
                    for (i = 0; i < this.map.length; i++) {
                        this.tileset.draw(this.context, this.map[i], Number(this.x) + (i % this.tiles_wide) * this.tile_width - this.origin_x, Number(this.y) + Math.floor(i / this.tiles_wide) * this.tile_height - this.origin_y);
                    }
                }
            },
            getCollisionEdge: {
                value: function (dir, sx, sy) {
                    var collision;
                    var corner;
                    var i;
                    var ix;
                    var iy;
                    var x;
                    var y;
                    if (!(dir == "left" || dir == "top" || dir == "right" || dir == "bottom") || isNaN(sx = Number(sx)) || isNaN(sy = Number(sy))) return undefined;
                    x = Math.round(isNaN(this.x) ? sx : sx - Number(this.x));
                    y = Math.round(isNaN(this.y) ? sy : sy - Number(this.y));
                    if (x % (this.tile_width / 2) === 0 || y % (this.tile_height / 2) === 0) {
                        switch (dir) {
                            case "left":
                            case "right":
                                return sx;
                            case "top":
                            case "bottom":
                                return sy;
                        }
                    }
                    ix = Math.floor(x / this.tile_width);
                    iy = Math.floor(y / this.tile_height);
                    i = ix + iy * this.tiles_wide;
                    if (x < 0 || x >= this.tile_width * this.tiles_wide || y < 0 || y >= this.tile_height * this.tiles_tall) {
                        collision = 0x0;
                        corner = 0x0;
                    }
                    else {
                        collision = this.tileset.getCollision(this.map[i]);
                        corner = this.collides(sx, sy);
                    }
                    if (!corner && (dir == "left" || dir == "right")) return sx;
                    else if (!corner && (dir == "top" || dir == "bottom")) return sy;
                    switch (dir) {
                        case "left":
                            if (x > this.tile_width * this.tiles_wide) return this.tile_width * this.tiles_wide + this.x;
                            else if (y < 0 || y >= this.tile_height * this.tiles_tall) return sx;
                            return ((corner == 0x2 && !(collision & 0x1)) || (corner == 0x8 && !(collision & 0x4))) ? ix * this.tile_width + this.tile_width / 2 + this.x : ix * this.tile_width + this.x;
                        case "right":
                            if (x < 0) return this.x;
                            else if (y < 0 || y >= this.tile_height * this.tiles_tall) return sx;
                            return ((corner == 0x1 && !(collision & 0x2)) || (corner == 0x4 && !(collision & 0x8))) ? ix * this.tile_width + this.tile_width / 2 + this.x : ix * this.tile_width + this.tile_width + this.x;
                        case "top":
                            if (y > this.tile_height * this.tiles_tall) return this.tile_height * this.tiles_tall + this.y;
                            else if (x < 0 || x >= this.tile_width * this.tiles_wide) return sy;
                            return ((corner == 0x4 && !(collision & 0x1)) || (corner == 0x8 && !(collision & 0x2))) ? iy * this.tile_height + this.tile_height / 2 + this.y : iy * this.tile_height + this.y;
                        case "bottom":
                            if (y < 0) return this.y;
                            else if (x < 0 || x >= this.tile_width * this.tiles_wide) return sy;
                            return ((corner == 0x1 && !(collision & 0x4)) || (corner == 0x2 && !(collision & 0x8))) ? iy * this.tile_height + this.tile_height / 2 + this.y : iy * this.tile_height + this.tile_height + this.y;
                    }
                }
            }
        });

        //  Tileset constructor:

        function Tileset(sheet, tile_width, tile_height, collisions, draw) {

            //  Handling arguments and error checking:

            if (isNaN(tile_width = Number(tile_width))) tile_width = 0;
            if (isNaN(tile_height = Number(tile_height))) tile_height = 0;
            if (!(typeof draw === "function" || draw instanceof Function)) draw = null;

            //  Adding properties:

            Object.defineProperties(this, {
                collisions: {
                    value: decode64(collisions)
                },
                drawFunction: {
                    value: draw
                },
                sheet: {
                    value: sheet
                },
                tile_height: {
                    value: tile_height
                },
                tile_width: {
                    value: tile_width
                }
            });

        }

        //  Tiles prototyping:

        Tileset.prototype = Object.create(Object.prototype, {
            draw: {
                value: function (context, index, x, y) {
                    if (typeof this.drawFunction === "function" || this.drawFunction instanceof Function) return this.drawFunction(context, this.sheet, index, x, y);
                }
            },
            getMap: {
                value: function (context, map, tiles_wide /*  x, y (if not provided, the map will be centred on the screen), origin_x, origin_y (if not provided, initialized to (0,0))  */) {
                    var args = [null, this].concat(Array.prototype.slice.call(arguments));
                    return new (Map.bind.apply(Map, args))();
                }
            },
            getCollision: {
                value: function (index) {
                    return isNaN(index) ? null : (this.collisions[Math.floor(index / 2)] >> 4 * ((index + 1) % 2)) & 0xF;
                }
            }
        });

        //  Defining shorthands for tile quadrants:

        Tileset.collision = Object.create(null, {
            NO_COLLISION: {value: 0x0},
            TOPLEFT: {value: 0x1},
            TOPRIGHT: {value: 0x2},
            BOTTOMLEFT: {value: 0x4},
            BOTTOMRIGHT: {value: 0x8}
        });

        //  Making constructors accessible:

        Tileset.Map = Map;

        return Tileset;

    })();

    /*
        The game engine itself follows.
        I've placed it inside its own closure for convenient packaging, but it requires all of the previous modules to be loaded.
    */

    return (function () {

        //  Area constructor:

        function Area(game, index) {

            //  Setting up variables:

            var clear = true;
            var items;
            var elt;
            var i;
            var item;
            var props;
            var x;
            var y;

            //  Handling arguments:

            if (!(game instanceof Game)) return;
            elt = game.data.getElementsByClassName("area").item(index);
            if (!(elt instanceof Element)) return;

            //  Defining properties:

            Object.defineProperty(this, "game", {value: game});
            Object.defineProperties(this, {
                characters: {value: new Collection(this, Character)},
                clear: {
                    get: function () {return clear},
                    set: function (n) {clear = !!n;}
                },
                functions: {value: elt.functions},
                images: {value: new Collection(this, JelliImage)},
                index: {
                    get: function () {return index},
                    set: function (n) {this.game.loadArea(n);}
                },
                maps: {
                    value: []
                },
                x: {
                    get: function () {return x;},
                    set: function (n) {
                        var i;
                        if (isNaN(n)) return;
                        x = Number(n);
                        for (i = 0; i < this.maps.length; i++) {
                            this.maps[i].origin_x = x;
                        }
                        this.clear = true;
                    }
                },
                y: {
                    get: function () {return y;},
                    set: function (n) {
                        var i;
                        if (isNaN(n)) return;
                        y = Number(n);
                        for (i = 0; i < this.maps.length; i++) {
                            this.maps[i].origin_y = y;
                        }
                        this.clear = true;
                    }
                }
            });

            //  Loading maps:

            for (items = elt.getElementsByClassName("map"), i = 0; i < items.length; i++) {
                item = items.item(i);
                this.maps[i] = game.tilesets[item.dataset.tileset].getMap(game.screens[item.dataset.screen].context, item.textContent.trim(), item.dataset.mapwidth, isNaN(item.dataset.dx) ? 0 : item.dataset.dx, isNaN(item.dataset.dy) ? 0 : item.dataset.dy, this.x, this.y);
            }
            Object.freeze(this.maps);

            //  Loading characters:

            for (items = (elt.dataset.characters ? elt.dataset.characters.split(/\s+/) : []), i = 0; i < items.length; i++) {
                this.characters.load(items[i]);
            }

            //  Initializing properties:

            this.x = 0; //  This initializes the x value across the board
            this.y = 0; //  This initializes the y value across the board

            //  Initialization:

            if (typeof this.functions === "object" && (typeof this.functions.init === "function" || this.functions.init instanceof Function)) this.functions.init.call(this);

            //  Area sealing:

            Object.seal(this);

        }

        //  Area prototyping:

        Area.prototype = Object.create(Object.prototype, {
            draw: {
                value: function (context) {
                    var i;
                    if (this.clear) {
                        for (i = 0; i < this.maps.length; i++) {
                            this.maps[i].draw();
                        }
                    }
                    this.characters.doForEach(function (character) {character.draw();});
                    this.images.doForEach(function (image) {image.draw();});
                    this.clear = false;
                }
            },
            step: {
                value: function () {
                    if (typeof this.functions === "object" && (typeof this.functions.step === "function" || this.functions.step instanceof Function)) this.functions.step.call(this);
                    this.characters.doForEach(function (character) {if (character.step) character.step();});
                }
            }
        });

        //  Character constructor:

        function Character(collection, name /*  Optional x, y, sprite OR id, x, y, sprite  */) {

            //  Setting up variables:

            var direction;
            var elt;
            var frame;
            var i;
            var id;
            var item;
            var items;
            var sprite;
            var sprites;
            var velocity;
            var x;
            var y;

            //  Handling arguments:

            if (typeof arguments[2] === "number" || arguments[2] instanceof Number) {
                id = name;
                x = arguments[2];
                if (isNaN(y = Number(arguments[3]))) y = undefined;
                if (isNaN(sprite = Number(arguments[4]))) sprite = 0;
            }
            else {
                id = arguments[2] ? arguments[2] : name;
                if (isNaN(x = Number(arguments[3]))) x = undefined;
                if (isNaN(y = Number(arguments[4]))) y = undefined;
                if (isNaN(sprite = Number(arguments[5]))) sprite = 0;
            }
            if (collection instanceof Collection && collection.game instanceof Game && collection.game.data instanceof Node) elt = collection.game.data.getElementsByTagName("*").namedItem(id);

            //  Loading sprites:

            sprites = {};
            item = (collection instanceof Collection && collection.game instanceof Game && collection.game.data instanceof Node && collection.game.data.getElementsByTagName("*").namedItem(elt.dataset.sprites) && collection.game.data.getElementsByTagName("*").namedItem(elt.dataset.sprites).className === "sprites") ? collection.game.data.getElementsByTagName("*").namedItem(elt.dataset.sprites) : null;
            for (items = item ? item.getElementsByClassName("sprite") : [], i = 0; i < items.length; i++) {
                if (sprites[i] === undefined) Object.defineProperty(sprites, i, {value: collection.game.sheets[item.dataset.sheet] ? collection.game.sheets[item.dataset.sheet].getSprite(items.item(i).dataset.index, items.item(i).dataset.length ? items.item(i).dataset.length : 1) : null});
                if (items.item(i).hasAttribute("title") && sprites[items.item(i).getAttribute("title")] === undefined) Object.defineProperty(sprites, items.item(i).getAttribute("title"), {value: sprites[i]});
            }

            //  Defaults:

            direction = undefined;
            frame = 0;
            velocity = 0;

            //  Creating as a Jelli:

            Jelli.call(this, collection instanceof Collection ? collection.area : undefined, collection instanceof Collection && collection.game instanceof Game && collection.game.screens ? collection.game.screens[elt.dataset.screen] : undefined, id, x, y, item && item.dataset.boxWidth ? item.dataset.boxWidth : sprites[0] ? sprites[0].width : undefined, item && item.dataset.boxHeight ? item.dataset.boxHeight : sprites[0] ? sprites[0].height : undefined, item ? item.dataset.originX : undefined, item ? item.dataset.originY : undefined);

            //  Defining properties:

            Object.defineProperties(this, {
                box_x: {value: isNaN(item.dataset.boxX) ? 0 : Number(item.dataset.boxX)},
                box_y: {value: isNaN(item.dataset.boxY) ? 0 : Number(item.dataset.boxY)},
                collides: {value: elt && elt.hasAttribute("data-collides") ? elt.dataset.collides : 0},
                direction: {
                    get: function () {return direction},
                    set: function (n) {if (!isNaN(n)) direction = Number(n);}
                },
                frame: {
                    get: function () {return frame},
                    set: function (n) {if (!isNaN(n)) frame = Number(n);}
                },
                init: {value: elt && typeof elt.functions === "object" && (typeof elt.functions.init === "function" || elt.functions.init instanceof Function) ? elt.functions.init.bind(this) : function () {}},
                sprite: {
                    get: function () {return sprite},
                    set: function (n) {if (this.sprites[n]) sprite = n;}
                },
                sprite_height: {value: sprites[0].height},
                sprite_width: {value: sprites[0].width},
                sprites: {value: sprites},
                step: {value: elt && typeof elt.functions === "object" && (typeof elt.functions.step === "function" || elt.functions.step instanceof Function) ? elt.functions.step.bind(this) : function () {}},
                velocity: {
                    get: function () {return velocity},
                    set: function (n) {if (!isNaN(n)) velocity = Number(n);}
                }
            });

            //  Initialization:

            this.init();

            //  Character sealing:

            Object.seal(this);

        }

        //  Character prototyping:

        Character.prototype = Object.create(Jelli.prototype, {
            draw: {
                value: function () {
                    if (!(this.screen instanceof Screen)) return;
                    return this.sprites[this.sprite].draw(this.screen.context, Math.round(this.edges.screen_left - this.box_x), Math.round(this.edges.screen_top - this.box_y), this.frame);
                }
            },
            getCollisionEdge: {
                value: function (dir, x, y) {
                    if (!(dir == "left" || dir == "top" || dir == "right" || dir == "bottom")) return undefined;
                    if (isNaN(x) || isNaN(y)) return undefined;
                    x = Number(x);
                    y = Number(y);
                    if (!this.collides && this.collides !== "" || this.collides === "map" || x <= Math.round(this.edges.left) || x >= Math.round(this.edges.right) || y <= Math.round(this.edges.top) || y >= Math.round(this.edges.bottom)) {
                        switch (dir) {
                            case "left":
                            case "right":
                                return x;
                            case "top":
                            case "bottom":
                                return y;
                        }
                    }
                    switch (dir) {
                        case "left":
                            return Math.round(this.edges.left);
                        case "right":
                            return Math.round(this.edges.right);
                        case "top":
                            return Math.round(this.edges.top);
                        case "bottom":
                            return Math.round(this.edges.bottom);
                    }
                }
            },
            target: {
                value: function(cx, cy) {
                    var dx = cx - this.x;
                    var dy = cy - this.y;
                    return this.targetBy(dx, dy);
                }
            },
            targetBy: {
                value: function(dx, dy) {
                    var c;
                    var d;
                    var i;
                    var ix;
                    var iy;
                    var j;
                    var k;
                    var ux;
                    var uy;
                    var s;
                    var t;
                    c = !this.collides && this.collides !== "" ? 0 : this.collides === "map" ? 1 : this.collides === "character" ? 2 : 3;
                    d = Math.sqrt(dx * dx + dy * dy);
                    if (!(this.area instanceof Area) || !(this.area.characters instanceof Collection) || typeof this.area.maps !== "object" || !d) return;
                    ix = this.x;
                    iy = this.y;
                    if (d > 1) {
                        ux = dx / d;
                        uy = dy / d;
                    }
                    else {
                        ux = dx;
                        uy = dy;
                    }
                    if (dx > 0) {
                        s = this.edges.right + ux;
                        if (c & 1) {
                            for (i = 0; i < this.area.maps.length; i++) {
                                k = Math.floor(this.height / (this.area.maps[i].tile_height / 2)) + 1;
                                for (j = 0; j <= k; j++) {
                                    t = this.area.maps[i].getCollisionEdge("left", this.edges.right + ux, this.edges.top + j * this.height / k);
                                    if (s > t) s = t;
                                }
                            }
                        }
                        if (c & 2) {
                            this.area.characters.doForEach((function (some) {
                                if (this === some || some.collides === 0 || some.collides === "map") return;
                                k = Math.floor(this.height / some.height) + 1;
                                for (j = 0; j <= k; j++) {
                                    t = some.getCollisionEdge("left", this.edges.right + ux, this.edges.top + j * this.height / k);
                                    if (s > t) s = t;
                                }
                            }).bind(this));
                        }
                        if (s > this.edges.right) this.edges.right = s;
                    }
                    else if (dx < 0) {
                        s = this.edges.left + ux;
                        if (c & 1) {
                            for (i = 0; i < this.area.maps.length; i++) {
                                k = Math.floor(this.height / (this.area.maps[i].tile_height / 2)) + 1;
                                for (j = 0; j <= k; j++) {
                                    t = this.area.maps[i].getCollisionEdge("right", this.edges.left + ux, this.edges.top + j * this.height / k);
                                    if (s < t) s = t;
                                }
                            }
                        }
                        if (c & 2) {
                            this.area.characters.doForEach((function (some) {
                                if (this === some || some.collides === 0 || some.collides === "map") return;
                                k = Math.floor(this.height / some.height) + 1;
                                for (j = 0; j <= k; j++) {
                                    t = some.getCollisionEdge("right", this.edges.left + ux, this.edges.top + j * this.height / k);
                                    if (s < t) s = t;
                                }
                            }).bind(this));
                        }
                        if (s < this.edges.left) this.edges.left = s;
                    }
                    if (dy > 0) {
                        s = this.edges.bottom + uy;
                        if (c & 1) {
                            for (i = 0; i < this.area.maps.length; i++) {
                                k = Math.floor(this.width / (this.area.maps[i].tile_width / 2)) + 1;
                                for (j = 0; j <= k; j++) {
                                    t = this.area.maps[i].getCollisionEdge("top", this.edges.left + j * this.width / k, this.edges.bottom + uy);
                                    if (s > t) s = t;
                                }
                            }
                        }
                        if (c & 2) {
                            this.area.characters.doForEach((function (some) {
                                if (this === some || some.collides === 0 || some.collides === "map") return;
                                k = Math.floor(this.width /some.width) + 1;
                                for (j = 0; j <= k; j++) {
                                    t = some.getCollisionEdge("top", this.edges.left + j * this.width / k, this.edges.bottom + uy);
                                    if (s > t) s = t;
                                }
                            }).bind(this));
                        }
                        if (s > this.edges.bottom) this.edges.bottom = s;
                    }
                    else if (dy < 0) {
                        s = this.edges.top + uy;
                        if (c & 1) {
                            for (i = 0; i < this.area.maps.length; i++) {
                                k = Math.floor(this.width / (this.area.maps[i].tile_width / 2)) + 1;
                                for (j = 0; j <= k; j++) {
                                    t = this.area.maps[i].getCollisionEdge("bottom", this.edges.left + j * this.width / k, this.edges.top + uy);
                                    if (s < t) s = t;
                                }
                            }
                        }
                        if (c & 2) {
                            this.area.characters.doForEach((function (some) {
                                if (this === some || !this.collides && this.collides !== "" || some.collides === "map") return;
                                k = Math.floor(this.width / some.width) + 1;
                                for (j = 0; j <= k; j++) {
                                    t = some.getCollisionEdge("bottom", this.edges.left + j * this.width / k, this.edges.top + uy);
                                    if (s < t) s = t;
                                }
                            }).bind(this));
                        }
                        if (s < this.edges.top) this.edges.top = s;
                    }
                    dx = this.x - ix;
                    dy = this.y - iy;
                    this.direction = dy < 0 ? Math.tan(dx / -dy) : dy > 0 ? (dx >= 0 ? Math.tan(dx / -dy) + Math.PI : Math.tan(dx / -dy) - Math.PI) : dx > 0 ? Math.PI / 2 : dx < 0 ? -Math.PI / 2 : undefined;
                    this.velocity = Math.sqrt(dx * dx + dy * dy);
                }
            }
        });

        //  Collection constructor:

        function Collection(parent, constructor) {

            var area;
            var game;
            var len;
            var nextIndex = 0;

            if (parent instanceof Area) {
                area = parent;
                game = parent.game;
            }
            else if (parent instanceof Game) {
                game = parent;
            }

            Object.defineProperties(this, {
                area: {value: area},
                Type: {value: constructor},
                game: {value: game},
                nextIndex: {
                    get: function () {return nextIndex},
                    set: function (n) {
                        n = Number(n);
                        if (n > nextIndex) nextIndex = n;
                    }
                },
                parent: {value: parent}
            });

        }

        //  Collection prototyping:

        Collection.prototype = Object.create(Object.prototype, {
            doForEach: {
                value: function (fn) {
                    var i;
                    for (i in this) {
                        if (!this.Type || this[i] instanceof this.Type) fn(this[i]);
                    }
                }
            },
            kill: {value: function (name) {if (this.hasOwnProperty(name)) delete this[name];}},
            load: {
                value: function (name) {
                    var args = [null, this].concat(Array.prototype.slice.call(arguments));
                    this[name] = typeof this.Type === "function" || this.Type instanceof Function ? new (this.Type.bind.apply(this.Type, args))() : null;
                    return Object.defineProperty(this[name], "kill", {
                        value: this.kill.bind(this, name),
                        writable: false
                    });
                }
            },
            loadNameless: {
                value: function () {
                    var args = [null, this, this.nextIndex].concat(Array.prototype.slice.call(arguments));
                    while (this.hasOwnProperty(this.nextIndex)) {this.nextIndex++;}
                    this[this.nextIndex] = typeof this.Type === "function" || this.Type instanceof Function ? new (this.Type.bind.apply(this.Type, args))() : null;
                    if (this[this.nextIndex]) Object.defineProperty(this[this.nextIndex], "kill", {value: this.kill.bind(this, this.nextIndex)});
                    return this[this.nextIndex++];
                }
            }
        });

        //  Game constructor:

        function Game(doc) {

            //  Setting up variables:

            var area;
            var collection;
            var collection_2;
            var data;
            var i;
            var j;
            var resized = true;

            //  Handling arguments and making sure modules are loaded:

            if (!(doc instanceof Document) || doc.game || typeof Screen === "undefined" || !Screen || typeof Control === "undefined" || !Control || typeof Sheet === "undefined" || !Sheet || typeof Letters === "undefined" || !Letters || typeof Tileset === "undefined" || !Tileset) return;
            Object.defineProperty(doc, "game", {value: this});

            //  imported() and placed() functions:

            function placed(node) {return (node instanceof Node) ? doc.body.appendChild(node) : doc.body.appendChild(data.getElementsByTagName("*").namedItem(node));}

            //  Setting up the data document and clearing the body

            data = doc.documentElement.replaceChild(doc.createElement("body"), doc.body);
            doc.body.style.visibility = "hidden";

            //  Defining properties:

            Object.defineProperties(this, {
                area: {
                    get: function () {return area},
                    set: function (n) {
                        if (n instanceof Area) area = n;
                        else this.loadArea(n);
                    }
                },
                clicks: {value: {}},
                control: {value: new Control(true, doc)},
                data: {value: data},
                document: {value: doc},
                images: {value: {}},
                letters: {value: {}},
                resized: {
                    get: function () {return resized},
                    set: function (n) {resized = Number(!!n);}
                },
                screens: {value: {}},
                sheets: {value: {}},
                texts: {value: new Collection(this, Text)},
                tilesets: {value: {}},
                touches: {value: {}},
                window: {value: doc.defaultView ? doc.defaultView : window}
            });

            //  Loading screens:

            for (collection = data.getElementsByTagName("canvas"), i = 0; i < collection.length; /*  Do nothing  */) {
                if (!collection.item(i).classList.contains("screen")) {
                    i++;
                    continue;
                }
                Object.defineProperty(this.screens, j = collection.item(i).id, {value: new Screen(placed(collection.item(i)), "2d"), enumerable: true});
                if (!this.placement_screen) Object.defineProperty(this, "placement_screen", {value: this.screens[j]});
            }
            Object.freeze(this.screens);

            //  Loading images:

            for (collection = data.getElementsByClassName("image"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.images, collection.item(i).id, {value: collection.item(i)});
            }

            //  Sprite sheet setup:

            for (collection = data.getElementsByClassName("letters"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.letters, collection.item(i).id, {value: new Letters(collection.item(i), collection.item(i).dataset.spriteWidth, collection.item(i).dataset.spriteHeight, doc)});
            }
            Object.freeze(this.letters);

            for (collection = data.getElementsByClassName("sheet"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.sheets, collection.item(i).id, {value: new Sheet(collection.item(i), collection.item(i).dataset.spriteWidth, collection.item(i).dataset.spriteHeight)});
            }
            Object.freeze(this.sheets);

            for (collection = data.getElementsByClassName("tileset"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.tilesets, collection.item(i).id, {value: new Tileset(new Sheet(collection.item(i), collection.item(i).dataset.spriteWidth, collection.item(i).dataset.spriteHeight), collection.item(i).dataset.spriteWidth, collection.item(i).dataset.spriteHeight, collection.item(i).dataset.collisions.trim(), Sheet.drawSheetAtIndex)});
            }
            Object.freeze(this.tilesets);

            //  Initializing the game code:

            if (typeof data.functions === "object" && (typeof data.functions.init === "function" || data.functions.init instanceof Function)) data.functions.init.call(this);

            //  Game sealing:

            Object.seal(this);

            //  Adding event listeners:

            this.window.addEventListener("keydown", this, false);
            this.window.addEventListener("resize", this, false);
            this.window.addEventListener("contextmenu", this, false);
            doc.documentElement.addEventListener("touchstart", this, false);
            doc.documentElement.addEventListener("touchend", this, false);
            doc.documentElement.addEventListener("touchmove", this, false);
            doc.documentElement.addEventListener("touchcancel", this, false);
            doc.documentElement.addEventListener("mousedown", this, false);
            doc.documentElement.addEventListener("mouseup", this, false);
            doc.documentElement.addEventListener("mousemove", this, false);

            //  Starting the render and logic processes:

            this.window.requestAnimationFrame(this.draw.bind(this))
            this.step();

        }

        //  Game prototyping:

        Game.prototype = Object.create(Object.prototype, {
            clearScreen: {
                value: function (screen) {
                    if (!(screen instanceof Screen)) screen = this.screens[screen]
                    if ((screen instanceof Screen)) screen.canvas.dataset.clear = "";
                }
            },
            draw: {
                value: function () {
                    var i;
                    if (this.resized) this.layout();
                    for (i in this.screens) {
                        if (this.screens[i].canvas.hasAttribute("data-clear")) {
                            this.screens[i].clear();
                            this.screens[i].canvas.removeAttribute("data-clear");
                            continue;
                        }
                        switch (this.screens[i].canvas.dataset.type) {
                            case "area":
                                if (this.area instanceof Area && this.area.clear) this.screens[i].clear();
                                break;
                            case "animation":
                                this.screens[i].clear();
                                break;
                            default:
                                /*  Do nothing  */
                                break;
                        }
                    }
                    if (this.area instanceof Area) this.area.draw();
                    for (i in this.texts) {
                        this.texts[i].draw()
                    }
                    this.resized = false;
                    this.window.requestAnimationFrame(this.draw.bind(this));
                }
            },
            handleEvent: {
                value: function (e) {
                    var i;
                    var j;
                    var k;
                    var n;
                    switch (e.type) {
                        case "contextmenu":
                            e.preventDefault();
                            break;
                        case "keydown":
                            k = e.code || e.key || e.keyIdentifier || e.keyCode;
                            if (this.document.documentElement.hasAttribute("data-touch")) {
                                this.document.documentElement.removeAttribute("data-touch");
                                this.resized = true;
                            }
                            if (k === "Tab" || k === "U+0009" || k === 0x09) {
                                if (!(this.document.fullscreenElement || this.document.mozFullScreenElement || this.document.webkitFullscreenElement || this.document.msFullscreenElement)) {
                                    if (this.document.body.requestFullscreen) this.document.body.requestFullscreen();
                                    else if (this.document.body.mozRequestFullScreen) this.document.body.mozRequestFullScreen();
                                    else if (this.document.body.webkitRequestFullscreen) this.document.body.webkitRequestFullscreen();
                                    else if (this.document.body.msRequestFullscreen) this.document.body.msRequestFullscreen();
                                }
                                else {
                                    if (this.document.exitFullscreen) document.this.exitFullscreen();
                                    else if (this.document.mozCancelFullScreen) this.document.mozCancelFullScreen();
                                    else if (this.document.webkitExitFullscreen) this.document.webkitExitFullscreen();
                                    else if (this.document.msExitFullscreen) this.document.msExitFullscreen();
                                }
                            }
                            break;
                        case "mousedown":
                            e.preventDefault();
                            this.clicks[e.button] = new Poke(this, e, e.button);
                            break;
                        case "mousemove":
                            e.preventDefault();
                            for (i in this.clicks) {
                                this.clicks[i].updateWith(e);
                            }
                            break;
                        case "mouseup":
                            e.preventDefault();
                            delete this.clicks[e.button];
                            break;
                        case "resize":
                            this.resized = true;
                            break;
                        case "touchcancel":
                        case "touchend":
                            e.preventDefault();
                            k = e.changedTouches;
                            for (i = 0; i < k.length; i++) {
                                delete this.touches[k[i].identifier];
                            }
                            break;
                        case "touchmove":
                            e.preventDefault();
                            k = e.changedTouches;
                            for (i = 0; i < k.length; i++) {
                                this.touches[k[i].identifier].updateWith(k[i]);
                            }
                            break;
                        case "touchstart":
                            e.preventDefault();
                            if (!this.document.documentElement.hasAttribute("data-touch")) {
                                this.document.documentElement.setAttribute("data-touch", "");
                                this.resized = true;
                            }
                            j = 0;
                            while (n !== j) {
                                n = j;
                                for (i in this.touches) {
                                    if (j === this.touches[i].number) j++;
                                }
                            }
                            k = e.changedTouches;
                            for (i = 0; i < k.length; i++) {
                                this.touches[k[i].identifier] = new Poke(this, k[i], n);
                            }
                            break;
                    }
                }
            },
            layout: {
                value: function () {
                    var body_height;
                    var body_width;
                    var canvas;
                    var i;
                    var scaled_height;
                    var scaled_width;
                    var temporary_height;
                    var temporary_width;
                    this.document.documentElement.style.margin = "0";
                    this.document.documentElement.style.padding = "0";
                    this.document.documentElement.style.background = "black";
                    this.document.documentElement.style.imageRendering = "-webkit-optimize-contrast";
                    this.document.documentElement.style.imageRendering = "-moz-crisp-edges";
                    this.document.documentElement.style.imageRendering = "pixelated";
                    this.document.documentElement.style.WebkitTouchCallout = "none";
                    this.document.documentElement.style.webkitTouchCallout = "none";
                    this.document.documentElement.style.WebkitUserSelect = "none";
                    this.document.documentElement.style.webkitUserSelect = "none";
                    this.document.documentElement.style.msUserSelect = "none";
                    this.document.documentElement.style.MozUserSelect = "none";
                    this.document.documentElement.style.userSelect = "none";
                    this.document.body.style.position = "absolute";
                    this.document.body.style.top = "0";
                    this.document.body.style.bottom = "0";
                    this.document.body.style.left = "0";
                    this.document.body.style.right = "0";
                    this.document.body.style.margin = "0";
                    this.document.body.style.border = "none";
                    this.document.body.style.padding = "0";
                    body_width = this.document.body.clientWidth;
                    body_height = this.document.body.clientHeight;
                    canvas = this.placement_screen
                    for (i in this.screens) {
                        canvas = this.screens[i].canvas;
                        if (body_width / body_height > canvas.width / canvas.height) {
                            if (body_height < canvas.height) scaled_height = body_height;
                            else scaled_height = canvas.height * Math.floor(body_height / canvas.height);
                            scaled_width = Math.floor(canvas.width * scaled_height / canvas.height);
                        }
                        else {
                            if (body_width < canvas.width) scaled_width = body_width;
                            else scaled_width = canvas.width * Math.floor(body_width / canvas.width);
                            scaled_height = Math.floor(canvas.height * scaled_width / canvas.width);
                        }
                        canvas.style.display = "block";
                        canvas.style.position = "absolute";
                        canvas.style.margin = 0;
                        canvas.style.borderStyle = "none";
                        canvas.style.borderWidth = "0";
                        canvas.style.borderColor = "transparent";
                        canvas.style.top = "calc(50% - " + (scaled_height / 2) + "px)";
                        canvas.style.left = "calc(50% - " + (scaled_width / 2) + "px)";
                        canvas.style.width = scaled_width + "px";
                        canvas.style.height = scaled_height + "px";
                    }
                    this.document.body.style.visibility = "";
                }
            },
            loadArea: {value: function (index) {this.area = new Area(this, index);}},
            step: {
                value: function () {
                    var i;
                    if (typeof this.data.functions === "object" && (typeof this.data.functions.step === "function" || this.data.functions.step instanceof Function)) this.data.functions.step.call(this);
                    if (this.area instanceof Area) this.area.step();
                    this.window.setTimeout(this.step.bind(this), 1000/60);
                }
            }
        });

        //  Jelli constructor:

        function Jelli(area, screen, id, x, y, width, height /*  Optional origin_x, origin_y  */) {

            //  Setting up variables:

            var origin_x;
            var origin_y

            //  Argument handling:

            if (isNaN(width = Number(width))) width = 0;
            if (isNaN(height = Number(height))) height = 0;
            if (isNaN(origin_x = Number(arguments[7]))) origin_x = width / 2;
            if (isNaN(origin_y = Number(arguments[8]))) origin_y = height / 2;
            if (isNaN(x = Number(x))) x = origin_x;
            if (isNaN(y = Number(y))) y = origin_y;

            Object.defineProperties(this, {
                area: {value: area instanceof Area ? area : undefined},
                edges: {
                    value: Object.create(null, {
                        bottom: {
                            get: (function () {return y - this.origin_y + this.height;}).bind(this),
                            set: (function (n) {if (!isNaN(n)) y = Number(n) - this.height + this.origin_y;}).bind(this)
                        },
                        left: {
                            get: (function () {return x - this.origin_x;}).bind(this),
                            set: (function (n) {if (!isNaN(n)) x = Number(n) + this.origin_x;}).bind(this)
                        },
                        right: {
                            get: (function () {return x - this.origin_x + this.width;}).bind(this),
                            set: (function (n) {if (!isNaN(n)) x = Number(n) - this.width + this.origin_x;}).bind(this)
                        },
                        screen_bottom: {
                            get: (function () {return y - this.origin_y + this.height - this.area.y;}).bind(this),
                            set: (function (n) {if (!isNaN(n)) y = Number(n) - this.height + this.origin_y + this.area.y;}).bind(this)
                        },
                        screen_left: {
                            get: (function () {return x - this.origin_x - this.area.x;}).bind(this),
                            set: (function (n) {if (!isNaN(n)) x = Number(n) + this.origin_x + this.area.x;}).bind(this)
                        },
                        screen_right: {
                            get: (function () {return x - this.origin_x + this.width - this.area.x;}).bind(this),
                            set: (function (n) {if (!isNaN(n)) x = Number(n) - this.width + this.origin_x + this.area.x;}).bind(this)
                        },
                        screen_top: {
                            get: (function () {return y - this.origin_y - this.area.y;}).bind(this),
                            set: (function (n) {if (!isNaN(n)) y = Number(n) + this.origin_y + this.area.y;}).bind(this)
                        },
                        top: {
                            get: (function () {return y - this.origin_y;}).bind(this),
                            set: (function (n) {if (!isNaN(n)) y = Number(n) + this.origin_y;}).bind(this)
                        }
                    })
                },
                game: {value: area instanceof Area && area.game instanceof Game ? area.game : undefined},
                height: {value: height},
                id: {
                    value: id,
                    enumerable: true
                },
                kill: {
                    value: null,
                    writable: true
                },
                origin_x: {value: origin_x},
                origin_y: {value: origin_y},
                screen: {value: screen},
                screen_x: {
                    get: function () {return x - this.area.x},
                    set: function (n) {if (!isNaN(n)) x = Number(n) + this.area.y}
                },
                screen_y: {
                    get: function () {return y - this.area.y},
                    set: function (n) {if (!isNaN(n)) x = Number(n) + this.area.y}
                },
                width: {value: width},
                x: {
                    enumerable: true,
                    get: function () {return x},
                    set: function (n) {if (!isNaN(n)) x = Number(n);}
                },
                y: {
                    enumerable: true,
                    get: function () {return y},
                    set: function (n) {if (!isNaN(n)) y = Number(n);}
                }
            });

        }

        //  Jelli prototyping:

        Jelli.prototype = Object.create(Object.prototype, {
            draw: {
                value: function () {}
            },
            setPosition: {
                value: function (x, y) {
                    this.x = x;
                    this.y = y;
                }
            }
        });

        //  Image constructor:

        function JelliImage(collection, name /*  Optional x, y, placed OR id, x, y, placed  */) {

            //  Setting up variables:

            var elt;
            var id;
            var placed;
            var source_width;
            var source_height;
            var x;
            var y;

            //  Handling arguments:

            if (typeof arguments[2] === "number" || arguments[2] instanceof Number) {
                id = name;
                x = arguments[2];
                if (isNaN(y = Number(arguments[3]))) y = undefined;
                placed = !!arguments[4];
            }
            else {
                id = arguments[2] ? arguments[2] : name;
                if (isNaN(x = Number(arguments[3]))) x = undefined;
                if (isNaN(y = Number(arguments[4]))) y = undefined;
                placed = !!arguments[5];
            }
            if (collection instanceof Collection && collection.game instanceof Game && collection.game.images) elt = collection.game.images[id];
            if (!(elt instanceof HTMLImageElement || elt instanceof SVGImageElement || elt instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && elt instanceof ImageBitmap))) elt = undefined;
            else {
                if (isNaN(source_width = Number(elt.naturalWidth !== undefined ? elt.naturalWidth : elt.width))) source_width = 0;
                if (isNaN(source_height = Number(elt.naturalHeight !== undefined ? elt.naturalHeight : elt.height))) source_height = 0;
            }

            //  Creating as a Jelli:

            Jelli.call(this, collection instanceof Collection ? collection.area : undefined, collection instanceof Collection && collection.game instanceof Game && collection.game.screens ? collection.game.screens[elt.dataset.screen] : undefined, id, x, y, source_width, source_height, elt && elt.dataset.originX ? elt.dataset.originX : source_width / 2, elt && elt.dataset.originY ? elt.dataset.originY : source_height / 2);

            Object.defineProperties(this, {
                placed: {
                    get: function () {return placed;},
                    set: function (n) {placed = !!n;}
                }
            });

            //  Image sealing:

            Object.seal(this);

        }

        //  Image prototyping:

        JelliImage.prototype = Object.create(Object.prototype, {
            draw: {
                value: function () {
                    if (!(this.screen instanceof Screen) || (this.source instanceof HTMLImageElement && !this.source.complete)) return;
                    if (this.placed) this.screen.context.drawImage(this.source, Math.floor(this.edges.screen_left), Math.floor(this.edges.screen_top));
                }
            },
            setPlacement: {
                value: function (n) {
                    this.placed = !!n;
                }
            },
            togglePlacement: {
                value: function () {
                    this.placed = !this.placed;
                }
            }
        });

        //  Poke constructor:

        function Poke(game, e, n) {

            //  Setting up variables:

            var elt;
            var rect;

            //  Handling arguments:

            if (!(game instanceof Game) || typeof e !== "object") return;
            elt = game.placement_screen.canvas;
            rect = elt.getBoundingClientRect();

            //  Property definitions:

            Object.defineProperties(this, {
                game: {value: game},
                number: {value: n},
                start_x: {value: (e.pageX - rect.left) * elt.width / elt.clientWidth,},
                start_y: {value: (e.pageY - rect.top) * elt.width / elt.clientWidth,},
                target: {value: game.placement_screen.canvas,},
                x: {
                    value: (e.pageX - rect.left) * elt.width / elt.clientWidth,
                    writable: true
                },
                y: {
                    value: (e.pageY - rect.top) * elt.width / elt.clientWidth,
                    writable: true
                }
            });

        }

        //  Poke prototyping:

        Poke.prototype = Object.create(Object.prototype, {
            updateWith: {value: function (e) {
                if (!(this.target instanceof Element) || typeof e !== "object") return;
                var rect = this.target.getBoundingClientRect();
                this.x = (e.pageX - rect.left + this.target.clientLeft) * this.target.width / this.target.clientWidth;
                this.y = (e.pageY - rect.top + this.target.clientTop) * this.target.width / this.target.clientWidth;
            }}
        });

        //  Text constructor:

        function Text(collection, name, screen, letters_name, text, isBase64) {

            //  Setting up variables:

            var context;
            var letters;
            var game;

            //  Handling arguments:

            if (!(collection instanceof Collection) || !(collection.game instanceof Game)) return;
            game = collection.game;
            context = game.screens[screen].context;
            letters = game.letters[letters_name];
            if (isBase64) text = game.window.atob(text);

            Object.defineProperty(this, "block", {value: letters.createBlock.apply(letters, [context, 0, 0].concat(text.split(letters.source.dataset.linefeed)))});
            Object.defineProperties(this, {
                advance: {value: this.block.advance.bind(this.block)},
                clear: {value: this.block.clear.bind(this.block)},
                color: {
                    value: undefined,
                    writable: true
                },
                context: {value: context},
                delIndex: {
                    get: function () {return this.block.delIndex},
                    set: function (n) {this.block.delIndex = n;}
                },
                drawIndex: {
                    get: function () {return this.block.drawIndex},
                    set: function (n) {this.block.drawIndex = n;}
                },
                fill: {value: this.block.fill.bind(this.block)},
                index: {
                    get: function () {return this.block.index},
                    set: function (n) {this.block.index = n;}
                },
                item: {value: this.block.item.bind(this.block)},
                kill: {  //  This gets overwritten by the collection after creation.
                    value: null,
                    writable: true
                },
                line: {value: this.block.line.bind(this.block)},
                x: {
                    get: function () {return this.block.x;},
                    set: function (n) {this.block.x = n;}
                },
                y: {
                    get: function () {return this.block.y;},
                    set: function (n) {this.block.y = n;}
                }
            });

            //  Text freezing:

            Object.seal(this);

        }

        //  Text prototyping:

        Text.prototype = Object.create(Object.prototype, {
            draw: {
                value: function () {
                    var c = this.color;
                    if (c) this.block.letters.setColor(this.block.letters.source.dataset["palette" + c[0].toUpperCase() + c.substr(1)]);
                    else this.block.letters.clearColor();
                    this.block.draw.call(this.block, this.context, this.x, this.y);
                }
            },
        });

        return Game;

    })();

})();
