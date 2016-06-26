    "use strict";

    ###
    KEYBOARD
    Keyboard input tracking
    ---------------------
    ###

- - -

#  Keyboard  #

`Keyboard` provides mechanisms for tracking keyboard input.

##  The constructor  ##

The `Keyboard` constructor takes one argument: `doc`, which gives the owner `Document`.
It defaults to `document`.

    Keyboard = (doc = document) ->

Not much work happens in the `Keyboard` constructor itself; most of the heavy-lifting takes place in the prototype. But, here are our property definitions:

        @codes = {}
        @keys = {}
        @ownerDocument = unless doc instanceof Document then document else doc

We freeze `Keyboard` to make it formally immutable:

        Object.freeze this

And we add some event listeners to track what's going on:

        doc.defaultView.addEventListener "keydown", this, false
        doc.defaultView.addEventListener "keyup", this, false

Finally, we need to make `Keyboard` transparent to the window:

    window.Keyboard = Keyboard

##  The prorotype  ##

The `Keyboard` prototype is where the magic happens.

    Keyboard.prototype = {

Our first function lets us add a new key to the `Keyboard`.
It only takes one argument, `name`, which should be a string.
If `name` is not provided, the function does nothing.

        add: (name) ->
            @controls[name] = false if name?
            return this

You will note that the above function returned `this` – that is, the current `Keyboard` object.
This allows for the stringing together of `Keyboard` commands.

Our next function is `addCodes()`, which adds codes to the key with the provided `name`.
Codes should be a valid `KeyboardEvent.code`, `KeyboardEvent.key`, `KeyboardEvent.keyIdentifier`, or `KeyboardEvent.keyCode`.
The `name` of the key is the first argument, and the codes come next.
If no key with `name` has already been defined, this does nothing.

        addCodes: (name, codes...) ->
            @codes[code] = name for code in codes unless name? and @keys[name]?
            return this

Here we have defined the value of `code` in `@codes` to give us the `name` of the key, for each code specified.
Again, we returned `this`.

If given a code, it would be nice to be able to find the name of the key that it is associated with.
`getName()` does this, taking the code as its argument.

        getName: (code) -> return @codes[code] if code? and @codes[code]?

`handleEvent()` handles the events that we added listeners for in the constructor.
At this time, these are all `KeyboardEvent`s.
It uses a `switch` statement to process them all, taking in the event itself as its argument.

        handleEvent: (e) ->
            return unless e instanceof Event
            switch e.type

When a key is down, we want to toggle it to `true`…

                when "keydown"
                    for code in [e.code, e.key, e.keyIdentifier, e.keyCode]
                        @toggleCode(code, true) if @isCodeDefined(code)

…and when a key is up, we want to toggle it to `false`.

                when "keyup"
                    for code in [e.code, e.key, e.keyIdentifier, e.keyCode]
                        @toggleCode(code, false) if @isCodeDefined(code)

This function shouldn't return anything, because it's just an event handler.

            return

The next two functions are pretty simple: `isActive()`, which tells us if a key is active, and `isDefined()`, which tells us if a key has been defined.
Both take a single argument, the `name` of the key.

        isActive: (name) -> !!@keys[name] if name? and @keys[name]?

        isDefined: (name) -> @keys[name]? if name?

It's equally possible, though, that you don't have the `name` of the key but rather only that of an associated code.
`isCodeActive()` and `isCodeDefined()` do the same as the above, only with an argument of a `code`.

        isCodeActive: (code) -> !!@keys[name] if code? and (name = @codes[code])? and @keys[name]?

        isCodeDefined: (code) -> @keys[name]? if code? and (name = @codes[code])?

If we can add keys, we should be able to remove them!

        remove: (name) ->
            delete @keys[name] if name?
            return this

And likewise with codes:

        removeCodes: (codes...) ->
            delete @codes[code] for code in codes
            return this

We can set whether or not a control/key is activated using `toggle()` and `toggleCode()`.
The first argument is the `name` or `code`; the second is what to set it to.
If not set, the second argument will just toggle the key to the opposite value.

        toggle: (name, to) -> @keys[name] = to? and to or not to? and !@keys[name] if name? and @keys[name]?

        toggleCode: (code, to) -> controls[name] = to? and to or not to? and !@keys[name] if code? and (name = @codes[code]) and @keys[name]?

You will notice that the above functions do *not* return `this`!
Rather, they return whatever value the key was toggled to, or `undefined` if the toggle failed.

That's all the functions we have, so let's freeze that prototype:

    }

    Object.freeze Keyboard.prototype

We have assumed control!
