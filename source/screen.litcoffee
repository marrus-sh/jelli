    "use strict";

    ###
    SCREEN
    Convenient canvas and context packaging
    ---------------------------------------
    ###

- - -

#  Screen  #

`Screen` is a very simple constructor.
Its goal is to provide a simple means of accessing both the canvas and the context for an HTML canvas element.

##  The constructor  ##

The `Screen` constructor takes two arguments: `canvas`, of type `HTMLCanvasElement`, and `context`, which should be the string to pass to `canvas.getContext()`.
The former of these arguments can also be passed as a string, in which case Screen will call `document.getElementById` to find the element.
The latter of these arguments defaults to `"2d"`.

    Screen = (canvas, context = "2d") ->

First we handle the arguments.
Note `doc` is used here to store the owner document, which is not assumed to be `document` (unless `canvas` is not an `HTMLCanvasElement`):

        unless canvas instanceof HTMLCanvasElement
            doc = document
            canvas = doc.getElementById(canvas)
            canvas = undefined unless canvas instanceof HTMLCanvasElement
        else doc = canvas.ownerDocument

Note in the above code that if no `HTMLCanvasElement` can be found, `canvas` is set to `undefined`.
Now we go ahead and set the properties:

        @canvas = canvas
        @context = canvas.getContext(context) if canvas
        @ownerDocument = doc

The width and height of the canvas are accessible through `Screen` attributes, but require some special getters and setters in case the canvas isn't defined.

        Object.defineProperties this, {
            height: {
                get: -> @canvas.height if @canvas
                set: (n) -> @canvas.height = n if @canvas
                enumerated: yes
            }
            width: {
                get: ->  @canvas.width if @canvas
                set: (n) -> @canvas.width = n if @canvas
                enumerated: yes
            }
        }

`Screen`s are completely immutable, so here `Object.freeze` prevents them from being modified:

        Object.freeze this

##  The prototype  ##

The `Screen` prototype is very simple, and just provides a few convenience functions for dealing with canvases.

    Screen.prototype = {

Our first function clears the canvas.
It supports both `"2d"` and `"webgl"` rendering contexts (but not `"webgl2"`, yet).
If the canvas isn't a canvas element, then this function does nothing.

        clear: ->
            return unless @canvas instanceof HTMLCanvasElement
            switch
                when @context instanceof CanvasRenderingContext2D then @context.clearRect(0, 0, @canvas.width, @canvas.height)
                when @context instanceof WebGLRenderingContext then @context.clear(@context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)

Right now `clear()` is the only prototype function for `Screen`, but more may be added later.
Again, the `Screen` prototype is immutable, so we freeze it:

    }

    Object.freeze Screen.prototype

##  Final touches  ##

We want screen to be accessible to all the denizens out there, so we attach it to the window object.
However, we don't want them extending the `Screen` constructor willy-nilly.
Such behaviours wouldn't break any of the above code, but it might mess with other scripts that expect `Screen` to only have certain properties defined.
So, to enforce this, we'll go ahead and freeze the whole thing:

    window.Screen = Object.freeze(Screen)

…And we're done!
Happy screening!
