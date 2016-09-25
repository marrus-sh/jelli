#  SCREEN  #
Convenient canvas and context packaging

- - -

##  Description  ##

The `Screen` module provides a convenient wrapper object for HTML `<canvas>`s.

###  The `Screen` object:  ###

####  The constructor  ####

#####  SYNTAX  #####

>   ```javascript
>   new Screen(canvas, context);
>   ```

-   **`canvas`**—
    An `HTMLCanvasElement`, or the `id` of one.
    Note that if an `id` is provided, it is assumed to belong to `window.document`.

-   **`context`**—
    The string to pass to `canvas.getContext()`.
    This defaults to `"2d"`.

#####  PROPERTIES  #####

-   **`Screen.prototype`**—
    The `Screen` prototype object.

#####  METHODS  #####

The `Screen()` constructor does not have any methods.

####  `Screen` instances  ####

#####  PROPERTIES  #####

If no canvas has been defined, all of the following properties return `undefined`.

-   **`scrn.canvas`**—
    The `HTMLCanvasElement` associated with the `Screen` instance.
    **Read-only.**

-   **`scrn.context`**—
    The rendering context associated with the `Screen` instance.
    **Read-only.**

-   **`scrn.height`, `scrn.width`**—
    The width and height of the canvas.

-   **`scrn.ownerDocument`**—
    An alias for `scrn.canvas.ownerDocument`.
    **Read-only.**

#####  METHODS  #####

-   **`Screen.prototype.clear()`**—
    Clears the canvas.
    This uses `scrn.context.clearRect()` for `CanvasRenderingContext2D`s and `scrn.context.clear()` for `WebGLRenderingContext`s.
    For other contexts (ie, as a fallback), it calls `scrn.canvas.width = scrn.canvas.width`, which is much slower and less efficient.

###  Examples:  ###

####  Setting up a 2D screen  ####

>   ```html
>   <!DOCTYPE html>
>   <canvas id="canvas"></canvas>
>   <script type="text/javascript"
>       scrn = new Screen("canvas", "2d");  //  The "2d" is optional.
>   </script>

##  Implementation  ##

    "use strict";

    ###
    SCREEN
    Convenient canvas and context packaging
    ---------------------------------------
    ###

`Screen` is a very simple constructor.
Its goal is to provide a simple means of accessing both the canvas and the context for an HTML canvas element.

###  The constructor:  ###

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

The width and height of the canvas are accessible through `Screen` attributes, but require some special getters and setters in case the canvas isn't defined.
Now we go ahead and set the properties:

        Object.defineProperties this, {
            canvas:
                value: canvas
                enumerable: yes
            context:
                value: (canvas.getContext(context) if canvas)
                enumerable: yes
            height:
                get: -> @canvas.height if @canvas
                set: (n) -> @canvas.height = n if @canvas
            ownerDocument: {value: doc}
            width:
                get: ->  @canvas.width if @canvas
                set: (n) -> @canvas.width = n if @canvas
        }

###  The prototype:  ###

The `Screen` prototype is very simple, and just provides a few convenience functions for dealing with canvases.

    Screen.prototype = Object.create(Object.prototype, {

Our first function clears the canvas.
It supports both `"2d"` and `"webgl"` rendering contexts (but not `"webgl2"`, yet).
If the canvas isn't a canvas element, then this function does nothing.

        clear:
            value: ->
                return unless @canvas instanceof HTMLCanvasElement
                switch
                    when @context instanceof CanvasRenderingContext2D then @context.clearRect(0, 0, @canvas.width, @canvas.height)
                    when @context instanceof WebGLRenderingContext then @context.clear(@context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
                    else @canvas.width = @canvas.width
                return

Right now `clear()` is the only prototype function for `Screen`, but more may be added later.
Again, the `Screen` prototype is immutable, so we freeze it:

    })

    Object.freeze Screen.prototype

###  Final touches:  ###

We want screen to be accessible to all the denizens out there, so we attach it to the window object.
However, we don't want them extending the `Screen` constructor willy-nilly.
Such behaviours wouldn't break any of the above code, but it might mess with other scripts that expect `Screen` to only have certain properties defined.
So, to enforce this, we'll go ahead and freeze the whole thing:

    @Screen = Object.freeze(Screen)

…And we're done!
Happy screening!
