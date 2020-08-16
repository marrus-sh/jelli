/*
#  THE JELLI GAME ENGINE  #
Programmed by Ᵹʼȷɛꞵɛᵹɔ

___

Implemented through several modules in Literate CoffeeScript.
Source code and resources are available at
  <https://github.com/marrus-sh/jelli/>.
Written for the CoffeeScript 2.3.2 compiler.

___

##  License  ##

Copyright © 2016–2018 Kyebego.

This program is free software: you can redistribute it and/or modify it
  under the terms of the GNU General Public License as published by the
  Free Software Foundation, either version 3 of the License, or (at
  your option) any later version.

This program is distributed in the hope that it will be useful, but
  WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

If you downloaded this file as part of a larger repository, you should
  have received a copy of the GNU General Public License along with
  this program.
Otherwise, see <https://www.gnu.org/licenses/>.

___

##  How To Use  ##

The `Jelli.Game.Θ` constructor creates a new game object, which is
  automatically assigned to `document.Game`.
If you are working with multiple documents, you can specify the one you
  want to use as an argument.
A document can have only one game assigned to it at a time, and
  this game is non-configurable once created.

A sample loading script might look like this:

    window.addEventListener("load", function () {
      new Jelli.Game.Θ(document);  //  Or just `new Jelli.Game.Θ;`
      //  Your game-specific code!!
    }, false);

*/
