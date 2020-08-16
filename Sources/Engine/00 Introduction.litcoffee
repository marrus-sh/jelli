#  INTRODUCTION  #
The Jelli Game Engine

 - - -

##  Introduction  ##

###  Jelli JSON:

The remaining source files for the Jelli Game Engine provide information about the programmatic interface for dealing with engine constructs.
This file provides further information on Jelli JSON, which is used to store information for engine components.

The basic format for a Jelli JSON file is as follows:

>   ```json
>   {
>       "areas": {},
>       "characters": {},
>       "images": {},
>       "letters": {},
>       "tilesets": {},
>       "sheets": {},
>       "views": {},
>   }
>   ```

As you can see, there are six core types of object; these are *area*, *character*, *image*, *letters*, *tileset*, *sheet*, *view*.
These are stored by name in the the appropriate property on the global object (you can use arrays if you prefer referencing them by number), and descriptions for each are below:

####  Area objects

The format for an area object is as follows:

>   ```json
>   {
>       "characters": {},
>       "images": {},
>       "maps": [],
>   }
>   ```

You will note that a new type of object is called for here, of type *map*.
Maps draw tiles to the screen from a tileset, and have the following form:

>   ```json
>   {
>       "data": <string of Base64-encoded data>,
>       "mapwidth": <number>,
>       "offset": [<x position>, <y position>],
>       "tileset": <name of tileset>,
>       "screen": [<name of view>, <name of screen>],
>   }
>   ```

`data` provides the map data, encoded from binary into Base64.
Each byte of data should provide the index of a tile from the given `tileset`, and the map is filled horizontally, left-to-right and top-to-bottom.
The width of the map is provided by `mapwidth`, and `offset` give the initial offset of the map on the screen.
The `screen` property gives the screen on which to draw the map.

####  Character objects

The format for a character object is as follows:

>   ```json
>   {
>       "collides": <string>,
>       "screen": [<name of view>, <name of screen>],
>       "speedcap": <number>,
>       "spritelist": <spritelist>,
>   }
>   ```

`collides` tells whether or not collisions are enabled for the character.
It can have one of the following values:

 -  **`"none"` (default):**
    The character does not collide.

 -  **`"map"` :**
    Map collisions are enabled.

 -  **`"character"` :**
    Character collisions are enabled.

 -  **`"all"` :**
    Both map and character collisions are enabled.

`screen` gives the screen on which the character should be drawn.
`speedcap` gives a maximum value for the character's movement speed.

`spritelist` is an object of type *spritelist*, which has the following form:

>   ```json
>   {
>       "box": [<box x>, <box y>, <box width>, <box height>],
>       "origin": [<origin x>, <origin y>],
>       "sheet": <name of sheet>,
>       "sprites": [],
>   }
>   ```

`box` gives the dimensions of the sprite bounding box, used with collision checking.
If not present, the box will fill the entire sprite.
`null` or `undefined` values are set to their defaults.

`origin` gives the origin of the sprite, relative to the bounding box (*not* the sprite image).
If not present, it will default to the center of the box.
`null` or `undefined` values are set to their defaults.

`sheet` gives the *sheet* to draw on for rendering the sprite.
The `sprites` property is an array of *sprites*, which are objects of the following form:

>   ```json
>   {
>       "index": <number>,
>       "length": <number>,
>       "name": <string>,
>   }
>   ```

`index` and `length` give the starting sprite within the sheet, and the length of the sprite's animation.
`name` gives a string name to the sprite that can be used instead of its index for identification.

####  Image objects

The format for an image object is as follows:

>   ```json
>   {
>       "name": <string>,
>       "origin": [<origin x>, <origin y>],
>       "screen": [<name of view>, <name of screen>],
>   }
>   ```

`name` gives the id of the image source for the image.

`origin` gives the origin of the image.
If not present, it will default to the center of the image.
`null` or `undefined` values are set to their defaults.

`screen` gives the screen to draw the image on.

####  Letters objects

The format for a letters object is as follows:

>   ```json
>   {
>       "dimensions": [<width of letter>, <height of letter>],
>       "name": <string>,
>       "linefeed": <character>,
>       "palettes": {},
>       "spacing": <number>,
>   }
>   ```

`dimensions` gives the dimensions of an individual letter (*not* the entire image), and `linefeed` specifies the character to be used as a linefeed.
`palettes` is an object whose own keys give palette names and whose own values give the associated colour codes.
`spacing` gives the spacing between letters.
`name` gives the id of the image source for the letters.

####  Tileset objects

The format for a tileset object is as follows:

>   ```json
>   {
>       "collisions": <string of Base64-encoded data>,
>       "dimentions": [<width of tile>, <height of tile>],
>       "name": <string>,
>   }
>   ```

`collisions` gives the collision data for the tileset as a Base64-encoded string, and `dimensions` gives the dimensions of an individual tile (*not* the entire image).
`name` gives the id of the image source for the tileset.

####  Sheet objects

The format for a sheet object is as follows:

>   ```json
>   {
>       "dimentions": [<width of tile>, <height of tile>],
>       "name": <string>,
>   }
>   ```

`dimensions` gives the dimensions of an individual sprite in the sheet (*not* the entire image).
`name` gives the id of the image source for the sheet.

####  View objects

The format for a view object is as follows:

>   ```json
>   {
>      "dimensions": [<width of view>, <height of view>],
>      "element": <element ID>,
>      "screens": {},
>   }
>   ```

The `dimensions` property gives the dimensions of the view.
`element` gives the `id` of an element in which to draw the view—note that the contents of this element will be deleted.
`screens` is an object whose own properties give the names of screens in the view, and whose own values are one of the following screen types:

 -  **`"animation"` :**
    The screen will be automatically redrawn every frame.

 -  **`"area"` :**
    The screen will be automatically redrawn on area change.

 -  **`"manual"` (default) :**
    The screen will not be automatically redrawn.

###  Loading JSON:

Jelli JSON can be provided using a `<script>` tag with `id="jelli-data"`.

>   **[Issue #75](https://github.com/marrus-sh/jelli/issues/75) :**
>   Loading some or all aspects of JSON from external files is also planned.

##  Implementation  ##

    ###
    INTRODUCTION
    The Jelli Game Engine
    ---------------------
    ###

The `Jelli` object will hold all of our engine components.

    Jelli = {}
