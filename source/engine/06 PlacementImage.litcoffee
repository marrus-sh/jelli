#  07. PLACEMENTIMAGE  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    PLACEMENTIMAGE
    The Jelli Game Engine
    ---------------------
    ###

`PlacementImage` provides a minimal [`Unit`](05 Unit.litcoffee) interface that is far simpler than that provided by [`Character`](07 Character.litcoffee).
It is intended for static images.

###  The constructor:  ###

The `PlacementImage` constructor generates a `PlacementImage` from an `IMAGE` element.
It has only two required arguments: `collection` and `name`, which hold the same meaning as they do for all `Collection` instances.
However, the arguments `id`, `x`, `y`, and `placed` may be passed in to initialize the values of those respective properties.
This takes a variety of forms:

- `Character(collection, name)`
- `Character(collection, name, placed)` **if** `placed` is a boolean
- `Character(collection, name, id)` otherwise
- `Character(collection, name, id, placed)` **if** `placed` is a boolean
- `Character(collection, name, x, y)` otherwise
- `Character(collection, name, x, y, placed)` **if** `placed` is a boolean
- `Character(collection, name, id, x, y)` otherwise
- `Character(collection, name, id, x, y, placed)`

Note that if `id` is not set, it is assumed to be `name`.

    Character = (collection, name, optional_args...) ->

>   **Note :**
    There is no explicit call to `Jelli` here because `PlacementImage` inherits from `Unit`, which is already a `Jelli` object.

Because of our optional arguments, we have to do some argument detection.
We'll go ahead and use a `switch` statement:

        switch optional_args.length
            when 0 then id = name
            when 1
                if typeof optional_args[0] is "boolean" or optional_args[0] instanceof Boolean
                    id = name
                    placed = optional_args[0]
                else
                    id = optional_args[0]
            when 2
                if typeof optional_args[1] is "boolean" or optional_args[1] instanceof Boolean
                    id = optional_args[0]
                    placed = optional_args[1]
                else
                    id = name
                    x = null if isNaN(x = Number(optional_args[0]))
                    y = null if isNaN(y = Number(optional_args[1]))
            when 3
                if typeof optional_args[2] is "boolean" or optional_args[2] instanceof Boolean
                    id = name
                    x = null if isNaN(x = Number(optional_args[0]))
                    y = null if isNaN(y = Number(optional_args[1]))
                    placed = optional_args[2]
                else
                    id = optional_args[0]
                    x = null if isNaN(x = Number(optional_args[1]))
                    y = null if isNaN(y = Number(optional_args[2]))
                    placed = false
            else
                id = optional_args[0]
                x = null if isNaN(x = Number(optional_args[1]))
                y = null if isNaN(y = Number(optional_args[2]))
                placed = optional_args[3]
        placed = !!placed

For convenience, we get `game` and `area` from `collection`:

        collection = null unless collection instanceof Collection
        game = if collection? then collection.game else null
        area = if collection? then collection.area else null

We also need to get the `IMAGE` element:

        elt = if typeof id is "number" or id instanceof Number then game?.data.getElementsByClassName("IMAGE").item(id) || null else game?.data.getElementsByClassName("IMAGE").namedItem(id) || null

Of course, `IMAGE` needs to actually be an image.

        elt = null unless elt instanceof HTMLImageElement or elt instanceof SVGImageElement or elt instanceof HTMLCanvasElement or createImageBitmap? and elt instanceof ImageBitmap

We can get the width and height of the `IMAGE` from one of two sources, depending on the `IMAGE` type.
All of the accepted types have `width` and `height` properties, which specify their dimensions.
However, `HTMLImageElement`s also have `naturalWidth` and `naturalHeight` properties, and these should be preferred for pixel-perfect rendering.

If for some reason we can't get *either* of these properties, then the `source_width` and `source_height` are set to zero.

        source_width = 0 unless elt? and not isNaN(source_width = Number(if source.naturalWidth? then source.naturalWidth else source.width))
        source_height = 0 unless elt? and not isNaN(source_height = Number(if source.naturalHeight? then source.naturalHeight else source.height))

We now have everything we need to initialize `PlacementImage` as a `Unit`:

        Unit.call this, area, game.screens[elt?.dataset.screen], id, x, y, source_width, source_height, elt?.getAttribute("data-origin-x"), elt?.getAttribute("data-origin-y")

Of course, we also need to define the `placed` property on the `PlacementImage`:

        Object.defineProperties this, {
            placed:
                get: -> placed
                set: (n) -> placed = !!n
        }

`PlacementImage`s are static, so we can go ahead and freeze them.

        Object.freeze this

###  The prototype:  ###

The `PlacementImage` prototype is very simple, consisting only of a `draw()` function and a function for toggling placement.

    PlacementImage.prototype = Object.create(Unit.prototype, {

The `draw()` function draws the `PlacementImage` – but only if it is loaded and `placed` has been set to `true`.

        draw: {value: -> @screen.context.drawImage(@source, Math.floor(@edges.screen_left), Math.floor(@edges.screen_top)) if @placed and @screen instanceof Screen and (not (@source instanceof HTMLImageElement) or @source.complete)}

The `togglePlacement` function either toggles `placed` or sets it to `n`.

        togglePlacement:
            value: (n) ->
                if n? then @placed = !!n
                else @placed = !@placed

We can now freeze the prototype:

    })

    Object.freeze this

###  Final touches:  ###

The only thing left to do is freeze `PlacementImage`, and add it to the window:

    @PlacementImage = Object.freeze(PlacementImage)
