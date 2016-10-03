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

        return unless doc instanceof Document and not doc.game?
        Object.defineProperty doc, "game", {value: this}

Next, we remove any `DATA` elements and place them inside `data`, a specially-crafted `<div>` for holding them.

>   **Note :**
    A `<div>` is used instead of a `DocumentFragment` for storing `DATA` elements because it implements `Element`, rather than just `Node`.
    At one time, a new `Document` was used, but this proved too cumbersome to be worthwhile.

        data = doc.createElement("div");
        for item in doc.getElementsByClassName("DATA")
            data.appendChild(item)

We can now set up containers for our various `Game` properties.
We use `Object.defineProperties` because these should not be enumerable.

        Object.defineProperties this, {
            characters: {value: new Collection(this, Character)}
            data: {value: data}
            document: {value: doc}
            functions: {value: document.body.functions}
            images: {value: new Collection(this, PlacementImage)}
            letters: {value: {}}
            screens: {value: {}}
            sheets: {value: {}}
            texts: {value: new Collection(this, Text)}
            tilesets: {value: {}}
            views: {value: {}}
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

Next, we manage the game's `VIEWS` elements and create `View` objects from them.
Note that these are elements in `doc`, not `data`.
We iterate over each:

        for view in doc.getElementsByClassName("VIEW")
            @views[view.id] = new View(this, view)

Many engine functions require accessing `Screen`s without knowing which `View` they belong to, so we also need to bundle all of our `View`'s `Screen`s into a single object:

            @screens[name] = screen for name, screen of @views[view.id].screens

Now, we can freeze both:

        Object.freeze @views
        Object.freeze @screens

Next, we have the various sprite-sheets.
First come our [`Letters`](../modules/Letters.litcoffee):

        @letters[item.id] = new Letters(item, item.getAttribute("data-sprite-width"), item.getAttribute("data-sprite-height"), doc) for item in data.getElementsByClassName("LETTERS")
        Object.freeze @letters

Then our [`Sheet`](../modules/Sheet.litcoffee)s:

        @sheets[item.id] = new Sheet(item, item.getAttribute("data-sprite-width"), item.getAttribute("data-sprite-height")) for item in data.getElementsByClassName("SHEET")
        Object.freeze @sheets

…And finally our [`Tileset`](../modules/Tileset.litcoffee)s (note for this one that we have to create a `Sheet` as part of the process):

        @tilesets[item.id] = new Tileset(new Sheet(item, item.getAttribute("data-sprite-width"), item.getAttribute("data-sprite-height")), item.getAttribute("data-sprite-width"), item.getAttribute("data-sprite-height"), item.getAttribute("data-collisions")?.trim(), Sheet.drawSheetAtIndex) for item in data.getElementsByClassName("TILESET")
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
If it has, then we need to `layout()` our `View`s.

                if @resized
                    view.layout() for i, view of @views

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

We should also draw our `Game`'s characters and images:

                @characters?.doForEach (character) -> character.draw()
                @images?.doForEach (image) -> image.draw()

Next, we draw any text that is currently loaded:

                text.draw() for i, text of @texts

Finally, we reset `resized` and call for the next frame:

                @resized = false
                @window.requestAnimationFrame @draw.bind(this)

####  getDataElement  ####

Safari unfortunately returns a `NodeList` instead of an `HTMLCollection` when using `getElementsByClassName()` or `getElementsByTagName()`, so `getDataElement` takes account of that when trying to access named items.
It takes two arguments: `class`, which is the class of the desired element, and `id`, which is its index or id.

        getDataElement:
            value: (className, id) ->
                elts = if className then @data.getElementsByClassName(className) else @data.getElementsByTagName("*")
                elt = elts.item(id) if typeof id is "number" or id instanceof Number
                return elt if elt?
                qs = if className then "#" + id + "." + className else "#" + id
                return if elts instanceof HTMLCollection and (typeof elts.namedItem is "function" or elts.namedItem instanceof Function) then elts.namedItem(id) else @data.querySelector(qs)
                @window.requestAnimationFrame @draw.bind(this)

####  getDocElement  ####

`getDocElement` is identical to `getDataElement`, only drawing from the entire `Document`.
It is used to find [`View`](09 View.litcoffee)s.

        getDocElement:
            value: (className, id) ->
                elts = if className then document.getElementsByClassName(className) else document.getElementsByTagName("*")
                elt = elts.item(id) if typeof id is "number" or id instanceof Number
                return elt if elt?
                qs = if className then "#" + id + "." + className else "#" + id
                return if elts instanceof HTMLCollection and (typeof elts.namedItem is "function" or elts.namedItem instanceof Function) then elts.namedItem(id) else document.querySelector(qs)


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
                @characters?.doForEach (character) -> character.step()
                @area.step() if @area instanceof Area
                @run("then")
                @window.setTimeout @step.bind(this), 1000/60

- - -

We can now freeze the prototype and be on our way:

    })

    Object.freeze Game.prototype

###  Final touches:  ###

The `defineFunctions()` static method defines the `function_object` for the given `element`.

    Game.defineFunctions = (element, function_object) ->
        element = document.getElementById(element) unless element instanceof Element
        element.functions = Object.freeze(function_object)

The `getSymbol()` static method creates a unique identifier from the given `name`.
If possible, this will be a `Symbol`; otherwise, it will be an `Object` with null prototype.

    Game.getSymbol = (name) -> if Symbol? then Symbol(name) else Object.freeze(Object.create(null, {toString: {value: String.bind(null, name)}}))

As always, we need to freeze `Game` and make it transparent to the window:

    @Game = Object.freeze(Game)
