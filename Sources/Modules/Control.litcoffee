<div align="right">
  <cite>The Jelli Game Engine</cite><br />
  Source and Documentation<br />
  <code>Sources/Modules/Control.litcoffee</code>
  <hr />
  Copyright © 2016, 2018 Kyebego.<br />
  Released under GNU GPLv3 or any later version; for more information,
    see the license notice at the bottom of this document.
</div>

#  CONTROL  #
Keyboard input tracking; mouse and touch support

___

##  Description  ##

`Control.Θ` objects provide a means of detecting keyboard, mouse, and
  touch input on `window`.
Mouse and touch inputs are provided using `Control.PokeΘ` objects,
  whose coordinates are given relative to a specified element.

###  Keyboard input:

Keyboard input detection does *not* occur automatically; rather, keys
  must be manually added.
You can create a new key using `$Control.AddƑ(Name)` and add codes to
  it using `$Control.AddCodesƑ(Name[, …])`.
These may be strung together; for example,
  `$Control.AddƑ("UP").AddCodesƑ("UP", 0x26, "ArrowUp", "Up")`
  associates the codes `0x26`, `"ArrowUp"`, and `"Up"` with the key
  `"UP"`.
Codes may be in the format of any one of `KeyboardEvent.code`,
  `KeyboardEvent.key`, `KeyboardEvent.keyIdentifier`, or
  `KeyboardEvent.keyCode`, and all of these are checked where
    supported.

There is no limit to the number of codes which may be added for a given
  key; consequently, it might be beneficial to set up keys which map to
  more than one physical key on the keyboard (for example, allowing
  users to press either `W` or `Up`).
You can use `$Control.IsActiveƑ(Name)` to determine whether a key is
  currently being pressed.

###  Pokes:

Mouse clicks and screen touches are stored in `Control.PokeListΘ`s,
  available through the `$Control.Clicks` and `$Control.Touches`
  properties, respectively.
`Control.PokeListΘ` items may be accessed by number using
  `$PokeList.ItemƑ(N)` or by ID using `$PokeList[ID]`.
For clicks, number and id are identical and correspond to the value
  of `MouseEvent.button` for the corresponding mouse event.
For touches, the number provides the ordinal number of the touch
  (first, second, third, etc.), while the ID provides a unique
  reference.
After a `Control.PokeΘ` is created, its number will not change, so
  this is generally the most convenient means of `Control.PokeΘ`
  access.

The starting location of a `Control.PokeΘ` is provided by
  `$Poke.StartX` and `$Poke.StartY`, while its current location is
  provided by `$Poke.X` and `$Poke.Y`.
For example, `$Control.Clicks.ItemƑ(0).X` gives the current
  x-coordinate of the mouse if a left-click has occurred.
If a left click has not occurred, `$Control.Clicks.ItemƑ(0)` will
  return `null`, and the above example will throw a `TypeError`.

It is not currently possible to detect the location of the mouse
  using Control when no button has been pressed.

###  The `Control.Θ` object:

`Control.Θ` objects are the main point of interface for the Control
  module.
If you have multiple screens, you may want to assign a separate
  `Control.Θ` to each.

####  The constructor

#####  syntax.

 >  ```javascript
 >      new Control.Θ();
 >      new Control.Θ(Elt);
 >      new Control.Θ(Elt, X, Y);
 >      new Control.Θ(Elt, X, Y, Width, Height);
 >  ```

 +  **`Elt`**—
    The target element to use as a basis for the control.
    Clicks and touches are only detected if they occur within the
      bounding rectangle of this element.
    The coordinate system for this detection can be further refined
      using the remaining arguments.
    The default value of `Elt` is `document.body`.

 +  **`X`, `Y`**—
    The distance from the left and top edges of `Elt`, respectively,
      for the coordinate system's origin.
    The unit of these distances is determined by `Width` and `Height`.
    Both of these values default to `0`.

 +  **`Width`, `Height`**—
    The number of units wide and tall, respectively, `Elt` is.
    For example, if `Elt` is actually 200 pixels wide but a value of
      `100` is passed for `width`, then each control unit will be two
      pixels.
    (This facilitates consistent relative coordinates for dynamically
      sized content.)
    These values default to `Elt.Width` and `Elt.Height`, if these are
      defined, or `Elt.clientWidth` and `Elt.clientHeight` if not.

#####  properties.

 +  **`Control.Θ.prototype`**—
    The `Control.Θ` prototype object.

#####  methods.

The `Control.Θ` constructor does not have any methods.

####  `Control.Θ` instances  ####

#####  properties.

 >  **Note :**
 >  Because all `Poke` coordinates are stored using control-units,
 >    attempting to change the coordinate system after object creation
 >    is not feasible.
 >  Consequently, coordinate-system–related attributes are read-only.

 +  **`$Control.Clicks` :**
    A `Control.PokeListΘ` containing all detected clicks on
      `$Control.Target`.

 +  **`$Control.Codes` :**
    An object whose own properties give the codes and their associated
      key names defined on the `Control.Θ` instance.
    This object may be modified directly to add new codes, but it is
      **highly recommended** that the `Control.Θ` instance methods be
      used instead.

 +  **`$Control.Width`, `$Control.Height` :**
    The height and width of `$Control.Target`, in control-units.
    These are set on object creation and **read-only**.

 +  **`$Control.Keys` :**
    An object whose own properties give the keys defined on the
      `Control.Θ` instance, and their current state.
    This object may be modified directly to add new keys, but it is
      **highly recommended** that the `$Control.Θ` instance methods be
      used instead.

 +  **`$Control.OwnerDocument` :**
    The `Document` whose `defaultView` is used for event detection.
    This defaults to `$Control.Target.ownerDocument`, and uses
      `GlobalObject.document` as a fallback in case the former is not
      defined.
    This value is **read-only**.

 +  **`$Control.Target` :**
    The target element.
    Only clicks and touches which occur within the bounds of this
      element are considered.
    This value is **read-only**.

 +  **`$Control.Touches` :**
    A `Control.PokeListΘ` containing all currently-detected touches on
      `$Control.Target`.

 +  **`$Control.X`, `ctrl.Y` :**
    The coordinates of the origin of the control coordinate system, in
      control-units.
    These are set on object creation and **read-only**.

 >  **[Issue #67](https://github.com/marrus-sh/jelli/issues/67) :**
 >  Right now the prototype chain is also checked for `$Control.Keys`
 >    and `$Control.Codes`, but support for this is anticipated to be
 >    removed in the future.

#####  methods.

Unless otherwise specified, `Control.Θ` instance methods return the
  given instance to allow the chaining of commands.

 +  **`Control.Θ.prototype.AddƑ(name)` :**
    Adds a new key to the control with name `name`.

 +  **`Control.Θ.prototype.AddCodesƑ(name[, …])` :**
    Adds any number of codes to the key with name `name`.
    These should match the form of `KeyboardEvent.code`,
      `KeyboardEvent.key`, `KeyboardEvent.keyIdentifier`, or
      `KeyboardEvent.keyCode`.
    If `name` has not already been added to the control instance as a
      key, this method does nothing.
    Note that each code may only be associated with one key at a time.

 +  **`Control.Θ.prototype.GetNameƑ(code)`**—
    Given a code `code`, returns the associated key name.
    If no key has been specified for the given code, returns
      `undefined`.

 +  **`Control.Θ.prototype.IsActiveƑ(name)`**—
    Checks to see whether the key with name `name` is currently active.
    This is a safer alternative to calling `!!$Control.Keys[name]`.

 +  **`Control.Θ.prototype.IsCodeActiveƑ(code)`**—
    Checks to see whether the key associated with `code` is currently
      active.
    Note that this does not necessarily mean that `code` itself is
      currently in use.

 +  **`Control.Θ.prototype.IsCodeDefinedƑ(code)`**—
    Checks to see whether the code given by `code` is currently defined
      and associated with a valid key.

 +  **`Control.Θ.prototype.IsDefinedƑ(name)`**—
    Checks to see whether the key with name `name` has been defined.
    This is a safer alternative to calling
      `$Control.Keys.hasOwnProperty(name)`.

 +  **`Control.Θ.prototype.RemoveƑ(name)`**—
    Removes the key with name `name` and all associated codes.

 +  **`Control.Θ.prototype.RemoveCodesƑ([…])`**—
    Removes the given codes.

 +  **`Control.Θ.prototype.ToggleƑ(name[, value])`**—
    Toggles the key with name `name`.
    If `value` is provided, the key with name `name` is instead set to
      `!!value`.
    This can be used to emulate keyboard keys (for example, on touch
      devices), or to toggle "hidden" keys (keys with no codes
      attached).
    This method returns the value which the key was set to if
      successful, or `undefined` if not.

 +  **`Control.Θ.prototype.ToggleCodeƑ(code[, value])`**—
    Toggles the key associated with code `code`.
    If `value` is provided, the key associated with code `code` is
      instead set to `!!value`.
    This method returns the value which the key was set to if
      successful, or `undefined` if not.

 +  **`Control.Θ.prototype.handleEvent(event)`**—
    Used to handle mouse, touch, and keyboard events.
    The listeners for event handling are created automatically upon
      `Control.Θ` creation, so this method should not ever be called
      directly.
    Returns `undefined`.

###  The `Control.PokeΘ` object:

The `Control.PokeΘ` object is used to store information about clicks
  and touches.
You shouldn't ever have to create these yourself.

####  The constructor

#####  syntax.

 >  ```javascript
 >      new Control.PokeΘ(Elt, E, N);
 >      new Control.PokeΘ(Elt, E, N, X, Y);
 >      new Control.PokeΘ(Elt, E, N, X, Y, Width, Height);
 >  ```

 +  **`Elt` :**
    The target element to use as a basis for the `Control.PokeΘ`
      instance.

 +  **`E` :**
    The `MouseEvent` or `Touch` to use when creating the
      `Control.PokeΘ`.
    `E.pageX` and `E.pageY` are used to determine the location of the
      `Control.PokeΘ` instance.

 +  **`N` :**
    The "number" of the `Poke`.
    This *should* be a JavaScript number, but this is not enforced.

 +  **`X`, `Y` :**
    The distance from the left and top edges of `Elt`, respectively,
      for the coordinate system's origin.
    The unit of these distances is determined by `Width` and `Height`.
    Both of these values default to `0`.

 +  **`Width`, `Height` :**
    The number of units wide and tall, respectively, `Elt` is.
    For example, if `Elt` is 200 pixels wide but a value of `100` is
      passed for `width`, then each control unit will be two pixels.
    (This facilitates consistent relative coordinates for dynamically
      sized content.)
    These values default to `Elt.Width` and `Elt.Height`, if these are
      defined, or `Elt.clientWidth` and `Elt.clientHeight` if not.

 >  [Issue #58](https://github.com/marrus-sh/jelli/issues/58) :
 >  Control may use different attributes for determining
 >    `Control.PokeΘ` position in the future.

#####  properties.

 +  **`Control.PokeΘ.prototype`**—
    The `Control.PokeΘ` prototype object.

#####  methods.

The `Control.PokeΘ` constructor does not have any methods.

####  `PokeΘ` instances

#####  properties.

All `Control.PokeΘ` properties are **read-only**, with the exception of
  `X` and `Y`.

 +  **`$Poke.Number` :**
    The number of the `Control.PokeΘ` instance.

 +  **`$Poke.OriginHeight`, `$Poke.OriginWidth`, `$Poke.OriginX`,
      `$Poke.OriginY` :**
    These define the coordinate system used to place the
      `Control.PokeΘ` instance within `$Poke.Target`.

 +  **`$Poke.StartX`, `$Poke.StartY`**—
    The starting position of the `Control.PokeΘ` instance.

 +  **`$Poke.Target`**—
    The target of the poke.

 +  **`$Poke.X`, `$Poke.Y`**—
    The current position of the `Control.PokeΘ` instance.

#####  methods.

 +  **`Control.PokeΘ.prototype.UpdateWithƑ(E)`**—
    Updates the `Control.PokeΘ` instance using the provided
      `MouseEvent` or `Touch`.

###  The `Control.PokeListΘ` object:

The `Control.PokeListΘ` object is used to collect `Control.PokeΘ`s in
  an ordered manner.
You shouldn't ever have to create these yourself.

####  The constructor

#####  syntax.

 >  ```javascript
 >  new Control.PokeListΘ(Elt);
 >  new Control.PokeListΘ(Elt, X, Y);
 >  new Control.PokeListΘ(Elt, X, Y, Width, Height);
 >  ```

`Control.PokeListΘ` takes the same arguments as `Control.Θ`, with the
  same meanings.

#####  properties.

 +  **`Control.PokeListΘ.prototype`**—
    The `Control.PokeListΘ` prototype object.

#####  methods.

The `Control.PokeListΘ()` constructor does not have any methods.

####  `Control.PokeListΘ` instances

#####  properties.

 +  **`$PokeList.Height`, `$PokeList.Width`, `$PokeList.X`,
      `$PokeList.Y` :**
    These define the coordinate system used to place the
      `Control.PokeListΘ` instance within `$PokeList.Target`.

 +  **`$PokeList.Target`**—
    The target of the pokes in the `Control.PokeListΘ` instance.

 +  **`$PokeList[ID]`**—
    Accesses the `$Poke` with `ID`.

#####  METHODS  #####

 +  **`Control.PokeListΘ.prototype.AddƑ(ID, E, N)`**—
    Creates a new `Control.PokeΘ` instance with `ID` and number `N`
      from the `MouseEvent` or `Touch` `E` and adds it to the
      `Control.PokeListΘ` instance.

 +  **`Control.PokeListΘ.prototype.DeleteItemƑ(N)`**—
    Deletes the `Control.PokeΘ` instance with number `N` from the
      `Control.PokeListΘ` instance.

 +  **`Control.PokeListΘ.prototype.ItemƑ(N)`**—
    Accesses the `Control.PokeΘ` instance with number `N` in the
      `Control.PokeListΘ` instance.

###  Examples:

####  Creating a control and tracking the arrow keys

 >  ```javascript
 >  var Ctrl = new Control.Θ();
 >  Ctrl.AddƑ("DOWN") .AddCodesƑ("down",  0x28, "ArrowDown",  "Down")
 >      .AddƑ("LEFT") .AddCodesƑ("left",  0x25, "ArrowLeft",  "Left")
 >      .AddƑ("RIGHT").AddCodesƑ("right", 0x27, "ArrowRight", "Right")
 >      .AddƑ("Up")   .AddCodesƑ("up",    0x26, "ArrowUp",    "Up")   ;
 >  ```

####  Using percentages as control-units

 >  ```javascript
 >  var Ctrl = new Control.Θ(document.body, 0, 0, 100, 100);
 >  ```

####  Simulating keyboard input

 >  ```html
 >  <!DOCTYPE html>
 >  <div id="faux_spacebar"></div>
 >  <script type="text/javascript">
 >    var Ctrl = new Control.Θ();
 >    Ctrl.AddƑ("SPACE").addCodes("space", 0x31, "Space");
 >    document.getElementById("faux_spacebar").addEventListener(
 >      "mousedown", Ctrl.Toggle.bind(Ctrl, "space", true), false
 >    );
 >    document.getElementById("faux_spacebar").addEventListener(
 >      "mouseup", Ctrl.Toggle.bind(Ctrl, "space", false), false
 >    );
 >  </script>
 >  ```

####  Using the mouse to simulate touches

 >  ```javascript
 >  Ctrl = new Control();
 >  FirstTouchOrClick = Ctrl.Touches.ItemƑ(0) || Ctrl.Clicks.ItemƑ(0);
 >  ```

##  Implementation  ##

`Control` provides mechanisms for tracking keyboard input, mouse
  clicks, and touch points.
It is defined directly on the `GlobalObject` for use by others.

    Object.defineProperty GlobalObject, "Control",
      configurable: yes
      value: Control = Object.defineProperties {},

###  Identity information:

The `ℹ` property provides an identifying URI for the API author of this
  version of Control.
If you fork Control and change its API, you should also change this
  value.

        ℹ: value: "#{API}Control"  #  See `../README.litcoffee`

The `Nº` property provides the version number of this version of
  Control, as an object with three parts: `Major`, `Minor`, and
  `Patch`.
It is up to the API author (identified above) to determine how these
  parts should be interpreted.
It is recommended that the `toString` and `valueOf` JavaScript methods
  be implemented as well.

        Nº: value: VersionNº  #  See `../README.litcoffee`

###  `Control.PokeΘ`:

`Control.PokeΘ` tracks clicks and touches.

####  The constructor

The `Control.PokeΘ` constructor takes seven arguments: `_Elt`, which
  specifies the area relative to which `Poke` coordinates should be
  defined; `_E`, which should be either a `MouseEvent` or a `Touch`;
  `_N`, which should be a number (this is not inforced, though); and
  `_X`, `_Y`, `_Width`, and `_Height`, which define the coordinate
  system from which to calculate coordinates.

    Object.defineProperty GlobalObject.Control, "PokeΘ",
      value: ControlPokeΘ = (_Elt, _E, _N, _X, _Y, _Width, _Height) ->

Local variables must be initialized from the passed arguments before
  any further processing can begin.

        Target = _Elt if _Elt instanceof Element
        OriginX = 0 if isNaN(OriginX = Number(_X))
        OriginY = 0 if isNaN(OriginY = Number(_Y))
        OriginWidth = null if isNaN OriginWidth = +_Width
        OriginHeight = null if isNaN OriginHeight = +_Height
        StartX = NaN
        StartY = NaN

Some properties require `Target` to fully initialize.

        if Target?
          OriginWidth ?= Target.width ? Target.clientWidth
          OriginHeight ?= Target.height ? Target.clientHeight

`StartX` and `StartY` give the initial coordinates of the instance,
  relative to `Elt` and according to the provided coordinate scheme.

          Rect = do Target.getBoundingClientRect
          if _E?
            StartX = (_E.pageX - Rect.left - OriginX) * OriginWidth /
              Target.clientWidth
            StartY = (_E.pageY - Rect.top - OriginY) * OriginHeight /
              Target.clientHeight

This is enough to define all of the instance's properties.
Only `X` and `Y` are writable.

        Object.defineProperties @,
          Number: value: _N
          OriginHeight: value: OriginHeight
          OriginWidth: value: OriginWidth
          OriginX: value: OriginX
          OriginY: value: OriginY
          StartX: value: StartX
          StartY: value: StartY
          Target: value: Target
          X:
            value: StartX
            writable: yes
          Y:
            value: StartY
            writable: yes


####  The prototype

The `Control.PokeΘ` prototype contains only one function:
  `UpdateWithƑ`, which updates an instance based on a `MouseEvent` or
  `Touch`.

    Object.defineProperty ControlPokeΘ, "prototype",
      writable: no,
      value: Object.create Object::,
        UpdateWithƑ: value: (_E) ->
          return unless @Target instanceof Element and typeof _E is "object"
          Rect = do @Target.getBoundingClientRect
          if _E?
            X = (_E.pageX - Rect.left - @OriginX) * @OriginWidth /
              @Target.clientWidth
            Y = (_E.pageY - Rect.top - @OriginY) * @OriginHeight /
              @Target.clientHeight
          @X = X unless isNaN X
          @Y = Y unless isNaN Y
          return

###  `Control.PokeListΘ`:

`Control.PokeListΘ` is a convenient object used for storing
  `Control.PokeΘ` instances.

####  The constructor

The `Control.PokeListΘ` constructor takes in the same arguments as
  `Control.Θ` (see below), with the same meanings.
The constructor just stores these values for later, then exits.

    Object.defineProperty GlobalObject.Control, "PokeListΘ",
      value: ControlPokeListΘ = (_Elt, _X, _Y, _Width, _Height) ->
        Target = if _Elt instanceof Element then _Elt else
          GlobalObject.document.body
        X = 0 if isNaN(X = Number(_X))
        Y = 0 if isNaN(Y = Number(_Y))
        Width = null if isNaN Width = +_Width
        Height = null if isNaN Height = +_Height
        if Target?
          Width ?= Target.width ? Target.clientWidth
          Height ?= Target.height ? Target.clientHeight
        Object.defineProperties @,
          Height: value: Height
          Target: value: Target
          Width: value: Width
          X: value: X
          Y: value: Y

####  The prototype  ####

The `Control.PokeListΘ` prototype allows for the creation of new
  `Control.PokeΘ` instances and accessing by number instead of ID.

    Object.defineProperty ControlPokeListΘ, "prototype",
      writable: no,
      value: Object.create Object::,

`DeleteItemƑ` deletes the first `Control.PokeΘ` instance with the
  specified number, `_N`

        DeleteItemƑ: value: (_N) ->
          delete @[ID] for own ID, Poke of @ when Poke.Number is _N
          return

`ItemƑ` returns the first `Control.PokeΘ` instance with the specified
  number, `_N`.

        ItemƑ: value: (_N) ->
          (return Poke) for own ID, Poke of @ when Poke.Number is _N
          return

`newPoke()` creates a new `Poke` from the specified `MouseEvent` or `Touch` at number `n`:

        new: {value: (id, e, n) -> this[id] = new Poke(@target, e, n, @x, @y, @width, @height)}

We can now freeze the prototype:

    })

    Object.freeze PokeList.prototype

###  Control:  ###

`Control` provides mechanisms for tracking keyboard input, mouse clicks, and touch points.

####  The constructor  ####

The `Control` constructor takes five arguments: `elt`, which gives the element used for determining `Poke` coordinates, and `x`, `y`, `width`, and `height`, which determines the coordinate system.
`elt` defaults to `document.body`.

    Control = (elt = document.body, x, y, width, height) ->

`Control` instances depend strongly on their prototypes.
Consequently, we should only proceed if `this` is, in fact, a `Control` instance proper.

        return unless this instanceof Control

We can then start by setting defaults for any unset attributes:

        elt = document.body unless elt instanceof Element
        x = 0 if isNaN(x = Number(x))
        y = 0 if isNaN(y = Number(y))
        width = (if elt.width? then elt.width else elt.clientWidth) if isNaN(width = Number(width))
        height = (if elt.height? then elt.height else elt.clientHeight) if isNaN(height = Number(height))

Not much work happens in the `Control` constructor itself; most of the heavy-lifting takes place in the prototype.
But, here are our property definitions:

        Object.defineProperties this, {
            "target": {value: elt}
            "clicks":
                value: new PokeList(elt, x, y, width, height),
                enumerable: true
            "codes": {value: {}}
            "height": {value: height}
            "keys": {value: {}}
            "ownerDocument": {value: @target?.ownerDocument || document}
            "touches":
                value: new PokeList(elt, x, y, width, height),
                enumerable: true
            "width": {value: width}
            "x": {value: x}
            "y": {value: y}
        }

We use `Object.defineProperties` because all of these properties are read-only.

We then a number of event listeners to track what's going on:

        window.addEventListener "keydown", this, false
        window.addEventListener "keyup", this, false
        window.addEventListener "contextmenu", this, false
        window.addEventListener "touchstart", this, false
        window.addEventListener "touchend", this, false
        window.addEventListener "touchmove", this, false
        window.addEventListener "touchcancel", this, false
        window.addEventListener "mousedown", this, false
        window.addEventListener "mouseup", this, false
        window.addEventListener "mousemove", this, false
        return

…And we are done!

####  The prorotype  ####

The `Control` prototype is where the magic happens.

    Control.prototype = Object.create(Object.prototype, {

Our first function lets us add a new key to the `Control`.
It only takes one argument, `name`, which should be a string.
If `name` is not provided, the function does nothing.

        add:
            value: (name) ->
                @keys[name] = off if name?
                return this

You will note that the above function returned `this` – that is, the current `Control` object.
This allows for the stringing together of `Control` commands.

Our next function is `addCodes()`, which adds codes to the key with the provided `name`.
Codes should be a valid `KeyboardEvent.code`, `KeyboardEvent.key`, `KeyboardEvent.keyIdentifier`, or `KeyboardEvent.keyCode`.
The `name` of the key is the first argument, and the codes come next.
If no key with `name` has already been defined, this does nothing.

        addCodes:
            value: (name, codes...) ->
                @codes[code] = name for code in codes if name? and @keys[name]?
                return this

Here we have defined the value of `code` in `@codes` to give us the `name` of the key, for each code specified.
Again, we returned `this`.

If given a code, it would be nice to be able to find the name of the key that it is associated with.
`getName()` does this, taking the code as its argument.

        getName:
            value: (code) -> return @codes[code] if code? and @codes[code]?

`handleEvent()` handles the events that we added listeners for in the constructor.
It uses a `switch` statement to process them all, taking in the event itself as its argument.

        handleEvent:
            value: (e) ->
                return unless e instanceof Event
                switch e.type

For `"contextmenu"`, we just want to prevent the default.

                    when "contextmenu" then e.preventDefault()

When a key is down, we want to toggle it to `on`…

                    when "keydown"
                        @toggleCode(code, on) for code in [e.code, e.key, e.keyIdentifier, e.keyCode] when @isCodeDefined(code)

…and when a key is up, we want to toggle it to `false`.

                    when "keyup"
                        @toggleCode(code, off) for code in [e.code, e.key, e.keyIdentifier, e.keyCode] when @isCodeDefined(code)

On `"mousedown"`, we generate a new `Poke` if the event was within our `target`'s bounds.
The index of the `Poke` corresponds to the mouse button that was pressed.

                    when "mousedown"
                        rect = @target?.getBoundingClientRect()
                        if rect and rect.left < e.pageX < rect.right and rect.top < e.pageY < rect.bottom
                            @clicks.new(e.button, e, e.button)

On `"mousemove"`, we update the corresponding `Poke` with the mouse's new position.

                    when "mousemove"
                        click.updateWith(e) for i, click of @clicks

On `"mouseup"`, we delete the `Poke` associated with the corresponding mouse button.

                    when "mouseup"
                        delete @clicks[e.button]

On `"touchcancel"` or `"touchend"`, we want to delete the corresponding `Poke`s.

                    when "touchcancel", "touchend"
                        delete @touches[touch.identifier] for touch in e.changedTouches

On `"touchmove"`, we want to update the corresponding `Poke`s with their new positions.

                    when "touchmove"
                        @touches[touch.identifier].updateWith(touch) for touch in e.changedTouches

On `"touchstart"`, we want to create a new `Poke` for the touch if the event was within our `target`'s bounds.
This is a slightly more complicated process.

                    when "touchstart"
                        rect = @target?.getBoundingClientRect()
                        touch_inside = false

We iterate over each touch:

                        for new_touch in e.changedTouches

If the rect is out of bounds, we skip over this touch:

                            continue unless rect and rect.left < touch.pageX < rect.right and rect.top < touch.pageY < rect.bottom
                            touch_inside = yes

First, we need to get the number of the touch, by iterating through existing touches until we find a number that is unused:

                            n = null
                            j = 0
                            while n isnt j
                                n = j
                                for i, touch of @touches
                                    j++ if j is touch.number

Now we can add a `Poke` with the appropriate number if the `touch` was inside our `VIEW`.

                            @touches.new(new_touch.identifier, touch, n)

If we successfully added a touch, then we should `preventDefault()`:

                        if touch_inside then e.preventDefault()

This function shouldn't return anything, because it's just an event handler.

                return

The next two functions are pretty simple: `isActive()`, which tells us if a key is active, and `isDefined()`, which tells us if a key has been defined.
Both take a single argument, the `name` of the key.

        isActive: {value: (name) -> !!@keys[name] if name? and @keys[name]?}

        isDefined: {value: (name) -> @keys[name]? if name?}

>   [Issue #67](https://github.com/marrus-sh/jelli/issues/67) :
    `isDefined` should use `Object.prototype.hasOwnProperty()`.

It's equally possible, though, that you don't have the `name` of the key but rather only that of an associated code.
`isCodeActive()` and `isCodeDefined()` do the same as the above, only with an argument of a `code`.

        isCodeActive: {value: (code) -> !!@keys[name] if code? and (name = @codes[code])? and @keys[name]?}

        isCodeDefined: {value: (code) -> @keys[name]? if code? and (name = @codes[code])?}

If we can add keys, we should be able to remove them!

        remove:
            value: (name) ->
                delete @keys[name] if name?
                delete @codes[code] for code in codes when name? and @codes[code] is name
                return this

And likewise with codes:

        removeCodes:
            value: (codes...) ->
                delete @codes[code] for code in codes
                return this

We can set whether or not a control/key is activated using `toggle()` and `toggleCode()`.
The first argument is the `name` or `code`; the second is what to set it to.
If not set, the second argument will just toggle the key to the opposite value.

        toggle: {value: (name, to) -> @keys[name] = to? and to or not to? and !@keys[name] if name? and @keys[name]?}

        toggleCode: {value: (code, to) -> @keys[name] = to? and to or not to? and !@keys[name] if code? and (name = @codes[code]) and @keys[name]?}

You will notice that the above functions do *not* return `this`!
Rather, they return whatever value the key was toggled to, or `undefined` if the toggle failed.

That's all the functions we have, so let's freeze that prototype:

    })

    Object.freeze Control.prototype

####  Final touches  ####

Finally, we need to make our constructors transparent to the window, and freeze them against meddling interlopers:

    Control.Poke = Object.freeze(Poke)
    Control.PokeList = Object.freeze(PokeList)
    Object.freeze(Control)

We have assumed control!

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
