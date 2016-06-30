#  05. AREA  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    AREA
    The Jelli Game Engine
    ---------------------
    ###

`Area`s are containers of game data which have their own scripting and variables.
Only one `Area` can be loaded at a time.

###  The constructor:  ###

The `Area` constructor takes two arguments: The `game` (of type `Game`) within which to create the `Area`, and `id`, which is the `id` of the `AREA` element.
If you prefer, you may use a numerical index for `id` instead.

    Area = (game, id) ->
        Jelli.call this

First, we need to ensure that a `Game` was provided, and that our `id` resolves to an `AREA` element.

        game = null unless game instanceof Game
        elt = if typeof id is "number" or id instanceof Number then game?.data.getElementsByClassName("AREA").item(id) else game?.data.getElementsByClassName("AREA").namedItem(id)
        elt = null unless elt?

We can now define the properties of the `Area`.
These properties are not enumerable and often should not be overwritten, so we use `Object.defineProperty` and `Object.defineProperties`.
The `Collection` constructor expects `area.game` to be set, so let's do that first:

        Object.defineProperty this, "game", {value: game}

The following properties are containers for things we will add to the `Area` later, with the exception of `functions`, which is pulled from the element.

        Object.defineProperties this, {
            characters: {value: new Collection(this, Character)}
            functions: {value: elt?.functions}
            images: {value: new Collection(this, PlacementImage)}
            maps: {value: []}
        }

The `id` property gets the `id` of the `Area`.
However, on setting, it loads a new `Area` instead.

        Object.defineProperty this, "id", {
            get: -> id
            set: (n) -> @game.area = n
        }

The `clear` property is used to identify when the `area` needs to be redrawn.
We use a getter and setter to make sure that it is always a boolean.
The initial value is `yes` because the map has not yet been drawn.

        clear = yes

        Object.defineProperty this, "clear", {
            get: -> clear
            set: (n) -> clear = !!n
        }

The `x` and `y` properties give the position of the area's origin, used for rendering.
They are passed to `Tilemap` as `origin_x` and `origin_y` on setting.
The `clear` property is set whenever `x` or `y` change.

        x = 0
        y = 0

        Object.defineProperties this, {
            x:
                get: -> x
                set: (n) ->
                    return if isNaN(n = Number(n))
                    map.origin_x = x for map in @maps
                    @clear = yes
            y:
                get: -> y
                set: (n) ->
                    return if isNaN(n = Number(n))
                    map.origin_y = y for map in @maps
                    @clear = yes
        }

We can now load the maps.
Maps are drawn from `MAP` elements within the `AREA` element. We iterate over each and use its `data-*` attributes to create the map.
We then freeze `maps` to prevent our list from changing or being corrupted.

        @maps[i] = game?.tilesets[map.dataset.tileset]?.getMap(game?.screens[map.dataset.screen]?.context, map.textContent.trim(), map.getAttibute("data-mapwidth"), map.getAttibute("data-dx"), map.getAttibute("data-dy"), x, y) for map, i in (elt?.getElementsByClassName("MAP") || [])
        Object.freeze @maps

Next, we can load the characters and images which have been specified in the `data-characters` and `data-images` attributes, respectively.
This is easy because `characters` and `images` are `Collection`s.

        @characters.load(i) for i in (elt?.dataset.characters?.split(/\s+/) || [])
        @images.load(i) for i in (elt?.dataset.images?.split(/\s+/) || [])

Finally, we can run the initialization code for the `Area`.
Any variables assigned to the `Area` must be declared in the initialization code.

        @run("init")

We then seal the `Area` to prevent further modification, but allow the overwriting of user-defined variables.

        Object.seal this

###  The prototype:  ###

The `Area` prototype allows us to `draw` the `Area` and `step` the `Area`'s logic.

    Area.prototype = Object.create(Jelli.prototype, {

`draw` iterates over the `maps`, `characters`, and `images` of the `Area` and draws them to `context`, in that order.
It only draws the `maps` if `clear` evaluates to `true`.

        draw: (context) ->
            map.draw() for map in maps if @clear
            @characters?.doForEach (character) -> character.draw()
            @images?.doForEach (image) -> image.draw()
            @clear = no

`step` calls the `Area`'s own `step` function, the `step` functions for its `characters`, in order, and then the `Area`'s' `then` function.

        step: ->
            @run("step")
            @characters?.doForEach (character) -> character.step()
            @run("then")

Now that our prototype is done, we can freeze it.

    })

    Object.freeze Area.prototype

###  Final touches:  ###

All that's left is freezing and making available `Area` to the window:

    @Area = Object.freeze(Area)
