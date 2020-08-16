#  06. PLACEMENTIMAGE  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    ###
    PLACEMENTIMAGE
    The Jelli Game Engine
    ---------------------
    ###

`PlacementImage` provides a minimal [`Unit`](05 Unit.litcoffee) interface that is far simpler than that provided by [`Character`](07 Character.litcoffee).
It is intended for static images.

###  The constructor:  ###

The `PlacementImage` constructor generates a `PlacementImage` from an `IMAGE` element.
It has only two required arguments: `collection` and `data`.
However, the arguments `x`, `y`, and `placed` may be passed in to initialize the values of those respective properties.
This takes a variety of forms:

- `PlacementImage(collection, data)`
- `PlacementImage(collection, data, placed)`
- `PlacementImage(collection, data, x, y)`
- `PlacementImage(collection, data, x, y, placed)`

Note that if `placed` is not set, it is assumed to be `false`.

    PlacementImage  =  (collection , data , optional_args...)  ->

>   **Note :**
>   There is no explicit call to `Jelli` here because `PlacementImage` inherits from `Unit`, which is already a `Jelli` object.

Because of our optional arguments, we have to do some argument detection.
We'll go ahead and use a `switch` statement:

        switch  optional_args.length
            when  0                              then              placed  =    no
            when  1                              then              placed  =  !!optional_args[0]
            when  2
                x       =    null                unless  isFinite  x       =   +optional_args[0]
                y       =    null                unless  isFinite  y       =   +optional_args[1]
                placed  =    no
            when  3
                x       =    null                unless  isFinite  x       =   +optional_args[0]
                y       =    null                unless  isFinite  y       =   +optional_args[1]
                placed  =  !!optional_args[2]

For convenience, we get `game` from `collection`:

        collection  =  null                unless  collection instanceof Collection
        game        =  collection?.game

We can now get the `elt` specified by our `source`.
Of course, `elt` needs to actually be an image.

        elt  =  if  typeof data.source is "string"    then  game?.document?.getElementById  data.source    else    data.source
        elt  =                                              null                                           unless  elt instanceof HTMLImageElement or elt instanceof SVGImageElement or elt instanceof HTMLCanvasElement or createImageBitmap? and elt instanceof ImageBitmap

We can get the width and height of the `IMAGE` from one of two sources, depending on the `IMAGE` type.
All of the accepted types have `width` and `height` properties, which specify their dimensions.
However, `HTMLImageElement`s also have `naturalWidth` and `naturalHeight` properties, and these should be preferred for pixel-perfect rendering.

If for some reason we can't get *either* of these properties, then the `source_width` and `source_height` are set to zero.

        source_width   =  0    unless  elt? and isFinite  source_width   =  +(elt.naturalWidth  ? elt.width )
        source_height  =  0    unless  elt? and isFinite  source_height  =  +(elt.naturalHeight ? elt.height)

We now have everything we need to initialize `PlacementImage` as a `Unit`:

        Unit.call  @ ,
            game
            game.views[data.screen[0]].screens data.screen[1]
            x
            y
            source_width
            source_height
            data.origin[0]
            data.origin[1]

Of course, we also need to define the `source` and `placed` properties on the `PlacementImage`:

        Object.defineProperties  @ ,
            placed :
                get        :       =>  placed
                set        :  (n)  =>  placed = !!n
            source : value : elt

`PlacementImage`s are static, so we can go ahead and seal them.
However, we can't freeze them, or `Collection` won't be able to overwrite their `kill()` function.

        Object.seal  @

###  The prototype:  ###

The `PlacementImage` prototype is very simple, consisting only of a `draw()` function and a function for toggling placement.

    Object.defineProperty  PlacementImage , "prototype" , value : Object.freeze  Object.create  Unit:: ,

The `draw()` function draws the `PlacementImage` – but only if it is a valid image, loaded, and `placed` has been set to `true`.

        draw : value :  ->  (@screen.context.drawImage @source ,
            Math.floor  @edges.screen_left ,
            Math.floor  @edges.screen_top
        )                                                           if @placed and @screen instanceof Screen and (@source instanceof HTMLImageElement and @source.complete or @source instanceof SVGImageElement or @source instanceof HTMLCanvasElement or createImageBitmap? and (@source instanceof ImageBitmap or @source instanceof ImageBitmap))

The `togglePlacement` function either toggles `placed` or sets it to `n`.

        togglePlacement : value :  (n)  ->  @placed  =  if  n?    then  !!n    else  !@placed

###  Final touches:  ###

The only thing left to do is freeze `PlacementImage`, and add it to the window:

    Object.defineProperty  Jelli , "PlacementImage" , value : PlacementImage
