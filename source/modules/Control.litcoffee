#  CONTROL  #
Keyboard input tracking; mouse and touch support

- - -

##  Description  ##

`Control` objects provide a means of detecting keyboard, mouse, and touch input on `window`.
Mouse and touch inputs are provided using `Poke` objects, whose coordinates are given relative to a specified element.

###  Keyboard input:  ###

Keyboard input detection does *not* occur automatically; rather, keys must be manually added.
You can create a new key using `ctrl.add(name)` and add codes to it using `ctrl.addCodes(name[, …])`.
These can be strung together; for example, `ctrl.add("up").addCodes("up", 0x26, "ArrowUp", "Up")` associates the codes `0x26`, `"ArrowUp"`, and `"Up"` with the key `"up"`.
Codes may be in the format of any one of `KeyboardEvent.code`, `KeyboardEvent.key`, `KeyboardEvent.keyIdentifier`, or `KeyboardEvent.keyCode`, and all of these are checked where supported.

There is no limit to the number of codes which may be added for a given key; consequently, it might be beneficial to set up keys which map to more than one physical key on the keyboard (for example, allowing users to press either `W` or `Up`).
You can use `ctrl.isActive(name)` to determine whether a key is currently being pressed.

###  `Poke`s and `PokeList`s:  ###

Mouse clicks and screen touches are stored in `PokeList`s, available through the `ctrl.clicks` and `ctrl.touches` properties, respectively.
`PokeList` items may be accessed by number using `poke_list.item(n)` or by id using `poke_list[id]`.
For clicks, number and id are identical and correspond to the value of `MouseEvent.button` for the corresponding mouse event.
For touches, the number provides the ordinal number of the touch (first, second, third, etc.), while the id provides a unique reference.
After a `Poke` is created, its number will not change, so this is generally the most convenient means of `Poke` access.

The starting location of a `Poke` is provided by `poke.start_x` and `poke.start_y`, while its current location is provided by `poke.x` and `poke.y`.
For example, `ctrl.clicks.item(0).x` gives the current x-coordinate of the mouse if a left-click has occurred.
If a left click has not occurred, `ctrl.clicks.item(0)` will return `null`, and the above example will throw a `TypeError`.

It is not currently possible to detect the location of the mouse through the `Control` interface when no button has been pressed.

###  The `Control` object:  ###

The `Control` object is the main point of interface for the `Control` module.
If you have multiple screens, you may want to assign a separate `Control` to each.

####  The constructor  ####

#####  SYNTAX  #####

>   ```javascript
>       new Control(elt);
>       new Control(elt, x, y);
>       new Control(elt, x, y, width, height);
>   ```

-   **`elt`**—
    The target element to use as a basis for the control.
    Clicks and touches are only detected if they occur within the bounding rectangle of this element.
    The coordinate system for this detection can be further refined using the remaining arguments.
    The default value of `elt` is `document.body`.

-   **`x`, `y`**—
    The distance from the left and top edges of `elt`, respectively, for the coordinate system's origin.
    The unit of these distances is determined by `width` and `height`.
    Both of these values default to `0`.

-   **`width`, `height`**—
    The number of units wide and tall, respectively, `elt` is.
    For example, if `elt` is 200 pixels wide but a value of `100` is passed for `width`, then each control unit will be two pixels.
    (This facilitates consistent relative coordinates for dynamically sized content.)
    These values default to `elt.width` and `elt.height` if these are defined, or `elt.clientWidth` and `elt.clientHeight` if not.

#####  PROPERTIES  #####

-   **`Control.prototype`**—
    The `Control` prototype object.

#####  METHODS  #####

-   **`Control.Poke(elt, e, n, x, y, width, height)`**—
    The `Poke` constructor.

-   **`Control.PokeList(elt, x, y, width, height)`**—
    The `PokeList` constructor.

####  `Control` instances  ####

#####  PROPERTIES  #####

>   **Note :**
    Because `Poke` coordinates are given using control-units, attemting to change the coordinate system after object creation is not feasible.
    Consequently, coordinate-system–related attributes are read-only.

-   **`ctrl.clicks`**—
    A `PokeList` containing all detected clicks on `ctrl.target`.

-   **`ctrl.codes`**—
    An object whose own properties give the codes and their associated key names defined on the `Control` instance.
    This object may be modified directly to add new codes, but it is **highly recommended** that the `Control` instance methods be used instead.
    >   [Issue #67](https://github.com/marrus-sh/jelli/issues/67) :
    Right now the prototype chain is also checked for `ctrl.codes`, but support for this is anticipated to be removed in the future

-   **`ctrl.height`**—
    The height of `ctrl.target`, in control-units.
    This is set on object creation and **read-only**.

-   **`ctrl.keys`**—
    An object whose own properties give the keys defined on the `Control` instance, and their current state.
    This object may be modified directly to add new keys, but it is **highly recommended** that the `Control` instance methods be used instead.
    >   [Issue #67](https://github.com/marrus-sh/jelli/issues/67) :
    Right now the prototype chain is also checked for `ctrl.keys`, but support for this is anticipated to be removed in the future.

-   **`ctrl.ownerDocument`**—
    The `document` whose `defaultView` is used for event detection.
    This defaults to `ctrl.target.ownerDocument`, and uses `document` as a fallback in case the former is not defined.

-   **`ctrl.target`**—
    The target element.
    Only clicks and touches which occur within the bounds of this element are considered.
    This value is **read-only**.

-   **`ctrl.touches`**—
    A `PokeList` containing all detected touches on `ctrl.target`.

-   **`ctrl.width`**—
    The width of `ctrl.target`, in control-units.
    This is set on object creation and **read-only**.

-   **`ctrl.x`, `ctrl.y`**—
    The coordinates of the origin of the control coordinate system, in control-units.
    These are set on object creation and **read-only**.

#####  METHODS  #####

Unless otherwise specified, `Control` instance methods return the given instance to allow the chaining of commands.

-   **`Control.prototype.add(name)`**—
    Adds a new key to the control with name `name`.

-   **`Control.prototype.addCodes(name[, …])`**—
    Adds any number of codes to the key with name `name`.
    These should match the form of `KeyboardEvent.code`, `KeyboardEvent.key`, `KeyboardEvent.keyIdentifier`, or `KeyboardEvent.keyCode`.
    If `name` has not been added to the control instance as a key, this method does nothing.
    Note that each code may only be associated with one key at a time.

-   **`Control.prototype.getName(code)`**—
    Given a code `code`, returns the associated key name.
    If no key has been specified for the given code, returns `undefined`.

-   **`Control.prototype.handleEvent(event)`**—
    Used to handle mouse, touch, and keyboard events.
    The listeners for event handling are created automatically upon `Control` creation, so this method should not ever be called directly.
    Returns `undefined`.

-   **`Control.prototype.isActive(name)`**—
    Checks to see whether the key with name `name` is currently active.
    This is a safer alternative to calling `!!ctrl.keys[name]`.

-   **`Control.prototype.isCodeActive(code)`**—
    Checks to see whether the key associated with `code` is currently active.
    Note that this does not necessarily mean that `code` itself is currently in use.

-   **`Control.prototype.isCodeDefined(code)`**—
    Checks to see whether the code given by `code` is currently defined and associated with a valid key.

-   **`Control.prototype.isDefined(name)`**—
    Checks to see whether the key with name `name` has been defined.
    This is a safer alternative to calling `ctrl.keys.hasOwnProperty(name)`.
    >   [Issue #67](https://github.com/marrus-sh/jelli/issues/67) :
    Right now the prototype chain is also checked for `Control.prototype.isDefined`, but support for this is anticipated to be removed in the future

-   **`Control.prototype.remove(name)`**—
    Removes the key with name `name` and all associated codes.

-   **`Control.prototype.removeCodes([…])`**—
    Removes the given codes.

-   **`Control.prototype.toggle(name[, value])`**—
    Toggles the key with name `name`.
    If `value` is provided, the key with name `name` is instead set to `!!value`.
    This can be used to emulate keyboard keys (for example, on touch devices), or to toggle "hidden" keys (keys with no codes attached).
    This method returns the value which the key was set to if successful, or `undefined` if not.

-   **`Control.prototype.toggleCode(code[, value])`**—
    Toggles the key associated with code `code`.
    If `value` is provided, the key associated with code `code` is instead set to `!!value`.
    This method returns the value which the key was set to if successful, or `undefined` if not.

###  The `Poke` object:  ###

The `Poke` object is used to store information about clicks and touches.
You shouldn't ever have to create these yourself.

####  The constructor  ####

#####  SYNTAX  #####

>   ```javascript
>       new Control.Poke(elt, e, n);
>       new Control.Poke(elt, e, n, x, y);
>       new Control.Poke(elt, e, n, x, y, width, height);
>   ```

-   **`elt`**—
    The target element to use as a basis for the `Poke` instance.

-   **`e`**—
    The `MouseEvent` or `Touch` to use when creating the `Poke`.
    `Poke()` uses `e.pageX` and `e.pageY` to determine the location of the `Poke` instance.
    >   [Issue #58](https://github.com/marrus-sh/jelli/issues/58) :
        `Poke()` may use different attributes for determining `Poke` location in the future.

-   **`n`**—
    The "number" of the `Poke`.
    This *should* be a JavaScript number, but this is not enforced.

-   **`x`, `y`**—
    The distance from the left and top edges of `elt`, respectively, for the coordinate system's origin.
    The unit of these distances is determined by `width` and `height`.
    Both of these values default to `0`.

-   **`width`, `height`**—
    The number of units wide and tall, respectively, `elt` is.
    For example, if `elt` is 200 pixels wide but a value of `100` is passed for `width`, then each control unit will be two pixels.
    (This facilitates consistent relative coordinates for dynamically sized content.)
    These values default to `elt.width` and `elt.height` if these are defined, or `elt.clientWidth` and `elt.clientHeight` if not.

#####  PROPERTIES  #####

-   **`Poke.prototype`**—
    The `Poke` prototype object.

#####  METHODS  #####

The `Poke()` constructor does not have any methods.

####  `Poke` instances  ####

#####  PROPERTIES  #####

All `Poke` properties are **read-only**, with the exception of `x` and `y`.

-   **`poke.number`**—
    The number of the `Poke` instance.

-   **`poke.origin_height`, `poke.origin_width`, `poke.origin_x`, `poke.origin_y`**—
    These define the coordinate system used to place the `Poke` instance within `poke.target`.

-   **`poke.start_x`, `poke.start_y`**—
    The starting position of the `Poke` instance.

-   **`poke.target`**—
    The target of the `Poke`.

-   **`poke.x`, `poke.y`**—
    The current position of the `Poke` instance.

#####  METHODS  #####

-   **`Poke.prototype.updateWith(e)`**—
    Updates the `Poke` using the given `MouseEvent` or `Touch`.
    `Poke.prototype.updateWith()` uses `e.pageX` and `e.pageY` to determine the location of the `Poke` instance.
    >   [Issue #58](https://github.com/marrus-sh/jelli/issues/58) :
        `Poke.prototype.updateWith()` may use different attributes for determining `Poke` location in the future.

###  The `PokeList` object:  ###

The `PokeList` object is used to collect `Poke`s in an ordered manner.
You shouldn't ever have to create these yourself.

####  The constructor  ####

#####  SYNTAX  #####

>   ```javascript
>   new Control.PokeList(elt);
>   new Control.PokeList(elt, x, y);
>   new Control.PokeList(elt, x, y, width, height);
>   ```

`PokeList()` takes the same arguments as `Control`, with the same meanings.

#####  PROPERTIES  #####

-   **`PokeList.prototype`**—
    The `PokeList` prototype object.

#####  METHODS  #####

The `PokeList()` constructor does not have any methods.

####  `PokeList` instances  ####

#####  PROPERTIES  #####

-   **`poke_list.height`, `poke_list.width`, `poke_list.x`, `poke_list.y`**—
    These define the coordinate system used to place the `PokeList` instance within `poke_list.target`.

-   **`poke_list.target`**—
    The target of the `PokeList`.

-   **`poke_list[id]`**—
    Accesses the `Poke` with id `id`.

#####  METHODS  #####

-   **`PokeList.prototype.deleteItem(n)`**—
    Deletes the `Poke` with number `n` from the `PokeList` instance.

-   **`PokeList.prototype.item(n)`**—
    Accesses the `Poke` with number `n` from the `PokeList` instance.

-   **`PokeList.prototype.add(id, e, n)`**—
    Creates a new `Poke` with id `id` and number `n` from the `MouseEvent` or `Touch` `e` and adds it to the `PokeList` instance.

###  Examples:  ###

####  Creating a control and tracking the arrow keys  ####

>   ```javascript
>   var ctrl = new Control();
>   ctrl.add("down").addCodes("down", 0x28, "ArrowDown", "Down");
>   ctrl.add("left").addCodes("left", 0x25, "ArrowLeft", "Left");
>   ctrl.add("right").addCodes("right", 0x27, "ArrowRight", "Right");
>   ctrl.add("up").addCodes("up", 0x26, "ArrowUp", "Up");
>   ```

####  Using percentages as control-units  ####

>   ```javascript
>   var ctrl = new Control(document.body, 0, 0, 100, 100);
>   ```

####  Simulating keyboard input  ####

>   ```html
>   <!DOCTYPE html>
>   <div id="faux_spacebar"></div>
>   <script type="text/javascript">
>       var ctrl = new Control();
>       ctrl.add("space").addCodes("space", 0x31, "Space");
>       document.getElementById("faux_spacebar").addEventListener("mousedown", ctrl.toggle.bind(null, "space", true), false);
>       document.getElementById("faux_spacebar").addEventListener("mouseup", ctrl.toggle.bind(null, "space", false), false);
>   </script>
>   ```

####  Using the mouse to simulate touches  ####

>   ```javascript
>   ctrl = new Control();
>   touch_or_mouse = ctrl.touches.item(0) || ctrl.clicks.item(0);
>   ```

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
            number: {value: n}
            origin_height: {value: height}
            origin_width: {value: width}
            origin_x: {value: x}
            origin_y: {value: y}
            target: {value: elt}
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

`Control` instances depend strongly on their prototypes.
Consequently, we should only proceed if `this` is, in fact, a `Control` instance proper.

        return unless this instanceof Control

We can then start by setting defaults for any unset attributes:

        elt = document.body unless elt instanceof Element
        x = 0 if isNaN(x = Number(x))
        y = 0 if isNaN(y = Number(y))
        width = (if elt.width? then elt.width else elt.clientWidth) if isNaN(width = Number(width))
        height = (if elt.height? then elt.height else elt.clientHeight) if isNaN(height = Number(height))

Not much work happens in the `Control` constructor itself; most of the heavy-lifting takes place in the prototype.
But, here are our property definitions:

        Object.defineProperties this, {
            "target": {value: elt}
            "clicks":
                value: new PokeList(elt, x, y, width, height),
                enumerable: true
            "codes": {value: {}}
            "height": {value: height}
            "keys": {value: {}}
            "ownerDocument": {value: @target?.ownerDocument || document}
            "touches":
                value: new PokeList(elt, x, y, width, height),
                enumerable: true
            "width": {value: width}
            "x": {value: x}
            "y": {value: y}
        }

We use `Object.defineProperties` because all of these properties are read-only.

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

…And we are done!

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
                        @toggleCode(code, on) for code in [e.code, e.key, e.keyIdentifier, e.keyCode] when @isCodeDefined(code)

…and when a key is up, we want to toggle it to `false`.

                    when "keyup"
                        @toggleCode(code, off) for code in [e.code, e.key, e.keyIdentifier, e.keyCode] when @isCodeDefined(code)

On `"mousedown"`, we generate a new `Poke` if the event was within our `target`'s bounds.
The index of the `Poke` corresponds to the mouse button that was pressed.

                    when "mousedown"
                        rect = @target?.getBoundingClientRect()
                        if rect and rect.left < e.pageX < rect.right and rect.top < e.pageY < rect.bottom
                            e.preventDefault()
                            @clicks.new(e.button, e, e.button)

On `"mousemove"`, we update the corresponding `Poke` with the mouse's new position.

                    when "mousemove"
                        click.updateWith(e) for i, click of @clicks

On `"mouseup"`, we delete the `Poke` associated with the corresponding mouse button.

                    when "mouseup"
                        delete @clicks[e.button]

On `"touchcancel"` or `"touchend"`, we want to delete the corresponding `Poke`s.

                    when "touchcancel", "touchend"
                        delete @touches[touch.identifier] for touch in e.changedTouches

On `"touchmove"`, we want to update the corresponding `Poke`s with their new positions.

                    when "touchmove"
                        @touches[touch.identifier].updateWith(touch) for touch in e.changedTouches

On `"touchstart"`, we want to create a new `Poke` for the touch if the event was within our `target`'s bounds.
This is a slightly more complicated process.

                    when "touchstart"
                        rect = @target?.getBoundingClientRect()
                        touch_inside = false

We iterate over each touch:

                        for new_touch in e.changedTouches

If the rect is out of bounds, we skip over this touch:

                            continue unless rect and rect.left < touch.pageX < rect.right and rect.top < touch.pageY < rect.bottom
                            touch_inside = yes

First, we need to get the number of the touch, by iterating through existing touches until we find a number that is unused:

                            n = null
                            j = 0
                            while n isnt j
                                n = j
                                for i, touch of @touches
                                    j++ if j is touch.number

Now we can add a `Poke` with the appropriate number if the `touch` was inside our `VIEW`.

                            @touches.new(new_touch.identifier, touch, n)

If we successfully added a touch, then we should `preventDefault()`:

                        if touch_inside then e.preventDefault()

This function shouldn't return anything, because it's just an event handler.

                return

The next two functions are pretty simple: `isActive()`, which tells us if a key is active, and `isDefined()`, which tells us if a key has been defined.
Both take a single argument, the `name` of the key.

        isActive: {value: (name) -> !!@keys[name] if name? and @keys[name]?}

        isDefined: {value: (name) -> @keys[name]? if name?}

>   [Issue #67](https://github.com/marrus-sh/jelli/issues/67) :
    `isDefined` should use `Object.prototype.hasOwnProperty()`.

It's equally possible, though, that you don't have the `name` of the key but rather only that of an associated code.
`isCodeActive()` and `isCodeDefined()` do the same as the above, only with an argument of a `code`.

        isCodeActive: {value: (code) -> !!@keys[name] if code? and (name = @codes[code])? and @keys[name]?}

        isCodeDefined: {value: (code) -> @keys[name]? if code? and (name = @codes[code])?}

If we can add keys, we should be able to remove them!

        remove:
            value: (name) ->
                delete @keys[name] if name?
                delete @codes[code] for code in codes when name? and @codes[code] is name
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
