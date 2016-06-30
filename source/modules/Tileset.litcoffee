#  TILESET  #
Maps and collision-checking

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    TILESET
    Maps and collision-checking
    ---------------------------
    ###

The `Tileset` module is used to associate a sprite-sheet with collision data, as well as to create and draw maps.
Like all `Jelli` modules, it is designed to function independently.
However, it works well in conjunction with `Sheet`, and this is how it is utilized in `Game`.

###  General functions:  ###

The `decode64()` function converts a Base64-encoded string into a `Uint8Array` (if supported) or `Array` (if not).
It will be used to generate our tile and collision maps.

>   [Issue #34](https://github.com/literallybenjam/jelli/issues/34) :
    This should be moved into `Game`.

`decode64()` only takes one variable, the string.

    decode64 = (base64) ->

We use a variable named `code` to keep track of the proper order for Base64 numbers, as a convenience.

        code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/-_"

As another matter of convenience (and slight efficiency?), we can set up an object, `values`, which associates a Base64 number with its decimal equivalent:

        values[n] = i for i, n in code

We need to make sure that our string is (1) actually a string, and (2) actually in Base64.
The latter requrires that it be divisible by `4`, so if it isn't then we exit early.

        return if (base64 = String(base64)).length % 4

For the most part, however, this function makes the good-faith assumption that the string being passed in is actually a Base64 string.

Base64 uses `"="` as a placeholder character.
For our calculations, it (and any non-Base64 character) will just be treated as `undefined`, which will convert to `0` under our bitwise operations.
However, we still need to know how many there are, so that we set the length of our array properly:

        placeholders = (base64[base64.length - 2] is "=") + (base64[base64.length - 1] is "=")

We can now set up our array.
We want to use a `Uint8Array`, if possible.
The size of our array is ¾ the size of the original data string, since we are converting from 6-bit to 8-bit.

        data = if Uint8Array? then new Uint8Array(3 * base64.length / 4 - placeholders) else new Array(3 * base64.length / 4 - placeholders)

We can now load all of our data into our array.
We do this in a `while` loop, iterating by fours over all the indices:

        i = 0

        while i < base64.length / 4

We pull in Base64 numbers four-at-a-time, and use them to generate a single 24-bit integer, `n`.

            n = values[base64[4 * i]] << 18 | values[base64[4 * i + 1]] << 12 | values[base64[4 * i + 2]] << 6 | values[base64[4 * i + 3]]

We then split this integer off into three 8-bit integers and record these in `data`:

            data[3 * i] = n >> 16 & 0xFF
            data[3 * i + 1] = n >> 8 & 0xFF
            data[3 * i + 2] = n & 0xFF

We can now increment `i`.

            i++

Finally, we return the final array.

        return data

###  Tilemap:  ###

`Tilemap` creates a map of tiles from a provided Base64 string, and provides functions for drawing it onscreen, as well as performing collision checking with it.
Right now, maps are 8-bit, meaning that they can only render tiles in the range `0x0`–`0xFF`.

>   [Issue #50](https://github.com/literallybenjam/jelli/issues/50) :
    The bit-depth of tilemaps should be specifiable as any integer in the range `1` (trivial)–`32` (the size of a JavaScript integer).

####  The constructor  ####

The `Tilemap` constructor takes *several* arguments. Here they are in a list:

- `tileset` is the `Tileset` object that the `Map` draws from
- `context` is a `CanvasRenderingContext2D` on which the `Map` should be drawn
- `map` is the Base64 map string
- `tiles_wide` is a number identifying how many tiles wide the map is
- `x` and `y` are the coordinates of the top-left corner of the `Tilemap` when rendering to `context`
- `origin_x` and `origin_y` are the coordinates of the origin point from which `x` and `y` are calculated. When dealing with multiple `Tilemap`s at different locations on the screen, synchronizing their origins allows you to shift their position while maintaining their relative distances

You can see the full constructor below:

    Tilemap = (tileset, context, map, tiles_wide, x, y, origin_x, origin_y) ->

The first thing we should do, as always, is handle the arguments we have been provided.
If `tileset` or `context` aren't `Tileset`s and `CanvasRenderingContext2D`s, respectively, then they are set to `null`.

        tileset = null unless tileset instanceof Tileset
        context = null unless context instanceof CanvasRenderingContext2D

We don't need the original Base64-encoded version of `map`, so we can decode it in-place:

        map = decode64(map)

`tiles_wide` obviously needs to be a positive integer.
We won't inforce the positive aspect, though.

        tiles_wide = 0 if isNaN(tiles_wide = Math.ceil(tiles_wide))

`tiles_tall`, likewise, tells us how many tiles tall the `Tilemap` is.
We can calculate this ourselves:

        tiles_tall = Math.ceil(map.length / tiles_wide)

`origin_x` and `origin_y` default to `0`.

        origin_x = 0 if isNaN(origin_x = Math.round(origin_x))
        origin_y = 0 if isNaN(origin_y = Math.round(origin_y))

`x` and `y`, if not provided, are set to `0`.
In an older version of the Jelli Game Engine, `Tilemap` centered the map if `x` and `y` were not provided.
This legacy behaviour might be useful to some people, so if needed it can be recreated by passing in the special constant `Tilemap.CENTER` for `x`, `y`, or both, as needed.

        x = Math.floor((context.canvas.width - tileset.tile_width * tiles_wide) / 2) - origin_x if x is Tilemap.CENTER and context? and tileset?
        x = 0 if isNaN(x = Math.round(x))
        y = Math.floor((context.canvas.height - tileset.tile_height * tiles_tall) / 2) - origin_y if y is Tilemap.CENTER and context? and tileset?
        y = 0 if isNaN(y = Math.round(y))

We now have all we need to make the map:

        @context = context
        @map = map
        @tile_height = tileset.tile_height if tileset
        @tile_width = tileset.tile_width if tileset
        @tiles_tall = tiles_tall
        @tiles_wide = tiles_wide
        @tileset = tileset

Because `origin_x`, `origin_y`, `x`, and `y` can be changed, we need to use getters and setters to ensure that they are always valid.

        Object.defineProperties this, {
            origin_x:
                get: -> origin_x
                set: (n) -> origin_x = n unless isNaN(n = Math.round(n))
            origin_y:
                get: -> origin_y
                set: (n) -> origin_y = n unless isNaN(n = Math.round(n))
            x:
                get: -> x
                set: (n) -> x = n unless isNaN(n = Math.round(n))
            y:
                get: -> y
                set: (n) -> y = n unless isNaN(n = Math.round(n))
        }

`Tilemap`s are necessarily static, so we should freeze the `Tilemap` object:

        Object.freeze this

####  The prototype  ####

The `Tilemap` prototype is used to access collision data and draw the map.

    Tilemap.prototype = Object.create(Object.prototype, {

There are only three functions in the `Tilemap` prototype, but each does a lot of work.

First, we have `collides`, which checks to see if a given point registers as a collision or not.
If it does, it returns the corner of the collision.
This will be one of the following:

- `Tileset.collisions.NO_COLLISION`
- `Tileset.collisions.TOPLEFT`
- `Tileset.collisions.TOPRIGHT`
- `Tileset.collisions.BOTTOMLEFT`
- `Tileset.collisions.BOTTOMRIGHT`

Each of these constants has a specific numeric value; see the "Final touches" section of `Tileset` for more information on what they mean.

>   [Issue #49](https://github.com/literallybenjam/jelli/issues/49) :
    This function may return other values in the future.

`collides()` takes as its arguments the horizontal and vertical coordinates of the point to check, relative to the map's origin.
These are named `sx` and `sy`.

        collides:
            value: (sx, sy) ->

First we need to make sure that our coordinates are numbers, and that a tileset has been defined for our map.
If not, we return `0x0` (`NO_COLLISION`).

                return 0x0 unless @tileset instanceof Tileset and not (isNaN(sx = Number(sx)) or isNaN(sy = Number(sy)))

We now calculate `x` and `y`, which are the coordinates of our point relative to the map's top-left corner.

                x = if isNaN(@x) then sx else sx - @x
                y = if isNaN(@y) then sy else sy - @y

If the point is outside of the bounds of the map, we return `0x0` (`NO_COLLISION`).

                return 0x0 if x < 0 or x >= @tile_width * @tiles_wide or y < 0 or y >= @tile_height * @tiles_tall

Otherwise, we need to get the collision data for the tile that the point resides in.
We can use `tileset.getCollision()` to access this:

                collision = @tileset.getCollision(@map[Math.floor(x / @tile_width) + Math.floor(y / @tile_height) * @tiles_wide])

Note that in the above code, `Math.floor(x / @tile_width)` gives the column of the tile, and `Math.floor(y / @tile_height)` gives the row.

We can get the corner that the point is located in by multiplying by `2` if the point is on the right-hand side, and multiplying by `4` if the point is on the bottom.
We use the bitwise `&` operator to compare this value to the collision data for the tile, and return the result.

                return collision & 1 * (1 + x % tile_width <= this.tile_width / 2) * (1 + 3 * (y % @tile_height <= @tile_height / 2))

Next, we have the `draw()` function.
This function is fairly simple, it just iterates over each tile and draws it to the `context`.

        draw:
            value: ->

Of course, we need to ensure that we can actually process and draw the tiles first:

                return unless @context instanceof CanvasRenderingContext2D and @tileset instanceof Tileset and not (isNaN(@x) or isNaN(@y) or isNaN(@origin_x) or isNaN(@origin_y)) and Number(@tile_width) and Number(@tile_height) and Number(@tiles_wide) and typeof @map is "object"

Note that the function aborts if `tile_width`, `tile_height`, or `tiles_wide` is `0` **or** `NaN`.

We can now draw the tiles:

                @tileset.draw(@context, @map[i], Number(@x) - Number(@origin_x) + (i % @tiles_wide) * @tile_width, Number(@y) - Number(@origin_y) + Math.floor(i / @tiles_wide) * @tiles_height) for i in [0..@map.length]

For a drawing function, we don't need to return a value.

                return

The final `Tilemap` prototype function is by far the most complex.
It is called `getCollisionEdge()`, and returns the specified edge of a tile's collision area **if** a collision is detected.
If not, it returns the coordinate of the point instead.

`getCollisionEdge()` takes three coordinates: the collision `edge`, which is one of the special constants `Tilemap.LEFT_EDGE`, `Tilemap.RIGHT_EDGE`,`Tilemap.TOP_EDGE`,`Tilemap.BOTTOM_EDGE`, and the coordinates of the point, `sx` and `sy`.

        getCollisionEdge:
            value: (edge, sx, sy) ->

First we need to make sure that we were passed the arguments that we expect:

                return unless (edge is Tilemap.BOTTOM_EDGE or edge is Tilemap.LEFT_EDGE or edge is Tilemap.RIGHT_EDGE or edge is Tilemap.TOP_EDGE) and isNaN(sx = Number(sx)) and isNaN(sy = Number(sy))

For convenience, let's store `Tileset.collisions` at `at`:

                at = Tileset.collisions

We now calculate `x` and `y`, which are the coordinates of our point relative to the map's top-left corner.
These values are rounded to the nearest pixel for `getCollisionEdge()`, in order to ensure that the computed value matches what will be rendered.

                x = Math.round(if isNaN(@x) then sx else sx - @x)
                y = Math.round(if isNaN(@y) then sy else sy - @y)

With a little math, we can get the index of the tile, both horizontally, vertically, and overall:

                ix = Math.floor(x / @tile_width)
                iy = Math.floor(y / @tile_height)
                i = ix + iy * @tiles_wide

If the point lands exactly on a tile edge, or if the point lies outside of the map's bounds, then we can't calculate the collision, so we just set it to `NO_COLLISION`.

                if x % (@tile_width / 2) is 0  or y % (@tile_height / 2) is 0 or x < 0 or x >= @tile_width * @tiles_wide or y < 0 or y >= @tile_height * @tiles_tall then corner = collision = at.NO_COLLISION

Otherwise we can get both the collision data for the tile (using `getCollision()`), and the corner of the collision (using `collides()`):

                else
                    collision = @tileset.getCollision(@map[i])
                    corner = @collides(sx, sy)

If `collides` returned `NO_COLLISION` (or we weren't able to calculate it), then we just return the original coordinate:

                return (if edge is Tilemap.LEFT_EDGE or edge is Tilemap.RIGHT_EDGE then sx else sy) if !corner

Otherwise, the value we return depends on the edge we are looking for.
If the point lands on the far side of the tile, then we need to check to see if the near side also has collision data.
If it does, we can return the near edge of the near side; if it doesn't, then the near edge of the far side is what we want.

                switch edge
                    when Tilemap.BOTTOM_EDGE then return (if corner is at.TOPLEFT and collision & at.BOTTOMLEFT or corner is at.TOPRIGHT and collision & at.BOTTOMRIGHT then iy * @tile_height + @tile_height + @y else iy * @tile_height + @tile_height / 2 + @y)
                    when Tilemap.LEFT_EDGE then return (if corner is at.TOPRIGHT and collision & at.TOPLEFT or corner is at.BOTTOMRIGHT and collision & at.BOTTOMLEFT then ix * @tile_width + @x else ix * @tile_width + @tile_width / 2 + @x)
                    when Tilemap.RIGHT_EDGE then return (if corner is at.TOPLEFT and collision & at.TOPRIGHT or corner is at.BOTTOMLEFT and collision & at.BOTTOMRIGHT then ix * @tile_width + @tile_width + @x else ix * @tile_width + @tile_width / 2 + @x)
                    when Tilemap.TOP_EDGE then return (if corner is at.BOTTOMLEFT and collision & at.TOPLEFT or corner is at.BOTTOMRIGHT and collision & at.TOPRIGHT then iy * @tile_height + @y else iy * @tile_height + @tile_height / 2 + @y)

With that, we're done.
We can now freeze the prototype:

    })

    Object.freeze Tilemap.prototype

####  Final touches  ####

Before moving on to other constructors, we need to create the special constants `Tilemap.LEFT_EDGE`, `Tilemap.RIGHT_EDGE`, `Tilemap.TOP_EDGE`, `Tilemap.BOTTOM_EDGE`, and `Tilemap.CENTER`, mentioned above.
If available, we will use the new symbol primitive; otherwise, an object with `null` prototype is just as unique and compact.

    Object.defineProperties Tilemap, {
        BOTTOM_EDGE: {value: if Symbol? then Symbol("bottom") else Object.freeze(Object.create(null))}
        CENTER: {value: if Symbol? then Symbol("center") else Object.freeze(Object.create(null))}
        LEFT_EDGE: {value: if Symbol? then Symbol("left") else Object.freeze(Object.create(null))}
        RIGHT_EDGE: {value: if Symbol? then Symbol("right") else Object.freeze(Object.create(null))}
        TOP_EDGE: {value: if Symbol? then Symbol("top") else Object.freeze(Object.create(null))}
    }

###  Tileset:  ###

`Tileset` associates collision data with a sprite-sheet.
It doesn't do the work of encoding the sprite-sheet itself, so it is a fairly simple object.

####  The constructor  ####

The `Tileset` constructor takes in five arguments: `sheet`, the sprite-sheet; `tile_width`, the pixel width of a tile; `tile_height`, the pixel height of a tile; `collisions`, which is Base64-encoded collision data; and `draw`, which is a function for drawing a sprite from the sheet.

`Tileset` makes no restrictions on the type of `sheet`:
Any value will work so long as the provided `draw` function can properly handle it.
`draw` should ideally be a function of the form `(context, sheet, index, x, y) ->`.
The only variable of these which is actually handled by `Tileset` is `sheet`; however, `Tilemap` (above) will pass `context` as a `CanvasRenderingContext2D`, `index` as the index of the sprite on the sheet, and `x` and `y` as the coordinates of the top-left corner of the sprite.

>   **Note :**
    The order of the arguments above have been designed to work well with the [`Sheet`](sheet.litcoffee) module; `Sheet.drawSheetAtIndex` can be passed as a `draw` function as-is.
    However, the use of the `Sheet` module is, of course, not required, and any other function which takes arguments in the same order can be used as well.
    It is entirely feasible, for example, to pass `Tileset` an `HTMLImageElement` for `sheet` and a simple `context.drawImage()` wrapper for `draw`.

    Tileset = (sheet, tile_width, tile_height, collisions, draw) ->

First we want to make sure that `tile_width` and `tile_height` are numbers.
We don't need to know anything else about `draw`, but we do want to make sure it is a function.

        tile_width = 0 if isNaN(tile_width = Number(tile_width))
        tile_height = 0 if isNaN(tile_height = Number(tile_height))
        draw = null unless typeof draw is "function" or draw instanceof Function

That's all we need to define the properties:

        @collisions = decode64(collisions)
        @drawFunction = draw
        @sheet = sheet
        @tile_height = tile_height
        @tile_width = tile_width

`Tileset` expects everything it deals with to be static, so we should freeze the object:

        Object.freeze(this)

####  The prototype  ####

The `Tileset` prototype is similarly simple, containing:

- A wrapper for its draw function
- A function for easy `Tilemap` creation
- `getCollision()`, which simply pulls collision data from the `collisions` array

Here they are in order:

    Tileset.prototype = Object.create(Object.prototype, {
        draw: {value: (context, index, x, y) -> @drawFunction(context, @sheet, index, x, y) if typeof @drawFunction is "function" or @drawFunction instanceof Function}
        getMap: {value: (context, map, tiles_wide, x, y, origin_x, origin_y) -> new Tilemap(this, context, map, tiles_wide, x, y, origin_x, origin_y)}
        getCollision: {value: (index) -> if isNaN(index) then 0 else (@collisions[Math.floor(index / 2)] >> 4 * ((index + 1) % 2)) & 0xF}    
    })

`getCollision()` involves complex bitwise operations because collision data is 4-bit, but is stored in an 8-bit array.
Here's a breakdown of what happens:

1.  `@collisions[Math.floor(index / 2)]` gives us the 8-bit integer which our collision data is stored in.
    If `index` is divisible by two, then the data will be in the first four bits, otherwise it will be in the second four.

2.  `>> 4 * ((index + 1) % 2)` shifts the integer from (1) four bits to the right if it is divisible by two.
    Note that `(index + 1) % 2` equals `0` if `index` is odd, and equals `1` if `index` is even.
    (Thus, this statement is numerically equivalent to `!(index % 2)`)

3.  `& 0xF` ensures that our result is 4-bit.
    If shifting happened in (2), this is already the case, but if it didn't, then we need to discard the first four digits.

Now that our prototype is defined, we can freeze it for safety.

    Object.freeze Tileset.prototype

####  Final touches  ####

The `Tileset.collision` object creates constants to represent both a lack of a collision and each of the four collision corners.
Collision data is 4-bit, where each bit signifies a collision corner.
The corners are thus defined as follows (in big-endian binary and hexadecimal):

- `Tileset.collision.NO_COLLISION`: `0000` = `0x0`
- `Tileset.collision.TOPLEFT`: `0001` = `0x1`
- `Tileset.collision.TOPRIGHT`: `0010` = `0x2`
- `Tileset.collision.BOTTOMLEFT`: `0100` = `0x4`
- `Tileset.collision.BOTTOMRIGHT`: `1000` = `0x8`

Note that `Tileset.collision.EMPTY` is synonymous with `Tileset.collision.NO_COLLISION`, and perhaps clearer to type.

We can use bitwise operators to combine collision information.
Thus, a tile which produces collisions on both the top-left and the bottom-right would have the collision value `Tileset.collision.TOPLEFT & Tileset.collision.BOTTOMRIGHT` = `0x9`, or `1001` in big-endian binary.

>   [Issue #49](https://github.com/literallybenjam/jelli/issues/49) :
    Although the fundamental nature of collision-checking will not change, the plan going forward is to support collision resolutions up to at least 32 bits.
    When this change is made, the collision constants listed above will be rendered less-than-helpful for the majority of bit-depths (although the numeric values to which they refer will function as normal).
    In anticipation of this, the collision constants `Tileset.collision.SECTOR_00` through `Tileset.collision.SECTOR_31` have also been defined, as you will see below.
    Under this schema, `TOPLEFT` is synonymous with `SECTOR_00`, `TOPRIGHT` is synonymous with `SECTOR_01`, `BOTTOMLEFT` is synonymous with `SECTOR_02`, and `BOTTOMRIGHT` is synonymous with `SECTOR_03`.

>   To ensure that no duplicates are encountered when enumerating over `Tileset.collision`, only `EMPTY` and `SECTOR_*` constants are provided as enumerable variables.
    This further reinforces them as the preferred forms.

The collision constants are defined as follows:

>   **Note :**
    There are more compact ways of defining these sectors, but the values have been written out for easy reference.

    collision_constants = Object.create(Object.prototype, {
        EMPTY:
            value: 0x0
            enumerable: yes
        NO_COLLISION: {value: 0}
        SECTOR_00:
            value: 0x1
            enumerable: yes
        SECTOR_01:
            value: 0x2
            enumerable: yes
        SECTOR_02:
            value: 0x4
            enumerable: yes
        SECTOR_03:
            value: 0x8
            enumerable: yes
        SECTOR_04:
            value: 0x10
            enumerable: yes
        SECTOR_05:
            value: 0x20
            enumerable: yes
        SECTOR_06:
            value: 0x40
            enumerable: yes
        SECTOR_07:
            value: 0x80
            enumerable: yes
        SECTOR_08:
            value: 0x100
            enumerable: yes
        SECTOR_09:
            value: 0x200
            enumerable: yes
        SECTOR_10:
            value: 0x400
            enumerable: yes
        SECTOR_11:
            value: 0x800
            enumerable: yes
        SECTOR_12:
            value: 0x1000
            enumerable: yes
        SECTOR_13:
            value: 0x2000
            enumerable: yes
        SECTOR_14:
            value: 0x4000
            enumerable: yes
        SECTOR_15:
            value: 0x8000
            enumerable: yes
        SECTOR_16:
            value: 0x10000
            enumerable: yes
        SECTOR_17:
            value: 0x20000
            enumerable: yes
        SECTOR_18:
            value: 0x40000
            enumerable: yes
        SECTOR_19:
            value: 0x80000
            enumerable: yes
        SECTOR_20:
            value: 0x100000
            enumerable: yes
        SECTOR_21:
            value: 0x200000
            enumerable: yes
        SECTOR_22:
            value: 0x400000
            enumerable: yes
        SECTOR_23:
            value: 0x800000
            enumerable: yes
        SECTOR_24:
            value: 0x1000000
            enumerable: yes
        SECTOR_25:
            value: 0x2000000
            enumerable: yes
        SECTOR_26:
            value: 0x4000000
            enumerable: yes
        SECTOR_27:
            value: 0x8000000
            enumerable: yes
        SECTOR_28:
            value: 0x10000000
            enumerable: yes
        SECTOR_29:
            value: 0x20000000
            enumerable: yes
        SECTOR_30:
            value: 0x40000000
            enumerable: yes
        SECTOR_31:
            value: 0x80000000
            enumerable: yes
        TOPLEFT: {value: 1}
        TOPRIGHT: {value: 2}
        BOTTOMLEFT: {value: 4}
        BOTTOMRIGHT: {value: 8}
    })

The collision constants should be frozen and stored in a non-enumerable variable:

    Object.defineProperty Tileset, "collisions", {value: Object.freeze(collision_constants)}

>   **Note :**
    The constants defined here are *aliases*, not symbols.
    You can always use the numeric value of the constants instead.

All that is left to do is provide access to `Tilemap` through `Tileset` and to `Tileset` through the window.
(Both should be frozen.)

    Tileset.Map = Object.freeze(Tilemap)
    @Tileset = Object.freeze(Tileset)

…And we're done!
