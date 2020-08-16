<div align="right">
  <cite>The Jelli Game Engine</cite><br />
  Source and Documentation<br />
  <code>Sources/README.litcoffee</code>
  <hr />
  Copyright © 2016, 2018 Kyebego.<br />
  Released under GNU GPLv3 or any later version; for more information,
    see the license notice at the bottom of this document.
</div>

#  THE JELLI GAME ENGINE  #
Programmed by Ᵹʼȷɛꞵɛᵹɔ

___

##  Description  ##

This folder contains all of the source code for the Jelli Game Engine.
Jelli is written in Literate CoffeeScript, which means that each source
  file can be read as Markdown.
The code blocks (indented with four spaces) in each file are the
  CoffeeScript code.
This file is the [`README`](README.litcoffee), and is, in fact, a file
  in the engine's source.

####  Developer compatibility

This program is designed for the kind of developers who would tell
  Rover their name is “cute” when starting up a new game of
  <cite>Animal Crossing</cite>.
Usability for “cool” developers has not been tested.

####  Browser compatibility

The anticipated (ie, untested) browser compatibility for the Jelli Game
  Engine and its various modules is as follows:

| Chrome | Firefox | Internet Explorer | Opera | Safari |
| :----: | :-----: | :---------------: | :---: | :----: |
|    7   |   4.0   |         9         |   12  |   5.1  |

A few specific features have higher requirements, however:

#####  Base64

The `Text` module allows for the passing of strings in Base64.
For the time being, this feature requires Internet Explorer 10.

#####  touch events.

Touch events are often either not supported or hidden behind a
  preference on desktop browsers.
In addition, touch events on IE mobile is only supported after version
  11 with Windows Phone 8.1.

#####  mouse events.

Mouse events likewise have higher requirements, due to the engine's
  dependence on `MouseEvent.pageX` and `MouseEvent.pageY`.
This is supported in all major browsers, but may not work in more
  antiquated ones (for example, Chrome requires at least version 45).

#####  pixelated images.

The Jelli Game Engine currently handles canvas upscaling using CSS to
  create a pixelated appearance.
This feature is only supported in recent browsers, so older ones may
  display a blurry image on larger screens.

#####  additional notes.

Safari (including on iOS) can sometimes fail to properly clear the
  canvas in select instances, for reasons that escape me and are likely
  a bug in Safari code.
(In one instance, one canvas would only clear if a *different* canvas
  was set to clear on area change, regardless of whether area change
  actually ever occurred.
I really have no solution to this except mess around until you can get
  things to work.)

 >  It has been a while since I wrote the above note and it's possible
 >    things have now worked themselves out.

###  Modules:

The Jelli Game Engine depends upon, and is developed alongside, several
  modules, each seperately encapsulated for portability and reusability.
The modules at this time are:

- [`Screen`](Modules/Screen.litcoffee)
- [`Control`](Modules/Control.litcoffee)
- [`Sheet`](Modules/Sheet.litcoffee)
- [`Letters`](Modules/Letters.litcoffee)
- [`Tileset`](Modules/Tileset.litcoffee)
- [`Data`](Modules/Tileset.litcoffee)

>   [Issue #51](https://github.com/marrus-sh/jelli/issues/51) :
    Support for a `Filter` module is also planned.

>   [Issue #63](https://github.com/marrus-sh/jelli/issues/63) :
    Support for a `Media` module is also planned.

You can view the source for each module by viewing the appropriately
  named `.litcoffee` file in the [Modules/](./Modules/) directory.

###  Engine:

The game engine, which depends on the aformentioned modules, is itself
  modular, comprised of a number of interdependent components.
At this time, the list of these components is as follows:

1. [`JellO`](engine/01 JellO.litcoffee)
2. [`Game`](engine/02 Game.litcoffee)
3. [`Area`](engine/03 Area.litcoffee)
4. [`Collection`](engine/04 Collection.litcoffee)
5. [`Unit`](engine/05 Unit.litcoffee)
6. [`PlacementImage`](engine/06 PlacementImage.litcoffee)
7. [`Character`](engine/07 Character.litcoffee)
8. [`Text`](engine/08 Text.litcoffee)
9. [`View`](engine/09 View.litcoffee)

Documentation for each engine module is available in the
  [Engine/](./Engine/) directory.

###  How to read this engine:

The best starting point for most readers and developers is reading
  through the documentation files for the engine itself, starting with
  the [`Introduction`](Engine/00 Introduction.litcoffee), as these
  provide all of the interfaces necessary for game development.
Nevertheless, the engine relies on the other modules for many of its
  tasks, and will reference them from time to time.
A policy of focusing on the engine and looking up the other modules
  when needed is probably the best approach to becoming familiar with
  the system as a whole.

It is not necessary to understand the code behind this engine in order
  to put it into use.
In fact, the extensive documentation provided for the engine exists
  precisely to make it accessible without forcing users to dig through
  code.
When browsing the source, each block of code is usually explained in
  the paragraphs immediately preceding or following it.

This engine is still under active development, and errors in the code
  are likely present.
Issues may be submitted through
  [GitHub](https://github.com/marrus-sh/jelli/issues) should any bugs
  be discovered.

###  Document structure:

Each source file is split into two main parts.
The first, titled "Description", outlines and documents the features of
  the module and how to use them.
The second, titled "Implementation", provides and explains the source
  code of the module.
Readers looking to use the engine need largely only concern themselves
  with the first section, but readers aiming for a deeper understanding
  of how the engine operates should read both.

###  Formatting conventions:

Source files are written in GitHub-Flavored Markdown (GFM), utilizing
  fenced code-blocks for non-compiled source and the occasional table.

This is a paragraph.
It is in a section titled “Formatting conventions”.
`This` is a code excerpt, this is *emphasis*, and this is
  **important**.
Here is a [link](http://example.com/).

 +  This is a short unordered list
 +  In the source, there is minimal padding between and around lines

 >  **Note :**
 >  This is a note.

 1. This is a short ordered list
 2. Here is item #2
 3. Short list items like these don't end in periods

 >  **[Issue ##](https://github.com/marrus-sh/jelli/issues) :**
 >  This is a note regarding a known issue.

 +  This is a list with paragraph content.
    For these kinds of lists, there is more padding in the source and
      each sentence ends with a period.

 +  Although this is an unordered list, an ordered list with paragraph
      content would be formatted in much the same way.

 >  ```coffeescript
 >  "This is a sample block of CoffeeScript code.
 >  It will not appear in the compiled source."
 >  ```

 >  ```javascript
 >  /*
 >      Usually, though, documentation examples are written in plain
 >      JavaScript.
 >  */
 >  ```

 >  ```json
 >  { "example": "Here is a block of JSON." }
 >  ```

 >  ```html
 >  <!DOCTYPE html>
 >  <title>Sample html</title>
 >  <p> And here is a block of HTML.
 >  ```

The following is a line break:

___

The following is a subsection titled “Case conventions and variable names”.

####  Case conventions and variable names

Jelli uses PascalCase for all functions and variables.
Non-constructor functions and methods are suffixed with `Ƒ`.
Constructor functions and methods are suffixed with `Θ`.
Function arguments are prefixed with `_`.
In the documentation, example instances are prefixed with `$`.

HTML class names are written in `RUNNINGCAPS`.
Note that HTML class names are, by spec, case-**sensitive**.

HTML tag names are written lower-case and wrapped in less-than and
  greater-than signs.
This distinguishes elements specified by `<tagname>` and elements
  specified by `CLASS`.
Elements may also be referred to by the DOM interface they implement;
  for example, `<img>` may be referred to as `HTMLImageElement` when
  this better reflects the code.

Element `id`s are written using `hyphenated-text`.
With `data-*` attributes, `runningtext` is used for variable names.

##  Implementation  ##

This is the first file in our Jelli source.
(For the complete source order, see the
  [`INSTALL.litcoffee`](../INSTALL.litcoffee).)
We start things off by entering into strict mode.

    "use strict";

###  Getting the global object:

Jelli is designed to be useäble in (virtually) any browser without any
  fancy compilation or features—just include `/Build/Jelli.min.js`, and
  the various objects are made available to you on the `window` object.
However, it also supports CommonJS `exports`, and will attempt to set
  its properties there if `self` and `window` are not defined.

    GlobalObject = self ? (window ? (exports ? null))
    unless GlobalObject
      throw new ReferenceError "Unable to find global object."

###  Global identity information:

`API` gives the base URI to be used when constructing API identifiers
  for modules.

    API = "https://www.KIBI.family/Jelli/#"

`VersionNº` gives the version number for this version of the Jelli Game
  Engine, which is shared across modules.

    VersionNº = Object.freeze
      Major: 0
      Minor: 2
      Patch: 0
      toString: -> "#{@Major}.#{@Minor}.#{@Patch}"
      valueOf: -> @Major * 100 + @Minor + @Patch / 100

___

<details>
  <summary>License notice</summary>
  <p>This file is a part of The Jelli Game Engine.</p>
  <p>The Jelli Game Engine is free software: you can redistribute it
    and/or modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.</p>
  <p>The Jelli Game Engine is distributed in the hope that it will be
    useful, but WITHOUT ANY WARRANTY; without even the implied warranty
    of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
    General Public License for more details.</p>
  <p>You should have received a copy of the GNU General Public License
    along with this source. If not, see
    <a href="https://www.gnu.org/licenses/">
    https://www.gnu.org/licenses/</a>.</p>
</details>
