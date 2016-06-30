#  LETTERS  #
Sprite-based text processing and rendering

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    LETTERS
    Sprite-based text processing and rendering
    ------------------------------------------
    ###

The `Letters` module is used to construct an alphabet from a sprite sheet, and provides mechanisms for rendering this on a canvas.
You will note similarities between this and [Sheet](sheet.litcoffee), but `Letters` is markedly more complex.

###  General functions:  ###

The function `drawLetter()` is called by various letter objects in order to draw a letter onscreen.
It is not exposed to the window.

`drawLetter()` takes four arguments: `letters`, a `Letter` object; `index`, the index of the letter to draw; `context`, a `CanvasRenderingContext2D` on which to draw the letter; and `x` and `y`, the coordinates of the letter's top-left corner.

    drawLetter (letters, index, context, x, y) ->

First, we need to make sure our arguments are what we expect them to be.
If `index`, `x`, or `y` don't resolve to numbers, we can simply set them to `0` instead, but with `letters` and `context`, if they aren't of the right type we will have to abort.

        return unless letters instanceof Letters and index < letters.size and context instanceof CanvasRenderingContext2D
        index = 0 if isNaN(index = Number(index))
        x = 0 if isNaN(x = Math.round(x))
        y = 0 if isNaN(y = Math.round(y))

Next, we need to find the horizontal (`i`) and vertical (`j`) position of the letter in the `Letters` sheet.
We can get this information from `index` with a little math:

        i = index % letters.width
        j = Math.floor(index / letters.width)

Finally, we can draw the letter.
Of course, first we must ensure that everything is as we expect: that `letters.canvas` is an `HTMLCanvasElement`, that `i` and `j` are numbers, and that `letter_width` and `letter_height` are nonzero.
This all happens in the next line:

        context.drawImage(letters.canvas, i * width, j * height, width, height, x, y, width, height) if letters.canvas instanceof HTMLCanvasElement and not isNaN(i) and not isNaN(j) and (width = Number(letters.letter_width)) and height = (Number(letters.letter_height))

###  Letter:  ###

The `Letter` constructor creates a reference to a single letter in a `Letters` object.
For efficiency's sake, the image data for the letter is not stored, only its location.

####  The constructor  ####

The `Letter` constructor takes two arguments, the `letters` (of type `Letters`), and the `index`.

    Letter = (letters, index) ->

First we need to make sure that the arguments are what we expect:

        letters = null unless letters instanceof Letters
        index = 0 if isNaN(index = Number(index))

We can now define the letter properties.
As you can see, `Letter` is a very simple constructor.

        @canvas = if letters then letters.canvas else null
        @draw = drawLetter.bind(this, letters, index)
        @height = if letters then letters.letter_height else 0
        @index = index
        @letters = letters
        @width = if letters then letters.letter_width else 0

`Letter`s are static references, so we can freeze them:

        Object.freeze this

####  The prototype  ####

`Letter` doesn't really have a prototype, but I went ahead and set a simple one anyway:

    Letter.prototype = Object.create(Object.prototype, {draw: {value: ->}})
    Object.freeze Letter.prototype

###  LetterBlock:  ###

A `LetterBlock` is the primary means of drawing strings of letters to the canvas.
They are essentialy composed of lines of `LetterStrings`, which contain the text.

####  The constructor  ####

`LetterBlock`s are constructed with four arguments, giving the `letters` (of type `Letters`), `context` (of type `CanvasRenderingContext2D`), and `x` and `y` position of the top-left corner of the block, followed by some number of strings (or `LetterStrings`, although the former is usually more convenient).

    LetterBlock = (letters, context, x, y, strings...) ->

We first need to make sure that the variables are of the proper type, and if not, set them to their defaults.

        context = null unless context instanceof CanvasRenderingContext2D
        letters = null unless letters instanceof Letters
        x = 0 if isNaN(x = Math.round(x))
        y = 0 if isNaN(y = Math.round(y))

We can now go ahead and assign the strings to numeric indices in the `LetterBlock` object:

        this[index] = (if string instanceof LetterString then string else new LetterString(letters, string)) for string, index in strings

There are several other properties that we also set for convenient access.
We use `Object.defineProperties` because these values should **not** be enumerable:

        Object.defineProperties this, {
            context: {value: context}
            height: {value: strings.length}
            letters: {value: letters}
        }

There are also a number of getters and setters which essentially move through each `LetterString` in the `LetterBlock` and get or set its value.
They all follow basically the same form, so I went ahead and defined it as its own function:

        multiGetter = (prop) ->

`i` is used to track what line we're on, while `n` tracks the value of the property:

            i = 0
            n = 0

If the property value is equal to the length of the line, then continue on to the next line, incrementing `n` by that length:

            n += this[i].length while i++ < @height and this[i][prop] is this[i].length


Otherwise, we've reached the last line where the property is set, so we can calculate the total value:

            return if i < @height then n + this[i][prop] else n

…And now for the setter:

        multiSetter = (prop, n) ->

Again, `i` keeps track of the current line, but this time `n` is passed in as an argument.
It should still be a number though:

            i = 0
            n = 0 if isNaN(n = Number(n))

If `n` is bigger than the length of the line, we overflow to the next line, decrementing `n` by that length:

            n -= this[i][prop] = this[i].length while i++ < @height and n > this[i].length

Otherwise, we've reached the last line, and we set the property to `n`'s remaining value:

            this[i][prop] = n if i < @height

And then we set the property for any further lines to `0`.

            this[i][prop] = 0 while ++i < @height

We can now bind these functions to our properties:

        Object.defineProperties this, {
            delIndex:
                get: multiGetter.bind(this, "delIndex")
                set: multiSetter.bind(this, "delIndex")
            drawIndex:
                get: multiGetter.bind(this, "drawIndex")
                set: multiSetter.bind(this, "drawIndex")
            index:
                get: multiGetter.bind(this, "index")
                set: multiSetter.bind(this, "index")
        }

(For definitions of these properties, see the documentation for `LetterString`, below.)

The `length` property only has a getter; it just adds up all the lengths of each line:

        Object.defineProperty this, "length", {
            get: ->
                i = 0
                n = 0
                n += this[i].length while i++ < @height
                return n
        }

`x` and `y` also have getters and setters, in order to reset the indices and ensure that their values are always numbers.

        Object.defineProperties this, {
            x:
                get: -> x
                set: (n) ->
                    unless isNaN(n)
                        x = Number(n)
                        @delIndex = 0
                        @drawIndex = 0
            y:
                get: -> y
                set: (n) ->
                    unless isNaN(n)
                        y = Number(n)
                        @delIndex = 0
                        @drawIndex = 0
        }

Note that although `x` and `y` reset `drawIndex` and `delIndex`, they do **not** clear the drawing context in any way.
As noted below, `draw()` is the only function which is allowed to draw to a context, for purposes of keeping logic and rendering distinct.
However, because `x` and `y` will have new values the next time `draw()` is called, it will be unable to erase any letters which have already been drawn.
This means that if you move the `LetterBlock` while `drawIndex` is nonzero, you must arrange for canvas clearing yourself.

That completes our property definitions.
`LetterBlock`'s getters and setters rely on having its strings remain constant, so we need to freeze the object:

        Object.freeze this

####  The prototype  ####

The `LetterBlock` prototype is used to get lines and/or letters and draw the block to the context.
It also inherits `advance()`, `clear()`, and `fill()` from `LetterString`.

    LetterBlock.prototype = Object.create(LetterString.prototype, {

The `draw()` function draws the block to the canvas.
It does this by drawing each string in sequence.
The variable `iy` is used to keep track of the current vertical position.

        draw:
            value: ->
                iy = @y
                for index, line of this
                    if line instanceof LetterString then line.draw(@context, @x, iy)
                    iy += @letters.letter_height + 1
                return

Note that one pixel space is drawn between lines.

>   [Issue #41](https://github.com/literallybenjam/jelli/issues/41) :
    It would be nice to be able to configure this amount.

The `item()` function gets a single `Letter` from a `LetterString`.
It is very similar to our `multiGetter` function above:

        item:
            value: (n) ->
                i = 0
                return null if isNaN(n = Number(n))
                n -= this[i].length while this[i++]? and n > this[i].length
                return if this[i]? then this[i].item(n) else null

Finally, the `line()` function gives us the entire `LetterSting` of a given line.

        line: {value: (n) -> if this[n] instanceof LetterString then this[n] else null}

We can now freeze the prototype, and move on to our next constructor:

    })

    Object.freeze LetterBlock.prototype

###  LetterString:  ###

`LetterString` defines a single line of text.
It is mostly just used by `LetterBlock`.

####  The constructor  ####

The `LetterString` constructor only takes two arguments: `letters`, the `Letters` object that the string is associated with; and `data`, which is a string of letter data.
Right now, each character in this string is interpreted as a code-point between `0x0` and `0xFFFF` (UTF-16).

>   [Issue #55](https://github.com/literallybenjam/jelli/issues/55) :
    Strings should be interpreted as 32-bit integers (UTF-32)

    LetterString = (letters, data) ->

If `data` isn't a string, we need to make it one.
And of course, if `letters` isn't a `Letters` we'd better set it to `null`.

        letters = null unless letters instanceof Letters
        data = String(data)

`index` gives the current logical position within the string, while `drawIndex` gives the current drawing position.
If the logical position moves backwards, then we need to erase letters from the canvas, and `delIndex` keeps track of this.
These are all defined using getters and setters to ensure that they always provide integer values.

        delIndex = 0
        drawIndex = 0
        drawIndex = 0

        Object.defineProperties this, {
            delIndex:
                get: -> delIndex
                set: (n) -> delIndex = n unless isNaN(n = Math.round(n))
            drawIndex:
                get: -> drawIndex
                set: (n) -> drawIndex = n unless isNaN(n = Math.round(n))
            index:
                get: -> index
                set: (n) -> index = n unless isNaN(n = Math.round(n))
        }

Next, we have `data` (the source string), `length` (the length of the string), and `letters` (the `Letters` object).
These are non-enumerable and non-writable.

        Object.defineProperties this, {
            data: {value: data}
            length: {value: data.length}
            letters: {value: letters}
        }

Finally, we can add the individual `Letter`s to the `LetterString`.

        this[index] = letters?.item(data.charCodeAt(i)) for letter, index in data

`LetterString`s are immutable, so we can freeze them:

        Object.freeze this

####  The prototype  ####

The `LetterString` prototype is used to advance the indices, get individual letters, and draw the string to the context.

    LetterString.prototype = Object.create(Object.prototype, {

The `advance` function advances the `LetterString` by an optional amount (defaults to `1`).

        advance:
            value: (amount = 1) ->

We do all our math on a separate variable, `i`, to avoid having to call the above getters and setters more often than we need to:

                i = @index

If the `amount` resolves to a number, then we will increment by that amount.
Otherwise, we just increment by `1`.

                i += if isNaN(amount = Math.round(amount)) then 1 else amount

We want to make sure our index is within our bounds: nonnegative and less-than–or–equal-to the length of the block.

                i = 0 if i < 0
                i = @length if i > @length

We can now set the `index`:

                @index = i

If our index moved backwards, we also need to set the `delIndex`:

                @delIndex = i if @delIndex > i

This function returns the final index position:

                return i

Our next function, `clear()`, simply resets `index` and `delIndex` to `0`:

        clear: {value: -> @index = @delIndex = 0}

Note that `clear()` **does not clear the drawing context**.
By design, the only function which draws to or clears a drawing context is `draw()`.
If ensuring that the letters have been cleared from the render is important to you, make sure that `draw()` is called at some point after calling `clear()` before proceeding.

The `draw()` function draws the string to the given `context` with its top-left corner at (`x`, `y`).
For purposes of efficiency, it only draws the string from `drawIndex` to `index`, and then sets `drawIndex` to this value.
If `delIndex` is less than `drawIndex`, it deletes these characters and sets back `drawIndex` first.

        draw:
            value: (context, x, y) ->

First we ensure that our arguments are correct, and we can actually draw the string.
If `x` and `y` aren't numbers, they default to `0`.

                return unless context instanceof CanvasRenderingContext2D and @letters instanceof Letters and (width = Number(@letters.letter_width)) and (height = Number(@letters_letter_height))
                x = 0 if isNaN(x = Math.round(x))
                y = 0 if isNaN(y = Math.round(y))

You may recognize that `unless`-statement from `drawLetter`, above.

Next, we make sure our indices are logical (between `0` and `length`).
Additionally, `delIndex` can't exceed `index`.

                @drawIndex = @length if @drawIndex > @length
                @drawIndex = 0 if @drawIndex < 0
                @delIndex = @index if @delIndex > @index
                @delIndex = 0 if @delIndex < 0

If `drawIndex` is bigger than `delIndex`, then we have some letters to delete:

                if @drawIndex > @delIndex
                    context.clearRect(x + @delIndex * (width + 1), y, (@drawIndex - @delIndex) * (width + 1), height + 1)
                    @drawIndex = @delIndex

You will note from the above that letters are given a 1px padding (on the bottom and right side).

>   [Issue #41](https://github.com/literallybenjam/jelli/issues/41) :
    It would be nice to be able to configure this amount.

We can now draw the letters from `drawIndex` to `index`:

                while @drawIndex < @length and @drawIndex < @index
                    continue unless this[@drawIndex] instanceof Letter
                    this[@drawIndex].draw(context, x + @drawIndex * (width + 1), y)
                    @drawIndex++

Finally, we can reset `delIndex` to `drawIndex`:

                @delIndex = @drawIndex

Our next function is `fill()`.
The inverse to `clear()`, it sets `index` to the length of the `LetterString`.

        fill: {value: -> @index = @length}

Finally, `item()` returns a single `Letter` from the `LetterString`.
It is the same as calling `this[n]`, except that a return value of a `Letter` or `null` is guaranteed:

        item: {value: (n) -> if this[n] instanceof Letter then this[n] else null}

…And our `LetterString`s are done.
We can freeze the prototype to make sure everything stays golden:

    })

    Object.freeze LetterString.prototype

###  Letters:  ###

`Letters` stores the actual sprite-sheet from which the other letter-related functions draw.
It uses its own personal `<canvas>` element to do this, which allows for things such as changing colour.

####  The constructor  ####

The arguments of the `Letters` constructor provide the `source` image, the `letter_width` and `letter_height` of the letters, and the `doc` from which to create the `<canvas>`.
This last argument is optional, and defaults to `document`; **however**, it is very important to set this if the `<canvas>` you are drawing onto exists on a different `Document`, because cross-`Document` `<canvas>` drawing is generally not possible.

Of course, it is equally essential that `source`, if it is an `Element`, also belongs to the same `Document`.
Fortunately, the `Letters` constructor does this automatically.

    Letters = (source, letter_width, letter_height, doc = document) ->

As always, we start by checking that the arguments we received are what we expected: a supported image type, a number, another number, and a `Document`.
(The supported image types are the same as those in [Sheet](sheet.litcoffee).)

        source = undefined unless source instanceof HTMLImageElement or source instanceof SVGImageElement or source instanceof HTMLCanvasElement or createImageBitmap? and source instanceof ImageBitmap
        letter_width = 0 if isNaN(letter_width = Number(letter_width))
        letter_height = 0 if isNaN(letter_height = Number(letter_height))
        doc = document unless doc instanceof Document

Here we import the `source` if it doesn't belong to `doc`:

        source = doc.importNode(source, true) if source instanceof Element and source.ownerDocument isnt doc

We can get the width and height of the image from one of two sources, depending on the source type.
All of the accepted types have `width` and `height` properties, which specify their dimensions.
However, `HTMLImageElement`s also have `naturalWidth` and `naturalHeight` properties, and these should be preferred for pixel-perfect rendering.

If for some reason we can't get *either* of these properties, then the `source_width` and `source_height` are set to zero.

        source_width = 0 unless source? and not isNaN(source_width = Number(if source.naturalWidth? then source.naturalWidth else source.width))
        source_height = 0 unless source? and not isNaN(source_height = Number(if source.naturalHeight? then source.naturalHeight else source.height))

As stated before, the `Letters` sprite-sheet exists on its own special `<canvas>` element.
Provided that a valid `source` has been provided, we create that `<canvas>` here.

        if source?
            canvas = doc.createElement("canvas")
            canvas.width = source_width
            canvas.height = source_height
            context = canvas.getContext("2d")
            context.drawImage(source, 0, 0) unless source instanceof HTMLImageElement and not source.complete

(The `unless` statement of that last line ensures that the `<img>` element is actually fully loaded before drawing the image. If not, the image can always be redrawn with `clearColor()`.)

If no valid `source` was found, then `canvas` and `context` are set to `null`.

        else canvas = context = null

There are a number of non-enumerable properties that we want to set for `Letters`; these are defined below.
Note that `height` and `width` refer to how many sprites wide and tall the canvas is.

        Object.defineProperties this, {
            canvas: {value: canvas}
            context: {value: context}
            height: {value: Math.floor(source_height / letter_height)}
            letter_height: {value: letter_height}
            letter_width: {value: letter_width}
            size: {value: Math.floor(source_height / letter_height) * Math.floor(source_width / letter_width)}
            source: {value: source}
            width: {value: Math.floor(source_width / letter_width)}
        }

Colour handling takes place using the getters and setters of the `color` attribute.

        color = Letters.NO_COLOR

        Object.defineProperty this, "color", {
            get: -> return color
            set: (n) ->

If the `color` is set to `Letters.NO_COLOR`, we clear the `context` and redraw the image:

                if n is Letters.NO_COLOR
                    color = n
                    if @context instanceof CanvasRenderingContext2D
                        @context.clearRect(0, 0, @context.canvas.width, @context.canvas.height)
                        @context.drawImage(@source, 0, 0) unless @source instanceof HTMLImageElement and not @source.complete

Otherwise, we use a composite operation to change the color of everything in the `context`

                else
                    color = String(n)
                    if @context instanceof CanvasRenderingContext2D
                        @context.globalCompositeOperation = "source-in"
                        @context.context.fillStyle = color
                        @context.fillRect(0, 0, @context.canvas.width, @context.canvas.height)
                        @context.globalCompositeOperation = "source-over"
        }

Next, we create `Letter` objects for each letter on the canvas.
For efficiency's sake, these are memorized getters, which don't compute their value until they is needed, but then remember the result afterwards.
In order to allow object freezing, this memorization takes place in a separate array.

        index = this.size
        memory = []

        getIndex: (i) ->
            return if memory[i]? then memory[i] else memory[i] = new Letter(this, i)

        Object.defineProperty(this, index, {get: getIndex.bind(this, index)}) while (index-- > 0)

`Letters` objects are immutable, so we can now freeze the object:

        Object.freeze this

####  The prototype  ####

The `Letters` prototype includes all of the functions one might need to create and use the various letter-objects, as well as functions for managing the current colour.

    Letters.prototype = Object.create(Object.prototype, {

First, we have the `clearColor()` function, which just sets `color` to `Letters.NO_COLOR`, but might be a little more comfortable than using the setter.

        clearColor: {value: -> @color = Letters.NO_COLOR}

Next, we have the `createBlock()`, `createString()`, and `item()` functions, which return a new `LetterBlock`, `LetterString`, and `Letter`, respectively.

`createBlock()` takes three arguments, `context` (a `CanvasRenderingContext2D`) and `x` and `y`, the coordinates of the top-left corner of the block, followed by some number of data strings.
It just passes these to the `LetterBlock` constructor, but with the convenience of not having to type `new`.

        createBlock: {value: (context, x, y, data...) -> new (LetterBlock.bind(null, this, context, x, y, data...))()}

`createString()` takes only one argument, `data`, which is the string data to pass to the `LetterString` constructor.
Like `createBlock`, it is primarily just a convenience function.

        createString: {value: (data) -> new LetterString(this, data)}

Finally, `item()` provides access to the individual `Letter`s.
It gives the same output as `this[]`, but the result is guaranteed to be either a `Letter` or `null` (if none was found).

        item: {value: (i) -> if this[i] instanceof Letter then this[i] else null}

That's the end of the prototype!
(*Whew!*)
Now we can finally freeze it and be done!

    })

    Object.freeze this

####  Final touches:  ####

First and foremost, we need to define the special constant `Letters.NO_COLOR`, referenced above.
If available, we will use the new symbol primitive; otherwise, an object with `null` prototype is just as unique and compact.

    Object.defineProperty Letters, "NO_COLOR", {value: if Symbol? then Symbol("none") else Object.freeze(Object.create(null))}

`Letters` provides our point-of-access for letter-related constructors, so let's freeze them, append them as static methods, and attach `Letters` to the window:

    Letters.Block = Object.freeze(LetterBlock)
    Letters.Letter = Object.freeze(Letter)
    Letters.String = Object.freeze(LetterString)

    @Letters = Object.freeze(Letters)

Happy lettering!
