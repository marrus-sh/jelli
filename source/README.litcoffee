#  THE JELLI GAME ENGINE  #
Programmed by Margaret Russel

- - -

##  Introduction  ##

This folder contains all of the source code for the Jelli Game Engine.
Jelli is written in Literate CoffeeScript, which means that each source file can be read as Markdown.
The code blocks (indented with four spaces) in each file are the CoffeeScript code.
This file is the [`README`](README.litcoffee), and is, in fact, a file in the engine's source.

####  Browser compatibility  ####

The anticipated (ie, untested) browser compatibility for the Jelli Game Engine and its various modules is as follows:

| Chrome | Firefox | Internet Explorer | Opera | Safari |
| :----: | :-----: | :---------------: | :---: | :----: |
|    7   |   4.0   |         9         |   12  |   5.1  |

A few specific features have higher requirements, however:

#####  touch events  #####

Touch events are often either not supported or hidden behind a preference on desktop browsers.
In addition, touch events on IE mobile is only supported after version 11 with Windows Phone 8.1.

#####  mouse events  #####

Mouse events likewise have higher requirements, due to the engine's dependence on `MouseEvent.pageX` and `MouseEvent.pageY`.
This is supported in all major browsers, but may not work in more antiquated ones (for example, Chrome requires at least version 45).

#####  pixelated images  #####

The Jelli Game Engine currently handles canvas upscaling using CSS to create a pixelated appearance.
This feature is only supported in recent browsers, so older ones may display a blurry image on larger screens.

##### additional notes  #####

Not all browsers will act the same way when multiple elements share the same `id` or `name`.
Non–Gecko-based browsers do not conform with the spec for `HTMLCollection.namedItem()` in these instances and will likely break the script.
Of course, giving multiple elements the same `id` is bad practice anyway, so this is unlikely to pose an issue.

Safari (including on iOS) can sometimes fail to properly clear the canvas in select instances, for reasons that escape me and are likely a bug in Safari code.
(In one instance, one canvas would only clear if a *different* canvas was set to clear on area change, regardless of whether area change actually ever occurred.
I really have no solution to this except mess around until you can get things to work.)

###  Modules:  ###

The Jelli Game Engine depends upon, and is developed alongside, several modules, each seperately encapsulated for portability and reusability.
The modules at this time are:

- [`Screen`](modules/Screen.litcoffee)
- [`Control`](modules/Control.litcoffee)
- [`Poke`](modules/Poke.litcoffee)
- [`Sheet`](modules/Sheet.litcoffee)
- [`Letters`](modules/Letters.litcoffee)
- [`Tileset`](modules/Tileset.litcoffee)

>   [Issue #51](https://github.com/literallybenjam/jelli/issues/51) :
    Support for a `Filter` module is also planned.

You can view the source for each module by viewing the appropriately named `.litcoffee` file in the [modules](modules) directory.

###  Engine:  ###

The game engine, which depends on the aformentioned modules, is itself modular, comprised of a number of interdependent components.
At this time, the list of these components is as follows:

1. [`Jelli`](engine/01 Jelli.litcoffee)
2. [`Game`](engine/02 Game.litcoffee)
3. [`Area`](engine/03 Area.litcoffee)
4. [`Collection`](engine/04 Collection.litcoffee)
5. [`Unit`](engine/05 Unit.litcoffee)
6. [`PlacementImage`](engine/06 PlacementImage.litcoffee)
7. [`Character`](engine/07 Character.litcoffee)

Documentation for each engine module is available in the [engine](engine) directory.

###  How to read this engine:  ###

The best starting point for most readers and developers is reading through the documentation files for the engine itself, starting with the [`Introduction`](engine/00 Introduction.litcoffee), as these provide all of the interfaces necessary for game development.
Nevertheless, the engine relies on the other modules for many of its tasks, and will reference them from time to time.
A policy of focusing on the engine and looking up the other modules when needed is probably the best approach to becoming familiar with the system as a whole.

It is not necessary to understand the code behind this engine in order to put it into use.
In fact, the extensive documentation provided for the engine exists precisely to make it accessible without forcing users to dig through code.
When browsing the source, each block of code is usually explained in the paragraphs immediately preceeding or following it.

This engine is still under active development, and errors in the code are likely present.
Issues may be submitted through [GitHub](https://github.com/literallybenjam/jelli/issues) should any bugs be discovered.

###  Document structure:  ###

Each source file is split into two main parts.
The first, titled "Introduction", outlines and documents the features of the module and how to use them.
The second, titled "Implementation", provides and explains the source code of the module.
Readers looking to use the engine need largely only concern themselves with the first section, but readers aiming for a deeper understanding of how the engine operates should read both.

###  Formatting conventions:  ###

Source files are written in GitHub-Flavored Markdown (GFM), utilizing fenced code-blocks for non-compiled source and the occasional table.

This is a paragraph.
It is in a section titled “Formatting conventions”.
In the Markdown source, each sentence is given its own line.
Variable names, literals, and code excerpts are represented like `this`, whereas `this()` is a function and `<this>` is an element.
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

>   ```coffeescript
>   "This is a sample block of CoffeeScript code.
>   It will not appear in the compiled source."
>   ```

>   ```html
>   <!DOCTYPE html>
>   <p>And here is a block of HTML.</p>
>   ```

This is a line break:

- - -

The CoffeeScript source uses four spaces for indentation.
This aids in visually matching up lines when several paragraphs of text lie between them.

The following is a subsection titled “Case conventions and variable names”.

####  Case conventions and variable names  ####

Variables are named as follows:

- `snake_case` is used for variable and property names.
- `SCREAMING_SNAKE_CASE` is used for symbols and special static values.
- `camelCase` is used for function names
- `PascalCase` (`UpperCamelCase`) is used for object constructors.

Class names are written in `RUNNINGCAPS`.
This is intended to mirror the style of `Element.tagName`, as well as distinguish them from user-defined classes (which presumably are lower- or mixed-case).
Note that HTML class names are, by spec, **not** case-insensitive, and thus the all-caps representation is **required**.

Tag names are written lower-case and wrapped in less-than and greater-than signs.
This distinguishes elements specified by `<tagname>` and elements specified by `CLASS`.
Elements may also be referred to by the DOM interface they implement; for example, `<img>` may be referred to as `HTMLImageElement` when this better reflects the code.

With `data-*` attributes, `runningtext` is used for variable names, but these are *often* given hyphen-separated semantic prefixes.
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
    Written for the CoffeeScript 1.10.0 compiler.
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
