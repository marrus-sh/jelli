#  CONTROL  #
Keyboard input tracking; mouse and touch support

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    CONTROL
    Keyboard input tracking; mouse and touch support
    ---------------------
    ###

###  Poke:  ###

`Poke` tracks clicks and touches.

####  The constructor  ####

The `Poke` constructor takes seven arguments: `elt`, which specifies the area relative to which `Poke` coordinates should be defined; `e`, which should be either a `MouseEvent` or a `Touch`; `n`, which should be a number (this is not inforced, though); and `x`, `y`, `width`, and `height`, which define the coordinate system from which to calculate `Poke` coordinates.

    Poke = (elt, e, n, x, y, width, height) ->

We should start with a few quick lines of argument checking to make sure everything is in order:

        elt = null unless elt instanceof Element
        e = null unless typeof e is "object"
        rect = elt?.getBoundingClientRect()
        x = 0 if isNaN(x = Number(x))
        y = 0 if isNaN(y = Number(y))
        width = (if elt.width? then elt.width else elt.clientWidth) if isNaN(width = Number(width))
        height = (if elt.height? then elt.height else elt.clientHeight) if isNaN(height = Number(height))

Now we can define the properties of the `Poke`:

        Object.defineProperties this, {
            origin_height: {value: height}
            number: {value: n}
            target: {value: elt}
            origin_width: {value: width}
            origin_x: {value: x}
            origin_y: {value: y}
        }

`start_x` and `start_y` give the initial coordinates of the `Poke`, relative to `elt`.
These coordinates are scaled to match the internal coordinate scheme given by `x`, `y`, `width`, and `height`.

        Object.defineProperties this, {
            start_x: {value: (e?.pageX - rect.left - @origin_x) * @origin_width / elt.clientWidth}
            start_y: {value: (e?.pageY - rect.top - @origin_y) * @origin_height / elt.clientHeight}
        }

`x` and `y` give the current coordinates of the `Poke`, relative to `elt`.
They start out as equal to `start_x` and `start_y`, but can be overwritten.

        Object.defineProperties this, {
            x:
                value: @start_x
                writable: yes
            y:
                value: @start_y
                writable: yes
        }

We can now seal (but not freeze) the `Poke`:

        Object.seal this

####  The prototype  ####

The `Poke` prototype contains only one function: `updateWith()`, which updates a `Poke` based on a `MouseEvent` or `Touch`.

    Poke.prototype = Object.create(Object.prototype, {
        updateWith:
            value: (e) ->
                return unless @target instanceof Element and typeof e is "object"
                rect = @target.getBoundingClientRect()
                @x = (e?.pageX - rect.left - @origin_x) * @origin_width / @target.clientWidth
                @y = (e?.pageY - rect.top - @origin_y) * @origin_height / @target.clientHeight
    })

    Object.freeze Poke.prototype

###  PokeList:  ###

`PokeList` is a more convenient `Object` for storing `Poke`s.

####  The constructor  ####

The `PokeList` constructor takes in the same arguments as `Control` (see below), with the same meanings.
The constructor stores these values for later, then exits.

    PokeList = (elt, x, y, width, height) ->
        elt = document.body unless elt instanceof Element
        x = 0 if isNaN(x = Number(x))
        y = 0 if isNaN(y = Number(y))
        width = (if elt.width? then elt.width else elt.clientWidth) if isNaN(width = Number(width))
        height = (if elt.height? then elt.height else elt.clientHeight) if isNaN(height = Number(height))
        Object.defineProperties this, {
            height: {value: height}
            target: {value: elt}
            width: {value: width}
            x: {value: x}
            y: {value: y}
        }

####  The prototype  ####

The `PokeList` prototype allows users to create new `Pokes` and access `Poke`s by number instead of `id`.

    PokeList.prototype = Object.create(Object.prototype, {

`deleteItem()` deletes the first `Poke` with the specified number, `n`

        deleteItem: {value: (n) -> delete this[id] for id, poke of this when poke.number is n}

`item()` returns the first `Poke` with the specified number, `n`.

        item:
            value: (n) ->
                (return poke) for id, poke of this when poke.number is n
                return null

`newPoke()` creates a new `Poke` from the specified `MouseEvent` or `Touch` at number `n`:

        new: {value: (id, e, n) -> this[id] = new Poke(@target, e, n, @x, @y, @width, @height)}

We can now freeze the prototype:

    })

    Object.freeze PokeList.prototype

###  Control:  ###

`Control` provides mechanisms for tracking keyboard input, mouse clicks, and touch points.

####  The constructor  ####

The `Control` constructor takes five arguments: `elt`, which gives the element used for determining `Poke` coordinates, and `x`, `y`, `width`, and `height`, which determines the coordinate system.
`elt` defaults to `document.body`.

    Control = (elt = document.body, x, y, width, height) ->

We start by setting defaults for any unset attributes:

        elt = document.body unless elt instanceof Element
        x = 0 if isNaN(x = Number(x))
        y = 0 if isNaN(y = Number(y))
        width = (if elt.width? then elt.width else elt.clientWidth) if isNaN(width = Number(width))
        height = (if elt.height? then elt.height else elt.clientHeight) if isNaN(height = Number(height))

Not much work happens in the `Control` constructor itself; most of the heavy-lifting takes place in the prototype. But, here are our property definitions:

        @target = elt
        @clicks = new PokeList(elt, x, y, width, height)
        @codes = {}
        @height = height
        @keys = {}
        @ownerDocument = @target?.ownerDocument || document
        @touches = new PokeList(elt, x, y, width, height)
        @width = width
        @x = x
        @y = y

We then a number of event listeners to track what's going on:

        if @ownerDocument?
            @ownerDocument.defaultView.addEventListener "keydown", this, false
            @ownerDocument.defaultView.addEventListener "keyup", this, false
            @ownerDocument.defaultView.addEventListener("contextmenu", this, false)
            @ownerDocument.defaultView.addEventListener("touchstart", this, false)
            @ownerDocument.defaultView.addEventListener("touchend", this, false)
            @ownerDocument.defaultView.addEventListener("touchmove", this, false)
            @ownerDocument.defaultView.addEventListener("touchcancel", this, false)
            @ownerDocument.defaultView.addEventListener("mousedown", this, false)
            @ownerDocument.defaultView.addEventListener("mouseup", this, false)
            @ownerDocument.defaultView.addEventListener("mousemove", this, false)

And we freeze `Control` to make it formally immutable:

        Object.freeze this

####  The prorotype  ####

The `Control` prototype is where the magic happens.

    Control.prototype = Object.create(Object.prototype, {

Our first function lets us add a new key to the `Control`.
It only takes one argument, `name`, which should be a string.
If `name` is not provided, the function does nothing.

        add:
            value: (name) ->
                @keys[name] = off if name?
                return this

You will note that the above function returned `this` – that is, the current `Control` object.
This allows for the stringing together of `Control` commands.

Our next function is `addCodes()`, which adds codes to the key with the provided `name`.
Codes should be a valid `KeyboardEvent.code`, `KeyboardEvent.key`, `KeyboardEvent.keyIdentifier`, or `KeyboardEvent.keyCode`.
The `name` of the key is the first argument, and the codes come next.
If no key with `name` has already been defined, this does nothing.

        addCodes:
            value: (name, codes...) ->
                @codes[code] = name for code in codes if name? and @keys[name]?
                return this

Here we have defined the value of `code` in `@codes` to give us the `name` of the key, for each code specified.
Again, we returned `this`.

If given a code, it would be nice to be able to find the name of the key that it is associated with.
`getName()` does this, taking the code as its argument.

        getName:
            value: (code) -> return @codes[code] if code? and @codes[code]?

`handleEvent()` handles the events that we added listeners for in the constructor.
It uses a `switch` statement to process them all, taking in the event itself as its argument.

        handleEvent:
            value: (e) ->
                return unless e instanceof Event
                switch e.type

For `"contextmenu"`, we just want to prevent the default.

                    when "contextmenu" then e.preventDefault()

When a key is down, we want to toggle it to `on`…

                    when "keydown"
                        for code in [e.code, e.key, e.keyIdentifier, e.keyCode]
                            @toggleCode(code, on) if @isCodeDefined(code)

…and when a key is up, we want to toggle it to `false`.

                    when "keyup"
                        for code in [e.code, e.key, e.keyIdentifier, e.keyCode]
                            @toggleCode(code, off) if @isCodeDefined(code)

On `"mousedown"`, we generate a new `Poke` if the event was within our `target`'s bounds.
The index of the `Poke` corresponds to the mouse button that was pressed.

                    when "mousedown"
                        e.preventDefault()
                        rect = @target?.getBoundingClientRect()
                        @clicks.new(e.button, e, e.button) if rect and rect.left < e.pageX < rect.right and rect.top < e.pageY < rect.bottom

On `"mousemove"`, we update the corresponding `Poke` with the mouse's new position.

                    when "mousemove"
                        e.preventDefault()
                        click.updateWith(e) for i, click of @clicks

On `"mouseup"`, we delete the `Poke` associated with the corresponding mouse button.

                    when "mouseup"
                        e.preventDefault()
                        delete @clicks[e.button]

On `"touchcancel"` or `"touchend"`, we want to delete the corresponding `Poke`s.

                    when "touchcancel", "touchend"
                        e.preventDefault()
                        delete @touches[touch.identifier] for touch in e.changedTouches

On `"touchmove"`, we want to update the corresponding `Poke`s with their new positions.

                    when "touchmove"
                        e.preventDefault()
                        @touches[touch.identifier].updateWith(touch) for touch in e.changedTouches

On `"touchstart"`, we want to create a new `Poke` for the touch if the event was within our `target`'s bounds.
This is a slightly more complicated process.

                    when "touchstart"

We iterate over each touch:

                        for new_touch in e.changedTouches

First, we need to get the number of the touch, by iterating through existing touches until we find a number that is unused:

                            n = null
                            j = 0
                            while n isnt j
                                n = j
                                for i, touch of @touches
                                    j++ if j is touch.number

Now we can add a `Poke` with the appropriate number if the `touch` was inside our `VIEW`.

                            rect = @target?.getBoundingClientRect()
                            @touches.new(new_touch.identifier, touch, n) if rect and rect.left < touch.pageX < rect.right and rect.top < touch.pageY < rect.bottom

This function shouldn't return anything, because it's just an event handler.

                return

The next two functions are pretty simple: `isActive()`, which tells us if a key is active, and `isDefined()`, which tells us if a key has been defined.
Both take a single argument, the `name` of the key.

        isActive: {value: (name) -> !!@keys[name] if name? and @keys[name]?}

        isDefined: {value: (name) -> @keys[name]? if name?}

It's equally possible, though, that you don't have the `name` of the key but rather only that of an associated code.
`isCodeActive()` and `isCodeDefined()` do the same as the above, only with an argument of a `code`.

        isCodeActive: {value: (code) -> !!@keys[name] if code? and (name = @codes[code])? and @keys[name]?}

        isCodeDefined: {value: (code) -> @keys[name]? if code? and (name = @codes[code])?}

If we can add keys, we should be able to remove them!

        remove:
            value: (name) ->
                delete @keys[name] if name?
                return this

And likewise with codes:

        removeCodes:
            value: (codes...) ->
                delete @codes[code] for code in codes
                return this

We can set whether or not a control/key is activated using `toggle()` and `toggleCode()`.
The first argument is the `name` or `code`; the second is what to set it to.
If not set, the second argument will just toggle the key to the opposite value.

        toggle: {value: (name, to) -> @keys[name] = to? and to or not to? and !@keys[name] if name? and @keys[name]?}

        toggleCode: {value: (code, to) -> @keys[name] = to? and to or not to? and !@keys[name] if code? and (name = @codes[code]) and @keys[name]?}

You will notice that the above functions do *not* return `this`!
Rather, they return whatever value the key was toggled to, or `undefined` if the toggle failed.

That's all the functions we have, so let's freeze that prototype:

    })

    Object.freeze Control.prototype

####  Final touches  ####

Finally, we need to make our constructors transparent to the window, and freeze them against meddling interlopers:

    Control.Poke = Object.freeze(Poke)
    Control.PokeList = Object.freeze(PokeList)
    @Control = Object.freeze(Control)

We have assumed control!
