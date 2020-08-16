#  09. VIEW  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    ###
    VIEW
    The Jelli Game Engine
    ---------------------
    ###

The `View` object collects canvas layers together under a single interface, and packages this interface with a [`Control`](../modules/Control.litcoffee).
Multiple `View`s can exist within the same `Game`.

###  The constructor:  ###

The `View` constructor takes two arguments: `game`, its parent game; and a `data` object.

    View  =  (game , data  =  {}) ->

First, of course, we ensure that that's actually what we were given:

        game  =      null            unless game instanceof Game
        data  =  new Object  data

We can now set up the `View` object:

        @height   =  data.dimensions?[1] >>> 0
        @screens  =  {}
        @width    =  data.dimensions?[0] >>> 0

We will store the element that contains the view in `elt`, and assign it to `target` on our object.


        @target  =  elt  =  game?.document?.getElementById  data.element

We can only set up our `View` if we have an `elt`.

        if  elt instanceof Element

`VIEW` elements must be empty except for their screens.
We can clear the `VIEW` by setting its `textContent` to `""`:

            elt.textContent  =  ""

Until we have a chance to lay out the `VIEW`, let's hide its contents:

            elt.style.visibility  =  "hidden"

Then we can load the screens.

            first_screen  =  null
            for              name , screen    of  data.screens or {}
                @screens[name]  = new Screen  (elt.appendChild  game?.document?.createElement  "CANVAS") , "2d"
                first_screen   ?=             @screens[name]
            Object.freeze    @screens

Finally, we can set up the `Control`, basing it off of the first screen's `<canvas>` if possible:

        @control  =  new Control  first_screen?.canvas ? elt ,
            0
            0
            @width
            @height

That's it!
`View`s are immutable, so we can go ahead and freeze them:

        Object.freeze  @

###  The prototype:  ###

`View` has only one prototype function: `layout()`.

    Object.defineProperty  View , "prototype" , value : Object.freeze  Object.create  Object:: ,

`layout()` lays out the `VIEW` element and its child canvases.

        layout : value :  ->

If there is no `VIEW` element associated with the `View`, we obviously can't do much.

            return  unless  @target instanceof Element

First, we style the `VIEW` element itself.
`VIEW`s should not be staticly-positioned, so if it is, we need to change that to `relative`.

            @target.style.position  =  "relative"    if (@target.ownerDocument.defaultView.getComputedStyle  @target).position is "static"

`VIEW`s should not be smaller than their `width` and `height`, so we can try to ensure that with CSS as well:

            @target.style.minWidth  =  @width  + "px"
            @target.style.minHeight =  @height + "px"

All other `VIEW` styling is left to the author.
We record the resultant rendered width and height of the `VIEW` here:

            client_width  = @target.clientWidth
            client_height = @target.clientHeight

The `SCREEN`s within the `VIEW` also need to be laid out.
`layout()` does some quick calculations to ensure that they always end up in the center of the `VIEW`.
We iterate over them as follows:

            for  name , screen    of  @screens
                canvas  =  screen.canvas

First, we set their `width` and `height` to match `VIEW`'s.
We only want to do this if they don't already match, because setting `canvas.width` (even to itself) will clear the canvas.

                canvas.width   =  @width     if  canvas.width  isnt @width
                canvas.height  =  @height    if  canvas.height isnt @height

Next, we calculate the *scaled* width and height for each `SCREEN`.
These are the largest values that (1) are integer multiples of `width` and `height` while (2) still fitting inside of the `VIEW` and (3) maintaining the aspect ratio.

We do this by comparing the `client_width` and `client_height` to `width` and `height`.
If the former's aspect ratio is narrower than the latter, then we base our calculations off of `width`.
Otherwise, we use `height`.

                if  client_width / client_height < @width / @height
                    scaled_width   =  if  client_width < @width      then              client_width                         else  @width  * Math.floor  client_width  / @width
                    scaled_height  =                                       Math.floor  @height * scaled_width  / @width
                else
                    scaled_height  =  if  client_height < @height    then              client_height                        else  @height * Math.floor  client_height / @height
                    scaled_width   =                                       Math.floor  @width  * scaled_height / @height

You will note that we checked to see if `client_width` or `client_height` somehow ended up smaller than `width` or `height` (for example, because of a `max-width` or `max-height` somewhere in the user's CSS).
In these instances, we ensure that the `SCREEN` does not overflow the `VIEW`.

Now that we have calculated the scaled width and height, we can style the `SCREEN`.
First, we need to make it display as a block element (without padding, borders, or margins) and position it absolutely.

                canvas.style.display   =  "block"
                canvas.style.position  =  "absolute"
                canvas.style.margin    =  "0"
                canvas.style.border    =  "none"
                canvas.style.padding   =  "0"

The CSS `width` and `height` of our `SCREEN` are our scaled values.

                canvas.style.width   =  scaled_width  + "px"
                canvas.style.height  =  scaled_height + "px"

Finally, the `top` and `left` values are calculated to center the `SCREEN` in the middle of the `VIEW`.

                canvas.style.top   =  "calc(50% - " + (scaled_height / 2) + "px)"
                canvas.style.left  =  "calc(50% - " + (scaled_width  / 2) + "px)"

We can now make our `VIEW` visible for the world to see!

            @target.style.visibility  =  ""
            return

###  Final touches:  ###

All that's left is to freeze `View` and attach it to the window:

    Object.defineProperty  Jelli , "View" , value : View

Happy viewing!
