Jelli Game Engine

#  Control()  #

`Control()` provides mechanisms for tracking keyboard input.

##  The constructor  ##

The `Control()` constructor takes one argument: `doc`, which gives the owner `Document`.
It defaults to `document`.

    "use strict";

    Control = (doc = document) ->

Not much work happens in the `Control()` constructor itself; most of the heavy-lifting takes place in the prototype. But, here are our property definitions:

        @controls = {}
        @ownerDocument = unless doc instanceof Document then document else doc
        @keys = {}

We freeze `Control()` to make it formally immutable:

        Object.freeze this

And we add some event listeners to track what's going on:

        doc.defaultView.addEventListener "keydown", this, false
        doc.defaultView.addEventListener "keyup", this, false

##  The prorotype  ##

The `Control` prototype is where the magic happens.

    Control.prototype = {

Our first function lets us add a new control.
It only takes one argument, `name`, which should be a string.
If `name` is not provided, the function does nothing.

        add: (name) ->
            unless name? then return
            @controls[name] = false
            return this

You will note that the above function returned `this` – that is, the current `Control` object.
This allows for the stringing together of `Control` commands.

Our next function is `addKeys()`, which adds keys for the given `name`.
Keys should be a valid `KeyboardEvent.code`, `KeyboardEvent.key`, `KeyboardEvent.keyIdentifier`, or `KeyboardEvent.keyCode`.
The `name` is the first argument, and the keys come next.
If the `name` has not already been defined, this does nothing.

        addKeys: (name, keys...) ->
            unless name? and @controls[name]? then return
            for key in keys
                @keys[key] = name
            return this

Here we have defined the value of `key` in `@keys` to give us the `name` of the control, for each key specified.
Again, we returned `this`.

If given a key, it would be nice to be able to find the name of the control that it is associated with.
`getName()` does this, taking the name of the key as its argument.

        getName: (key) -> unless key? and @keys[key]? then return else @keys[key]

`handleEvent()` handles the events that we added listeners for in the constructor.
At this time, these are all `KeyboardEvent`s.
It uses a `switch` statement to process them all, taking in the event itself as its argument.

        handleEvent: (e) ->
            unless e instanceof Event then return
            switch e.type

When a key is down, we want to toggle it to `true`…

                when "keydown"
                    for key in [e.code, e.key, e.keyIdentifier, e.keyCode]
                        if @isKeyDefined key then @toggleKey key, true

…and when a key is up, we want to toggle it to `false`.

                when "keyup"
                    for key in [e.code, e.key, e.keyIdentifier, e.keyCode]
                        if @isKeyDefined key then @toggleKey key, false

This function shouldn't return anything, because it's just an event handler.

            return

The next two functions are pretty simple: `isActive()`, which tells us if a control is active, and `isDefined()`, which tells us if a control is defined.
Both take a single argument, the `name` of the control.

        isActive: (name) -> unless name? and @controls[name]? then return else !!@controls[name]

        isDefined: (name) -> unless name? then return else controls[name]?

It's equally possible, though, that you don't have the `name` of the control but rather only that of an associated `key`.
`isKeyActive()` and `isKeyDefined()` do the same as the above, only with an argument of a `key`.

        isKeyActive: (key) -> unless key? and (name = @keys[key])? and @controls[name]? then return else !!@controls[name]

        isKeyDefined: (key) -> unless key? and (name = @keys[key])? then return else @controls[name]?

If we can add controls, we should be able to remove them!

        remove: (name) ->
            unless name? then return
            delete @controls[name]
            return this

And likewise with keys:

        removeKeys: (keys...) ->
            for key in keys
                delete @keys[key]
            return this

We can set whether or not a control/key is activated using `toggle()` and `toggleKeys()`.
The first argument is the `name` or `key`; the second is what to set it to.
If not set, the second argument will just toggle the key to the opposite value.

        toggle: (name, to = !@controls[name]) -> unless name? and @controls[name]? then return else @controls[name] = !!to

        toggleKey: (key, to = !@controls[@keys[key]]) -> unless key? and (name = @keys[key]) and @controls[name] then return else controls[name] = !!to

You will notice that the above functions do *not* return `this`!
Rather, they return whatever value the control was toggled to.

That's all the functions we have, so let's freeze that prototype and make the constructor transparent to the window:

    }
    Object.freeze Control.prototype

    window.Control = Control

We have assumed control!
