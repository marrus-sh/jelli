#  08. TEXT  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    TEXT
    The Jelli Game Engine
    ---------------------
    ###

`Text` provides mechanisms for drawing text onscreen via [`LetterBlock`](../modules/Letters.litcoffee)s, designed to work with [`Collection`](../modules/Collection.litcoffee)s.

###  The constructor:  ###

The `Text` constructor generates a `LetterBlock` from the provided `text`.
It has only several required arguments: `collection` and `name`, which hold the same meaning as they do for all `Collection` instances; `screen`, which specifies the screen on which to draw the text; `letters_name`, which gives the name of the `Letters` object to draw the text from; `text`, which holds the text itself; and `isBase64`, which tells if the text needs to be decoded from Base64 before rendering (this defaults to `false`).

    Text = (collection, name, screen, letters_name, text, isBase64 = no) ->

For convenience, we get `game` and `area` from `collection`:

        collection = null unless collection instanceof Collection
        game = if collection? then collection.game else null
        area = if collection? then collection.area else null

Now, let's handle those arguments:

        if game?
            context = game.screens[screen]?.context
            letters = game.letters[letters_name]
            text = game.window.atob(text) if isBase64
        else
            context = letters = null

We can now create the `LetterBlock`:

        Object.defineProperty this, "block", {value: letters?.createBlock.apply(letters, [context, 0, 0].concat(text.split(letters.source.getAttribute("data-linefeed"))))}

For convenience, let's bind the `LetterBlock`'s important functions to the `Text`:

        Object.defineProperties this, {
            advance: {value: @block.advance.bind(@block)}
            clear: {value: @block.clear.bind(@block)}
            fill: {value: @block.fill.bind(@block)}
            item: {value: @block.item.bind(@block)}
            line: {value: @block.line.bind(@block)}
        }

We can also define getters and setters for the `LetterBlock`'s important attributes.

        Object.defineProperties this, {
            delIndex:
                get: -> @block.delIndex
                set: (n) -> @block.delIndex = n
            drawIndex:
                get: -> @block.drawIndex
                set: (n) -> @block.drawIndex = n
            index:
                get: -> @block.index
                set: (n) -> @block.index = n
            length:
                value: @block.length
            x:
                get: -> @block.x
                set: (n) -> @block.x = n
            y:
                get: -> @block.y
                set: (n) -> @block.y = n
        }

We then store `context`, and set up `kill` so it can be overwritten by `Collection`.
We also set up a new property, `color`, which stores the `Text`'s current colour.

        Object.defineProperties this, {
            color:
                value: null
                writable: yes
            context:
                value: context
                enumerable: yes
            kill:
                value: null
                writable: yes
        }

`Text`s are static (with the exception of possibly changing `color`) so we can go ahead and seal them.

        Object.seal this

###  The prototype:  ###

The `Text` prototype is very simple, consisting only of a `draw()` function.

    Text.prototype = Object.create(Object.prototype, {

The `draw()` function sets the appropriate colour for the `Letters` and then draws the `LetterBlock`

        draw:
            value: ->
                return unless @block?.letters instanceof Letters
                if @color then @block.letters.color = @block.letters.source?.getAttribute("data-palette-" + @color) else @block.letters.clearColor()
                @block.draw()

We can now freeze the prototype:

    })

    Object.freeze Text.prototype

###  Final touches:  ###

The only thing left to do is freeze `Text` and add it to the window:

    @Text = Object.freeze(Text)
