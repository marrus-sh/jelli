#  03. COLLECTION  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    COLLECTION
    The Jelli Game Engine
    ---------------------
    ###

`Collection` creates a simple packaging for objects, and methods for interacting with them.
[`Area`](03 Area.litcoffee) uses it to package its `Character`s and `PlacementImage`s.

###  The constructor:  ###

The `Collection` constructor takes two arguments: a `parent` object, and the `constructor` for its objects.
The `constructor` should take the form `(collection, name…) ->`, where `collection` will be this `Collection` object, and `name` is the key associated with an instance.
(Note that there is no requirement that `constructor`s actually *do* anything with this information; you are more than welcome to throw them away.)

    Collection = (parent, constructor) ->

If `parent` is an `Area`, we can get both `area` and `game`.
If it is `Game`, we can only get `game`.
(If it is neither, then we can't get anything.)

        if parent instanceof Area
            area = parent
            game = parent.game
        else if parent instanceof Game then game = parent

`nextIndex` gets the next index for nameless `Collection` objects.
It starts out at zero:

        nextIndex = 0

We can now define the `Collection` properties.
All of these need to be non-enumerable, so we use `Object.defineProperties()`.

        Object.defineProperties this, {
            area: {value: area || null}
            Type: {value: if typeof constructor is "function" or constructor instanceof Function then constructor else null}
            game: {value: game || null}
            nextIndex: {
                get: -> nextIndex
                set: (n) -> if Number(n) > nextIndex then nextIndex = Number(n)
            }
            parent: {value: if typeof parent is "object" then parent else null}
        }

`Collection` objects store their contents as direct properties, so we can't freeze them or prevent extensions.
However, you **really shouldn't** manually change their contents.

###  The prototype:  ###

Instead, you should use the functions provided by `Collection.prototype`!
These allow you to create new instances, delete old ones, and enumerate over all of them.

    Collection.prototype = Object.create(Object.prototype, {

`doForEach()` is a convenience function for `for … of…` (or the JavaScript equivalent, `for (… in…)`) which *also* checks to ensure that the returned properties are instances of `Collection.Type`.
It takes a function as its argument, which should take the form of `(value, key) ->`.
It returns the `Collection` itself.

        doForEach:
            value: ->
                fn(value, key) for key, value of this when not @Type? or value instanceof @Type
                return this

`kill()` deletes the instance specified by `name` from the `Collection`, if it exists, returning the deleted instance.
Note that, as with any instance of the `delete` operator, this won't free up memory if the instance is still referenced somewhere else.

        kill:
            value: (name) ->
                if Object.getOwnPropertyDescriptor(this, name)?.configurable
                    instance = this[name]
                    delete this[name]
                else instance = null
                return instance

The advantages to using `kill()` over `delete` are:

1.  `kill()` checks to see if properties are configurable first, and so won't throw a `TypeError` and won't allow you to delete the properties defined by the `Collection` constructor.
    (`delete` only does this in non-strict mode.)

2.  `kill()` is a function, and thus can be used in callbacks and bound to specific values.

3.  `kill()` returns the instance that it deletes.

For consistency, using `kill()` is recommended in *every* instance, but in many instances `delete` will work just as well.

The `load()` function creates an instance and stores it in `name`.
`load()` will **not** overwrite properties which already have values (if this is important, call `kill()` first).
`load()` returns the newly-created instance, but if it is unable to load the instance, it returns `null`.

        load:
            value: (name, args...) ->
                unless this[name]?
                    Object.defineProperty this, name, {
                        value: if typeof @Type is "function" or @Type instanceof Function then new @Type(this, name, arguments...) else null
                        configurable: true
                    }
                    Object.defineProperty this[name], "kill", {value: this.kill.bind(this, name)}
                else null

By default, `load()` makes properties non-writable, and it is *recommended* that you not change this.
Calling `kill()` and then `load()` is the best way to overwrite an instance.

`load()` attempts to bind `kill()` to the instance that it creates for convenience.

`loadNameless()` is very similar to `load()`, but is intended for autonomous instances which rarely need to be referenced by name.
Consequently, it has a few differences:

1.  `loadNameless()` doesn't take `name` as an argument
2.  `loadNameless()` returns the index of the created instance, not the instance itself

The code is below:

        loadNameless:
            value: (args...) ->
                @nextIndex++ while this[@nextIndex]?
                Object.defineProperty this, @nextIndex, {
                    value: if typeof @Type is "function" or @Type instanceof Function then new @Type(this, @nextIndex, arguments...) else null
                    configurable: true
                }
                Object.defineProperty this[@nextIndex], "kill", {value: this.kill.bind(this, @nextIndex)}
                return @nextIndex++

We can now freeze the `Collection` prototype:

    })

    Object.freeze Collection.prototype

###  Final touches:  ###

We now need only to freeze `Collection` and make it available to everyone else through the window:

    @Collection = Object.freeze(Collection)

Happy collecting!
