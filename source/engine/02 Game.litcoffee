#  02. GAME  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    GAME
    The Jelli Game Engine
    ---------------------
    ###

The `Game` object encapsulates the entire Jelli Game Engine.
Only one `Game` can be defined per `Document` – an important stipulation because `Game` modifies its `Document`'s contents.

###  The constructor:  ##

The `Game` constructor takes only one argument: the `Document` which it should be attached to.
If not provided, this is assumed to be `document`.

    Game = (doc = document) ->
        Jelli.call this

First we need to ensure that `Game` has not already been called for this specific `Document` by checking for the existence of `doc.game`
Then we set `doc.game` to the non-configurable, non-writable value of `this`:

        return if not (doc instanceof Document) or doc.game?
        Object.defineProperty doc, "game", {value: this}

Next, we clear the `body` of `doc` by replacing it with a new `<body>` element.
We store the old `<body>` in the variable `data`, thus maintaining our access to the game's data.
Finally, we set the `visibility` CSS property of `doc.body` to `hidden`, keeping its contents invisible until we get a chance to properly lay it out.

        data = doc.documentElement.replaceChild(doc.createElement("body"), doc.body)
        doc.body.style.visibility = "hidden"

The `placed()` function, only available from inside the `Game` constructor, places a node into `doc` from `data`, by either name or value.

        placed = (node) -> if node instanceof Node then doc.body.appendChild(node) else doc.body.appendChild(data.getElementsByTagName("*").namedItem(node))

We can now set up containers for our various `Game` properties.
We use `Object.defineProperties` because these should not be enumerable.

        Object.defineProperties this, {
            data: {value: data}
            document: {value: doc}
            functions: {value: data.functions}
            letters: {value: {}}
            screens: {value: {}}
            sheets: {value: {}}
            texts: {value: {}}
            tilesets: {value: {}}
            window: {value: doc.defaultView || window}
        }

Note that `window` is `doc`'s `Window`.

Two properties have getters and setters.
`resized` ensures that its value is always a boolean.
`area` returns the current `Area` on getting, and loads a new one on setting.

        area = null
        resized = true
        Object.defineProperties this, {
            area:
                get: -> area
                set: (n) -> if n instanceof Area then area = n else @loadArea(n)
            resized:
                get: -> resized
                set: (n) -> resized = !!n
        }

Next, we load the screens, by `placed()`-ing them and passing them to [`Screen`](../modules/Screen.litcoffee).
Screens must be `<canvas>` elements, and they must have class `SCREEN`.
The first screen to be loaded is used for layout, and is called `placement_screen`.

        for item in data.getElementsByTagName("canvas") when item.classList.contains("SCREEN")
            @screens[item.id] = new Screen(placed(item), "2d")
            unless @placement_screen? then Object.defineProperty(this, "placement_screen", {value: @screens[item.id]})
        Object.freeze @screens

Now that the screens have been loaded, (most importantly, `placement_screen`), we can load our [`Control`](../modules/Control.litcoffee):

        Object.defineProperty this, "control", new Control(@placement_screen.canvas)

Next, we have the various sprite-sheets.
First come our [`Letters`](../modules/Letters.litcoffee):

        @letters[item.id] = new Letters(item, item.getAttribute("data-sprite-width"), item.getAttribute("data-sprite-height"), doc) for item in data.getElementsByClassName("LETTERS")
        Object.freeze @letters

Then our [`Sheet`](../modules/Sheet.litcoffee)s:

        @sheets[item.id] = new Sheet(item, item.getAttribute("data-sprite-width"), item.getAttribute("data-sprite-height")) for item in data.getElementsByClassName("SHEET")
        Object.freeze @sheets

…And finally our [`Tileset`](../modules/Tileset.litcoffee)s (note for this one that we have to create a `Sheet` as part of the process):

        @tilesets[item.id] = new Tileset(new Sheet(item, item.getAttribute("data-sprite-width"), item.getAttribute("data-sprite-height")), item.getAttribute("data-sprite-width"), item.getAttribute("data-sprite-height"), item.getAttribute("data-collisions").trim(), Sheet.drawSheetAtIndex)
        Object.freeze @tilesets

We can now initialize the game code:

        @run("init")

Seal the game:

        Object.seal this

And, finally, add all of the event listeners that we will need to handle:

        @window.addEventListener("resize", this, false)

We can then start the logic and render processes, and get the game rolling:

        @window.requestAnimationFrame @draw.bind(this)
        @step()

###  The prototype:  ###

The `Game` prototype handles various events, draws the game, runs the game logic, and otherwise manages the broad functioning of the engine.

    Game.prototype = Object.create(Jelli.prototype, {

####  clearScreen()  ####

The `clearScreen()` function simply sets a `data-*` attribute on the screen with `id` to remind `draw()` to clear it:

        clearScreen: {value: (id) -> @screens[id].canvas.setAttribute("data-clear", "")}

####  draw()  ####

`draw()` manages the game's rendering process.

        draw:
            value: ->

First, we check to see if the `Game` has been resized.
If it has, then we need to redo `layout`.

                @layout() if @resized

Next, we iterate over the screens and clear them if necessary.

                for i, screen of @screens
                    if screen.canvas.hasAttribute("data-clear")
                        screen.clear()
                        screen.canvas.removeAttribute("data-clear")
                        continue
                    switch screen.canvas.getAttribute("data-type")
                        when "area"
                            screen.clear() if @area instanceof Area and @area.clear
                        when "animation" then screen.clear()

If an area has been loaded, we can draw it:

                @area.draw() if @area instanceof Area

Next, we draw any text that is currently loaded:

                text.draw() for i, text of @texts

Finally, we reset `resized` and call for the next frame:

                @resized = false
                @window.requestAnimationFrame @draw.bind(this)

####  handleEvent()  ####

`handleEvent()` handles all of the events that we added listeners for back in the constructor.
It takes the `Event` as its argument.

        handleEvent:
            value: (e) ->

We run a `switch`-statement based on the `Event`'s `type`:

                switch e.type

On `"resize"`, we set `resize` so that `draw()` knows to redo our layout.

                    when "resize" then @resized = true

That's all for now – the majority of events are handled by [`Control`](../modules/Control.litcoffee).

####  layout()  ####

`layout()` lays out the `Game`, scaling up its screens by the largest integer multiplier.

>   [Issue #47](https://github.com/literallybenjam/jelli/issues/47) :
    This code will likely change considerably in the future.
    Consequently no in-depth explination is provided.

        layout:
            value: ->
                @document.documentElement.style.margin = "0"
                @document.documentElement.style.padding = "0"
                @document.documentElement.style.background = "black"
                @document.documentElement.style.msInterpolationMode = "nearest-neighbor"
                @document.documentElement.style.imageRendering = "-webkit-optimize-contrast"
                @document.documentElement.style.imageRendering = "-moz-crisp-edges"
                @document.documentElement.style.imageRendering = "pixelated"
                @document.documentElement.style.WebkitTouchCallout = "none"
                @document.documentElement.style.webkitTouchCallout = "none"
                @document.documentElement.style.WebkitUserSelect = "none"
                @document.documentElement.style.webkitUserSelect = "none"
                @document.documentElement.style.msUserSelect = "none"
                @document.documentElement.style.MozUserSelect = "none"
                @document.documentElement.style.userSelect = "none"
                @document.body.style.position = "absolute"
                @document.body.style.top = "0"
                @document.body.style.bottom = "0"
                @document.body.style.left = "0"
                @document.body.style.right = "0"
                @document.body.style.margin = "0"
                @document.body.style.border = "none"
                @document.body.style.padding = "0"
                body_width = @document.body.clientWidth
                body_height = @document.body.clientHeight
                for i, screen in @screens
                    canvas = @screens.canvas
                    if body_width / body_height > canvas.width / canvas.height
                        scaled_height = if body_height < canvas.height then body_height else canvas.height * Math.floor(body_height / canvas.height)
                        scaled_width = Math.floor(canvas.width * scaled_height / canvas.height)
                    else
                        scaled_width = if body_width < canvas.width then body_width else canvas.width * Math.floor(body_width / canvas.width)
                        scaled_height = Math.floor(canvas.height * scaled_width / canvas.width)
                    canvas.style.display = "block"
                    canvas.style.position = "absolute"
                    canvas.style.margin = "0"
                    canvas.style.top = "calc(50% - " + (scaled_height / 2) + "px)";
                    canvas.style.left = "calc(50% - " + (scaled_width / 2) + "px)";
                    canvas.style.width = scaled_width + "px"
                    canvas.style.height = scaled_height + "px"
                @document.body.style.visibility = "";

####  loadArea()  ####

`loadArea` simply calls the [`Area`](03 Area.litcoffee) constructor to load a new `Area`.

        loadArea: {value: (index) -> @area = new Area(this, index)}

####  step()  ####

`step` merely calls the `Game`'s step code, and then the `Area`'s, setting a timeout after which the code will be run again.

>   [Issue #41](https://github.com/literallybenjam/jelli/issues/41) :
    Right now, the game runs at 60 ticks per second, but this should be configurable.

        step:
            value: ->
                @run("step")
                @area.step() if @area instanceof Area
                @window.setTimeout @step.bind(this), 1000/60

- - -

We can now freeze the prototype and be on our way:

    })

    Object.freeze Game.prototype

###  Final touches:  ###

As always, we need to freeze `Game` and make it transparent to the window:

    @Game = Object.freeze(Game)
