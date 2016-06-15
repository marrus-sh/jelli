/* jshint asi:true, browser:true, devel:true */
/* globals ImageBitmap */

/*

#  Jelli Game Engine  #

*/

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

            //  Handling arguments and error checking:

            if (arguments.length < 1)  throw new Error("[Screen] Screen constructor called with too few arguments.");
            if (typeof canvas === "string" || canvas instanceof String) {
                if (!document.getElementById(canvas)) throw new Error("[Screen] Cannot construct Screen – no element found with the given id (" + canvas + ").");
                canvas = document.getElementById(canvas);
            }
            else if (!(canvas instanceof Element)) throw new Error("[Screen] The first argument of the Screen constructor must be an element or string.");
            if (typeof context === "undefined" || context === null) context = "2d";
            else if (!(typeof context === "string" || context instanceof String)) throw new Error("[Screen] The second argument of the System constructor must be a string.");

            //  Property definitions:

            Object.defineProperties(this, {
                canvas: {
                    value: canvas
                },
                context: {
                    value: canvas.getContext(context)
                }
            });

            if (!this.context) throw new Error("[Screen] Failed to create canvas context `" + context + "`.");

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

        return Screen;

    })();

    //  Control:

    var Control = (function () {

        //  Control constructor:

        function Control(shouldUpdateDOM) {

            //  Property definitions:

            Object.defineProperties(this, {
                controls: {
                    value: {}
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
                    if (arguments.length < 1) throw new Error("(control.js) No control given to add.");
                    if (!(typeof name === "string" || name instanceof String)) throw new Error("(control.js) Control names must be strings.");
                    this.controls[name] = false;
                    return this;
                }
            },

            addKeys: {
                value: function (name /*  One or more keys  */) {
                    var i;
                    if (arguments.length < 1) throw new Error("(control.js) No control given to assign keys to.");
                    if (!(typeof name === "string" || name instanceof String)) throw new Error("(control.js) Control names must be strings.");
                    if (this.controls[name] === undefined) throw new Error("(control.js) Control not defined.");
                    for (i = 1; i < arguments.length; i++) {
                        if (!(typeof arguments[i] === "string" || arguments[i] instanceof String || typeof arguments[i] === "number" || arguments[i] instanceof Number)) throw new Error("(control.js) Control keys must be strings or numbers.");
                        this.keys[arguments[i]] = name;
                    }
                    return this;
                }
            },

            getName: {
                value: function (key) {
                    if (arguments.length < 1) throw new Error("(control.js) No key provided to get.");
                    if (!(typeof key === "string" || key instanceof String || typeof key === "number" || key instanceof Number)) throw new Error("(control.js) Control keys must be strings or numbers.");
                    return this.keys[key];
                }
            },

            handleEvent: {
                value: function (e) {
                    var k;
                    if (!(e instanceof Event)) throw new Error("(control.js) Tried to handle something that wasn't an event.");
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
                    if (arguments.length < 1) throw new Error("(control.js) No control given to check.");
                    if (!(typeof name === "string" || name instanceof String)) throw new Error("(control.js) Control names must be strings.");
                    if (this.controls[name] === undefined) throw new Error("(control.js) Control not defined.");
                    return !!this.controls[name];
                }
            },

            isDefined: {
                value: function (name) {
                    if (arguments.length < 1) throw new Error("(control.js) No control given to check for existance.");
                    if (!(typeof name === "string" || name instanceof String)) throw new Error("(control.js) Control names must be strings.");
                    return this.controls[name] !== undefined;
                }
            },

            isKeyActive: {
                value: function (key) {
                    var name;
                    if (arguments.length < 1) throw new Error("(control.js) No key given to check.");
                    if (!(typeof key === "string" || key instanceof String || typeof key === "number" || key instanceof Number)) throw new Error("(control.js) Control keys must be strings or numbers.");
                    name = this.keys[key];
                    if (!(typeof name === "string" || name instanceof String)) throw new Error("(control.js) Control key resolved to a non-string name.");
                    if (this.controls[name] === undefined) throw new Error("(control.js) Control not defined.");
                    return !!this.controls[name];
                }
            },

            isKeyDefined: {
                value: function (key) {
                    var name;
                    if (arguments.length < 1) throw new Error("(control.js) No key given to check for existance.");
                    if (!(typeof key === "string" || key instanceof String || typeof key === "number" || key instanceof Number)) throw new Error("(control.js) Control keys must be strings or numbers.");
                    return this.keys[key] !== undefined;
                }
            },

            linkElement: {
                value: function (name, element) {
                    if (arguments.length < 1) throw new Error("(control.js) No control given to link.");
                    if (!(typeof name === "string" || name instanceof String)) throw new Error("(control.js) Control names must be strings.");
                    if (this.controls[name] === undefined) throw new Error("(control.js) Control not defined.");
                    if (typeof element === "string" || element instanceof String) {
                        if (!document.getElementById(element)) throw new Error("(control.js) Cannot link element – no element found with the given id (" + element + ").");
                        element = document.getElementById(element);
                    }
                    else if (!(element instanceof Element)) throw new Error("(control.js) No element given to link.");
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
                    var elements = document.querySelectorAll("*[data-control='" + name + "']");
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
                    if (arguments.length < 1) throw new Error("(control.js) No control given to toggle.");
                    if (!(typeof name === "string" || name instanceof String)) throw new Error("(control.js) Control names must be strings.");
                    if (to !== undefined && !(typeof to === "boolean" || to instanceof Boolean)) throw new Error("(control.js) Toggle value must be a boolean.");
                    if (this.controls[name] === undefined) throw new Error("(control.js) Control not defined.");
                    if (to !== undefined) this.controls[name] = to;
                    else this.controls[name] = !this.controls[name];
                    return this.controls[name];
                }
            },

            toggleKey: {
                value: function (key, to) {
                    var name;
                    if (arguments.length < 1) throw new Error("(control.js) No key given to toggle.");
                    if (!(typeof key === "string" || key instanceof String || typeof key === "number" || key instanceof Number)) throw new Error("(control.js) Control keys must be strings or numbers.");
                    name = this.keys[key];
                    if (!(typeof name === "string" || name instanceof String)) throw new Error("(control.js) Control key resolved to a non-string name.");
                    if (to !== undefined && !(typeof to === "boolean" || to instanceof Boolean)) throw new Error("(control.js) Toggle value must be a boolean.");
                    if (this.controls[name] === undefined) throw new Error("(control.js) Control not defined.");
                    if (to !== undefined) this.controls[name] = to;
                    else this.controls[name] = !this.controls[name];
                    return this.controls[name];
                }
            },

            unlinkElement: {
                value: function (element) {
                    if (arguments.length < 1) throw new Error("(control.js) No element given to unlink.");
                    if (typeof element === "string" || element instanceof String) {
                        if (!document.getElementById(element)) throw new Error("(control.js) Cannot link element – no element found with the given id (" + element + ").");
                        element = document.getElementById(element);
                    }
                    else if (!(element instanceof Element)) throw new Error("(control.js) No element given to unlink.");
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
                    var elements = document.querySelectorAll("*[data-control]");
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

    //  Placement image:

    var PlacementImage = (function () {

        //  Placement image constructor

        function PlacementImage(source, context, x, y /*  Optional placed  */) {

            //  Variable setup:

            var source_width;
            var source_height;
            var placed = !!arguments[4];

            //  Handling arguments and error checking:

            if (!(context instanceof CanvasRenderingContext2D)) throw new Error("[Image] Cannot create image – rendering context must be 2d.");
            if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Image] Cannot create image – coordinates must be numbers.");
            if (!(source instanceof HTMLImageElement || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && source instanceof ImageBitmap))) throw new Error("[Image] Rendering source must be an image.")
            if (source instanceof HTMLImageElement && !source.complete) throw new Error("[Image] Rendering source has not finished loading.");

            //  Getting width and height:

            if (source.naturalWidth) source_width = source.naturalWidth;
            else source_width = source.width;
            if (source.naturalHeight) source_height = source.naturalHeight;
            else source_height = source.height;

            //  Adding properties:

            Object.defineProperties(this, {
                context: {
                    value: context
                },
                height: {
                    value: source_height
                },
                placed: {
                    get: function () {return placed;},
                    set: function (n) {placed = !!n;}
                },
                source: {
                    value: source
                },
                width: {
                    value: source_width
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

        //  Placement image prototyping:

        PlacementImage.prototype = Object.create(Object.prototype, {
            draw: {
                value: function () {
                    if (this.placed) this.context.drawImage(this.source, Math.floor(this.x), Math.floor(this.y));
                }
            },
            setPosition: {
                value: function (x, y) {
                    if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Image] Cannot set image position – coordinates must be numbers.");
                    this.x = x;
                    this.y = y;
                }
            },
            togglePlacement: {
                value: function () {
                    this.placed = !this.placed;
                }
            }
        });

        return PlacementImage;

    })();

    //  Sheet:

    var Sheet = (function () {

        //  Drawing a sprite:

        function drawSprite(sheet, start_index, context, x, y /*  Optional frame  */) {

            //  Variable setup:

            var i;
            var index;
            var j;

            //  Handling arguments and error checking:

            if (!(sheet instanceof Sheet)) throw new Error("[Sheet] Cannot draw sprite – no sheet provided.");
            if (!(typeof start_index === "number" || start_index instanceof Number)) throw new Error("[Sheet] Cannot draw sprite – index must be a number.");
            else if (start_index > sheet.size) throw new Error("[Sheet] Cannot draw sprite – index out of range.");
            if (!(context instanceof CanvasRenderingContext2D)) throw new Error("[Sheet] Cannot draw sprite – rendering context must be 2d.");
            if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Sheet] Cannot draw sprite – coordinates must be numbers.");
            if (arguments.length >= 6) {
                if (!(typeof arguments[5] === "number" || arguments[5] instanceof Number)) throw new Error("[Sheet] Cannot draw sprite – frame must be a number.");
                else if (start_index + arguments[5] > sheet.size) throw new Error("[Sheet] Cannot draw sprite – frame out of range.");
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

            if (!(sheet instanceof Sheet)) throw new Error("[Sheet] Cannot create sprite – no sheet provided.");
            if (!(typeof index === "number" || index instanceof Number)) throw new Error("[Sheet] Cannot create sprite – index must be a number.");
            else if (index > sheet.size) throw new Error("[Sheet] Cannot create sprite – index out of range.");
            if (arguments.length >= 3) {
                if (!(typeof arguments[2] === "number" || arguments[2] instanceof Number)) throw new Error("[Sheet] Cannot create sprite – length must be a number.");
                else if (index + arguments[2] - 1 >= sheet.size) throw new Error("[Sheet] Cannot create sprite – length out of range.");
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

            if (!(source instanceof HTMLImageElement || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && source instanceof ImageBitmap))) throw new Error("[Sheet] Rendering source must be an image.")
            if (source instanceof HTMLImageElement && !source.complete) throw new Error("[Sheet] Rendering source has not finished loading.");
            if (!(typeof sprite_width === "number" || sprite_width instanceof Number) || !(typeof sprite_height === "number" || sprite_height instanceof Number)) throw new Error("[Sheet] Widths and heights must be numbers.");

            //  Getting width and height:

            if (source.naturalWidth) source_width = source.naturalWidth;
            else source_width = source.width;
            if (source.naturalHeight) source_height = source.naturalHeight;
            else source_height = source.height;

            //  Error-checking width and height:

            if (!Number.isInteger(source_width / sprite_width)) throw new Error("[Sheet] Provided width does not perfectly divide source.");
            if (!Number.isInteger(source_height / sprite_height)) throw new Error("[Sheet] Provided height does not perfectly divide source.");

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
                    if (!(context instanceof CanvasRenderingContext2D)) throw new Error("[Sheet] Cannot draw sprite at index – rendering context must be 2d.");
                    if (!(typeof index === "number" || index instanceof Number)) throw new Error("[Sheet] Cannot draw sprite at index – none provided.");
                    else if (index >= this.size) throw new Error("[Sheet] Cannot draw sprite at index – index out of range.");
                    if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Sheet] Cannot draw sprite at index – coordinates must be numbers.");
                    return drawSprite(this, index, context, x, y);
                }
            },
            getSprite: {
                value: function (index /*  Optional length  */) {
                    var length;
                    if (!(typeof index === "number" || index instanceof Number)) throw new Error("[Sheet] Cannot get sprite – index must be a number.");
                    if (arguments.length >= 2) {
                        if (!(typeof arguments[1] === "number" || arguments[1] instanceof Number)) throw new Error("[Sheet] Cannot get sprite – length must be a number.");
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
            if (!(context instanceof CanvasRenderingContext2D)) throw new Error("[Sheet] Cannot draw sprite – rendering context must be 2d.");
            if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Sheet] Cannot draw sprite – coordinates must be numbers.");
            if (arguments.length >= 5) {
                if (!(typeof arguments[4] === "number" || arguments[4] instanceof Number)) throw new Error("[Sheet] Cannot draw sprite – frame must be a number.");
                return sprite.draw(context, x, y, arguments[4])
            }
            return sprite.draw(context, x, y)
        }
        Sheet.drawSheetAtIndex = function(context, sheet, index, x, y) {
            if (!(context instanceof CanvasRenderingContext2D)) throw new Error("[Sheet] Cannot draw sprite at index – rendering context must be 2d.");
            if (!(sheet instanceof Sheet)) throw new Error("(sprite.js) Cannot draw sprite – no sheet provided.");
            if (!(typeof index === "number" || index instanceof Number)) throw new Error("[Sheet] Cannot draw sprite at index – none provided.");
            else if (index >= this.size) throw new Error("[Sheet] Cannot draw sprite at index – index out of range.");
            if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Sheet] Cannot draw sprite at index – coordinates must be numbers.");
            return sheet.drawIndex(context, index, x, y);
        }

        //  Making other constructors accessible:

        Sheet.Sprite = Sprite;

        return Sheet;

    })();

    //  Letters:

    var Letters = (function () {

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

        function LetterBlock(letters, context, x, y /*  Some number of strings  */) {

            //  Variable setup:

            var i;

            //  Handling arguments and error checking:

            if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(letters.js) Cannot create block – provided context must be 2d.");
            if (!(letters instanceof Letters)) throw new Error("(letters.js) Cannot create string – no letters provided.");
            if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(letters.js) Cannot create block – coordinates must be numbers.");

            //  Creating the block:

            for (i = 4; i < arguments.length; i++) {
                if (!(typeof arguments[i] === "string" || arguments[i] instanceof String)) throw new Error("(letters.js) Block arguments must be strings.");
                Object.defineProperty(this, i - 4, {
                    value: new LetterString(letters, arguments[i])
                });
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
                        if (this[i]) this[i].delIndex = n;
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
                        if (this[i]) this[i].drawIndex = n;
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
                        if (this[i]) this[i].index = n;
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
                        x = n;
                        this.clear();
                    }
                },
                y: {
                    get: function () {return y;},
                    set: function (n) {
                        y = n;
                        this.clear();
                    }
                }
            });

        }

        //  Letter block prototyping:

        LetterBlock.prototype = Object.create(Object.prototype, {
            advance: {
                value: function (/*  Optional amount  */) {
                    if (arguments[0]) this.index += arguments[0];
                    else this.index++;
                    if (this.index < 0) this.index = this.length;
                    if (this.index > this.length) this.index = this.length;
                    if (this.delIndex > this.index) this.delIndex = this.index;
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
                        if (!(this.line(i) instanceof LetterString)) throw new Error("(letters.js) Block index did not resolve to a string.");
                        this.line(i).draw(this.context, this.x, y);
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
                    for (i = 0; i < this.height && n > this[i].length; i++) {
                        n -= this[i].length;
                    }
                    if (this[i]) return this[i].item(n);
                    return null;
                }
            },
            line: {
                value: function (n) {
                    return this[n];
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
                delIndex: {
                    value: 0,
                    writable: true
                },
                drawIndex: {
                    value: 0,
                    writable: true
                },
                index: {
                    value: 0,
                    writable: true
                },
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
            advance: {
                value: function (/*  Optional amount  */) {
                    if (arguments[0]) this.index += arguments[0];
                    else this.index++;
                    if (this.index < 0) this.index = this.length;
                    if (this.index > this.length) this.index = this.length;
                    if (this.delIndex > this.index) this.delIndex = this.index;
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
                    if (!(context instanceof CanvasRenderingContext2D)) throw new Error("(letters.js) Cannot draw string – provided context must be 2d.");
                    if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(letters.js) Cannot draw string – coordinates must be numbers.");
                    if (this.drawIndex > this.length) this.drawIndex = this.length;
                    if (this.drawIndex < 0) this.drawIndex = 0;
                    if (this.delIndex > this.index) this.delIndex = this.index;
                    if (this.delIndex < 0) this.delIndex = 0;
                    if (this.drawIndex > this.delIndex) {
                        context.clearRect(x + this.delIndex * (this.letters.letter_width + 1), y, (this.drawIndex - this.delIndex) * (this.letters.letter_width + 1), this.letters.letter_height + 1);
                        this.drawIndex = this.delIndex;
                    }
                    while (this.drawIndex < this.length && this.drawIndex < this.index) {
                        if (!(this.item(this.drawIndex) instanceof Letter)) throw new Error("(letters.js) String index did not resolve to a letter.");
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
                    return this[n];
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
                color: {
                    value: undefined,
                    writable: true
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
                    if (this.color === undefined) return;
                    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
                    this.context.drawImage(this.source, 0, 0);
                    this.color = undefined;
                }
            },
            createBlock: {
                value: function (context, x, y /*  Some number of data strings  */) {
                    var args = [undefined, this].concat(Array.prototype.slice.call(arguments));
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
                    if (this.color === color || color === undefined) return;
                    this.context.globalCompositeOperation = "source-in";
                    this.context.fillStyle = color;
                    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
                    this.context.globalCompositeOperation = "source-over";
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

            //  Handling arguments and error checking:

            if (!(typeof base64 === "string" || base64 instanceof String) || base64.length % 4) throw new Error("[Tileset] Collisions must be provided as a Base64-encoded string.");

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

            if (!(context instanceof CanvasRenderingContext2D)) throw new Error("[Tileset] Cannot create map – canvas context must be 2d.");
            if (!(tileset instanceof Tileset)) throw new Error("[Tileset] Cannot create map – no tileset provided");
            if (!(typeof map === "string" || map instanceof String) || map.length % 4) throw new Error("[Tileset] Cannot create map – map must be provided as a Base64-encoded string.");
            if (!(typeof tiles_wide === "number" || tiles_wide instanceof Number)) throw new Error("[Tileset] Cannot create map – width of map not specified.");
            decoded_map = decode64(map);
            if (decoded_map.length % tiles_wide !== 0) throw new Error("[Tileset] Cannot create map – provided map not evenly divided by its width.");
            if (arguments[4] !== undefined && !(typeof arguments[4] === "number" || arguments[4] instanceof Number)) throw new Error("[Tileset] Cannot create map – starting coordinates must be numbers.");
            else x = arguments[4];
            if (arguments[5] !== undefined && !(typeof arguments[5] === "number" || arguments[5] instanceof Number)) throw new Error("[Tileset] Cannot create map – starting coordinates must be numbers.");
            else y = arguments[5];
            if (arguments[6] !== undefined && !(typeof arguments[6] === "number" || arguments[6] instanceof Number)) throw new Error("[Tileset] Cannot create map – origin coordinates must be numbers.");
            else origin_x = arguments[6];
            if (arguments[7] !== undefined && !(typeof arguments[7] === "number" || arguments[7] instanceof Number)) throw new Error("[Tileset] Cannot create map – origin coordinates must be numbers.");
            else origin_y = arguments[7];
            if (x === undefined) x = Math.floor((context.canvas.width - tileset.tile_width * tiles_wide) / 2);
            if (y === undefined) y = Math.floor((context.canvas.height - tileset.tile_height * (decoded_map.length / tiles_wide)) / 2);
            if (origin_x === undefined) origin_x = 0;
            if (origin_y === undefined) origin_y = 0;
            tiles_tall = decoded_map.length / tiles_wide;

            //  Making the map:


            Object.defineProperties(this, {
                context: {
                    value: context
                },
                map: {
                    value: decoded_map
                },
                origin_x: {
                    value: origin_x,
                    writable: true
                },
                origin_y: {
                    value: origin_y,
                    writable: true
                },
                tile_height: {
                    value: tileset.tile_height
                },
                tile_width: {
                    value: tileset.tile_width
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
                    value: x,
                    writable: true
                },
                y: {
                    value: y,
                    writable: true
                }
            });

        }

        //  Map prototyping:

        Map.prototype = Object.create(Object.prototype, {
            collides: {
                value: function (sx, sy) {
                    var collision;
                    var x;
                    var y;
                    if (!(typeof sx === "number" || sx instanceof Number) || !(typeof sy === "number" || sy instanceof Number)) throw new Error("[Tileset] Cannot find collision – coordinates must be numbers.");
                    x = sx - this.x;
                    y = sy - this.y;
                    if (x < 0 || x >= this.tile_width * this.tiles_wide || y < 0 || y >= this.tile_height * this.tiles_tall) return 0x0;
                    collision = this.tileset.getCollision(this.map[Math.floor(x / this.tile_width) + Math.floor(y / this.tile_height) * this.tiles_wide]);
                    if ((0 <= x && x % this.tile_width <= this.tile_width / 2) || (0 > x && x % this.tile_width <= -this.tile_width / 2)) {
                        if ((0 <= y && y % this.tile_height <= this.tile_height / 2) || (0 > y && y % this.tile_height <= -this.tile_height / 2)) return collision & 0x1;
                        else return collision & 0x4;
                    }
                    else {
                        if ((0 <= y && y % this.tile_height <= this.tile_height / 2) || (0 > y && y % this.tile_height <= -this.tile_height / 2)) return collision & 0x2;
                        else return collision & 0x8;
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
                    if (!(dir == "left" || dir == "top" || dir == "right" || dir == "bottom")) throw new Error("[Tileset] Cannot get collision edge – No proper directional keyword provided.");
                    if (!(typeof sx === "number" || sx instanceof Number) || !(typeof sy === "number" || sy instanceof Number)) throw new Error("[Tileset] Cannot find collision – coordinates must be numbers.");
                    x = Math.round(sx - this.x);
                    y = Math.round(sy - this.y);
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
                            if ((corner == 0x2 && !(collision & 0x1)) || (corner == 0x8 && !(collision & 0x4))) return ix * this.tile_width + this.tile_width / 2 + this.x;
                            else return ix * this.tile_width + this.x;
                            break;
                        case "right":
                            if (x < 0) return this.x;
                            else if (y < 0 || y >= this.tile_height * this.tiles_tall) return sx;
                            if ((corner == 0x1 && !(collision & 0x2)) || (corner == 0x4 && !(collision & 0x8))) return ix * this.tile_width + this.tile_width / 2 + this.x;
                            else return ix * this.tile_width + this.tile_width + this.x;
                            break;
                        case "top":
                            if (y > this.tile_height * this.tiles_tall) return this.tile_height * this.tiles_tall + this.y;
                            else if (x < 0 || x >= this.tile_width * this.tiles_wide) return sy;
                            if ((corner == 0x4 && !(collision & 0x1)) || (corner == 0x8 && !(collision & 0x2))) return iy * this.tile_height + this.tile_height / 2 + this.y;
                            else return iy * this.tile_height + this.y;
                            break;
                        case "bottom":
                            if (y < 0) return this.y;
                            else if (x < 0 || x >= this.tile_width * this.tiles_wide) return sy;
                            if ((corner == 0x1 && !(collision & 0x4)) || (corner == 0x2 && !(collision & 0x8))) return iy * this.tile_height + this.tile_height / 2 + this.y;
                            else return iy * this.tile_height + this.tile_height + this.y;
                            break;
                    }
                }
            },
            draw: {
                value: function () {
                    var i;
                    for (i = 0; i < this.map.length; i++) {
                        this.tileset.draw(this.context, this.map[i], this.origin_x + this.x + (i % this.tiles_wide) * this.tile_width, this.origin_y + this.y + Math.floor(i / this.tiles_wide) * this.tile_height);
                    }
                }
            }
        });

        //  Tileset constructor:

        function Tileset(sheet, tile_width, tile_height, collisions, draw) {

            //  Handling arguments and error checking:

            if (!(typeof tile_width === "number" || tile_width instanceof Number) || !(typeof tile_height === "number" || tile_height instanceof Number)) throw new Error("[Tileset] Cannot create tileset – tile widths and heights must be numbers.");
            if (!(typeof collisions === "string" || collisions instanceof String) || collisions.length % 4) throw new Error("[Tileset] Collisions must be provided as a Base64-encoded string.");
            if (!(typeof draw === "function" || draw instanceof Function)) throw new Error("[Tileset] No draw function provided");

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
                    if (!(context instanceof CanvasRenderingContext2D)) throw new Error("[Tileset] Cannot draw tile – canvas context must be 2d.");
                    if (!(typeof index === "number" || index instanceof Number)) throw new Error("[Tileset] Cannot draw tile – index must be a number.");
                    if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Tileset] Cannot draw tile – coordinates must be numbers.");
                    return this.drawFunction(context, this.sheet, index, x, y);
                }
            },
            getMap: {
                value: function (context, map, tiles_wide /*  x, y (if not provided, the map will be centred on the screen), origin_x, origin_y (if not provided, initialized to (0,0))  */) {
                    var args = [undefined, this].concat(Array.prototype.slice.call(arguments));
                    return new (Map.bind.apply(Map, args))();
                }
            },
            getCollision: {
                value: function (index) {
                    if (!(typeof index === "number" || index instanceof Number)) throw new Error("[Tileset] Cannot get collision – index must be a number.");
                    return (this.collisions[Math.floor(index / 2)] >> 4 * ((index + 1) % 2)) & 0xF;
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

    //  JelliScript:

    var Jelli = (function () {

        //  The global JelliScript object

        var global = null;
        var globals = [];
        var functions = Object.create(Object.prototype, {
            log: {
                value: function(prop) {console.log(value(global ? global : this, prop));}
            }
        });
        var modifiers = Object.create(Object.prototype, {
            declare: {
                value: function(prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (!/^\w+$/.test(prop)) throw new Error("[JelliScript] Syntax error: Disallowed characters used in a variable name.");
                    if (this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to declare an already-declared variable.");
                    this.__properties__[prop] = 0;
                }
            },
            delete: {
                value: function(prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) delete this.__properties__[prop];
                }
            },
            get: {value: function(prop) {return value(this, prop);}},
            increment: {
                value: function(prop /*  optional value  */) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to increment a non-declared value.");
                    if (arguments[1] !== undefined) return this.__properties__[prop] += arguments[1];
                    else return this.__properties__[prop]++;
                }
            },
            is_defined: {
                value: function(prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    return this.__properties__.hasOwnProperty(prop);
                }
            },
            mod_increment: {
                value: function(prop, mod /*  optional value  */) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to mod-increment a non-declared value.");
                    if (arguments[2] !== undefined) this.__properties__[prop] += arguments[2];
                    else this.__properties__[prop]++;
                    this.__properties__[prop] %= mod;
                    if (this.__properties__[prop] < 0 && mod > 0 || this.__properties__[prop] > 0 && mod < 0) this.__properties__[prop] += mod;
                    return this.__properties__[prop];
                }
            },
            round: {
                value: function(prop /*  optional digits  */) {
                    var n = 1;
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to round a non-declared value.");
                    if (arguments[1] !== undefined) n = Math.pow(10, arguments[1])
                    return (this.__properties__[prop] = Math.round(this.__properties__[prop] * n) / n);
                }
            },
            set: {
                value: function(prop, to) {
                    var s;
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to set a non-declared value.");
                    return (this.__properties__[prop] = to);
                }
            }
        });

        //  Copying object properties:

        function copyOnto(from, to) {
            var collection;
            var i;
            for (collection = Object.getOwnPropertyNames(from), i = 0; i < collection.length; i++) {
                Object.defineProperty(to, collection[i], Object.getOwnPropertyDescriptor(from, collection[i]));
            }
        }

        //  Running functions:

        function run(dataobj, fn /*  arguments list  */) {
            var s;
            if (!(dataobj instanceof Jelli)) throw new Error("[JelliScript] Error: No Jelli object provided.");
            if ((typeof fn === "string" || fn instanceof String) && fn.indexOf(".") !== -1) {
                s = fn.indexOf(".");
                if (dataobj.__modifiers__[fn.substr(s + 1)] instanceof Function) return arguments[2] instanceof Array ? dataobj.__modifiers__[fn.substr(s + 1)].apply(dataobj, [fn.substr(0, s)].concat(arguments[2].map(value.bind(undefined, global ? global : dataobj)))) : dataobj.__modifiers__[fn.substr(s + 1)].call(dataobj, fn.substr(0, s));
                else if (dataobj.__properties__[fn.substr(0, s)] instanceof Jelli) return arguments[2] instanceof Array ? run(dataobj.__properties__[fn.substr(0, s)], fn.substr(s + 1), arguments[2]) : run(dataobj.__properties__[fn.substr(0, s)], fn.substr(s + 1));
                else throw new Error("[JelliScript] Function name did not resolve into a function.");
            }
            else if (!dataobj.__modifiers__) {
                console.log(dataobj);
            }
            else if (dataobj.__functions__[fn] instanceof Function) return arguments[2] instanceof Array ? dataobj.__functions__[fn].apply(dataobj, arguments[2].map(value.bind(undefined, global ? global : dataobj))) : dataobj.__functions__[fn].call(dataobj);
            else throw new Error("[JelliScript] Function name did not resolve into a function.");
        }

        //  Getting values:

        function value(dataobj, prop) {
            var s;
            if (!(dataobj instanceof Jelli)) throw new Error("[JelliScript] Error: No Jelli object provided.");
            if (prop instanceof Jelli) return prop;
            else if (!isNaN(Number(prop))) return Number(prop);
            else if ((typeof prop === "string" || prop instanceof String) && prop[0] === '"' && prop[prop.length - 1] === '"' && !/^"|[^\\]"/.test(prop.substring(1, prop.length - 1))) {
                return prop.substring(1, prop.length - 1);
            }
            else if ((typeof prop === "string" || prop instanceof String) && prop[0] === "-") {
                s = value(dataobj, prop.substr(1));
                if (typeof s === "number" || s instanceof Number) return -s;
            }
            else if ((typeof prop === "string" || prop instanceof String) && prop.indexOf(".") !== -1) {
                s = prop.indexOf(".");
                if (dataobj.__properties__[prop.substr(0, s)] instanceof Jelli) return value(dataobj.__properties__[prop.substr(0, s)], prop.substr(s + 1));
                else throw new Error("[JelliScript] " + prop.substr(0, s) + " did not resolve into a Jelli object");
            }
            else if (typeof dataobj.__properties__[prop] === "number" || dataobj.__properties__[prop] instanceof Number || dataobj.__properties__[prop] instanceof Jelli) return dataobj.__properties__[prop];
            else if (dataobj.__properties__[prop] === undefined) {throw new Error("[JelliScript] Variable is undefined.");}
            else return String(dataobj.__properties__[prop]);
        }

        //  Jelli object constructor:

        function Jelli(props, fns, mods) {

            //  Setting up variables:

            var i;

            //  Defining core properties:

            Object.defineProperty(this, "__modifiers__", {value: {}});
            Object.defineProperty(this, "__functions__", {value: Object.create(this.__modifiers__)});
            Object.defineProperty(this, "__properties__", {
                value: Object.create(Object.prototype, {
                    "false": {value: 0},
                    "true": {value: 1}
                })
            });

            //  Setting provided properties and functions:

            if (props) this.defineProperties(props);
            copyOnto(functions, this.__functions__);
            if (fns) this.defineFunctions(fns);
            copyOnto(modifiers, this.__modifiers__);
            if (mods) this.defineModifiers(mods);

        }

        //  Jelli object prototyping:

        Jelli.prototype = Object.create(Object.prototype, {
            declare: {value: modifiers.declare},
            defineFunction: {value: function(name, fn) {
                if (typeof fns !== "object") throw new Error("[JelliScript] Functions must be provided in a properties object.");
                Object.defineProperty(this.__functions__, name, fn);
            }},
            defineFunctions: {value: function (fns) {
                if (typeof fns !== "object") throw new Error("[JelliScript] Functions must be provided in a properties object.");
                Object.defineProperties(this.__functions__, fns);
            }},
            defineModifier: {value: function(name, mod) {
                if (typeof mods !== "object") throw new Error("[JelliScript] Modifiers must be provided in a properties object.");
                Object.defineProperty(this.__modifiers__, name, mod);
            }},
            defineModifiers: {value: function (mods) {
                if (typeof mods !== "object") throw new Error("[JelliScript] Modifiers must be provided in a properties object.");
                Object.defineProperties(this.__modifiers__, mods);
            }},
            defineProperty: {value: function(name, prop) {
                if (typeof props !== "object") throw new Error("[JelliScript] Properties must be provided in a properties object.");
                Object.defineProperty(this.__property__, name, prop);
            }},
            defineProperties: {value: function (props) {
                if (typeof props !== "object") throw new Error("[JelliScript] Properties must be provided in a properties object.");
                Object.defineProperties(this.__properties__, props);
            }},
            delete: {value: modifiers.delete},
            get: {value: modifiers.get},
            increment: {value: modifiers.increment},
            log: {value: functions.log},
            mod_increment: {value: modifiers.mod_increment},
            set: {value: modifiers.set}
        });

        //  The global Jelli object:

        Object.defineProperty(Jelli, "global", {
            get: function () {return global;}
        });

        //  JelliScript parsing:

        Jelli.parseScript = function (script, dataobj) {

            //  Setting up variables:

            var args;
            var b;
            var breakdown;
            var condition;
            var conds_regex = /(-)?\s*\(\s*(-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\"|[^"])*?")(?:\s*([<>=])\s*(-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+))|"(?:\\"|[^"])*?")?\s*\)/g;
            var unset_global;
            var i;
            var j;
            var line;
            var lines;
            var n;
            var regex = /^\s*(?:(?:((?:-?\s*\(\s*(?:-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\"|[^"])*?")(?:\s*[<>=]\s*(?:-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\"|[^"])*?"))?\s*\)\s*?)+)?\s*(?:(\w+(?:\.\w+)*)\s*(\(\s*(?:-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\"|[^"])*?")(?:\s*,\s*(?:-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\"|[^"])*?"))*\s*\))?|(\?))|([:;]))|>>.*)\s*$/;
            var s;

            //  Handling arguments and error checking:

            if (!(typeof script === "string" || script instanceof String)) throw new Error("[JelliScript] Error: Script is not a string.");
            if (typeof dataobj !== "object") throw new Error("[JelliScript] Error: No data object provided.");

            globals.push(global);
            global = dataobj;

            //  Parsing the lines:

            for (lines = script.split("\n"), i = 0; i < lines.length; i++) {

                //  Setting the current line:

                line = lines[i].trim();
                if (line === "") continue;
                breakdown = regex.exec(line);
                if (!breakdown) throw new Error("[JelliScript] Error on line " + (i + 1) + ": Parsing error.");

                //  If there are conditions:

                if (breakdown[1]) {
                    b = false;
                    while ((condition = conds_regex.exec(breakdown[1])) && !b) {
                        if (condition[1]) n = true;
                        else n = false;
                        switch (condition[3]) {
                            case "=":
                                b = n ? value(dataobj, condition[2]) !== value(dataobj, condition[4]) : value(dataobj, condition[2]) === value(dataobj, condition[4]);
                                break;
                            case "<":
                                b = n ? value(dataobj, condition[2]) >= value(dataobj, condition[4]) : value(dataobj, condition[2]) < value(dataobj, condition[4]);
                                break;
                            case ">":
                                b = n ? value(dataobj, condition[2]) <= value(dataobj, condition[4]) : value(dataobj, condition[2]) > value(dataobj, condition[4]);
                                break;
                            default:
                                b = n ? !value(dataobj, condition[2]) : !!value(dataobj, condition[2]);
                                break;
                        }
                    }
                }
                else b = true;

                //  If the line ends in `?`:

                if (breakdown[4]) {

                    //  Setting up variables:

                    n = false;
                    j = 0;
                    s = "";

                    while (++i < lines.length) {

                        //  Setting the current line:

                        line = lines[i].trim();
                        if (line === "") continue;
                        breakdown = regex.exec(line);

                        //  Managing nesting levels and ELSE statements:

                        if (!breakdown) throw new Error("[JelliScript] Error on line " + (i + 1) + ": Parsing error.");
                        if (breakdown[4]) j++;
                        if (breakdown[5] === ";") {
                            if (--j < 0) break;
                        }
                        if (!j && breakdown[5] === ":") {
                            if (!n) n = true;
                            else throw new Error("[JelliScript] Error on line " + (i + 1) + ": Improper second 'else'.");
                            continue;
                        }

                        //  Adds the line to the string if necessary:

                        if ((!n && b) || (n && !b)) s += line + "\n";

                    }

                    //  Parses the resultant string:

                    Jelli.parseScript(s, dataobj);

                }

                else if (b && breakdown[2]) {
                    if (breakdown[3]) run(dataobj, breakdown[2], breakdown[3].substring(1, breakdown[3].length - 1).trim().split(/\s*,\s*/));
                    else run(dataobj, breakdown[2]);
                }

            }

            global = globals.pop();

        }

        return Jelli;

    })();

    /*
        The game engine itself follows.
        I've placed it inside its own closure for convenient packaging, but it requires all of the previous modules to be loaded.
    */

    return (function () {

        //  Area constructor:

        function Area(game, index) {

            //  Setting up variables:

            var collection;
            var elt;
            var i;
            var item;
            var props;
            var x;
            var y;

            //  Handling arguments and error checking:

            elt = game.datadoc.getElementsByClassName("area").item(index);
            if (!(game instanceof Game && elt instanceof Element)) return;

            //  Defining properties:

            Object.defineProperties(this, {
                game: {
                    value: game
                },
                initScript: {
                    value: elt.getElementsByClassName("init").item(0) ? elt.getElementsByClassName("init").item(0).text || elt.getElementsByClassName("init").item(0).textContent : ""
                },
                maps: {
                    value: []
                },
                stepScript: {
                    value: elt.getElementsByClassName("step").item(0) ? elt.getElementsByClassName("step").item(0).text || elt.getElementsByClassName("step").item(0).textContent : ""
                }
            });

            //  Sets up the area as a Jelli:

            Jelli.call(this, {
                characters: {value: new Collection(this, Character)},
                game: {value: game},
                images: {value: new Collection(this, JelliImage)},
                x: {
                    get: function () {return x;},
                    set: (function (value) {
                        var i;
                        if (!(typeof value === "number" || value instanceof Number)) throw new Error("[Game] Cannot load area – x-coordinate must be a number.");
                        x = value;
                        for (i = 0; i < this.maps.length; i++) {
                            this.maps[i].origin_x = value;
                        }
                        this.set("clear", 1);
                    }).bind(this)
                },
                y: {
                    get: function () {return y;},
                    set: (function (value) {
                        var i;
                        if (!(typeof value === "number" || value instanceof Number)) throw new Error("[Game] Cannot load area – y-coordinate must be a number.");
                        y = value;
                        for (i = 0; i < this.maps.length; i++) {
                            this.maps[i].origin_y = value;
                        }
                        this.set("clear", 1);
                    }).bind(this)
                }
            }, {
                setMapOffset: {value: this.setMapOffset}
            });

            //  Jelli aliases:

            Object.defineProperties(this, {
                characters: {value: this.__properties__.characters},
                images: {value: this.__properties__.images},
                x: {
                    get: function () {return this.__properties__.x;},
                    set: function (n) {this.__properties__.x = n;}
                },
                y: {
                    get: function () {return this.__properties__.y;},
                    set: function (n) {this.__properties__.y = n;}
                }
            });

            //  Initializing properties:

            this.declare("clear");
            this.set("clear", 1);
            this.declare("index");
            this.set("index", game.get(index));
            this.x = 0; //  This initializes the x value (so you can use this.set())
            this.y = 0; //  This initializes the y value (so you can use this.set())

            //   Adding dataset variables:

            for (collection = (elt.dataset.vars ? elt.dataset.vars.split(/\s+/) : []), i = 0; i < collection.length; i++) {
                this.declare(collection[i]);
            }

            //  Loading maps:

            for (collection = elt.getElementsByClassName("map"), i = 0; i < collection.length; i++) {
                item = collection.item(i);
                this.maps[i] = game.tilesets[item.dataset.tileset].getMap(game.screens[item.dataset.screen].context, item.textContent.trim(), Number(item.dataset.mapwidth), isNaN(Number(item.dataset.dx)) ? 0 : Number(item.dataset.dx), isNaN(Number(item.dataset.dy)) ? 0 : Number(item.dataset.dy), this.get("x"), this.get("y"));
            }


            //  Loading characters:

            for (collection = (elt.dataset.characters ? elt.dataset.characters.split(/\s+/) : []), i = 0; i < collection.length; i++) {
                this.characters.load(collection[i]);
            }

            //  Area freezing:

            Object.freeze(this);

            //  Initialization:

            this.init();

        }

        //  Area prototyping:

        Area.prototype = Object.create(Jelli.prototype, {
            draw: {
                value: function (context) {
                    var i;
                    if (this.get("clear")) {
                        for (i = 0; i < this.maps.length; i++) {
                            this.maps[i].draw();
                        }
                    }
                    for (i in this.characters.__properties__) {
                        this.characters.__properties__[i].draw();
                    }
                    for (i in this.images.__properties__) {
                        this.images.__properties__[i].draw();
                    }
                    this.set("clear", 0);
                }
            },
            init: {
                value: function () {
                    if (this.index === 1) window.area = this;
                    return Jelli.parseScript(this.initScript, this);
                }
            },
            setMapOffset: {
                value: function (index /*  x, y  */) {
                    if (arguments[1] !== undefined) {
                        this.maps[index].x = arguments[1];
                    }
                    if (arguments[2] !== undefined) {
                        this.maps[index].y = arguments[2];
                    }
                }
            },
            step: {
                value: function () {
                    var i;
                    Jelli.parseScript(this.stepScript, this);
                    for (i in this.characters.__properties__) {
                        this.characters.__properties__[i].step();
                    }
                }
            },
        });

        //  Character constructor:

        function Character(area, name) {

            //  Setting up variables:

            var collection;
            var elt;
            var i;
            var item;
            var props = {};
            var sprites = [];

            //  Handling arguments and error checking:

            if (!(area instanceof Area)) return;
            elt = area.game.datadoc.getElementById(name);
            if (!(elt instanceof Element)) return;

            //  Loading sprites:

            item = (area.game.datadoc.getElementById(elt.dataset.sprites) && area.game.datadoc.getElementById(elt.dataset.sprites).className === "sprites") ? area.game.datadoc.getElementById(elt.dataset.sprites) : null;
            for (collection = item ? item.getElementsByClassName("sprite") : [], i = 0; i < collection.length; i++) {
                sprites.push(area.game.sheets[item.dataset.sheet].getSprite(Number(collection.item(i).dataset.index), Number(collection.item(i).dataset.length ? collection.item(i).dataset.length : 1)));
                if (collection.item(i).hasAttribute("title") && props[collection.item(i).getAttribute("title")] === undefined) props[collection.item(i).getAttribute("title")] = {value: i};
            }

            //  Preparing Jelli properties

            props.area = {value: area};
            props.game = {value: area.game};
            props.height = {value: Number(item.dataset.boxHeight || sprites[0].height)};
            props.origin_x = {value: Number(item.dataset.boxX || sprites[0].width / 2)};
            props.origin_y = {value: Number(item.dataset.boxY || sprites[0].height / 2)};
            props.sprite_height = {value: sprites[0].height};
            props.sprite_width = {value: sprites[0].width};
            props.width = {value: Number(item.dataset.boxWidth || sprites[0].width)};

            //  Defining properties:

            Object.defineProperties(this, {  //  None of the above are writable, so I can just reference them straight below
                area: props.area,
                game: props.game,
                height: props.height,
                initScript: {value: elt.getElementsByClassName("init").item(0) ? elt.getElementsByClassName("init").item(0).text || elt.getElementsByClassName("init").item(0).textContent : ""},
                origin_x: props.origin_x,
                origin_y: props.origin_y,
                screen: {value: area.game.screens[elt.dataset.screen]},
                sprites: {value: sprites},
                sprite_height: props.sprite_height,
                sprite_width: props.sprite_width,
                stepScript: {value: elt.getElementsByClassName("step").item(0) ? elt.getElementsByClassName("step").item(0).text || elt.getElementsByClassName("step").item(0).textContent : ""},
                width: props.width
            });

            //  Sets up the character as a Jelli:

            Jelli.call(this, props, {
                target: {value: this.target},
                targetBy: {value: this.targetBy}
            });

            //  Setting JelliScript properties:

            this.declare("x");
            this.set("x", this.sprite_width / 2);
            this.declare("y");
            this.set("y", this.sprite_height / 2);
            this.declare("dir");
            this.declare("frame");

            for (collection = elt.dataset.vars ? elt.dataset.vars.split(/\s+/) : [], i = 0; i < collection.length; i++) {
                this.declare(collection[i]);
            }

            //  Initialization:

            this.init();

            //  Character freezing:

            Object.freeze(this);

        }

        //  Character prototyping:

        Character.prototype = Object.create(Jelli.prototype, {
            draw: {
                value: function () {
                    if (!(this.screen instanceof Screen)) return;
                    return this.sprites[this.get("dir")].draw(this.screen.context, Math.round(this.get("x") - this.origin_x + this.area.get("x")), Math.round(this.get("y") - this.origin_y + this.area.get("y")), this.get("frame"));
                }
            },
            getCollisionEdge: {
                value: function (dir, x, y) {
                    if (!(dir == "left" || dir == "top" || dir == "right" || dir == "bottom")) throw new Error("[Game] Cannot get collision edge – No proper directional keyword provided.");
                    if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Game] Cannot find collision – coordinates must be numbers.");
                    if (x <= Math.round(this.get("x") - this.width / 2) || x >= Math.round(this.get("x") + this.width / 2) || y <= Math.round(this.get("y") - this.height / 2) || y >= Math.round(this.get("y") + this.height / 2)) {
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
                            return Math.round(this.get("x") - this.width / 2);
                        case "right":
                            return Math.round(this.get("x") + this.width / 2);
                        case "top":
                            return Math.round(this.get("y") - this.height / 2);
                        case "bottom":
                            return Math.round(this.get("y") + this.height / 2);
                    }
                }
            },
            init: {
                value: function () {
                    return Jelli.parseScript(this.initScript, this);
                }
            },
            step: {
                value: function () {
                    return Jelli.parseScript(this.stepScript, this);
                }
            },
            target: {
                value: function(cx, cy) {
                    var dx = cx - this.get("x");
                    var dy = cy - this.get("y");
                    return this.targetBy(dx, dy);
                }
            },
            targetBy: {
                value: function(dx, dy) {
                    var c = false;
                    var d;
                    var i;
                    var j;
                    var k;
                    var ux;
                    var uy;
                    var sx;
                    var sy;
                    var tx;
                    var ty;
                    if (!(this.area instanceof Area)) throw new Error("[Game] Could not target character – character is not associated with an area.");
                    d = Math.sqrt(dx * dx + dy * dy);
                    if (!d) return;
                    if (d > 1) {
                        ux = dx / d;
                        uy = dy / d;
                    }
                    else {
                        ux = dx;
                        uy = dy;
                    }
                    if (dx > 0) {
                        for (i = 0; i < this.area.maps.length; i++) {
                            k = Math.floor(this.height / (this.area.maps[i].tile_height / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = this.area.maps[i].getCollisionEdge("left", this.get("x") + ux + this.width / 2, this.get("y") + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx > tx) sx = tx;
                            }
                        }
                        for (i in this.area.characters.__properties__) {
                            if (this === this.area.characters.__properties__[i]) continue;
                            k = Math.floor(this.height / this.area.characters.__properties__[i].height) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = this.area.characters.__properties__[i].getCollisionEdge("left", this.get("x") + ux + this.width / 2, this.get("y") + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx > tx) sx = tx;
                            }
                        }
                        if (sx !== undefined) this.set("x", sx - this.width / 2);
                    }
                    else if (dx < 0) {
                        for (i = 0; i < this.area.maps.length; i++) {
                            k = Math.floor(this.height / (this.area.maps[i].tile_height / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = this.area.maps[i].getCollisionEdge("right", this.get("x") + ux - this.width / 2, this.get("y") + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx < tx) sx = tx;
                            }
                        }
                        for (i in this.area.characters.__properties__) {
                            if (this === this.area.characters.__properties__[i]) continue;
                            k = Math.floor(this.height / this.area.characters.__properties__[i].height) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = this.area.characters.__properties__[i].getCollisionEdge("right", this.get("x") + ux - this.width / 2, this.get("y") + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx < tx) sx = tx;
                            }
                        }
                        if (sx !== undefined) this.set("x", sx + this.width / 2);
                    }
                    if (dy > 0) {
                        for (i = 0; i < this.area.maps.length; i++) {
                            k = Math.floor(this.width / (this.area.maps[i].tile_width / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = this.area.maps[i].getCollisionEdge("top", this.get("x") + (j - k / 2) * this.width / k, this.get("y") + uy + this.height / 2);
                                if (sy === undefined || sy > ty) sy = ty;
                            }
                        }
                        for (i in this.area.characters.__properties__) {
                            if (this === this.area.characters.__properties__[i]) continue;
                            k = Math.floor(this.width / this.area.characters.__properties__[i].width) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = this.area.characters.__properties__[i].getCollisionEdge("top", this.get("x") + (j - k / 2) * this.width / k, this.get("y") + uy + this.height / 2);
                                if (sy === undefined || sy > ty) sy = ty;
                            }
                        }
                        if (sy !== undefined) this.set("y", sy - this.height / 2);
                    }
                    else if (dy < 0) {
                        for (i = 0; i < this.area.maps.length; i++) {
                            k = Math.floor(this.width / (this.area.maps[i].tile_width / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = this.area.maps[i].getCollisionEdge("bottom", this.get("x") + (j - k / 2) * this.width / k, this.get("y") + uy - this.height / 2);
                                if (sy === undefined || sy < ty) sy = ty;
                            }
                        }
                        for (i in this.area.characters.__properties__) {
                            if (this === this.area.characters.__properties__[i]) continue;
                            k = Math.floor(this.width / this.area.characters.__properties__[i].width) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = this.area.characters.__properties__[i].getCollisionEdge("bottom", this.get("x") + (j - k / 2) * this.width / k, this.get("y") + uy - this.height / 2);
                                if (sy === undefined || sy < ty) sy = ty;
                            }
                        }
                        if (sy !== undefined) this.set("y", sy + this.height / 2);
                    }
                }
            }
        });

        //  Collection constructor:

        function Collection(parent, constructor) {

            var area;
            var game;

            if (parent instanceof Area) {
                area = parent;
                game = parent.game;
            }
            else if (parent instanceof Game) {
                game = parent;
            }

            Jelli.call(this, {
                area: {value: area},
                game: {value: game},
                parent: {value: parent},
            }, {}, {
                load: {value: this.load}
            });

            Object.defineProperties(this, {
                area: {get: function () {return this.__properties__.area;}},
                Type: {value: constructor},
                game: {get: function () {return this.__properties__.game;}},
                parent: {get: function () {return this.__properties__.parent;}}
            })

            //  Images freezing:

            Object.freeze(this);

        }

        //  Collection prototyping:

        Collection.prototype = Object.create(Jelli.prototype, {
            load: {
                value: function (name) {
                    var args = [undefined, this.parent].concat(Array.prototype.slice.call(arguments));
                    this.declare(name);
                    this.set(name, new (this.Type.bind.apply(this.Type, args))());
                }
            }
        });

        //  Game constructor:

        function Game(doc) {

            //  Setting up variables:

            var collection;
            var datadoc;
            var i;

            //  imported() and placed() functions:

            function imported(node) {
                if (typeof node === "string" || node instanceof String) node = datadoc.getElementById(node);
                if (!(node instanceof Node)) throw new Error("[Game] Cannot import node – none provided");
                return doc.importNode(node, true);
            }

            function placed(node) {
                if (typeof node === "string" || node instanceof String) node = datadoc.getElementById(node);
                if (!(node instanceof Node)) throw new Error("[Game] Cannot place node – none provided");
                return doc.body.appendChild(document.importNode(node, true));
            }

            //  Handling arguments and error checking:

            if (!(doc instanceof Document)) return;
            if (doc.game) return;
            else Object.defineProperty(doc, "game", {value: this});

            //  Making sure modules are loaded:

            if (typeof Screen === "undefined" || !Screen) throw new Error("[Game] Screen module not loaded");
            if (typeof Control === "undefined" || !Control) throw new Error("[Game] Control module not loaded");
            if (typeof PlacementImage === "undefined" || !PlacementImage) throw new Error("[Game] Image module not loaded");
            if (typeof Sheet === "undefined" || !Sheet) throw new Error("[Game] Sheet module not loaded");
            if (typeof Letters === "undefined" || !Letters) throw new Error("[Game] Letters module not loaded");
            if (typeof Tileset === "undefined" || !Tileset) throw new Error("[Game] Tileset module not loaded");
            if (typeof Jelli === "undefined" || !Tileset) throw new Error("[Game] JelliScript module not loaded");

            //  Setting up the data document and clearing the body

            datadoc = doc.implementation.createHTMLDocument("Jelli Data Document");
            datadoc.body = datadoc.importNode(doc.body, true);
            doc.body = doc.createElement("body");
            doc.body.style.visibility = "hidden";

            //  Defining properties:

            Object.defineProperties(this, {
                control: {value: new Control(true)},
                datadoc: {value: datadoc},
                document: {value: doc},
                images: {value: {}},
                letters: {value: {}},
                screens: {value: {}},
                sheets: {value: {}},
                tilesets: {value: {}},
                window: {value: doc.defaultView ? doc.defaultView : window}
            });

            //  Sets up the game as a Jelli:

            Jelli.call(this, {
                area: {
                    value: 0,
                    writable: true
                },
                key_start: {get: (function () {return Number(this.control.isActive("start"));}).bind(this)},
                key_select: {get: (function () {return Number(this.control.isActive("select"));}).bind(this)},
                key_menu: {get: (function () {return Number(this.control.isActive("menu"));}).bind(this)},
                key_look: {get: (function () {return Number(this.control.isActive("look"));}).bind(this)},
                key_exit: {get: (function () {return Number(this.control.isActive("exit"));}).bind(this)},
                key_action: {get: (function () {return Number(this.control.isActive("action"));}).bind(this)},
                key_up: {get: (function () {return Number(this.control.isActive("up"));}).bind(this)},
                key_down: {get: (function () {return Number(this.control.isActive("down"));}).bind(this)},
                key_left: {get: (function () {return Number(this.control.isActive("left"));}).bind(this)},
                key_right: {get: (function () {return Number(this.control.isActive("right"));}).bind(this)},
                texts: {value: new Collection(this, Text)},
                touch: {get: function () {return 0;}}  //  TK
            }, {
                clearScreen: {value: this.clearScreen},
                loadArea: {value: this.loadArea}
            });

            //  Jelli aliases:

            Object.defineProperties(this, {
                area: {
                    get: function () {return this.__properties__.area;},
                    set: function (n) {this.set("area", n);}
                },
                texts: {value: this.__properties__.texts}
            });

            //  Control setup:

            placed("jo-ctls-lf");
            placed("jo-ctls-rt");

            this.control.add("action").addKeys("action", 0x58, "U+0058", "KeyX", "X", "x").linkElement("action", "jo-ctrl-actn");
            this.control.add("down").addKeys("down", 0x28, "ArrowDown", "Down").linkElement("down", "jo-ctrl-dnrw");
            this.control.add("exit").addKeys("exit", 0x5A, "U+005A", "KeyZ", "Z", "z").linkElement("exit", "jo-ctrl-exit");
            this.control.add("left").addKeys("left", 0x25, "ArrowLeft", "Left").linkElement("left", "jo-ctrl-lfrw");
            this.control.add("look").addKeys("look", 0x53, "U+0053", "KeyS", "S", "s").linkElement("look", "jo-ctrl-look");
            this.control.add("menu").addKeys("menu", 0x41, "U+0041", "KeyA", "A", "a").linkElement("menu", "jo-ctrl-menu");
            this.control.add("right").addKeys("right", 0x27, "ArrowRight", "Right").linkElement("right", "jo-ctrl-rtrw");
            this.control.add("select").addKeys("select", 0x57, "U+0057", "KeyW", "W", "w").linkElement("select", "jo-ctrl-selc");
            this.control.add("start").addKeys("start", 0x51, "U+0051", "KeyQ", "Q", "q").linkElement("start", "jo-ctrl-strt");
            this.control.add("up").addKeys("up", 0x26, "ArrowUp", "Up").linkElement("up", "jo-ctrl-uprw");

            //  Loading screens:

            for (collection = datadoc.getElementsByTagName("canvas"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.screens, collection.item(i).id, {value: new Screen(placed(collection.item(i)), "2d"), enumerable: true});
            }

            //  Loading images:

            for (collection = datadoc.getElementsByClassName("image"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.images, collection.item(i).id, {value: imported(collection.item(i))});
            }

            //  Sprite sheet setup:

            for (collection = datadoc.getElementsByClassName("letters"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.letters, collection.item(i).id, {value: new Letters(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight))});
            }
            for (collection = datadoc.getElementsByClassName("sheet"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.sheets, collection.item(i).id, {value: new Sheet(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight))});
            }
            for (collection = datadoc.getElementsByClassName("tileset"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.tilesets, collection.item(i).id, {value: new Tileset(new Sheet(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight), collection.item(i).dataset.collisions.trim(), Sheet.drawSheetAtIndex)});
            }

            //  Setting JelliScript properties:

            this.declare("resized");
            this.set("resized", 1);

            //   Adding dataset variables:

            for (collection = (document.documentElement.dataset.vars ? document.documentElement.dataset.vars.split(/\s+/) : []), i = 0; i < collection.length; i++) {
                this.declare(collection[i]);
            }

            //  Game freezing:

            Object.freeze(this.screens);
            Object.freeze(this.letters);
            Object.freeze(this.sheets);
            Object.freeze(this.tilesets);
            Object.freeze(this);

            //  Initializing the game code:

            if (doc.head.getElementsByClassName("init").item(0)) Jelli.parseScript(doc.head.getElementsByClassName("init").item(0).text || doc.head.getElementsByClassName("init").item(0).textContent, this);

            //  Adding event listeners:

            doc.body.addEventListener("touchmove", function (e) {e.preventDefault();}, false);
            this.window.addEventListener("keydown", this, false);
            this.window.addEventListener("resize", this, false);
            this.window.addEventListener("touchstart", this, false);

            //  Starting the render and logic processes:

            this.window.requestAnimationFrame(this.draw.bind(this))
            this.step();

        }

        //  Game prototyping:

        Game.prototype = Object.create(Jelli.prototype, {
            clearScreen: {
                value: function (screen) {
                    if (!(screen instanceof Screen)) screen = this.screens[screen]
                    if (!(screen instanceof Screen)) throw new Error("[Game] Could not clear screen – none provided.")
                    screen.canvas.dataset.clear = "";
                }
            },
            draw: {
                value: function () {
                    var i;
                    if (this.get("resized")) this.layout();
                    for (i in this.screens) {
                        if (this.screens[i].canvas.hasAttribute("data-clear")) {
                            this.screens[i].clear();
                            this.screens[i].canvas.removeAttribute("data-clear");
                            continue;
                        }
                        switch (this.screens[i].canvas.dataset.type) {
                            case "area":
                                if (this.area instanceof Area && this.area.get("clear")) this.screens[i].clear();
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
                    for (i in this.texts.__properties__) {
                        this.texts.__properties__[i].draw()
                    }
                    this.set("resized", 0);
                    this.window.requestAnimationFrame(this.draw.bind(this));
                }
            },
            handleEvent: {
                value: function (e) {
                    var k;
                    switch (e.type) {
                        case "keydown":
                            k = e.code || e.key || e.keyIdentifier || e.keyCode;
                            if (this.document.documentElement.hasAttribute("data-touch")) {
                                this.document.documentElement.removeAttribute("data-touch");
                                this.set("resized", 1);
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
                        case "resize":
                            this.set("resized", 1);
                            break;
                        case "touchstart":
                            if (!this.document.documentElement.hasAttribute("data-touch")) {
                                this.document.documentElement.setAttribute("data-touch", "");
                                this.set("resized", 1);
                            }
                            break;
                    }
                }
            },
            layout: {
                value: function () {
                    var body_height;
                    var body_width;
                    var border_img = this.datadoc.querySelector("img.gui-border");
                    var border_height =  Number(border_img.dataset.spriteHeight);
                    var border_width =  Number(border_img.dataset.spriteWidth);
                    var button_img = this.datadoc.querySelector("img.gui-buttons");
                    var button_height;
                    var button_width;
                    var canvas;
                    var horizontal;
                    var i;
                    var scaled_height;
                    var scaled_width;
                    var temporary_height;
                    var temporary_width;
                    if (this.document.documentElement.hasAttribute("data-touch")) {
                        button_height = Number(button_img.dataset.buttonHeight);
                        button_width = Number(button_img.dataset.buttonWidth);
                    }
                    else {
                        button_height = 0;
                        button_width = 0;
                    }
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
                    this.document.body.style.background = border_img.dataset.systemBackground;
                    body_width = this.document.body.clientWidth;
                    body_height = this.document.body.clientHeight;
                    canvas = this.document.getElementsByTagName("canvas").item(0)
                    if (body_width / body_height > canvas.width / canvas.height) {
                        horizontal = true;
                        body_width -= 2 * button_width;
                    }
                    else {
                        horizontal = false;
                        body_height -= button_height;
                    }
                    for (i = 0; i < this.document.getElementsByTagName("canvas").length; i++) {
                        canvas = this.document.getElementsByTagName("canvas").item(i);
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
                        canvas.style.borderStyle = "solid";
                        canvas.style.borderTopWidth = canvas.style.borderBottomWidth = border_height + "px";
                        canvas.style.borderLeftWidth = canvas.style.borderRightWidth = border_width + "px";
                        canvas.style.borderColor = "transparent";
                        canvas.style.borderRadius = border_width + "px " + border_height + "px";
                        canvas.style.borderImage = "url(" + border_img.src + ") " + border_width + " " + border_height + " repeat";
                        if (!i) canvas.style.background = border_img.dataset.screenBackground;
                        if (horizontal) canvas.style.top = "calc(50% - " + (scaled_height / 2 + border_height) + "px)";
                        else canvas.style.top = "calc(50% - " + (scaled_height / 2 + border_height + button_height / 2) + "px)";
                        canvas.style.left = "calc(50% - " + (scaled_width / 2 + border_width) + "px)";
                        canvas.style.width = scaled_width + "px";
                        canvas.style.height = scaled_height + "px";
                    }
                    if (horizontal){
                        this.document.getElementById("jo-ctls-lf").style.top = "0";
                        this.document.getElementById("jo-ctls-rt").style.top = "0";
                        this.document.getElementById("jo-ctls-lf").style.right = "";
                        this.document.getElementById("jo-ctls-rt").style.left = "";
                    }
                    else {
                        this.document.getElementById("jo-ctls-lf").style.top = "";
                        this.document.getElementById("jo-ctls-rt").style.top = "";
                        this.document.getElementById("jo-ctls-lf").style.right = "50%";
                        this.document.getElementById("jo-ctls-rt").style.left = "50%";
                    }
                    this.document.body.style.visibility = "";
                }
            },
            loadArea: {value: function (index) {this.area = new Area(this, index);}},
            step: {
                value: function () {

                    //  Game stepping:

                    if (document.head.getElementsByClassName("step").item(0)) Jelli.parseScript(document.head.getElementsByClassName("step").item(0).text || document.head.getElementsByClassName("step").item(0).textContent, this);

                    //  Area stepping:

                    if (this.area instanceof Area) this.area.step();

                    //  setTimeout for that logic:

                    this.window.setTimeout(this.step.bind(this), 1000/60);

                }
            }
        });

        //  Image constructor:

        function JelliImage(area, name, id) {

            //  Setting up variables:

            var elt;
            if (!id) id = name;

            //  Handling arguments and error checking:

            if (!(area instanceof Area)) return;
            elt = area.game.images[id];
            if (!(elt instanceof Element)) return;

            //  Defining image as placement image:

            PlacementImage.call(this, elt, area.game.screens[elt.dataset.screen].context, 0, 0, 0);

            //  But it's actually a Jelli!

            Jelli.call(this, {
                placed: {
                    get: (function () {return this.placed ? 1 : 0;}).bind(this),
                    set: (function (n) {this.placed = n;}).bind(this)
                },
                x: {
                    get: (function () {return this.x;}).bind(this),
                    set: (function (n) {this.x = n;}).bind(this)
                },
                y: {
                    get: (function () {return this.y;}).bind(this),
                    set: (function (n) {this.y = n;}).bind(this)
                },
            }, {
                setPosition: {value: this.setPosition},
                togglePlacement: {value: this.togglePlacement}
            });

            //  Image sealing:

            Object.seal(this);

        }

        //  Image prototyping:

        JelliImage.prototype = Object.create(Jelli.prototype, {
            draw: {value: PlacementImage.prototype.draw},
            setPosition: {value: PlacementImage.prototype.setPosition},
            togglePlacement: {value: PlacementImage.prototype.togglePlacement}
        });

        //  Text constructor:

        function Text(game, name, screen, letters_name, text, isBase64) {

            var context = game.screens[screen].context;
            var letters = game.letters[letters_name];
            if (isBase64) text = game.window.atob(text);

            //  Defining properties:

            Object.defineProperties(this, {
                block: {value: letters.createBlock.apply(letters, [context, 0, 0].concat(text.split(letters.source.dataset.linefeed)))},
                context: {value: context},
                delIndex: {
                    get: function () {return this.block.delIndex},
                    set: function (n) {this.block.delIndex = n;}
                },
                drawIndex: {
                    get: function () {return this.block.drawIndex},
                    set: function (n) {this.block.drawIndex = n;}
                },
                index: {
                    get: function () {return this.block.index},
                    set: function (n) {this.block.index = n;}
                },
                x: {
                    get: function () {return this.block.x;},
                    set: function (n) {this.block.x = n;}
                },
                y: {
                    get: function () {return this.block.y;},
                    set: function (n) {this.block.y = n;}
                }
            });

            //  Creating text as a Jelli:

            Jelli.call(this, {
                color: {
                    value: 0,
                    writable: true
                },
                context: {
                    value: context
                },
                delIndex: {
                    get: (function () {return this.block.delIndex;}).bind(this),
                    set: (function (n) {this.block.delIndex = n;}).bind(this)
                },
                drawIndex: {
                    get: (function () {return this.block.drawIndex;}).bind(this),
                    set: (function (n) {this.block.drawIndex = n;}).bind(this)
                },
                height: {get: function () {return this.block.height;}},
                index: {
                    get: (function () {return this.block.index;}).bind(this),
                    set: (function (n) {this.block.index = n;}).bind(this)
                },
                length: {get: function () {return this.block.length;}},
                text: {value: text},
                x: {
                    get: (function () {return this.block.x;}).bind(this),
                    set: (function (n) {this.block.x = n;}).bind(this)
                },
                y: {
                    get: (function () {return this.block.y;}).bind(this),
                    set: (function (n) {this.block.y = n;}).bind(this)
                },
            }, {
                advance: {value: this.advance},
                clear: {value: this.clear},
                fill: {value: this.fill}
            });

            //  Text freezing:

            Object.freeze(this);

        }

        //  Text prototyping:

        Text.prototype = Object.create(Jelli.prototype, {
            advance: {value: function (/*  Optional amount  */) {return this.block.advance.apply(this.block, arguments);}},
            clear: {value: function () {return this.block.clear.apply(this.block, arguments);}},
            draw: {
                value: function () {
                    var c = this.get("color");
                    if (c) this.block.letters.setColor(this.block.letters.source.dataset["palette" + c[0].toUpperCase() + c.substr(1)]);
                    else this.block.letters.clearColor();
                    this.block.draw.call(this.block, this.context, this.x, this.y);
                }
            },
            fill: {value: function () {return this.block.fill.apply(this.block, arguments);}},
            item: {value: function (n) {return this.block.item.apply(this.block, arguments);}},
            line: {value: function (n) {return this.block.line.apply(this.block, arguments);}}
        });

        return Game;

    })();

})();
