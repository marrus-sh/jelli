#  07. CHARACTER  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    ###
    CHARACTER
    The Jelli Game Engine
    ---------------------
    ###

`Character`s are `Unit`s with support for scripting, animation, and multiple sprites.
They are generated from `CHARACTER` elements.

###  The constructor:  ###

The `Character` constructor generates a `Character` from the provided `data`.
It has only two required arguments: `collection` and `data`.
However, the arguments `x`, `y`, and `sprite` may be passed in to initialize the values of those respective properties.
This takes a variety of forms:

- `Character(collection, data)`
- `Character(collection, data, sprite)`
- `Character(collection, data, x, y)`
- `Character(collection, data, x, y, sprite)`

    Character  =  (collection , data  =  {} , optional_args...)  ->

>   **Note :**
    There is no explicit call to `Jelli` here because `Character` inherits from `Unit`, which is already a `Jelli` object.

Because of our optional arguments, we have to do some argument detection.
We'll go ahead and use a `switch` statement:

        switch  optional_args.length
            when  1                        then              current_sprite  =   optional_args[0]
            when  2
                x               =  null    unless  isFinite  x               =  +optional_args[0]
                y               =  null    unless  isFinite  y               =  +optional_args[1]
            when  3
                x               =  null    unless  isFinite  x               =  +optional_args[0]
                y               =  null    unless  isFinite  y               =  +optional_args[1]
                current_sprite  =  optional_args[2]

For convenience, we get `game` from `collection`:

        collection  =  null                unless  collection instanceof Collection
        game        =  collection?.game

We also get our `spritelist` and initialize our `sprites` object:

        spritelist  =  data.spritelist ? {}
        sprites     =  {}

Our `current_sprite` must be a nonnegative integer:

        current_sprite  >>>=  0

We can now load the `Character` sprites.
Sprites can be referenced both by either index or name, so we define the latter to be an alias for the former.
Because neither HTML attributes nor JavaScript object keys distinguish between numbers and strings, we make the additional restriction that names must be non-numeric.

        for  sprite , index    in  spritelist.sprites or []
            sprites[index]        =  try  game.sheets[spritelist.sheet].getSprite  sprite.index , sprite.length    catch    then  null
            sprites[sprite.name]  =       sprites[index]                                                                    if    sprite.name? and isNaN sprite.name

The `sprites` of a `Character` are immutable:

        Object.freeze  sprites

We now have everything we need to initialize `Character` as a `Unit`:

        Unit.call @ ,
            game
            game.screens[data.screen]
            id
            x
            y
            spritelist.box[2]         or sprites[0]?.width
            spritelist.box[3]         or sprites[0]?.height
            spritelist.origin[0]
            spritelist.origin[1]

We can then define additional properties unique to the `Character` object.
The following are non-enumerable, so we use `Object.defineProperties`:

        Object.defineProperties @,
            box_x         : value :                                               spritelist .box[0]                      >> 0
            box_y         : value :                                               spritelist .box[1]                      >> 0
            collides      : value : switch            data.collides
                when  "all"                                            then       Character  .collisions.ALL
                when  "character"                                      then       Character  .collisions.CHARACTER
                when  "map"                                            then       Character  .collisions.MAP
                else                                                              Character  .collisions.DOES_NOT_COLLIDE
            functions     : value :                                               data       .functions
            max_velocity  : value : if      isFinite  data.speedcap    then      +data       .speedcap                                     else  Character.NO_MAX_VELOCITY
            sprite_height : value:                                                sprites[0]?.height                      >> 0
            sprite_width  : value:                                                sprites[0]?.width                       >> 0
            sprites       : value:                                                sprites
            step          : value:                                     @run.bind  @                                            , "step"

There are also some enumerable properties on `Character`.
These all can be modified by users or other functions, so we use getters and setters to ensure that they always return the proper type.

This sets the initial values for these properties:

        current_sprite  =  0    unless sprites[current_sprite]
        direction       =  null
        frame           =  0
        velocity        =  0

And now we can define the getters and setters:

        Object.defineProperties  @ ,
            direction :
                get        :       =>  direction
                set        :  (n)  =>  direction       =  if  isFinite  n    then  +n    else  null
                enumerable :           yes
            frame     :
                get        :       =>  frame
                set        :  (n)  =>  frame           =                            n    if    (isFinite  n = +n) and 0 <= n < sprites[current_sprite].frames
                enumerable :           yes
            sprite    :
                get        :       =>  current_sprite
                set        :  (n)  =>  current_sprite  =                            n    if    sprites[n]?
                enumerable :           yes
            velocity   :
                get        :       =>  velocity
                set        :  (n)  =>  velocity        =                           +n    if    isFinite  n
                enumerable :           yes

Finally, we can run the `Character`'s initialization code, and seal the resulting object.

        @run         "init"
        Object.seal  this

###  The prototype:  ###

The `Character` prototype provides functions for drawing `Character`s, handling collisions, and moving them towards a given point.

    Object.defineProperty  Character , "prototype" , value : Object.freeze  Object.create  Unit:: ,

The `draw()` function is simple: it just calls the `draw()` function of the current sprite.

        draw : value :  ->  @sprites[@sprite]?.draw  @screen?.context ,
            @edges.screen_left - @box_x ,
            @edges.screen_top  - @box_y ,
            @frame

`getCollisionEdge()` is used in the same manner as `Tilemap.getCollisionEdge()`.
However, because `Character`s don't have collision zones, the code is much more simple.

        getCollisionEdge : value :  (edge , x , y)  ->

First we need to make sure that we were passed the arguments that we expect:

            return   unless   (edge is Tileset.Map.BOTTOM_EDGE or edge is Tileset.Map.LEFT_EDGE or edge is Tileset.Map.RIGHT_EDGE or edge is Tileset.Map.TOP_EDGE) and (isFinite x  =  +x) and (isFinite y  =  +y)

If (1) the object doesn't collide with other `Character`s, or (2) the point is outside of the object's bounds, then we return the original coordinate:

            (switch  edge
                when  Tileset.Map.LEFT_EDGE , Tileset.Map.RIGHT_EDGE     then  return  x
                when  Tileset.Map.TOP_EDGE  , Tileset.Map.BOTTOM_EDGE    then  return  y
            )                                                                               unless   @collides & Character.collisions.CHARACTER and (Math.round  @edges.left) < x < (Math.round  @edges.right) and (Math.round  @edges.top) < y < (Math.round  @edges.bottom)

Otherwise, we return the proper edge:

            switch  edge
                when  Tileset.Map.LEFT_EDGE      then  return  Math.round  @edges.left
                when  Tileset.Map.RIGHT_EDGE     then  return  Math.round  @edges.right
                when  Tileset.Map.TOP_EDGE       then  return  Math.round  @edges.top
                when  Tileset.Map.BOTTOM_EDGE    then  return  Math.round  @edges.bottom
            return

`target()` is a convenience function for running `targetBy()` with absolute, instead of relative, coordinates.

        target : value :  (cx , cy)  ->  @targetBy  cx - @x, cy - @y

`targetBy()` moves the character 1 pixel or less towards the provided coordinate, given relative to the character's own origin.
It's two arguments, `dx` and `dy`, specify this coordinate.

>   [Issue #41](https://github.com/literallybenjam/jelli/issues/41) :
    The maximum value of 1px should be configurable through `data-*` attributes.

        targetBy : value :  (dx , dy)  ->

First, we calculate the magnitude of the distance vector:

            d  =  Math.sqrt  dx * dx + dy * dy

Next, we ensure that everything is set up properly for us to do our calculations:

            return  unless  @area instanceof Area and @area.characters instanceof Collection and @area.maps instanceof Object

We set `ix` and `iy` to the `Character`'s initial position.
We will need these later for direction and velocity calculations.

            ix  =  @x
            iy  =  @y

If `d` is larger than the max_velocity, we cap it:

            if  this.max_velocity isnt Character.NO_MAX_VELOCITY and d > this.max_velocity
                dx  =  dx / d * this.max_velocity
                dy  =  dy / d * this.max_velocity

Note, however, that if `d` is smaller than `this.max_velocity`, we don't scale the vector up.

We can now calculate the horizontal movement of the character.

>   **Note :**
    The fact that horizontal movement is calculated first means that if a `Character` walks diagonally while kitty-corner to a collision sector, it will travel horizontally along that sector rather than vertically.
    For example, in the following scenario:

>   |    |    |
>   |----|----|
>   | 　 | ⬛ |
>   | 🐊 | 　 |

>   …🐊 will move horizontally rightward (by `Math.SQRT2 / 2`) if 🐊.targetBy(1, -1) is called.
    This is an extreme edge case (as it requires the `Character` to be lined up *perfectly* along the diagonal), but is worth noting regardless.
    The most important takeway is that, in these scenarios, the `Character` does *not* stand still.

We run two separate cases depending on whether the `Character` is moving to the right or left, but the underlying algorithms are very similar.
Let's look at the rightward case:

            if  dx > 0

First, we set `s` to the right edge of the `Character`, incremented by `dx`.
If a collision is going to happen, it will happen here.

                s  =  @edges.right + dx

Then we check for collisions with the map, if appliciable, by iterating over `maps`:

                if  @collides & Character.collisions.MAP
                    for  map    in  @area.maps

`k` tells us how many collision points we need to check in order to ensure we didn't miss any map sectors.
We take the height of the `Character` and divide it by the height of a map sector.
This still isn't enough if the `Character` happens to be perfectly aligned (note from [the `Tileset` documentation](tileset.litcoffee) that collisions aren't detected on sector edges), so we need to add `2`.
(Just `1` is sufficient, `2` ensures there are no rounding errors.)

                        k  =  Math.floor  @height / (map.tile_height / 2) + 2

>   [Issue #49](https://github.com/literallybenjam/jelli/issues/49) :
    The `/ 2` in the above code assumes each tile is split up into four sectors, two in each direction.
    This is currently how `Tilemap` operates, but the plan is to change this going forward.

We can then iterate over all of our collision points, getting the left collision edge using `getCollisionEdge()`.
If this edge is further left than `s`, we move `s` back to be flush with the edge.

                        j     =   -1
                        while    ++j <= k
                            t  =  map.getCollisionEdge  Tileset.Map.LEFT_EDGE , s , @edges.top + j * @height / k
                            s  =                        t                                                           if s > t

Now, we do the same thing, only iterating over the area's `Character`s.

                if  @collides & Character.collisions.CHARACTER
                    @area.characters.doForEach  (some)  =>

We don't need (or *want*) to check if a `Character` collides with itself, and we also shouldn't check for collisions with `Character`s for which `Character`-collision is disabled.

                        return  if  @ is some or not (some.collides & Character.collisions.CHARACTER)

Our `k` is similar, only we use the `Character` height as our sector.

                        k  =  Math.floor  @height / some.height + 2

…And then we iterate over our points.

                        j     =   -1
                        while    ++j <= k
                            t  =  map.getCollisionEdge  Tileset.Map.LEFT_EDGE , s , @edges.top + j * @height / k
                            s  =                        t                                                           if s > t

If our final `s` is still further right than our original right edge, then we go ahead and move the `Character`:

                @edges.right  =  s    if  s > @edges.right

…And now we do the same thing for leftward motion, only using the left edge:

            if  dx < 0
                s            =  @edges   .left + dx
                if                @collides      & Character.collisions.MAP
                    for                                     map    in  @area.maps
                        k       =  Math.floor    @height /  (map.tile_height / 2) + 2
                        j       =               -1
                        while                  ++j       <= k
                            t  =  map.getCollisionEdge  Tileset.Map.RIGHT_EDGE , s , @edges.top + j * @height  / k
                            s  =                        t                                                              if  s < t
                if              @collides        & Character.collisions.CHARACTER
                    @area.characters.doForEach  (some)  =>
                        return                                              if  @ is some or not (some.collides & Character.collisions.CHARACTER)
                        k       =  Math.floor    @height /  some.height           + 2
                        j       =                -1
                        while                   ++j       <= k
                            t  =  some.getCollisionEdge  Tileset.Map.RIGHT_EDGE , s , @edges.top + j * @height  / k
                            s  =                        t                                                             if s < t
                @edges.left  =  s                                                    if  s < @edges.left

And then for upward and downward motion, switching our widths and heights:

            if  dy > 0
                s              =  @edges   .bottom + dy
                if                @collides        & Character.collisions.MAP
                    for                                     map    in  @area.maps
                        k       =  Math.floor    @width /  (map.tile_width / 2) + 2
                        j       =               -1
                        while                  ++j      <= k
                            t  =  map.getCollisionEdge  Tileset.Map.TOP_EDGE    , @edges.left + j * @width / k , s
                            s  =                                               t                                        if  s > t
                if                @collides        & Character.collisions.CHARACTER
                    @area.characters.doForEach  (some)  =>
                        return                                              if  @ is some or not (some.collides & Character.collisions.CHARACTER)
                        k       =  Math.floor    @width /  some.width           + 2
                        j       =               -1
                        while                  ++j      <= k
                            t  =  some.getCollisionEdge  Tileset.Map.TOP_EDGE    , @edges.left + j * @width / k , s
                            s  =                                               t                                       if s > t
                @edges.bottom  =  s                                                    if  s > @edges.bottom
            if  dy < 0
                s              =  @edges   .top    + dy
                if                @collides        & Character.collisions.MAP
                    for                                     map    in  @area.maps
                        k       =  Math.floor    @width /  (map.tile_width / 2) + 2
                        j       =               -1
                        while                  ++j      <= k
                            t  =  map.getCollisionEdge  Tileset.Map.BOTTOM_EDGE , @edges.left + j * @width / k , s
                            s  =                                               t                                       if  s < t
                if                @collides        & Character.collisions.CHARACTER
                    @area.characters.doForEach  (some)  =>
                        return                                              if  @ is some or not (some.collides & Character.collisions.CHARACTER)
                        k       =  Math.floor    @width /  some.width           + 2
                        j       =               -1
                        while                  ++j      <= k
                            t  =  some.getCollisionEdge  Tileset.Map.BOTTOM_EDGE , @edges.left + j * @width / k , s
                            s  =                                               t                                       if s < t
                @edges.top     =  s                                                    if  s < @edges.top

*(Whew!)*

With that done, our `Character` has been successfully moved.
We now set the `direction` and `velocity` properties based on the change in position.
We can go ahead and overwrite `dx` and `dy`, since we won't be needing their old values anymore.

            dx  =  @x - ix
            dy  =  @y - iy

We use a atan2 function to set the `direction`.
This is an angle in radians, clockwise from due north:

            @direction  =  Math.atan2  dx , -dy

`velocity` uses the same magnitude function we used to calculate `d`:

            @velocity  =  Math.sqrt  dx * dx + dy * dy

>   *Note :*
    `velocity` is thus in units of px/tick

We are now done with the `Character` prototype, and can freeze it and move on.

    Object.freeze  Character.prototype

###  Final touches:  ###

The `Character.collisions` object stores aliases for values used to determine the kinds of objects with which the `Character` collides.
Bitwise operations can be used to check if a `Character` collides with a certain type of object (note that `Character.collisions.ALL is Character.collisions.MAP | Character.collisions.CHARACTER`.)

    Character.collisions  =
        DOES_NOT_COLLIDE : 0x0
        MAP              : 0x1
        CHARACTER        : 0x2
        ALL              : 0x3
    Object.freeze  Character.collisions

The `Character.NO_MAX_VELOCITY` property indicates that a `Character` has no maximum velocity.

    Object.defineProperty  Character , "NO_MAX_VELOCITY" , value : Game.makeIdentifier  "Infinity"

We can now freeze `Character` and make it transparent to the window:

    Object.defineProperty  Jelli , "Character" , value : Character
