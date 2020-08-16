<div align="right">
  <cite>The Jelli Game Engine</cite><br />
  Source and Documentation<br />
  <code>Sources/Modules/Screen.litcoffee</code>
  <hr />
  Copyright © 2016, 2018 Kyebego.<br />
  Released under GNU GPLv3 or any later version; for more information,
    see the license notice at the bottom of this document.
</div>

#  SCREEN  #
Convenient canvas and context packaging

___

##  Description  ##

The `Screen` module provides a convenient wrapper object for HTML `<canvas>`es.

###  The `Screen.Θ` object:

####  The constructor

#####  syntax.

 >  ```javascript
 >  new Screen.Θ(Canvas);
 >  new Screen.Θ(Canvas, Context);
 >  ```

 +  **`Canvas` :**
    An `HTMLCanvasElement`, or the `id` of one.
    Note that if an `id` is provided, it is assumed to belong to
      `window.document`.

 +  **`Context` :**
    The string to pass to `Canvas.getContext`.
    This defaults to `"2d"`.

#####  properties.

 +  **`Screen.Θ.prototype` :**
    The `Screen.Θ` prototype object.

#####  methods.

The `Screen.Θ` constructor does not have any methods.

####  `Screen.Θ` instances

#####  properties.

If no canvas has been defined, all of the following properties return
  `undefined`.

 +  **`$Screen.Canvas` :**
    The `HTMLCanvasElement` associated with the `Screen.Θ` instance.
    **Read-only.**

 +  **`$Screen.Context` :**
    The rendering context associated with the `Screen.Θ` instance.
    **Read-only.**

 +  **`$Screen.Height`, `$Screen.Width` :**
    The width and height of the canvas.

 +  **`$Screen.OwnerDocument` :**
    An alias for `$Screen.Canvas.ownerDocument`.
    **Read-only.**

#####  methods.

 +  **`Screen.Θ.prototype.ClearƑ()` :**
    Clears the canvas.
    This uses `$Screen.Context.clearRect` for
      `CanvasRenderingContext2D`s, `$Screen.Context.clear` for
      `WebGLRenderingContext`s and `WebGL2RenderingContext`s.
    For other contexts (ie, as a fallback), it calls
      `$Screen.Canvas.width = $Screen.Canvas.width`, which is much
      slower and less efficient.

###  Examples:

####  Setting up a 2D screen

 >  ```html
 >  <!DOCTYPE html>
 >  <canvas id="canvas"></canvas>
 >  <script type="text/javascript">
 >    //  = `new Screen.Θ(document.getElementById("canvas"), "2d")`:
 >    var MyScreen = new Screen.Θ("canvas");
 >    MyScreen.Context.fillStyle = "red";
 >    MyScreen.Context.fillRect(0, 0, MyScreen.Width, MyScreen.Height);
 >  </script>
 >  ```

##  Implementation  ##

`Screen` is a very simple module.
Its goal is to provide a straightforward means of accessing both the
  canvas and the context for an HTML canvas element.

`Screen` is defined directly on the `GlobalObject` for use by others.

    Object.defineProperty GlobalObject, "Screen",
      configurable: yes
      value: Screen = Object.defineProperties {},

###  Identity information:

The `ℹ` property provides an identifying URI for the API author of this
  version of Screen.
If you fork Screen and change its API, you should also change this
  value.

        ℹ: value: "#{API}Screen"  #  See `../README.litcoffee`

The `Nº` property provides the version number of this version of
  Screen, as an object with three parts: `Major`, `Minor`, and
  `Patch`.
It is up to the API author (identified above) to determine how these
  parts should be interpreted.
It is recommended that the `toString` and `valueOf` JavaScript methods
  be implemented as well.

        Nº: value: VersionNº  #  See `../README.litcoffee`

###  `Screen.Θ`:

####  The constructor

The `Screen.Θ` constructor takes two arguments: `_Canvas`, of type
  `HTMLCanvasElement`, and `_Context`, which should be the string to
  pass to `_Canvas.getContext()`.
The former of these arguments can also be passed as a string, in which
  case Screen will attempt `GlobalObject.document.getElementById` to
  find the element.
The latter of these arguments defaults to `"2d"`.

    Object.defineProperty GlobalObject.Screen, "Θ",
      value: ScreenΘ = (_Canvas, _Context = "2d") ->

The local variable `Canvas` is the resolved value of `_Canvas`, calling
  `GlobalObject.document.getElementById` if the provided value isn't an
  `HTMLCanvasElement`.

        unless (Canvas = _Canvas) instanceof HTMLCanvasElement
          OwnerDocument = GlobalObject.document
          Canvas = OwnerDocument.getElementById(Canvas)
          Canvas = undefined unless Canvas instanceof HTMLCanvasElement
        else OwnerDocument = Canvas.ownerDocument

Note in the above code that if no `HTMLCanvasElement` can be found,
  `Canvas` is set to `undefined`.

The `Width` and `Height` of the canvas are accessible through instance
  properties, but require some special getters and setters in case the
  canvas isn't defined.
The other properties are very straightforward:

        Object.defineProperties @,
          Canvas:
            value: Canvas
            enumerable: yes
          Context:
            value: Canvas.getContext _Context if Canvas
            enumerable: yes
          Height:
            get: -> @Canvas.height if @Canvas
            set: (_N) -> @Canvas.height = _N if @Canvas
          OwnerDocument: value: OwnerDocument
          Width:
            get: -> @Canvas.width if @Canvas
            set: (_N) -> @Canvas.width = _N if @Canvas

####  The prototype

The `Screen.Θ` prototype is very simple, and just provides a few
  convenience functions for dealing with canvases.

    Object.defineProperty ScreenΘ, "prototype",
      writable: no
      value: Object.create Object::,

`ClearƑ` clears the canvas.
It supports both `"2d"`, `"webgl"`, and `"webgl2"` rendering contexts.
If the `Canvas` isn't an `HTMLCanvasElement`, then this function does
  nothing.

        ClearƑ: value: ->
          return unless @Canvas instanceof HTMLCanvasElement
          switch
            when @Context instanceof CanvasRenderingContext2D
              @Context.clearRect 0, 0, @Width, @Height
            when @Context instanceof WebGLRenderingContext or
              @Context instanceof WebGL2RenderingContext
                @Context.clear @Context.COLOR_BUFFER_BIT |
                  @Context.DEPTH_BUFFER_BIT
            else @Width = @Width
          return

Right now `ClearƑ` is the only prototype function for `Screen`, but
  more may be added later.

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
