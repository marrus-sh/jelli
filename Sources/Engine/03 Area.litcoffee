#  03. AREA  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    ###
    AREA
    The Jelli Game Engine
    ---------------------
    ###

`Area`s are containers of game data which have their own scripting and variables.
Only one `Area` can be loaded at a time.

###  The constructor:

The `Area` constructor takes two arguments: The `game` (of type `Game`) within which to create the `Area`, and `id`, which is the `id` of the `AREA` element.
If you prefer, you may use a numerical index for `id` instead.

    Area  =  (collection , data  =  {})  ->
        JellO.call  @

For convenience, we get `game` from `collection`:

        collection  =  null                unless  collection instanceof Collection
        game        =  collection?.game

`data` must be an `Object`:

        data  =  new Object  data

We can now define the properties of the `Area`.
These properties are not enumerable and often should not be overwritten, so we use `Object.defineProperty` and `Object.defineProperties`.
The `Collection` constructor expects `area.game` to be set, so let's do that first:

        Object.defineProperty  @ , "game" , value : game

The following properties are containers for things we will add to the `Area` later.

        Object.defineProperties  @ ,
            characters : value : new Collection  @ , Character
            images     : value : new Collection  @ , PlacementImage
            maps       : value : []

The `id` property gets the `id` of the `Area`.
However, on setting, it loads a new `Area` instead.

        Object.defineProperty  @ , "id" ,
            get :       =>  id
            set :  (n)  =>  game?.area  =  n

The `clear` property is used to identify when the `area` needs to be redrawn.

        clear  =  yes

We use a getter and setter to make sure that it is always a boolean.
The initial value is `yes` because the map has not yet been drawn.

        Object.defineProperty  @ , "clear" ,
            get :       =>  clear
            set :  (n)  =>  clear  =  !!n

The `x` and `y` properties give the position of the area's origin, used for rendering.

        x  =  0
        y  =  0

They are passed to `Tilemap` as `origin_x` and `origin_y` on setting.
The `clear` property is set whenever `x` or `y` change.

        Object.defineProperties  @ ,
            x :
                get :       =>  x
                set :  (n)  =>
                    return                     unless  isFinite  x  =  +n
                    map   .origin_x  =  x      for     map                   in  @maps
                    @clear           =  yes
                    return              x
            y :
                get :       =>  y
                set :  (n)  =>
                    return                     unless  isFinite  x  =  +n
                    map   .origin_y  =  y      for     map                   in  @maps
                    @clear           =  yes
                    return              y

The `kill` property is just an empty function, intended to be overwritten when an `Area` is used as part of a [`Collection`](04 Collection.litcoffee).

        Object.defineProperty  @ , "kill" ,
            value    :  =>
            writable :      yes

We can now load the maps.
We iterate over each and create the map.

        (@maps[name]  =  try  game.tilesets[map.tileset].makeMap  game.views[map.screen[0]].screens[map.screen[1]].context ,
            map.data
            map.mapwidth
            map.offset[0]    if map.offset?
            map.offset[1]    if map.offset?
            x
            y
        )                for                                      item                                                     , name    in  data.maps

We then freeze `maps` to prevent our list from changing or being corrupted.

        Object.freeze  @maps

Next, we can load the characters and images which have been specified for the area.
This is easy because `characters` and `images` are `Collection`s.

        @characters.load  name , item    for name , item    of  data.characters    if  data.characters?
        @images    .load  name , item    for name , item    of  data.images        if  data.images?

Finally, we can run the initialization code for the `Area`.
Any variables assigned to the `Area` must be declared in the initialization code.

        @run  "init"

We then seal the `Area` to prevent further modification, but allow the overwriting of user-defined variables.

        Object.seal  @

###  The prototype:

The `Area` prototype allows us to `draw` the `Area` and `step` the `Area`'s logic.

    Object.defineProperty  Area , "prototype" , value : Object.freeze  Object.create  JellO:: ,

`draw` iterates over the `maps`, `characters`, and `images` of the `Area` and draws them to `context`, in that order.
It only draws the `maps` if `clear` evaluates to `true`.

        draw : value :  (context)  ->
            do                                             map      .draw    for  map    in  @maps    when  map?.draw?    if  @clear
            @characters.doForEach     (character)  =>  do  character.draw
            @images    .doForEach     (image)      =>  do  image    .draw
            @clear                 =                       no
            return

`step` calls the `Area`'s own `step` function, the `step` functions for its `characters`, in order, and then the `Area`'s' `then` function.

        step : value :  ->
            @run                   "step"
            @characters.doForEach  (character)  =>  do  character.step
            @run                   "then"
            return

###  Final touches:

All that's left is freezing and making available `Area` to the window:

    Object.defineProperty  Jelli , "Area" , value : Area
