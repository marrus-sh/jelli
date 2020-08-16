<div align="right">
  <cite>The Jelli Game Engine</cite><br />
  Source and Documentation<br />
  <code>INSTALL.litcoffee</code>
  <hr />
  Copyright © 2016, 2018 Kyebego.<br />
  Released under GNU GPLv3 or any later version; for more information,
    see the license notice at the bottom of this document.
</div>

___

#  INSTALL  #
Building a fresh copy from source

___

##  Description  ##

The Jelli Game Engine can be easily built using the CoffeeScript build
  system, Cake.
Just run `cake build` from this directory. You can use `cake clear` to
  delete the built files.

When Cake runs, it loads the [`Cakefile`](./Cakefile), which simply
  runs this file in turn.

___

##  Implementation  ##

###  Prerequisites:

In order to build Jelli, we'll need access to the filesystem, as well
  as the ability to create child processes.
So we need to require `fs` and `child_process`:

    fs = require 'fs'
    { exec } = require 'child_process'

###  Build order:

Building Jelli takes place over two steps:

 1. Stitching the source files together, and
 2. Compiling the result

Because variables defined in earlier files will be made available in
  later ones, the ordering of the files is very important.
The following array gives the build order of our source files:

    BuildOrder = [
      "README"
      "Modules/Control"
      "Modules/Data"
      "Modules/Letters"
      "Modules/Screen"
      "Modules/Sheet"
      "Modules/Tileset"
      "Engine/00 Introduction"
      "Engine/01 Jelli"
      "Engine/02 Game"
      "Engine/03 Area"
      "Engine/04 Collection"
      "Engine/05 Unit"
      "Engine/06 PlacementImage"
      "Engine/07 Character"
      "Engine/08 Text"
      "Engine/09 View"
    ]

There is no need to provide the `.litcoffee` extension in our build
  order or the `Source/` prefix, both of which can be assumed.

###  Loading files:

Our first task will be to load our source files.
The `CollectƑ` function reads our files into an array, which we will
  then pass on to later build steps.

    CollectƑ = (_SourceFiles) -> (_CallbackƑ) ->
      console.log "Collecting source files…"

We will use the `Contents` array to hold the contents of all of
  our source files, in order.
`FilesRemaining` will store the number of files left to process.
We can set both of these at the same time, since the length of the
  contents array will initially equal the number of remaining files.

      Contents = new Array FilesRemaining = _SourceFiles.length

We read each file, in order, and add it to our `FileContents` array.

      for File, Index in _SourceFiles
        do (File, Index) ->
          fs.readFile "Sources/#{File}.litcoffee", "utf8", (
            _Err, _Contents
          ) ->
            throw _Err if _Err
            FileContents[Index] = _Contents

If we have read all of our available files, we can call our callback
  and move on.

            _CallbackƑ FileContents if --FilesRemaining is 0
      return

###  File stitching:

The `StitchƑ` function joins an array of files together.
The complicated string of function calls and returns at the beginning
  of `StitchƑ` is just to make it easier to string together with our
  other functions later on—you'll see this pattern a lot in this file,
  but you needn't pay it much mind.

    StitchƑ = (_CollectƑ) -> (_CallbackƑ) -> _CollectƑ (_Contents) ->
      console.log "Stitching…"

We put a horizontal rule in-between our files to make them easier to
  debug—remember that these are still Literate CoffeeScript at this
  point.

      StitchedContents = _Contents.join "\n\n___\n\n"

Finally, we write the stitched file to disk, for later compilation.
We have to create the `Build/` folder if it doesn't exist.

      fs.mkdir "Build", (_Err) ->
        throw _Err if _Err and _Err.code isnt 'EEXIST'
        fs.writeFile "Build/Jelli.litcoffee",
          StitchedContents, "utf-8", (_Err) ->
            throw _Err if _Err
            _CallbackƑ "Build/Jelli.litcoffee"
      return

##  Compiling  ##

The `CompileƑ` function compiles our stitched Literate CoffeeScript
  file.
It's pretty simple—it just executes `coffee`, adding a license and
  usage notice to the beginning of the file with `cat`.
Note the `-t` flag; we will use Babel for transpiling into an
  ECMAScript 5.1–compatible form.

    CompileƑ = (_StitchƑ) -> (_CallbackƑ) -> _StitchƑ (_Stitched) ->
      console.log "Compiling…"
      Compiled = _Stitched.replace /\.litcoffee$/i, ".js"
      exec "
        coffee -cpt #{_Stitched} | cat README.js - > #{Compiled}
      ", (_Error, _StdOut, _StdErr) ->
        throw _Error if _Error
        if _StdOut or _StdErr
          console.log (_StdOut or "") + (_StdErr or "")
        _CallbackƑ Compiled
      return

##  Minifying  ##

Finally, we use UglifyJS 3 to minify our final output.
We again add a license/usage notice to the beginning of the file.
The `MinifyƑ` function accomplishes this:

    MinifyƑ = (_CompileƑ) -> _CompileƑ (_Compiled) ->
      console.log "Minifying…"
      Minified = _Compiled.replace /\.js$/, ".min.js"
      exec "
        uglifyjs #{_Compiled} -c | cat README.js - > #{Minified}
      ", (_Error, _StdOut, _StdErr) ->
        throw _Error if _Error
        if _StdOut or _StdErr
          console.log (_StdOut or "") + (_StdErr or "")
        console.log "…Done."
      return

##  Building  ##

The `BuildƑ` function just links all of the above functions together:

    @BuildƑ = BuildƑ = -> MinifyƑ CompileƑ StitchƑ CollectƑ BuildOrder

##  Watching  ##

The `WatchƑ` function builds, then watches for changes and
  automatically rebuilds.

    @WatchƑ = WatchƑ = ->
      do BuildƑ
      for File in BuildOrder
        do (_File) ->
          fs.watch "Sources/#{_File}.litcoffee", "utf8", (_Type) ->
            return unless _Type is "change"
            console.log "File `#{_File}` changed, rebuilding..."
            do BuildƑ

##  Clearing  ##

The `ClearƑ` function clears out the files that we created above:

    @ClearƑ = ClearƑ = ->
      fs.unlink "Build/Jelli.litcoffee", ->  #  Ignore errors
      fs.unlink "Build/Jelli.js"       , ->  #  Ignore errors
      fs.unlink "Build/Jelli.min.js"   , ->  #  Ignore errors

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
