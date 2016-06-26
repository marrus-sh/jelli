Jelli Game Engine

#  Screen  #

`Screen` is a very simple constructor.
Its goal is to provide a simple means of accessing both the canvas and the context for an HTML canvas element.

##  The constructor  ##

The `Screen` constructor takes two arguments: `canvas`, of type `HTMLCanvasElement`, and `context`, which should be the string to pass to `canvas.getContext()`.
The former of these arguments can also be passed as a string, in which case Screen will call `document.getElementById` to find the element.
The latter of these arguments defaults to `"2d"`.

    "use strict";

    Screen = (canvas, context = "2d") ->

First we handle the arguments.
Note `doc` is used here to store the owner document, which is not assumed to be `document` (unless `canvas` is not an `HTMLCanvasElement`):

        unless canvas instanceof HTMLCanvasElement
            doc = document
            canvas = doc.getElementById canvas
            unless canvas instanceof HTMLCanvasElement then canvas = undefined
        else
            doc = canvas.ownerDocument

Note in the above code that if no `HTMLCanvasElement` can be found, `canvas` is set to `undefined`.
Now we go ahead and set the properties:

        @canvas = canvas
        @context = if canvas then canvas.getContext context
        @ownerDocument = doc

The width and height of the canvas are accessible through `Screen` attributes, but require some special getters and setters in case the canvas isn't defined.

        Object.defineProperties this, {
            height: {
                get: -> return if @canvas then @canvas.height
                set: (n) -> if @canvas then @canvas.height = n
                enumerated: yes
            }
            width: {
                get: -> return if @canvas then @canvas.width
                set: (n) -> if @canvas then @canvas.width = n
                enumerated: yes
            }
        }

`Screen`s are completely immutable, so here `Object.freeze` prevents them from being modified:

        Object.freeze this

We want screen to be accessible to all the denizens out there, so we attach it to the window object:

    window.Screen = Screen

##  The prototype  ##

The `Screen` prototype is very simple, and just provides a few convenience functions for dealing with canvases.

    Screen.prototype = {

Our first function clears the canvas.
It supports both `"2d"` and `"webgl"` rendering contexts (but not `"webgl2"`, yet).
If the canvas isn't a canvas element, then this function does nothing.

        clear: ->
            unless @canvas instanceof HTMLCanvasElement then return
            if @context instanceof CanvasRenderingContext2D then @context.clearRect(0, 0, @canvas.width, @canvas.height)
            else if @context instanceof WebGLRenderingContext then @context.clear(@context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)

Right now `clear()` is the only prototype function for `Screen`, but more may be added later.
Again, the `Screen` prototype is immutable, so we freeze it:

    }

    Object.freeze Screen.prototype

…And we're done!
Happy screening!
