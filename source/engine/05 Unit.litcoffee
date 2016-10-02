#  05. UNIT  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    UNIT
    The Jelli Game Engine
    ---------------------
    ###

`Unit` provides a common interface that [`PlacementImage`](06 PlacementImage.litcoffee) and [`Character`](07 Character.litcoffee) draw upon.
It is not intended to be used on its own.

###  The constructor:  ###

The `Unit` constructor is rather unweildy (ie, it takes a lot of arguments), because it isn't intended for general use.
Here's a list of the arguments in order:

- `game`: The `Game` that the `Unit` belongs to
- `screen`: The `Screen` on which the `Unit` should be drawing
- `id`: The `id` of the `Unit`, used by `Character` and `PlacementImage` to identify its source element
- `x`: The horizontal position of the `Unit`
- `y`: The vertical position of the `Unit`
- `width`: The width of the `Unit`
- `height`: The height of the `Unit`
- `origin_x`: The horizontal location of the `Unit`'s origin, measured from its left edge
- `origin_y`: The vertical location of the `Unit`'s origin, measured from its top edge

You can see these in the constructor below.
`Unit`s are `Jelli`s, so we're sure to call that constructor as well.

    Unit = (game, screen, id, x, y, width, height, origin_x, origin_y) ->
        Jelli.call this

Given all of those arguments, our first task is to make sure they are what we expect:

        game = null unless game instanceof Game
        screen = null unless screen instanceof Screen
        id = String(id)
        width = 0 if isNaN(width = Number(width))
        height = 0 if isNaN(height = Number(height))
        origin_x = width / 2 if isNaN(origin_x = Number(origin_x))
        origin_y = height / 2 if isNaN(origin_y = Number(origin_y))
        x = origin_x if isNaN(x = Number(x))
        y = origin_y if isNaN(y = Number(y))

Now we can define some of those properties.
`id`, `x`, and `y` are enumerable, and `x` and `y` are modifiable through a getter and a setter.

        Object.defineProperties this, {
            area: {get: -> return game.area}
            game: {value: game || null}
            height: {value: height}
            id:
                value: id
                enumerable: yes
            origin_x: {value: origin_x}
            origin_y: {value: origin_y}
            screen: {value: screen}
            width: {value: width}
            x:
                enumerable: yes
                get: -> x
                set: (n) -> x = Number(n) unless isNaN(n)
            y:
                enumerable: yes
                get: -> y
                set: (n) -> y = Number(n) unless isNaN(n)
        }

The properties `screen_x` and `screen_y` are convenience properties for getting and setting `x` and `y` relative to the top-left corner of the screen.

        Object.defineProperties this, {
            screen_x:
                get: -> x - @area?.x
                set: (n) -> x = Number(n) + @area?.x unless isNaN(n)
            screen_y:
                get: -> y - @area?.y
                set: (n) -> y = Number(n) + @area?.y unless isNaN(n)
        }

The `kill` property is just an empty function, intended to be overwritten when a `Unit` is used as part of a [`Collection`](04 Collection.litcoffee).

        Object.defineProperty this, "kill", {
            value: ->
            writable: yes
        }

The `edges` property provides a number of convenient properties for accessing the location of the `Unit`, with `screen_*` variants as well.

        Object.defineProperty this, "edges", {
            value: Object.create(null, {
                top:
                    enumerable: yes
                    get: -> y - origin_y
                    set: (n) -> y = Number(n) + origin_y unless isNaN(n)
                bottom:
                    enumerable: yes
                    get: -> y - origin_y + height
                    set: (n) -> y = Number(n) - height + origin_y unless isNaN(n)
                left:
                    enumerable: yes
                    get: -> x - origin_x
                    set: (n) -> x = Number(n) + origin_x unless isNaN(n)
                right:
                    enumerable: yes
                    get: -> x - origin_x + width
                    set: (n) -> x = Number(n) - width + origin_x unless isNaN(n)
                screen_top:
                    enumerable: yes
                    get: -> y - origin_y - area.y
                    set: (n) -> y = Number(n) + origin_y + area.y unless isNaN(n)
                screen_bottom:
                    enumerable: yes
                    get: -> y - origin_y + height - area.y
                    set: (n) -> y = Number(n) - height + origin_y + area.y unless isNaN(n)
                screen_left:
                    enumerable: yes
                    get: -> x - origin_x - area.x
                    set: (n) -> x = Number(n) + origin_x + area.x unless isNaN(n)
                screen_right:
                    enumerable: yes
                    get: -> x - origin_x + width - area.x
                    set: (n) -> x = Number(n) - width + origin_x + area.x unless isNaN(n)
            })
        }
        Object.freeze @edges

With that, we're done defining our `Unit`.
`Unit`s are made to be extended, so we won't freeze them.

###  The prototype:  ###

The `Unit` prototype is incredibly simple.

    Unit.prototype = Object.create(Jelli.prototype, {

`draw()` is a placeholder function – it should be overwritten by descendants.

        draw: {value: ->}

`setPosition` is a simple convenience function for setting `x` and `y`:

        setPosition:
            value: (x, y) ->
                @x = x
                @y = y

With that, we can freeze the prototype:

    })

    Object.freeze Unit.prototype

###  Final touches:  ###

All that's left is to freeze `Unit` and make it transparent to the window:

    @Unit = Object.freeze(Unit)
