#  THE JELLI GAME ENGINE  #
Programmed by Margaret Russel

- - -

##  Introduction  ##

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
This file is the [`README`](README.litcoffee), and is, in fact, a file in the engine's source.

> The transition from JavaScript to CoffeeScript is still underway, so many of the above modules have not yet been written. They are forthcoming.

###  How to read this engine:  ###

The best starting point for most readers and developers is [`Game`](game.litcoffee), as it provides all of the interfaces necessary for game development.
However, `Game` relies on the other modules for many of its tasks, and will reference them from time to time.
A policy of starting at `Game` and looking up the other modules when needed is probably the best approach to becoming familiar with the engine as a whole.

It is not necessary to understand the code behind this engine in order to put it into use.
In fact, the extensive documentation provided for the engine exists precisely to make it accessible without forcing users to dig through code.
When browsing the source, each block of code is usually explained in the paragraphs immediately preceeding or following it.

This engine is still under active development, and errors in the code are likely present.
Issues may be submitted through [GitHub](https://github.com/literallybenjam/jelli/issues) should any bugs be discovered.

###  Document structure:  ###

Each engine source file is split into two main parts.
The first, titled "Introduction", outlines and documents the features of the module and how to use them.
The second, titled "Implementation", provides and explains the source code of the module.
Readers looking to use the engine largely need only concern themselves with the first section, while readers aiming for a deeper understanding of how the engine operates should read both.

###  Formatting conventions:  ###

This is a paragraph.
It is in a section titled “Formatting conventions”.
In the Markdown source, each sentence is given its own line.
Variable names, literals, and code excerpts are represented like `this`.
This is *emphasis*, and this is **important**.
Here is a [link](http://example.com).

- This is a short unordered list
- In the source, there is minimal padding between and around lines

>   **Note :**
    This is a note.

1.  This is an ordered list
2.  Here is item #2
3.  Short list items like these don't end in periods

>   [Issue ##](https://github.com/literallybenjam/jelli/issues) :
This is a note regarding a known issue.

-   This is an unordered list with paragraph content.
    For these kinds of lists, there is more padding in the source and each sentence ends with a period.

-   Although this is an unordered list, an ordered list with paragraph content would be formatted in much the same way.

This is a line break:

- - -

The following is a subsection titled “Variable naming”.

####  Variable naming  ####

Variables are named as follows:

- `snake_case` is used for variable and property names.
- `SCREAMING_SNAKE_CASE` is used for symbols and special static values.
- `camelCase` is used for function names
- `PascalCase` (`UpperCamelCase`) is used for object constructors.

With `data-*` attributes, `runningtext` is used for variable names, but these are *often* given semantic prefixes.
So you will have `data-bitdepth` but also `data-sprite-width`.
In JavaScript, these become `dataset.bitdepth` and `dataset.spriteWidth`, respectively.

##  Implementation  ##

    "use strict";

    ###
    THE JELLI GAME ENGINE
    Programmed by Margaret Russel
    -----------------------------
    Implemented through several modules in Literate CoffeeScript.
    Source code and resources are available at https://github.com/literallybenjam/jelli/.
    ###

###  License:  ###

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

###  Usage:  ###

Simply include [`jelli.js`](../jelli.js) in the `<head>` of your document to load the script.

    ###
    How To Use:

    The `Game` constructor creates a new game, which is automatically assigned to `document.game`.
    You can choose a different document for game rendering by passing it in as an attribute.
    A document can have only one game assigned to it at a time, and this game is non-configurable.

    A sample loading script might look like this:

        window.addEventListener("load", function () {new Game(document);}, false);
    ###
