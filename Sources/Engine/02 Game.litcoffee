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

###  The constructor:

The `Game` constructor takes only one argument: the `Document` which it should be attached to.
If not provided, this is assumed to be `document`.

    Game  =  (doc  =  document , data  =  {})  ->
        JellO.call  @

First we need to ensure that `Game` has not already been called for this specific `Document` by checking for the existence of `doc.game`:

        throw  new Error  "Jelli/Game : No document specified"                      unless  doc        instanceof Document
        throw  new Error  "Jelli/Game : `game` already defined on this document"    if      doc?.game?

Next we set `doc.game` to the non-configurable, non-writable value of `this`:

        Object.defineProperty  doc , "game" , value : @

`data` must be an `Object`:

        data = new Object  data

We can now set up containers for our various `Game` properties.
We use `Object.defineProperties` because these should not be enumerable.

        Object.defineProperties  @ ,
            areas      : value : new Collection  @ , Area
            characters : value : new Collection  @ , Character
            document   : value :     doc
            images     : value : new Collection  @ , PlacementImage
            letters    : value :     {}
            sheets     : value :     {}
            texts      : value : new Collection  @ , Text
            tilesets   : value :     {}
            views      : value :     {}

We set `window` to be `doc`'s `Window`, if possible.

        Object.defineProperty  @ , "window" , value : if  doc.defaultView instanceof Window    then  doc.defaultView    else  window

Two properties have getters and setters.

        area     =  null
        resized  =  yes

`resized` ensures that its value is always a boolean.
`area` returns the current `Area` on getting, and loads a new one on setting.

        Object.defineProperties  @ ,
            area    :
                get :       =>  area
                set :  (n)  =>  area     =  if   n instanceof Area    then  n    else  (@areas[n]    if  @areas[n] instanceof Area)
            resized :
                get :       =>  resized
                set :  (n)  =>  resized  =     !!n

Next, we manage the game's views and create `View` objects for them.
We iterate over each:

        @views[name]  =  new View  @ , view    for  name , view    of  data.views

We freeze our views so that they can't be changed.

        Object.freeze  @views

Next, we have the various sprite-sheets: our [`Letters`](../modules/Letters.litcoffee), our [`Sheet`](../modules/Sheet.litcoffee)s, and finally our [`Tileset`](../modules/Tileset.litcoffee)s (note for this one that we have to create a `Sheet` as part of the process):

        @letters[name]   =                new Letters  new Image  item.src , item.dimensions[0] , item.dimensions[1] , item.spacing , doc                                                                                          for  name , item    of  data.letters
        @sheets[name]    =                new Sheet    new Image  item.src , item.dimensions[0] , item.dimensions[1]                                                                                                               for  name , item    of  data.sheets
        @tilesets[name]  =  new Tileset  (new Sheet    new Image  item.src , item.dimensions[0] , item.dimensions[1]                     ) , item.dimensions[0] , item.dimensions[1] , item.collisions , Sheet.drawSheetAtIndex    for  name , item    of  data.tilesets

We freeze each.

        Object.freeze  @letters
        Object.freeze  @sheets
        Object.freeze  @tilesets

Next, we can load the areas, characters, and images which have been specified for the game.
This is easy because these are all `Collection`s.

        @areas     .load  name , item    for  name , item    of  data.areas         if  data.areas?
        @characters.load  name , item    for  name , item    of  data.characters    if  data.characters?
        @images    .load  name , item    for  name , item    of  data.images        if  data.images?

We can now initialize the game code:

        @run  "init"

Seal the game:

        Object.seal  @

And, finally, add all of the event listeners that we will need to handle:

        @window.addEventListener  "resize" , @ , no

We can then start the logic and render processes, and get the game rolling:

        @window   .requestAnimationFrame  Game::draw.bind  @
        Game::step.call                   @

Lastly, we return our object.

        return  @

###  The prototype:

The `Game` prototype handles various events, draws the game, runs the game logic, and otherwise manages the broad functioning of the engine.

    Object.defineProperty  Game , "prototype" , value : Object.freeze  Object.create  JellO:: ,

####  draw()

`draw()` manages the game's rendering process.

        draw : value :  ->

First, we check to see if the `Game` has been resized.
If it has, then we need to `layout()` our `View`s.

            do  view.layout    for  name , item    of  @views    if  @resized

>  __TODO :__  CLEARING SCREENS

If an area has been loaded, we can draw it:

            do  @area.draw    if  @area instanceof Area

We should also draw our `Game`'s characters and images:

            @characters.doForEach  (character)  =>  do  character.draw
            @images    .doForEach  (image)      =>  do  image.draw

Next, we draw any text that is currently loaded:

            do  text.draw    for  name , item    of  @texts

Now that we have handled any resizing, we can reset `resized`.

            @resized  =  no

Finally, we call for the next frame:

            @window.requestAnimationFrame  Game::draw.bind  @
            return

####  handleEvent()

`handleEvent()` handles all of the events that we added listeners for back in the constructor.
It takes the `Event` as its argument.

        handleEvent : value :  (e)  ->

We run a `switch`-statement based on the `Event`'s `type`:

            switch  e?.type

On `"resize"`, we set `resize` so that `draw()` knows to redo our layout.

                when  "resize"    then  @resized  =  yes

That's all for now – the majority of events are handled by [`Control`](../modules/Control.litcoffee).

            return

####  step()

`step` merely calls the `Game`'s step code, and then the `Area`'s, setting a timeout after which the code will be run again.

>   [Issue #41](https://github.com/literallybenjam/jelli/issues/41) :
    Right now, the game runs at 60 ticks per second, but this should be configurable.

        step : value :  ->
            @run                   "step"
            @characters.doForEach  (character)  =>  do  character.step
            do                     @area.step                            if  @area instanceof Area
            @run                   "then"
            @window.setTimeout     (@step.bind  @) , 1000 / 60
            return

###  Final touches:  ###

The `makeIdentifier()` static method creates a unique identifier from the given `name`.

    Object.defineProperty  Game , "makeIdentifier" , value :  (name)  ->  Object.freeze  Object.create  null , toString : value : String.bind  null , name

As always, we need to freeze `Game` and make it transparent to the window:

    Object.defineProperty  Jelli , "Game" , value : Game
