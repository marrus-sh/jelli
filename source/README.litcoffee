    "use strict";

    ###
    THE JELLI GAME ENGINE
    Programmed by Margaret Russel
    -----------------------------
    Implemented through several modules in Literate CoffeeScript.
    Source code and resources are available at https://github.com/literallybenjam/jelli/.
    ###

- - -

#  Jelli Game Engine  #

This folder contains all of the source code for the Jelli Game Engine.
Jelli is written in Literate CoffeeScript, which means that each source file can be read as Markdown.
The code blocks (indented with four spaces) in each file are the CoffeeScript code.

The Jelli Game Engine is comprised of several modules, each seperately encapsulated for portability and reusability.
Only the `Game` module depends on the others.
The modules at this time are:

- [`Screen`](screen.litcoffee)
- [`Keyboard`](keyboard.litcoffee) [formerly, `Control`]
- [`Sheet`](sheet.litcoffee)
- [`Letters`](letters.litcoffee)
- [`Tileset`](tileset.litcoffee)
- [`Game`](game.litcoffee)

You can view the source for each module by viewing the appropriately named `.litcoffee` file in this repositiory.

> The transition from JavaScript to CoffeeScript is still underway, so many of the above modules have not yet been written. They are forthcoming.

##  License  ##

The Jelli Game Engine is licensed under an MIT License, provided below:

    ###
    MIT License

    Copyright (c) 2016 Margaret Russel

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    ###

##  Usage  ##

Simply include [`jelli.js`](../jelli.js) in the `<head>` of your document to load the script.

    ###
    How To Use:

    The `Game` constructor creates a new game, which is automatically assigned to `document.game`.
    You can choose a different document for game rendering by passing it in as an attribute.
    A document can have only one game assigned to it at a time, and this game is non-configurable.

    A sample loading script might look like this:
        window.addEventListener("load", function () {new Game(document);}, false);
    ###

##  Naming conventions  ##

- `snake_case` is used for variable and property names.
- `SCREAMING_SNAKE_CASE` is used for symbols and special static values.
- `camelCase` is used for function names
- `PascalCase` (`UpperCamelCase`) is used for object constructors.

With `data-*` attributes, `runningtext` is used for variable names, but these are *often* given semantic prefixes.
So you will have `data-bitdepth` but also `data-sprite-width`
In JavaScript, these become `dataset.bitdepth` and `dataset.spriteWidth`, respectively.
