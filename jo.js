/* jshint asi:true, browser:true */
/* globals ImageBitmap */

/*

#  jo.js: A Video Game  #

*/

//  All inside an anonymous function for strictness and proper closure:

var Jo = (function () {

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

    //  Sheet:

    var Sheet = (function () {

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

        function Map(tileset, context, map, tiles_wide /*  x, y (if not provided, the map will be centred on the screen)  */) {

            //  Setting up variables:

            var decoded_map;
            var tiles_tall;
            var x;
            var y;

            //  Handling arguments and error checking:

            if (!(context instanceof CanvasRenderingContext2D)) throw new Error("[Tileset] Cannot create map – canvas context must be 2d.");
            if (!(tileset instanceof Tileset)) throw new Error("[Tileset] Cannot create map – no tileset provided");
            if (!(typeof map === "string" || map instanceof String) || map.length % 4) throw new Error("[Tileset] Cannot create map – map must be provided as a Base64-encoded string.");
            if (!(typeof tiles_wide === "number" || tiles_wide instanceof Number)) throw new Error("[Tileset] Cannot create map – width of map not specified.");
            decoded_map = decode64(map);
            if (decoded_map.length % tiles_wide !== 0) throw new Error("[Tileset] Cannot create map – provided map not evenly divided by its width.");
            if (arguments.length >= 6) {
                if (!(typeof arguments[4] === "number" || arguments[4] instanceof Number) || !(typeof arguments[5] === "number" || arguments[5] instanceof Number)) throw new Error("[Tileset] Cannot create map – starting coordinates must be numbers.");
                x = arguments[4];
                y = arguments[5];
            }
            else {
                x = Math.floor((context.canvas.width - tileset.tile_width * tiles_wide) / 2);
                y = Math.floor((context.canvas.height - tileset.tile_height * (decoded_map.length / tiles_wide)) / 2);
            }
            tiles_tall = decoded_map.length / tiles_wide;

            //  Making the map:


            Object.defineProperties(this, {
                context: {
                    value: context
                },
                map: {
                    value: decoded_map
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
                    value: x
                },
                y: {
                    value: y
                }
            });

        }

        //  Map prototyping:

        Map.prototype = Object.create(Object.prototype, {
            collides: {
                value: function (x, y) {
                    var collision;
                    if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Tileset] Cannot find collision – coordinates must be numbers.");
                    if (x < this.x || x >= this.x + this.tile_width * this.tiles_wide || y < this.y || y >= this.y + this.tile_height * this.tiles_tall) return 0xF;
                    collision = this.tileset.getCollision(this.map[Math.floor((x - this.x) / this.tile_width) + Math.floor((y - this.y) / this.tile_height) * this.tiles_wide]);
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
                value: function (dir, x, y) {
                    var collision;
                    var corner;
                    var i;
                    var ix;
                    var iy;
                    if (!(dir == "left" || dir == "top" || dir == "right" || dir == "bottom")) throw new Error("[Tileset] Cannot get collision edge – No proper directional keyword provided.");
                    if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Tileset] Cannot find collision – coordinates must be numbers.");
                    if ((x - this.x) % (this.tile_width / 2) === 0 || (y - this.y) % (this.tile_height / 2) === 0) {
                        switch (dir) {
                            case "left":
                            case "right":
                                return x;
                            case "top":
                            case "bottom":
                                return y;
                        }
                    }
                    ix = Math.floor((x - this.x) / this.tile_width);
                    iy = Math.floor((y - this.y) / this.tile_height);
                    i = ix + iy * this.tiles_wide;
                    if (x < this.x || x >= this.x + this.tile_width * this.tiles_wide || y < this.y || y >= this.y + this.tile_height * this.tiles_tall) {
                        collision = 0xF;
                        corner = 0xF;
                    }
                    else {
                        collision = this.tileset.getCollision(this.map[i]);
                        corner = this.collides(x, y);
                    }
                    if (!corner && (dir == "left" || dir == "right")) return x;
                    else if (!corner && (dir == "top" || dir == "bottom")) return y;
                    switch (dir) {
                        case "left":
                            if (x > this.x + this.tile_width * this.tiles_wide) return this.x + this.tile_width * this.tiles_wide;
                            else if (y < this.y || y >= this.y + this.tile_height * this.tiles_tall) return x;
                            if ((corner == 0x2 && !(collision & 0x1)) || (corner == 0x8 && !(collision & 0x4))) return ix * this.tile_width + this.tile_width / 2;
                            else return ix * this.tile_width;
                            break;
                        case "right":
                            if (x < this.x) return this.x;
                            else if (y < this.y || y >= this.y + this.tile_height * this.tiles_tall) return x;
                            if ((corner == 0x1 && !(collision & 0x2)) || (corner == 0x4 && !(collision & 0x8))) return ix * this.tile_width + this.tile_width / 2;
                            else return ix * this.tile_width + this.tile_width;
                            break;
                        case "top":
                            if (y > this.y + this.tile_height * this.tiles_tall) return this.y + this.tile_height * this.tiles_tall;
                            else if (x < this.x || x >= this.x + this.tile_width * this.tiles_wide) return y;
                            if ((corner == 0x4 && !(collision & 0x1)) || (corner == 0x8 && !(collision & 0x2))) return iy * this.tile_height + this.tile_height / 2;
                            else return iy * this.tile_height;
                            break;
                        case "bottom":
                            if (y < this.y) return this.y;
                            else if (x < this.x || x >= this.x + this.tile_width * this.tiles_wide) return y;
                            if ((corner == 0x1 && !(collision & 0x4)) || (corner == 0x2 && !(collision & 0x8))) return iy * this.tile_height + this.tile_height / 2;
                            else return iy * this.tile_height + this.tile_height;
                            break;
                    }
                }
            },
            draw: {
                value: function () {
                    var i;
                    for (i = 0; i < this.map.length; i++) {
                        this.tileset.draw(this.context, this.map[i], this.x + (i % this.tiles_wide) * this.tile_width, this.y + Math.floor(i / this.tiles_wide) * this.tile_height);
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
                value: function (context, map, tiles_wide) {
                    return new Map(this, context, map, tiles_wide);
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

    //  JoScript:

    var JoScript = (function () {

        //  Getting values:

        function value(dataobj, prop) {
            if (typeof dataobj !== "object") throw new Error("[JoScript] Error: No data object provided.");
            if (!isNaN(Number(prop))) return Number(prop);
            else if ((typeof prop === "string" || prop instanceof String) && prop[0] === "-") {
                if (typeof dataobj[prop.substr(1)] === "number" || dataobj[prop.substr(1)] instanceof Number) return -dataobj[prop];
            }
            else if (typeof dataobj[prop] === "number" || dataobj[prop] instanceof Number) return dataobj[prop];
            else throw new Error("[JoScript] Variable did not resolve into a number.");
        }

        //  Script object constructor:

        function JoScript(props) {

            //  Setting up variables:

            var i;

            //  Handling arguments and error checking:

            if (typeof props === undefined) return;
            if (typeof props === "string" || props instanceof String) {
                this[props] = 0;
                return;
            }
            if (!(typeof props === "object" && props instanceof Array)) throw new Error("[JoScript] Data object property names must be provided in an array.");

            for (i = 0; i < props.length; i++) {
                if (!(typeof props[i] === "string" || props[i] instanceof String)) throw new Error("[JoScript] Data object property names must be provided as strings.");
                this[props[i]] = 0;
            }

        }

        //  Script object prototyping:

        JoScript.prototype = Object.create(Object.prototype, {

            declare: {
                value: function(prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JoScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JoScript] Dashes are not allowed in variable names.");
                    if (this.hasOwnProperty(prop)) throw new Error("[JoScript] Attempted to declare an already-declared variable.");
                    this[prop] = 0;
                }
            },
            get: {
                value: function(prop) {
                    return value(this, prop);
                }
            },
            increment: {
                value: function(prop /*  optional value  */) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JoScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JoScript] Dashes are not allowed in variable names.");
                    if (this[prop] === undefined || !this.hasOwnProperty(prop)) throw new Error("[JoScript] Attempted to increment a non-declared value.");
                    if (arguments[1] !== undefined) this[prop] += value(this, arguments[1]);
                    else return this[prop]++;
                }

            },
            mod_increment: {
                value: function(prop, mod /*  optional value  */) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JoScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JoScript] Dashes are not allowed in variable names.");
                    if (this[prop] === undefined || !this.hasOwnProperty(prop)) throw new Error("[JoScript] Attempted to increment a non-declared value.");
                    if (arguments[2] !== undefined) this[prop] += value(this, arguments[2]);
                    else this[prop]++;
                    return this[prop] %= value(this, mod);
                }

            },
            set: {
                value: function(prop, to) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JoScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JoScript] Dashes are not allowed in variable names.");
                    if (this[prop] === undefined || !this.hasOwnProperty(prop)) throw new Error("[JoScript] Attempted to set a non-declared value.");
                    return (this[prop] = value(this, to));
                }
            },
            void: {
                value: function(prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JoScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JoScript] Dashes are not allowed in variable names.");
                    if (this[prop] === undefined || !this.hasOwnProperty(prop)) throw new Error("[JoScript] Attempted to void a non-declared value.");
                    this[prop] = 0;
                }
            }

        });

        JoScript.parse = function (script, dataobj) {

            //  Setting up variables:

            var args;
            var b;
            var breakdown;
            var condition;
            var conds_regex = /(-)?\s*\(\s*(-?\w+)(?:\s*([<>=])\s*(-?\w+))?\s*\)/g;
            var i;
            var j;
            var line;
            var lines;
            var n;
            var regex = /^\s*(?:(?:((?:-?\s*\(\s*-?\w+(?:\s*[<>=]\s*-?\w+)?\s*\)\s*)+)?\s*(?:(\w+)\s*(\(\s*-?\w+(?:\s*,\s*-?\w+)*\s*\))?|(\?))|([:;]))|>>.*)\s*$/;
            var s;

            //  Handling arguments and error checking:

            if (!(typeof script === "string" || script instanceof String)) throw new Error("[JoScript] Error: Script is not a string.");
            if (typeof dataobj !== "object") throw new Error("[JoScript] Error: No data object provided.");

            //  Parsing the lines:

            for (lines = script.split("\n"), i = 0; i < lines.length; i++) {

                //  Setting the current line:

                line = lines[i].trim();
                if (line === "") continue;
                breakdown = regex.exec(line);
                if (!breakdown) throw new Error("[JoScript] Error on line " + (i + 1) + ": Parsing error.");

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
                                b = n ? value(dataobj, condition[2]) <= value(dataobj, condition[4]) : value(dataobj, condition[2] > value(dataobj, condition[4]));
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

                        if (!breakdown) throw new Error("[JoScript] Error on line " + (i + 1) + ": Parsing error.");
                        if (breakdown[4]) j++;
                        if (breakdown[5] === ";") {
                            if (--j < 0) break;
                        }
                        if (!j && breakdown[5] === ":") {
                            if (!n) n = true;
                            else throw new Error("[JoScript] Error on line " + (i + 1) + ": Improper second 'else'.");
                            continue;
                        }

                        //  Adds the line to the string if necessary:

                        if ((!n && b) || (n && !b)) s += line + "\n";

                    }

                    //  Parses the resultant string:

                    JoScript.parse(s, dataobj);

                }

                else if (b && breakdown[2]) {
                    if (breakdown[3]) {
                        dataobj[breakdown[2]].apply(dataobj, breakdown[3].substring(1, breakdown[3].length - 1).trim().split(/\s*,\s*/));
                    }
                    else dataobj[breakdown[2]].apply(dataobj);
                }

            }

        }

        return JoScript;

    })();

    /*
        The actual game code follows.
        I've placed it inside its own closure for convenient packaging, but it requires all of the previous modules to be loaded.
    */

    return (function () {

        //  Setting up variables:

        var datadoc = document.implementation.createHTMLDocument("Jo");

        var characters = [];
        var control;
        var letters = Object.create(null);
        var screens = Object.create(null);
        var sheets = Object.create(null);
        var maps = [];
        var tilesets = Object.create(null);

        var clear_area = true;
        var current_area;
        var resized = true;

        var global_object = Object.create(JoScript.prototype, {
            "key_start": {get: function() {return Number(control.isActive("start"));}},
            "key_select": {get: function() {return Number(control.isActive("select"));}},
            "key_menu": {get: function() {return Number(control.isActive("menu"));}},
            "key_look": {get: function() {return Number(control.isActive("look"));}},
            "key_exit": {get: function() {return Number(control.isActive("exit"));}},
            "key_action": {get: function() {return Number(control.isActive("action"));}},
            "key_up": {get: function() {return Number(control.isActive("up"));}},
            "key_down": {get: function() {return Number(control.isActive("down"));}},
            "key_left": {get: function() {return Number(control.isActive("left"));}},
            "key_right": {get: function() {return Number(control.isActive("right"));}}
        });

        //  Character constructor:

        function Character(sprites, box_x, box_y, box_width, box_height, props, initScript, stepScript) {

            //  Setting up variables:

            var i;

            //  Handling arguments and error checking:

            if (!(typeof sprites === "object" && sprites instanceof Array)) throw new Error("[Jo] Cannot create character – sprites must be provided in an array.");
            if (!(typeof props === "object" && props instanceof Array)) throw new Error("[Jo] Cannot create character – variables must be provided in an array.");
            if (!(typeof initScript === "string" || initScript instanceof String)) throw new Error("[Jo] Cannot create character – No init function provided.");
            if (!(typeof stepScript === "string" || stepScript instanceof String)) throw new Error("[Jo] Cannot create character – No step function provided.");

            //  Defining properties:

            Object.defineProperties(this, {  //  Note that $ is not valid in JoScript variable names
                height: {
                    value: box_height
                },
                init$cript: {
                    value: initScript
                },
                origin_x: {
                    value: box_x
                },
                origin_y: {
                    value: box_y
                },
                sprite$: {
                    value: sprites
                },
                sprite_height: {
                    value: sprites[0].height
                },
                sprite_width: {
                    value: sprites[0].width
                },
                step$cript: {
                    value: stepScript
                },
                width: {
                    value: box_width
                }
            });

            this.declare("x");
            this.set("x", this.sprite_width / 2);
            this.declare("y");
            this.set("y", this.sprite_height / 2);
            this.declare("dir");
            this.declare("frame");

            for (i = 0; i < props.length; i++) {
                if (!(typeof props[i] === "string" || props[i] instanceof String)) throw new Error("[Jo] Cannot create character – Property names must be strings.");
                this.declare(props[i]);
            }

        }

        Character.prototype = Object.create(global_object, {
            getCollision$Edge: {
                value: function (dir, x, y) {
                    if (!(dir == "left" || dir == "top" || dir == "right" || dir == "bottom")) throw new Error("[Jo] Cannot get collision edge – No proper directional keyword provided.");
                    if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("[Jo] Cannot find collision – coordinates must be numbers.");
                    if (x <= this.get("x") - this.width / 2 || x >= this.get("x") + this.width / 2 || y <= this.get("y") - this.height / 2 || y >= this.get("y") + this.height / 2) {
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
                            return this.get("x") - this.width / 2;
                        case "right":
                            return this.get("x") + this.width / 2;
                        case "top":
                            return this.get("y") - this.height / 2;
                        case "bottom":
                            return this.get("y") + this.height / 2;
                    }
                }
            },
            draw$: {
                value: function (context) {
                    return this.sprite$[this.get("dir")].draw(context, Math.floor(this.get("x") - this.origin_x), Math.floor(this.get("y") - this.origin_y), this.get("frame"));
                }
            },
            init$: {
                value: function () {
                    return JoScript.parse(this.init$cript, this);
                }
            },
            step$: {
                value: function () {
                    return JoScript.parse(this.step$cript, this);
                }
            },
            target: {
                value: function(cx, cy) {
                    var dx = this.get(cx) - this.get("x");
                    var dy = this.get(cy) - this.get("y");
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
                    dx = this.get(dx);
                    dy = this.get(dy);
                    d = Math.sqrt(dx * dx + dy * dy);
                    if (!d) return;
                    ux = dx / d;
                    uy = dy / d;
                    if (dx > 0) {
                        for (i = 0; i < maps.length; i++) {
                            k = Math.floor(this.height / (maps[i].tile_height / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = maps[i].getCollisionEdge("left", this.get("x") + ux + this.width / 2, this.get("y") + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx > tx) sx = tx;
                            }
                        }
                        for (i = 0; i < characters.length; i++) {
                            if (this === characters[i]) continue;
                            k = Math.floor(this.height / characters[i].height) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = characters[i].getCollision$Edge("left", this.get("x") + ux + this.width / 2, this.get("y") + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx > tx) sx = tx;
                            }
                        }
                        if (sx !== undefined) this.set("x", sx - this.width / 2);
                    }
                    else if (dx < 0) {
                        for (i = 0; i < maps.length; i++) {
                            k = Math.floor(this.height / (maps[i].tile_height / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = maps[i].getCollisionEdge("right", this.get("x") + ux - this.width / 2, this.get("y") + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx < tx) sx = tx;
                            }
                        }
                        for (i = 0; i < characters.length; i++) {
                            if (this === characters[i]) continue;
                            k = Math.floor(this.height / characters[i].height) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = characters[i].getCollision$Edge("right", this.get("x") + ux - this.width / 2, this.get("y") + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx < tx) sx = tx;
                            }
                        }
                        if (sx !== undefined) this.set("x", sx + this.width / 2);
                    }
                    if (dy > 0) {
                        for (i = 0; i < maps.length; i++) {
                            k = Math.floor(this.width / (maps[i].tile_width / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = maps[i].getCollisionEdge("top", this.get("x") + (j - k / 2) * this.width / k, this.get("y") + uy + this.height / 2);
                                if (sy === undefined || sy > ty) sy = ty;
                            }
                        }
                        for (i = 0; i < characters.length; i++) {
                            if (this === characters[i]) continue;
                            k = Math.floor(this.width / characters[i].width) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = characters[i].getCollision$Edge("top", this.get("x") + (j - k / 2) * this.width / k, this.get("y") + uy + this.height / 2);
                                if (sy === undefined || sy > ty) sy = ty;
                            }
                        }
                        if (sy !== undefined) this.set("y", sy - this.height / 2);
                    }
                    else if (dy < 0) {
                        for (i = 0; i < maps.length; i++) {
                            k = Math.floor(this.width / (maps[i].tile_width / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = maps[i].getCollisionEdge("bottom", this.get("x") + (j - k / 2) * this.width / k, this.get("y") + uy - this.height / 2);
                                if (sy === undefined || sy < ty) sy = ty;
                            }
                        }
                        for (i = 0; i < characters.length; i++) {
                            if (this === characters[i]) continue;
                            k = Math.floor(this.width / characters[i].width) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = characters[i].getCollision$Edge("bottom", this.get("x") + (j - k / 2) * this.width / k, this.get("y") + uy - this.height / 2);
                                if (sy === undefined || sy < ty) sy = ty;
                            }
                        }
                        if (sy !== undefined) this.set("y", sy + this.height / 2);
                    }
                }
            }
        });

        //  Clear the screens:

        function clearScreens() {

            //  Setting up variables:

            var i;

            //  Clearing the screens:

            for (i in screens) {
                switch (screens[i].canvas.dataset.type) {
                    case "area":
                        if (clear_area) screens[i].clear();
                        break;
                    case "animation":
                        screens[i].clear();
                        break;
                    default:
                        /*  Do nothing  */
                        break;
                }
            }

        }

        //  Draw functions:

        function drawText() {
            letters.letters.setColor(letters.letters.source.dataset.paletteDeepblue);
            letters.letters.createBlock(
                "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x49\x0A\x0B\x0C\x0D\x0E\x0F",
                "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x49\x1A\x1B\x1C\x1D\x1E\x1F",
                "\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x49\x2A\x2B\x2C\x2D\x2E\x2F",
                "\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x49\x3A\x3B\x3C\x3D\x3E\x3F",
                "\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x49\x4A\x4B\x4C\x4D\x4E\x4F",
                "",
                "\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x49\x5A\x5B\x5C\x5D\x5E\x5F",
                "\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x49\x6A\x6B\x6C\x6D\x6E\x6F",
                "\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x49\x7A\x7B\x7C\x7D\x7E\x7F",
                "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x49\x8A\x8B\x8C\x8D\x8E\x8F",
                "\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x49\x9A\x9B\x9C\x9D\x9E\x9F",
                "",
                "\xA0\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\x49\xAA\xAB\xAC\xAD\xAE\xAF",
                "\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\x49\xBA\xBB\xBC\xBD\xBE\xBF",
                "\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\x49\xCA\xCB\xCC\xCD\xCE\xCF",
                "\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\x49\xDA\xDB\xDC\xDD\xDE\xDF",
                "\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\x49\xEA\xEB\xEC\xED\xEE\xEF",
                "",
                "\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\x49\xFA\xFB\xFC\xFD\xFE\xFF"
            )//.draw(screens.textground.context, 0, 0);

        }

        //  Event handling:

        function handleEvent(e) {

            var k;

            switch (e.type) {

                case "keydown":
                    k = e.code || e.key || e.keyIdentifier || e.keyCode;
                    if (document.documentElement.hasAttribute("data-touch")) {
                        document.documentElement.removeAttribute("data-touch");
                        resized = true;
                    }
                    if (!document.documentElement.hasAttribute("data-loaded")) {
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
                    resized = true;
                    break;

                case "touchstart":
                    if (!document.documentElement.hasAttribute("data-touch")) {
                        document.documentElement.setAttribute("data-touch", "");
                        resized = true;
                    }
                    if (!document.documentElement.hasAttribute("data-loaded")) {
                        setup();
                        break;
                    }
                    break;

            }

        }

        //  Initialization:

        function init() {

            //  Setting up variables:

            var char_proto;
            var collection;
            var collection2;
            var i;
            var j;
            var m;
            var n;

            function imported(node) {
                if (typeof node === "string" || node instanceof String) node = datadoc.getElementById(node);
                if (!(node instanceof Node)) throw new Error("[Jo] Cannot import node – none provided");
                return document.importNode(node, true);
            }
            function placed(node) {
                if (typeof node === "string" || node instanceof String) node = datadoc.getElementById(node);
                if (!(node instanceof Node)) throw new Error("[Jo] Cannot place node – none provided");
                return document.body.appendChild(document.importNode(node, true));
            }

            //  Making sure modules are loaded:

            if (typeof Screen === "undefined" || !Screen) throw new Error("[Jo] Screen module not loaded");
            if (typeof Control === "undefined" || !Control) throw new Error("[Jo] Control module not loaded");
            if (typeof Sheet === "undefined" || !Sheet) throw new Error("[Jo] Sheet module not loaded");
            if (typeof Letters === "undefined" || !Letters) throw new Error("[Jo] Letters module not loaded");
            if (typeof Tileset === "undefined" || !Tileset) throw new Error("[Jo] Tileset module not loaded");
            if (typeof JoScript === "undefined" || !Tileset) throw new Error("[Jo] JoScript module not loaded");

            //  Setting up datadoc and clearing the body:

            datadoc.body = datadoc.importNode(document.body, true);
            document.body = document.createElement("body");
            document.body.style.visibility = "hidden";

            //  Screen setup:

            for (collection = datadoc.getElementsByTagName("canvas"), i = 0; i < collection.length; i++) {
                Object.defineProperty(screens, collection.item(i).id, {value: new Screen(placed(collection.item(i)), "2d"), enumerable: true});
            }

            //  Control setup:

            placed("jo-ctls-lf");
            placed("jo-ctls-rt");

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

            //  Sprite sheet setup:

            for (collection = datadoc.getElementsByClassName("letters"), i = 0; i < collection.length; i++) {
                Object.defineProperty(letters, collection.item(i).id, {value: new Letters(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight))});
            }
            for (collection = datadoc.getElementsByClassName("tileset"), i = 0; i < collection.length; i++) {
                Object.defineProperty(tilesets, collection.item(i).id, {value: new Tileset(new Sheet(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight), collection.item(i).dataset.collisions.trim(), Sheet.drawSheetAtIndex)});
            }
            for (collection = datadoc.getElementsByClassName("sheet"), i = 0; i < collection.length; i++) {
                Object.defineProperty(sheets, collection.item(i).id, {value: new Sheet(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight))});
            }

            //  Adding event listeners:

            document.body.addEventListener("touchmove", function (e) {e.preventDefault();}, false);
            window.addEventListener("keydown", handleEvent, false);
            window.addEventListener("resize", handleEvent, false);
            window.addEventListener("touchstart", handleEvent, false);

        }

        //  Layout:

        function layout() {

            //  Variable setup:

            var body_height;
            var body_width;
            var border_img = datadoc.querySelector("img.gui-border");
            var border_height =  Number(border_img.dataset.spriteHeight);
            var border_width =  Number(border_img.dataset.spriteWidth);
            var button_img = datadoc.querySelector("img.gui-buttons");
            var button_height;
            var button_width;
            var canvas;
            var horizontal;
            var i;
            var scaled_height;
            var scaled_width;
            var temporary_height;
            var temporary_width;

            //  Accommodating buttons for touch:

            if (document.documentElement.hasAttribute("data-touch")) {
                button_height = Number(button_img.dataset.buttonHeight);
                button_width = Number(button_img.dataset.buttonWidth);
            }
            else {
                button_height = 0;
                button_width = 0;
            }

            //  Styling the root:

            document.documentElement.style.margin = "0";
            document.documentElement.style.padding = "0";
            document.documentElement.style.background = "black";
            document.documentElement.style.imageRendering = "-webkit-optimize-contrast";
            document.documentElement.style.imageRendering = "-moz-crisp-edges";
            document.documentElement.style.imageRendering = "pixelated";
            document.documentElement.style.WebkitTouchCallout = "none";
            document.documentElement.style.webkitTouchCallout = "none";
            document.documentElement.style.WebkitUserSelect = "none";
            document.documentElement.style.webkitUserSelect = "none";
            document.documentElement.style.msUserSelect = "none";
            document.documentElement.style.MozUserSelect = "none";
            document.documentElement.style.userSelect = "none";

            //  Styling the body:

            document.body.style.position = "absolute";
            document.body.style.top = "0";
            document.body.style.bottom = "0";
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.margin = "0";
            document.body.style.border = "none";
            document.body.style.padding = "0";
            document.body.style.background = border_img.dataset.systemBackground;

            //  Setting up body width/height:

            body_width = document.body.clientWidth;
            body_height = document.body.clientHeight;

            //  Layout choice is dictated by the first canvas element:

            canvas = document.getElementsByTagName("canvas").item(0)
            if (body_width / body_height > canvas.width / canvas.height) {
                horizontal = true;
                body_width -= 2 * button_width;
            }
            else {
                horizontal = false;
                body_height -= button_height;
            }

            //  Sizing each canvas:

            for (i = 0; i < document.getElementsByTagName("canvas").length; i++) {

                canvas = document.getElementsByTagName("canvas").item(i);

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

            //  Styling controls:

            if (horizontal){
                document.getElementById("jo-ctls-lf").style.top = "0";
                document.getElementById("jo-ctls-rt").style.top = "0";
                document.getElementById("jo-ctls-lf").style.right = "";
                document.getElementById("jo-ctls-rt").style.left = "";
            }
            else {
                document.getElementById("jo-ctls-lf").style.top = "";
                document.getElementById("jo-ctls-rt").style.top = "";
                document.getElementById("jo-ctls-lf").style.right = "50%";
                document.getElementById("jo-ctls-rt").style.left = "50%";
            }

            //  Making it visible:

            document.body.style.visibility = "";

        }

        //  Area loading:

        function loadArea() {

            //  Setting up variables:

            var collection;
            var collection2;
            var i;
            var j;
            var item;
            var item2;
            var m;
            var n;

            //  Loading maps:

            maps = [];
            for (collection = current_area.getElementsByClassName("map"), i = 0; i < collection.length; i++) {
                item = collection.item(i);
                maps[i] = tilesets[item.dataset.tileset].getMap(screens[item.dataset.screen].context, item.textContent.trim(), Number(item.dataset.mapwidth));
            }

            //  Loading characters:

            characters = [];
            for (collection = current_area.getElementsByClassName("character"), i = 0; i < collection.length; i++) {
                item = collection.item(i);
                m = {};
                n = [];
                if (!datadoc.getElementById(item.dataset.sprites) || datadoc.getElementById(item.dataset.sprites).className !== "sprites") throw new Error("[Jo] Cannot load character – No sprites provided.");
                else item2 = datadoc.getElementById(item.dataset.sprites);
                for (collection2 = item2.getElementsByClassName("sprite"), j = 0; j < collection2.length; j++) {
                    n.push(sheets[item2.dataset.sheet].getSprite(Number(collection2.item(j).dataset.index), Number(collection2.item(j).dataset.length ? collection2.item(j).dataset.length : 1)));
                    if (collection2.item(j).hasAttribute("title")) m[collection2.item(j).getAttribute("title")] = j;
                }
                characters[i] = new Character(n, Number(item2.dataset.boxX || n[0].width / 2), Number(item2.dataset.boxY || n[0].height / 2), Number(item2.dataset.boxWidth || n[0].width), Number(item2.dataset.boxHeight || n[0].height), item.dataset.vars ? item.dataset.vars.split(/\s+/) : [], item.getElementsByClassName("init").item(0) ? item.getElementsByClassName("init").item(0).text || item.getElementsByClassName("init").item(0).textContent : "", item.getElementsByClassName("step").item(0) ? item.getElementsByClassName("step").item(0).text || item.getElementsByClassName("step").item(0).textContent : "");
                for (j in m) {
                    characters[i].declare(j);
                    characters[i].set(j, m[j]);
                }
                characters[i].init$();
            }

        }

        //  Logic function:

        function logic() {

            //  Setting up variables:

            var i;

            //  Stepping the characters:

            for (i = 0; i < characters.length; i++) {
                characters[i].step$()
            }

            //  setTimeout for that logic:

            window.setTimeout(logic, 1000/60);

        }

        //  Rendering function:

        function render() {

            //  Setting up variables:

            var i;

            //  Managing layout:

            if (resized) layout();

            //  Clearing the screens, if needed:

            clearScreens();

            //  Drawing the area:

            if (clear_area) {

                //  Drawing the tiles:

                for (i = 0; i < maps.length; i++) {
                    maps[i].draw();
                }

                //  Drawing the text:

                drawText();

            }

            //  Drawing the characters:

            for (i = 0; i < characters.length; i++) {
                characters[i].draw$(screens.mainground.context)
            }

            //  Reset various flags:

            clear_area = resized = false;

            //  Request new frame:

            window.requestAnimationFrame(render);

        }

        //  Setup function:

        function setup() {

            current_area = datadoc.getElementById("testarea");

            loadArea();

            document.documentElement.setAttribute("data-loaded", "");

            logic();

            window.requestAnimationFrame(render);

        }

        //  Add load listener:

        window.addEventListener("load", init, false);

        return true;

    })();

})();
