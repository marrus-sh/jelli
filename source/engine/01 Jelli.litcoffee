#  01. JELLI  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    JELLI
    The Jelli Game Engine
    ---------------------
    ###

###  The constructor:  ###

At face value, `Jelli` no different than `Object`, so its constructor does very little.
It only initializes the `functions` object, using `Object.defineProperty` to prevent it from being enumerated or deleted.

    Jelli = ->
        Object.defineProperty this, "functions", {
            value: null,
            writable: yes
        }

Many `Jelli` objects redefine the `functions` object as non-writable after setting its value.

###  The prototype:  ###

The `Jelli` prototype provides useful extensions for game objects.

    Jelli.prototype = Object.create(Object.prototype, {

`run()` calls a function assigned to the `functions` object with `this` assigned to the object.

        run: (name) ->
            @functions[name].call(this) if @functions? and (typeof @functions[name] is "function" or @functions[name] instanceof Function)

That's all we have in the prototype for now.

    })
    
    Object.freeze Jelli.prototype

###  Final touches:  ###

Most other engine modules need access to `Jelli`, so let's freeze it and attach it to the window:

    @Jelli = Object.freeze(Jelli)
