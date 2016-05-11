/* jslint asi:true, browser:true */

/*

#  control.js: Control Engine  #

*/

//  All inside an anonymous function for strictness and proper closure

var Control = (function () {

    "use strict";

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

})()
