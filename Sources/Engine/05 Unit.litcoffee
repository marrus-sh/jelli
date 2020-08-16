#  05. UNIT  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    ###
    UNIT
    The Jelli Game Engine
    ---------------------
    ###

`Unit` provides a common interface that [`PlacementImage`](06 PlacementImage.litcoffee) and [`Character`](07 Character.litcoffee) draw upon.
It is not intended to be used on its own.

###  The constructor:

The `Unit` constructor is rather unweildy (ie, it takes a lot of arguments), because it isn't intended for general use.
Here's a list of the arguments in order:

- `game`: The `Game` that the `Unit` belongs to
- `screen`: The `Screen` on which the `Unit` should be drawing
- `x`: The horizontal position of the `Unit`
- `y`: The vertical position of the `Unit`
- `width`: The width of the `Unit`
- `height`: The height of the `Unit`
- `origin_x`: The horizontal location of the `Unit`'s origin, measured from its left edge
- `origin_y`: The vertical location of the `Unit`'s origin, measured from its top edge

You can see these in the constructor below.
`Unit`s are `Jelli`s, so we're sure to call that constructor as well.

    Unit  =  (game , screen , x , y , width , height , origin_x , origin_y)  ->
        Jelli.call  @

Given all of those arguments, our first task is to make sure they are what we expect:

        game         =  null              unless            game     instanceof Game
        screen       =  null              unless            screen   instanceof Screen
        width     >>>=  0
        height    >>>=  0
        origin_x     =  width    /   2    unless  isFinite  origin_x  =          +origin_x
        origin_y     =  height   /   2    unless  isFinite  origin_y  =          +origin_y
        x            =  origin_x          unless  isFinite  x         =          +x
        y            =  origin_y          unless  isFinite  y         =          +y

Now we can define some of those properties.
`x` and `y` are enumerable and modifiable through a getter and a setter.

        Object.defineProperties  @ ,
            area     : get   :       =>  game    .area
            game     : value :           game
            height   : value :           height
            origin_x : value :           origin_x
            origin_y : value :           origin_y
            screen   : value :           screen
            width    : value :           width
            x        :
                enumerable   :           yes
                get          :       =>  x
                set          :  (n)  =>  x              =  +n     if  isFinite  n
            y        :
                enumerable   :           yes
                get          :       =>  y
                set          :  (n)  =>  y              =  +n     if  isFinite  n

The properties `screen_x` and `screen_y` are convenience properties for getting and setting `x` and `y` relative to the top-left corner of the screen.

        Object.defineProperties  @ ,
            screen_x :
                get :       =>         x - @area?.x
                set :  (n)  =>  x  =  +n + @area?.x    if  isFinite  n
            screen_y :
                get :       =>         y - @area?.y
                set :  (n)  =>  y  =  +n + @area?.y    if  isFinite  n

The `kill` property is just an empty function, intended to be overwritten when a `Unit` is used as part of a [`Collection`](04 Collection.litcoffee).

        Object.defineProperty  @ , "kill" ,
            value    :  =>
            writable :      yes

The `edges` property provides a number of convenient properties for accessing the location of the `Unit`, with `screen_*` variants as well.

        Object.defineProperty  @ , "edges" , value : Object.freeze  Object.create  null ,
            top           :
                enumerable :                yes
                get        :       =>       y   - origin_y
                set        :  (n)  =>  y = +n   + origin_y                       if  isFinite  n
            bottom        :
                enumerable :                yes
                get        :       =>       y   - origin_y + height
                set        :  (n)  =>  y = +n   + origin_y - height              if  isFinite  n
            left          :
                enumerable :                yes
                get        :       =>       x   - origin_x
                set        :  (n)  =>  x = +n   + origin_x                       if  isFinite  n
            right         :
                enumerable :                yes
                get        :       =>       x   - origin_x + width
                set        :  (n)  =>  x = +n   + origin_x - width               if  isFinite  n
            screen_top    :
                enumerable :                yes
                get        :       =>       y   - origin_y - @area.y
                set        :  (n)  =>  y = +n   + origin_y + @area.y             if  isFinite  n
            screen_bottom :
                enumerable :                yes
                get        :       =>       y   - origin_y + height - @area.y
                set        :  (n)  =>  y = +n   + origin_y - height + @area.y    if  isFinite  n
            screen_left   :
                enumerable :                yes
                get        :       =>       x   - origin_x - @area.x
                set        :  (n)  =>  x = +n   + origin_x + @area.x             if  isFinite  n
            screen_right  :
                enumerable :                yes
                get        :       =>       x   - origin_x + width - @area.x
                set        :  (n)  =>  x = +n   + origin_x - width + @area.x     if  isFinite  n

With that, we're done defining our `Unit`.
`Unit`s are made to be extended, so we won't freeze them.

        return  @

###  The prototype:

The `Unit` prototype is incredibly simple.

    Object.defineProperty  Unit , "prototype" , value : Object.freeze  Object.create  JellO:: ,

`draw()` is a placeholder function – it should be overwritten by descendants.

        draw : value :  ->

`setPosition` is a simple convenience function for setting `x` and `y`:

        setPosition : value :  (x, y)  ->
            @x  =  x
            @y  =  y

###  Final touches:  ###

All that's left is to freeze `Unit` and make it transparent to the window:

    Object.defineProperty  Jelli , "Unit" , value : Unit
