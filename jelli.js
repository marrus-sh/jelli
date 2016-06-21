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

    //  Placement image:

    var PlacementImage = (function () {

        //  Placement image constructor

        function PlacementImage(source, context, x, y /*  Optional origin_x, origin_y, placed  */) {

            //  Variable setup:

            var origin_x;
            var origin_y
            var source_width;
            var source_height;
            var placed = !!arguments[6];

            //  Handling arguments:

            if (!(source instanceof HTMLImageElement || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && source instanceof ImageBitmap))) source = undefined;
            if (!(context instanceof CanvasRenderingContext2D)) return;
            if (isNaN(x = Number(x))) x = 0;
            if (isNaN(y = Number(x))) y = 0;
            if (isNaN(origin_x = Number(arguments[4]))) origin_x = 0;
            if (isNaN(origin_y = Number(arguments[5]))) origin_y = 0;

            //  Getting width and height:

            if (!source || isNaN(source_width = Number(source.naturalWidth !== undefined ? source.naturalWidth : source.width))) source_width = 0;
            if (!source || isNaN(source_height = Number(source.naturalHeight !== undefined ? source.naturalHeight : source.height))) source_height = 0;

            //  Adding properties:

            Object.defineProperties(this, {
                context: {value: context},
                height: {value: source_height},
                origin_x: {
                    value: origin_x,
                    writable: true
                },
                origin_y: {
                    value: origin_y,
                    writable: true
                },
                placed: {
                    get: function () {return placed;},
                    set: function (n) {placed = !!n;}
                },
                source: {value: source},
                width: {value: source_width},
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
                    if (this.source instanceof HTMLImageElement && !this.source.complete) return;
                    if (this.placed) this.context.drawImage(this.source, Math.floor(this.x - this.origin_x), Math.floor(this.y - this.origin_y));
                }
            },
            setPlacement: {
                value: function (n) {
                    this.placed = !!n;
                }
            },
            setPosition: {
                value: function (x, y) {
                    if (!isNaN(x)) this.x = Number(x);
                    if (!isNaN(y)) this.x = Number(y);
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
            x = arguments[4] === undefined && context && tileset ? Math.floor((context.canvas.width - tileset.tile_width * tiles_wide) / 2) : isNaN(arguments[4]) ? Number(arguments[4]) : 0;
            y = arguments[5] === undefined && context && tileset ? Math.floor((context.canvas.width - tileset.tile_width * tiles_tall) / 2) : isNaN(arguments[5]) ? Number(arguments[5]) : 0;
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

    //  JelliScript:

    var Jelli = (function () {

        //  The global JelliScript object

        var global = null;
        var globals = [];
        var functions = Object.create(Object.prototype, {
            log: {
                value: function (prop) {console.log(value(global ? global : this, prop));}
            }
        });
        var modifiers = Object.create(Object.prototype, {
            declare: {
                value: function (prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (!/^\w+$/.test(prop)) throw new Error("[JelliScript] Syntax error: Disallowed characters used in a variable name.");
                    if (this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to declare an already-declared variable.");
                    this.__properties__[prop] = 0;
                }
            },
            declare_Jelli: {
                value: function (prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (!/^\w+$/.test(prop)) throw new Error("[JelliScript] Syntax error: Disallowed characters used in a variable name.");
                    if (this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to declare an already-declared variable.");
                    this.__properties__[prop] = new Jelli();
                }
            },
            delete: {
                value: function (prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) delete this.__properties__[prop];
                }
            },
            get: {value: function (prop) {return value(this, prop);}},
            increment: {
                value: function (prop /*  optional value  */) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to increment a non-declared value.");
                    return arguments[1] !== undefined ? this.__properties__[prop] += arguments[1] : this.__properties__[prop]++;
                }
            },
            is_defined: {
                value: function (prop) {
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    return this.__properties__.hasOwnProperty(prop);
                }
            },
            make_eternal: {
                value: function (prop) {
                    var s;
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to set a non-declared value.");
                    return Object.defineProperty(this.__properties__, prop, {configurable: false});
                }
            },
            make_hidden: {
                value: function (prop) {
                    var s;
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to set a non-declared value.");
                    return Object.defineProperty(this.__properties__, prop, {enumerable: false});
                }
            },
            make_static: {
                value: function (prop) {
                    var s;
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to set a non-declared value.");
                    return Object.defineProperty(this.__properties__, prop, {writable: false});
                }
            },
            mod_increment: {
                value: function (prop, mod /*  optional value  */) {
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
                value: function (prop /*  optional digits  */) {
                    var n = 1;
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to round a non-declared value.");
                    if (arguments[1] !== undefined) n = Math.pow(10, arguments[1])
                    return (this.__properties__[prop] = Math.round(this.__properties__[prop] * n) / n);
                }
            },
            run: {value: function (fn) {return run.call(null, this, fn, Array.prototype.slice.call(arguments, 1));}},
            scale: {value: function (prop, factor) {
                if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                if (this.__properties__[prop] === undefined || !this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to increment a non-declared value.");
                return this.__properties__[prop] *= factor;
            }},
            set: {
                value: function (prop, to) {
                    var s;
                    if (!(typeof prop === "string" || prop instanceof String)) throw new Error("[JelliScript] Variables must be specified as strings.");
                    if (prop.indexOf("-") !== -1) throw new Error("[JelliScript] Dashes are not allowed in variable names.");
                    if (!this.__properties__.hasOwnProperty(prop)) throw new Error("[JelliScript] Attempted to set a non-declared value.");
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
                if (dataobj.__properties__[fn.substr(0, s)] instanceof Jelli && dataobj.__properties__[fn.substr(0, s)].__functions__[fn.substr(s + 1)] instanceof Function && (arguments[2] instanceof Array ? arguments[2].length : 0) >= dataobj.__properties__[fn.substr(0, s)].__functions__[fn.substr(s + 1)].length) {
                    dataobj = dataobj.__properties__[fn.substr(0, s)];
                    s = fn.substr(s + 1);
                    return arguments[2] instanceof Array ? dataobj.__functions__[s].apply(dataobj, arguments[2].map(value.bind(undefined, global ? global : dataobj))) : dataobj.__functions__[s].call(dataobj);
                }
                if (dataobj.__modifiers__[fn.substr(s + 1)] instanceof Function) return arguments[2] instanceof Array ? dataobj.__modifiers__[fn.substr(s + 1)].apply(dataobj, [fn.substr(0, s)].concat(arguments[2].map(value.bind(undefined, global ? global : dataobj)))) : dataobj.__modifiers__[fn.substr(s + 1)].call(dataobj, fn.substr(0, s));
                else if (dataobj.__properties__[fn.substr(0, s)] instanceof Jelli) return arguments[2] instanceof Array ? run(dataobj.__properties__[fn.substr(0, s)], fn.substr(s + 1), arguments[2]) : run(dataobj.__properties__[fn.substr(0, s)], fn.substr(s + 1));
                else throw new Error("[JelliScript] Function name did not resolve into a function.");
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
                return prop.substring(1, prop.length - 1).replace('\\"', '"').replace('\\\\', '\\');
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
                    "rand": {get: function () {return Math.random();}},
                    "this": {value: this},
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
            var args_regex = /-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\.|[^"\\])*?"/g;
            var b;
            var breakdown;
            var condition;
            var conds_regex = /(-)?\s*\(\s*(-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\.|[^"\\])*?")(?:\s*([<>=])\s*(-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+))|"(?:\\.|[^"\\])*?")?\s*\)/g;
            var unset_global;
            var i;
            var j;
            var line;
            var lines;
            var n;
            var regex = /^\s*(?:(?:((?:-?\s*\(\s*(?:-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\.|[^"\\])*?")(?:\s*[<>=]\s*(?:-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\.|[^"\\])*?"))?\s*\)\s*?)+)?\s*(?:(\w+(?:\.\w+)*)\s*(\(\s*(?:-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\.|[^"\\])*?")(?:\s*,\s*(?:-?(?:\w+(?:\.\w+)*|[0-9]*\.?[0-9]+)|"(?:\\.|[^"\\])*?"))*\s*\))?|(\?))|([:;]))|>>.*)\s*$/;
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
                    conds_regex.lastIndex = 0;
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
                    if (breakdown[3]) run(dataobj, breakdown[2], breakdown[3].match(args_regex));
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

            var clear = 1;
            var collection;
            var elt;
            var i;
            var item;
            var props;
            var x;
            var y;

            //  Handling arguments:

            elt = game.datadoc.getElementsByClassName("area").item(index);
            if (!(game instanceof Game && elt instanceof Element)) return;

            //  Defining properties:

            Object.defineProperty(this, "game", {value: game});
            Object.defineProperties(this, {
                characters: {value: new Collection(this, Character)},
                clear: {
                    get: function () {return clear},
                    set: function (n) {clear = Number(!!n);}
                },
                images: {value: new Collection(this, JelliImage)},
                index: {
                    get: function () {return index},
                    set: function (n) {this.game.loadArea(n);}
                },
                initScript: {
                    value: elt.getElementsByClassName("init").item(0) ? elt.getElementsByClassName("init").item(0).text || elt.getElementsByClassName("init").item(0).textContent : ""
                },
                maps: {
                    value: []
                },
                stepScript: {
                    value: elt.getElementsByClassName("step").item(0) ? elt.getElementsByClassName("step").item(0).text || elt.getElementsByClassName("step").item(0).textContent : ""
                },
                x: {
                    get: function () {return x;},
                    set: (function (value) {
                        var i;
                        if (!(typeof value === "number" || value instanceof Number)) throw new Error("[Game] Cannot load area – x-coordinate must be a number.");
                        x = value;
                        for (i = 0; i < this.maps.length; i++) {
                            this.maps[i].origin_x = value;
                        }
                        this.images.doForEach(function (image) {image.origin_x = value;});
                        this.clear = 1;
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
                        this.images.doForEach(function (image) {image.origin_y = value;});
                        this.clear = 1;
                    }).bind(this)
                }
            });

            //  Sets up the area as a Jelli:

            Jelli.call(this, {
                characters: {value: this.characters},
                clear: {
                    get: function () {return clear;},
                    set: function (n) {clear = Number(!!n);}
                },
                game: {value: game},
                images: {value: this.images},
                index: {
                    get: function () {return index;},
                    set: (function (n) {this.game.loadArea(n);}).bind(this)
                },
                x: {
                    get: function () {return x;},
                    set: (function (n) {this.x = n;}).bind(this)
                },
                y: {
                    get: function () {return y;},
                    set: (function (n) {this.y = n;}).bind(this)
                }
            }, {
                setMapOffset: {value: this.setMapOffset}
            });

            //  Initializing properties:

            this.x = 0; //  This initializes the x value (so you can use this.set())
            this.y = 0; //  This initializes the y value (so you can use this.set())

            //   Adding dataset variables:

            for (collection = (elt.dataset.vars ? elt.dataset.vars.split(/\s+/) : []), i = 0; i < collection.length; i++) {
                this.declare(collection[i]);
            }

            //  Loading maps:

            for (collection = elt.getElementsByClassName("map"), i = 0; i < collection.length; i++) {
                item = collection.item(i);
                this.maps[i] = game.tilesets[item.dataset.tileset].getMap(game.screens[item.dataset.screen].context, item.textContent.trim(), Number(item.dataset.mapwidth), isNaN(Number(item.dataset.dx)) ? 0 : Number(item.dataset.dx), isNaN(Number(item.dataset.dy)) ? 0 : Number(item.dataset.dy), this.x, this.y);
            }


            //  Loading characters:

            for (collection = (elt.dataset.characters ? elt.dataset.characters.split(/\s+/) : []), i = 0; i < collection.length; i++) {
                this.characters.load(collection[i]);
            }

            //  Area sealing:

            Object.seal(this);

            //  Initialization:

            this.init();

        }

        //  Area prototyping:

        Area.prototype = Object.create(Jelli.prototype, {
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
                    this.clear = 0;
                }
            },
            init: {value: function () {return Jelli.parseScript(this.initScript, this);}},
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
                    Jelli.parseScript(this.stepScript, this);
                    this.characters.doForEach(function (character) {character.step();});
                }
            },
        });

        //  Character constructor:

        function Character(collection, name /*  Optional x, y OR id, x, y  */) {

            //  Setting up variables:

            var dir = 0;
            var elt;
            var frame = 0;
            var i;
            var id;
            var item;
            var items;
            var sprites = {};
            var x;
            var y;

            //  Handling arguments:

            if (typeof arguments[2] === "number" || arguments[2] instanceof Number) {
                id = name;
                x = arguments[2];
                if (isNaN(y = Number(arguments[3]))) y = undefined;
            }
            else {
                id = arguments[2] ? arguments[2] : name;
                if (isNaN(x = Number(arguments[3]))) x = undefined;
                if (isNaN(y = Number(arguments[4]))) y = undefined;
            }
            if (!(collection instanceof Collection) || !collection.area || !collection.game) return;
            elt = collection.game.datadoc.getElementById(id);
            if (!(elt instanceof Element)) return;

            //  Loading sprites:

            item = (collection.game.datadoc.getElementById(elt.dataset.sprites) && collection.game.datadoc.getElementById(elt.dataset.sprites).className === "sprites") ? collection.game.datadoc.getElementById(elt.dataset.sprites) : null;
            for (items = item ? item.getElementsByClassName("sprite") : [], i = 0; i < items.length; i++) {
                if (sprites[i] === undefined) Object.defineProperty(sprites, i, {value: collection.game.sheets[item.dataset.sheet] ? collection.game.sheets[item.dataset.sheet].getSprite(items.item(i).dataset.index, items.item(i).dataset.length ? items.item(i).dataset.length : 1) : null});
                if (items.item(i).hasAttribute("title") && sprites[items.item(i).getAttribute("title")] === undefined) Object.defineProperty(sprites, items.item(i).getAttribute("title"), {value: sprites[i]});
            }
            if (x === undefined) x = sprites[0].width / 2;
            if (y === undefined) y = sprites[0].height / 2;

            //  Defining properties:

            Object.defineProperties(this, {  //  Pretty much none of the above are writable, so I can just reference them straight below
                area: {value: collection.area},
                collides : {value: elt.hasAttribute("data-collides") ? elt.dataset.collides : 0},
                dir: {
                    get: function () {return dir},
                    set: function (n) {dir = isNaN(n) ? String(n) : Number(n);}
                },
                frame: {
                    get: function () {return frame},
                    set: function (n) {if (!isNaN(n)) frame = Number(n);}
                },
                game: {value: collection.game},
                height: {value: Number(item.dataset.boxHeight || sprites[0].height)},
                initScript: {value: elt.getElementsByClassName("init").item(0) ? elt.getElementsByClassName("init").item(0).text || elt.getElementsByClassName("init").item(0).textContent : ""},
                origin_x: {value: Number(item.dataset.boxX || sprites[0].width / 2)},
                origin_y: {value: Number(item.dataset.boxY || sprites[0].height / 2)},
                screen: {value: collection.game.screens[elt.dataset.screen]},
                screen_x: {get: function () {return this.x - this.area.x}},
                screen_y: {get: function () {return this.y - this.area.y}},
                sprites: {value: sprites},
                sprite_height: {value: sprites[0].height},
                sprite_width: {value: sprites[0].width},
                stepScript: {value: elt.getElementsByClassName("step").item(0) ? elt.getElementsByClassName("step").item(0).text || elt.getElementsByClassName("step").item(0).textContent : ""},
                width: {value: Number(item.dataset.boxWidth || sprites[0].width)},
                x: {
                    get: function () {return x},
                    set: function (n) {if (!isNaN(n)) x = Number(n);}
                },
                y: {
                    get: function () {return y},
                    set: function (n) {if (!isNaN(n)) y = Number(n);}
                }
            });

            //  Sets up the character as a Jelli:

            Jelli.call(this, {
                area: {value: collection.area},
                collides: {value: this.collides},
                dir: {
                    get: function () {return dir},
                    set: function (n) {dir = isNaN(n) ? String(n) : Number(n);}
                },
                frame: {
                    get: function () {return frame},
                    set: function (n) {if (!isNaN(n)) frame = Number(n);}
                },
                game: {value: collection.game},
                height: {value: this.height},
                origin_x: {value: this.origin_x},
                origin_y: {value: this.origin_y},
                screen_x: {get: (function () {return this.x - this.area.x}).bind(this)},
                screen_y: {get: (function () {return this.y - this.area.y}).bind(this)},
                sprite_height: {value: sprites[0].height},
                sprite_width: {value: sprites[0].width},
                width: {value: this.width},
                x: {
                    get: function () {return x},
                    set: function (n) {if (!isNaN(n)) x = Number(n);}
                },
                y: {
                    get: function () {return y},
                    set: function (n) {if (!isNaN(n)) y = Number(n);}
                }
            }, {
                setPosition: {value: this.setPosition},
                target: {value: this.target},
                targetBy: {value: this.targetBy}
            });

            for (items = elt.dataset.vars ? elt.dataset.vars.split(/\s+/) : [], i = 0; i < items.length; i++) {
                this.declare(items[i]);
            }

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
                    return this.sprites[this.dir].draw(this.screen.context, Math.round(this.x - this.origin_x - this.area.x), Math.round(this.y - this.origin_y - this.area.y), this.frame);
                }
            },
            getCollisionEdge: {
                value: function (dir, x, y) {
                    if (!(dir == "left" || dir == "top" || dir == "right" || dir == "bottom")) return undefined;
                    if (isNaN(x) || isNaN(y)) return undefined;
                    x = Number(x);
                    y = Number(y);
                    if (this.collides === 0 || this.collides === "map" || x <= Math.round(this.x - this.width / 2) || x >= Math.round(this.x + this.width / 2) || y <= Math.round(this.y - this.height / 2) || y >= Math.round(this.y + this.height / 2)) {
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
                            return Math.round(this.x - this.width / 2);
                        case "right":
                            return Math.round(this.x + this.width / 2);
                        case "top":
                            return Math.round(this.y - this.height / 2);
                        case "bottom":
                            return Math.round(this.y + this.height / 2);
                    }
                }
            },
            init: {value: function () {return Jelli.parseScript(this.initScript, this);}},
            setPosition: {
                value: function (x, y) {
                    this.x = x;
                    this.y = y;
                }
            },
            step: {value: function () {return Jelli.parseScript(this.stepScript, this);}},
            target: {
                value: function(cx, cy) {
                    var dx = cx - this.x - this.width / 2;
                    var dy = cy - this.y - this.width / 2;
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
                    d = Math.sqrt(dx * dx + dy * dy);
                    if (!(this.area instanceof Area) || !(this.area.characters instanceof Collection) || typeof this.area.maps !== "object" || !d) return;
                    if (d > 1) {
                        ux = dx / d;
                        uy = dy / d;
                    }
                    else {
                        ux = dx;
                        uy = dy;
                    }
                    if (this.collides === 0 || this.collides === "character") {
                        this.x += ux;
                        this.y += uy;
                        return;
                    }
                    if (dx > 0) {
                        for (i = 0; i < this.area.maps.length; i++) {
                            k = Math.floor(this.height / (this.area.maps[i].tile_height / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = this.area.maps[i].getCollisionEdge("left", this.x + ux + this.width / 2, this.y + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx > tx) sx = tx;
                            }
                        }
                        this.area.characters.doForEach((function (some) {
                            if (this === some || some.collides === 0 || some.collides === "map") return;
                            k = Math.floor(this.height / some.height) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = some.getCollisionEdge("left", this.x + ux + this.width / 2, this.y + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx > tx) sx = tx;
                            }
                        }).bind(this));
                        if (sx !== undefined) this.x = sx - this.width / 2;
                    }
                    else if (dx < 0) {
                        for (i = 0; i < this.area.maps.length; i++) {
                            k = Math.floor(this.height / (this.area.maps[i].tile_height / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = this.area.maps[i].getCollisionEdge("right", this.x + ux - this.width / 2, this.y + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx < tx) sx = tx;
                            }
                        }
                        this.area.characters.doForEach((function (some) {
                            if (this === some || some.collides === 0 || some.collides === "map") return;
                            k = Math.floor(this.height / this.area.characters.__properties__[i].height) + 1;
                            for (j = 0; j <= k; j++) {
                                tx = some.getCollisionEdge("right", this.x + ux - this.width / 2, this.y + (j - k / 2) * this.height / k);
                                if (sx === undefined || sx < tx) sx = tx;
                            }
                        }).bind(this));
                        if (sx !== undefined) this.x = sx + this.width / 2;
                    }
                    if (dy > 0) {
                        for (i = 0; i < this.area.maps.length; i++) {
                            k = Math.floor(this.width / (this.area.maps[i].tile_width / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = this.area.maps[i].getCollisionEdge("top", this.x + (j - k / 2) * this.width / k, this.y + uy + this.height / 2);
                                if (sy === undefined || sy > ty) sy = ty;
                            }
                        }
                        this.area.characters.doForEach((function (some) {
                            if (this === some || some.collides === 0 || some.collides === "map") return;
                            k = Math.floor(this.width /some.width) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = some.getCollisionEdge("top", this.x + (j - k / 2) * this.width / k, this.y + uy + this.height / 2);
                                if (sy === undefined || sy > ty) sy = ty;
                            }
                        }).bind(this));
                        if (sy !== undefined) this.y = sy - this.height / 2;
                    }
                    else if (dy < 0) {
                        for (i = 0; i < this.area.maps.length; i++) {
                            k = Math.floor(this.width / (this.area.maps[i].tile_width / 2)) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = this.area.maps[i].getCollisionEdge("bottom", this.x + (j - k / 2) * this.width / k, this.y + uy - this.height / 2);
                                if (sy === undefined || sy < ty) sy = ty;
                            }
                        }
                        this.area.characters.doForEach((function (some) {
                            if (this === some || some.collides === 0 || some.collides === "map") return;
                            k = Math.floor(this.width / some.width) + 1;
                            for (j = 0; j <= k; j++) {
                                ty = some.getCollisionEdge("bottom", this.x + (j - k / 2) * this.width / k, this.y + uy - this.height / 2);
                                if (sy === undefined || sy < ty) sy = ty;
                            }
                        }).bind(this));
                        if (sy !== undefined) this.y = sy + this.height / 2;
                    }
                }
            }
        });

        //  Collection constructor:

        function Collection(parent, constructor) {

            var area;
            var game;
            var len;
            var nextIndex;

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
                    set: function (n) {if (!isNaN(n)) nextIndex = Number(n);}
                },
                parent: {value: parent}
            });

            Jelli.call(this, {
                area: {value: area},
                game: {value: game},
                length: {get: (function () {return this[Object.keys(this).length];}).bind(this)},
                nextIndex: {
                    get: function () {return nextIndex},
                    set: function (n) {if (!isNaN(n)) nextIndex = Number(n);}
                },
                parent: {value: parent}
            }, {
                loadNameless: {value: this.loadNameless}
            }, {
                load: {value: this.load}
            });

        }

        //  Collection prototyping:

        Collection.prototype = Object.create(Jelli.prototype, {
            doForEach: {
                value: function (fn) {
                    var i;
                    for (i in this.__properties__) {
                        if (!this.Type || this.__properties__[i] instanceof this.Type) fn(this.__properties__[i]);
                    }
                    for (i in this) {
                        if (!this.Type || this.__properties__[i] instanceof this.Type) fn(this[i]);
                    }
                }
            },
            kill: {
                value: function (name) {
                    if (this.hasOwnProperty(name)) delete this[name];
                    else this.delete(name);
                }
            },
            load: {
                value: function (name) {
                    var args = [null, this].concat(Array.prototype.slice.call(arguments));
                    this.declare(name);
                    if (typeof this.Type === "function" || this.Type instanceof Function) this.set(name, new (this.Type.bind.apply(this.Type, args))());
                    if (this.get(name).__functions__) Object.defineProperty(this.get(name).__functions__, "kill", {value: this.kill.bind(this, name)});
                }
            },
            loadNameless: {
                value: function () {
                    var args = [null, this, this.nextIndex].concat(Array.prototype.slice.call(arguments));
                    this[this.nextIndex] = typeof this.Type === "function" || this.Type instanceof Function ? new (this.Type.bind.apply(this.Type, args))() : null;
                    if (this[this.nextIndex] && this[this.nextIndex].__functions__) Object.defineProperty(this[this.nextIndex].__functions__, "kill", {value: this.kill.bind(this, this.nextIndex)});
                    this.nextIndex++;
                }
            }
        });

        //  Game constructor:

        function Game(doc) {

            //  Setting up variables:

            var area = 0;
            var collection;
            var collection_2;
            var datadoc;
            var i;
            var j;
            var resized = 1;

            //  Handling arguments and making sure modules are loaded:

            if (!(doc instanceof Document) || doc.game || typeof Screen === "undefined" || !Screen || typeof Control === "undefined" || !Control || typeof PlacementImage === "undefined" || !PlacementImage || typeof Sheet === "undefined" || !Sheet || typeof Letters === "undefined" || !Letters || typeof Tileset === "undefined" || !Tileset || typeof Jelli === "undefined" || !Jelli) return;
            Object.defineProperty(doc, "game", {value: this});

            //  imported() and placed() functions:

            function imported(node) {return (node instanceof Node) ? doc.importNode(node, true) : doc.importNode(datadoc.getElementById(node), true);}
            function placed(node) {return (node instanceof Node) ? doc.body.appendChild(doc.importNode(node, true)) : doc.body.appendChild(doc.importNode(datadoc.getElementById(node), true));}

            //  Setting up the data document and clearing the body

            datadoc = doc.implementation.createHTMLDocument("Jelli Data Document");
            datadoc.body = datadoc.importNode(doc.body, true);
            doc.body = doc.createElement("body");
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
                click_functions: {value: {}},
                clicks: {value: {}},
                control: {value: new Control(true, doc)},
                datadoc: {value: datadoc},
                document: {value: doc},
                images: {value: {}},
                initScript: {value: doc.head.getElementsByClassName("init").item(0) ? doc.head.getElementsByClassName("init").item(0).text || doc.head.getElementsByClassName("init").item(0).textContent : ""},
                letters: {value: {}},
                resized: {
                    get: function () {return resized},
                    set: function (n) {resized = Number(!!n);}
                },
                screens: {value: {}},
                sheets: {value: {}},
                stepScript: {value: doc.head.getElementsByClassName("step").item(0) ? doc.head.getElementsByClassName("step").item(0).text || doc.head.getElementsByClassName("step").item(0).textContent : ""},
                texts: {value: new Collection(this, Text)},
                tilesets: {value: {}},
                touch_functions: {value: {}},
                touches: {value: {}},
                window: {value: doc.defaultView ? doc.defaultView : window}
            });

            //  Sets up the game as a Jelli:

            Jelli.call(this, {
                get: function () {return area},
                set: (function (n) {
                    if (n instanceof Area) area = n;
                    else this.loadArea(n);
                }).bind(this),
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
                resized: {
                    get: function () {return resized},
                    set: function (n) {resized = Number(!!n);}
                },
                texts: {value: this.texts},
                touch: {get: function () {return 0;}}  //  TK
            }, {
                clearScreen: {value: this.clearScreen},
                loadArea: {value: this.loadArea}
            });

            this.control.add("action").addKeys("action", 0x58, "U+0058", "KeyX", "X", "x");
            this.control.add("down").addKeys("down", 0x28, "ArrowDown", "Down");
            this.control.add("exit").addKeys("exit", 0x5A, "U+005A", "KeyZ", "Z", "z");
            this.control.add("left").addKeys("left", 0x25, "ArrowLeft", "Left");
            this.control.add("look").addKeys("look", 0x53, "U+0053", "KeyS", "S", "s");
            this.control.add("menu").addKeys("menu", 0x41, "U+0041", "KeyA", "A", "a");
            this.control.add("right").addKeys("right", 0x27, "ArrowRight", "Right");
            this.control.add("select").addKeys("select", 0x57, "U+0057", "KeyW", "W", "w");
            this.control.add("start").addKeys("start", 0x51, "U+0051", "KeyQ", "Q", "q");
            this.control.add("up").addKeys("up", 0x26, "ArrowUp", "Up");

            //  Loading click/touch functions:

            for (collection = doc.head.getElementsByClassName("click_function"), i = 0; i < collection.length; i++) {
                for (collection_2 = collection.item(i).dataset.clickNumber ? collection.item(i).dataset.clickNumber.split(/\s+/) : [], j = 0; j < collection_2.length; j++) {
                    Object.defineProperty(this.click_functions, collection_2[j], {value: collection.item(i).text || collection.item(i).textContent});
                }
            }
            for (collection = doc.head.getElementsByClassName("touch_function"), i = 0; i < collection.length; i++) {
                for (collection_2 = collection.item(i).dataset.touchNumber ? collection.item(i).dataset.touchNumber.split(/\s+/) : [], j = 0; j < collection_2.length; j++) {
                    Object.defineProperty(this.touch_functions, collection_2[j], {value: collection.item(i).text || collection.item(i).textContent});
                }
            }

            //  Loading screens:

            for (collection = datadoc.getElementsByTagName("canvas"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.screens, collection.item(i).id, {value: new Screen(placed(collection.item(i)), "2d"), enumerable: true});
                if (i === 0) Object.defineProperty(this, "placement_screen", {value: this.screens[collection.item(i).id]});
            }

            //  Loading images:

            for (collection = datadoc.getElementsByClassName("image"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.images, collection.item(i).id, {value: imported(collection.item(i))});
            }

            //  Sprite sheet setup:

            for (collection = datadoc.getElementsByClassName("letters"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.letters, collection.item(i).id, {value: new Letters(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight), doc)});
            }
            for (collection = datadoc.getElementsByClassName("sheet"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.sheets, collection.item(i).id, {value: new Sheet(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight))});
            }
            for (collection = datadoc.getElementsByClassName("tileset"), i = 0; i < collection.length; i++) {
                Object.defineProperty(this.tilesets, collection.item(i).id, {value: new Tileset(new Sheet(imported(collection.item(i)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight)), Number(collection.item(i).dataset.spriteWidth), Number(collection.item(i).dataset.spriteHeight), collection.item(i).dataset.collisions.trim(), Sheet.drawSheetAtIndex)});
            }

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

        Game.prototype = Object.create(Jelli.prototype, {
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
                    for (i in this.texts.__properties__) {
                        this.texts.__properties__[i].draw()
                    }
                    this.resized = 0;
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
                        case "mousedown":
                            e.preventDefault();
                            this.clicks[[1, 3, 2, 4, 5][e.button]] = new Poke(this, e, i);
                            break;
                        case "mousemove":
                            e.preventDefault();
                            for (i in this.clicks) {
                                this.clicks[i].updateWith(e);
                            }
                            break;
                        case "mouseup":
                            e.preventDefault();
                            delete this.clicks[[1, 3, 2, 4, 5][e.button]];
                            break;
                        case "resize":
                            this.set("resized", 1);
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
                                this.set("resized", 1);
                            }
                            j = 1;
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
            init: {value: function () {return Jelli.parseScript(this.initScript, this);}},
            layout: {
                value: function () {
                    var body_height;
                    var body_width;
                    var border_img = this.datadoc.querySelector("img.gui-border");
                    var border_height =  Number(border_img.dataset.spriteHeight);
                    var border_width =  Number(border_img.dataset.spriteWidth);
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
                    this.document.body.style.background = border_img.dataset.systemBackground;
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
                        canvas.style.borderStyle = "solid";
                        canvas.style.borderTopWidth = canvas.style.borderBottomWidth = border_height + "px";
                        canvas.style.borderLeftWidth = canvas.style.borderRightWidth = border_width + "px";
                        canvas.style.borderColor = "transparent";
                        canvas.style.borderRadius = border_width + "px " + border_height + "px";
                        canvas.style.borderImage = "url(" + border_img.src + ") " + border_width + " " + border_height + " repeat";
                        if (!i) canvas.style.background = border_img.dataset.screenBackground;
                        canvas.style.top = "calc(50% - " + (scaled_height / 2 + border_height) + "px)";
                        canvas.style.left = "calc(50% - " + (scaled_width / 2 + border_width) + "px)";
                        canvas.style.width = scaled_width + "px";
                        canvas.style.height = scaled_height + "px";
                    }
                    this.document.body.style.visibility = "";
                }
            },
            loadArea: {value: function (index) {this.area = new Area(this, index);}},
            step: {
                value: function () {

                    //  Variable setup:

                    var i;

                    //  Click/touch stepping:

                    for (i in this.clicks) {
                        if (this.click_functions[i]) Jelli.parseScript(this.click_functions[i], this.clicks[i]);
                    }
                    for (i in this.touches) {
                        if (this.touch_functions[this.touches[i].number]) Jelli.parseScript(this.touch_functions[this.touches[i].number], this.touches[i]);
                    }

                    //  Game stepping:

                    Jelli.parseScript(this.stepScript, this);

                    //  Area stepping:

                    if (this.area instanceof Area) this.area.step();

                    //  setTimeout for that logic:

                    this.window.setTimeout(this.step.bind(this), 1000/60);

                }
            }
        });

        //  Image constructor:

        function JelliImage(collection, name /*  Optional x, y, placed OR id, x, y, placed  */) {

            //  Setting up variables:

            var elt;
            var id;
            var placed;
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
            if (!(collection instanceof Collection) || !collection.area || !collection.game) return;
            elt = collection.game.images[id];
            if (!(elt instanceof Element)) return;

            //  Defining image as placement image:

            PlacementImage.call(this, elt, collection.game.screens[elt.dataset.screen].context, x, y, collection.area.x, collection.area.y, placed);

            //  But it's actually a Jelli!

            Jelli.call(this, {
                area: {value: collection.area},
                collection: {value: collection},
                game: {value: collection.game},
                placed: {
                    get: (function () {return this.placed ? 1 : 0;}).bind(this),
                    set: (function (n) {this.placed = n;}).bind(this)
                },
                screen_x: {get: (function () {return this.x - this.area.x}).bind(this)},
                screen_y: {get: (function () {return this.y - this.area.y}).bind(this)},
                x: {
                    get: (function () {return this.x;}).bind(this),
                    set: (function (n) {this.x = n;}).bind(this)
                },
                y: {
                    get: (function () {return this.y;}).bind(this),
                    set: (function (n) {this.y = n;}).bind(this)
                },
            }, {
                setPlacement: {value: this.setPlacement},
                setPosition: {value: this.setPosition},
                togglePlacement: {value: this.togglePlacement}
            });

            Object.defineProperties(this, {
                area: {value: collection.area},
                collection: {value: collection},
                game: {value: collection.game},
                screen_x: {get: function () {return this.x - this.area.x}},
                screen_y: {get: function () {return this.y - this.area.y}}
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

        //  Poke constructor:

        function Poke(game, e, n) {

            //  Setting up variables:

            var elt = game.placement_screen.canvas;
            var rect = elt.getBoundingClientRect();

            //  Handling arguments:

            if (!(game instanceof Game) || typeof e !== "object") return;

            //  Property definitions:

            Object.defineProperties(this, {
                game: {value: game},
                number: {value: n},
                start_x: {value: (e.pageX - rect.left + elt.clientLeft) * elt.width / elt.clientWidth,},
                start_y: {value: (e.pageY - rect.top + elt.clientTop) * elt.width / elt.clientWidth,},
                target: {value: game.placement_screen.canvas,},
                x: {
                    value: (e.pageX - rect.left + elt.clientLeft) * elt.width / elt.clientWidth,
                    writable: true
                },
                y: {
                    value: (e.pageY - rect.top + elt.clientTop) * elt.width / elt.clientWidth,
                    writable: true
                }
            });

            //  Setting up poke as a Jelli:

            Jelli.call(this, {
                game: {value: game},
                number: {value: n},
                start_x: {value: this.start_x},
                start_y: {value: this.start_y},
                x: {get: (function () {return this.x;}).bind(this)},
                y: {get: (function () {return this.y;}).bind(this)},
            });

        }

        //  Poke prototyping:

        Poke.prototype = Object.create(Jelli.prototype, {
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

            //  Handling arguments:

            if (!(collection instanceof Collection) || !collection.game) return;
            context = collection.game.screens[screen].context;
            letters = collection.game.letters[letters_name];
            if (isBase64) text = collection.game.window.atob(text);

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
