#  INTRODUCTION  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    INTRODUCTION
    The Jelli Game Engine
    ---------------------
    ###

>   *To come.*

    defineFunctions = (function_object) ->

        scripts = document.getElementsByTagName("script")
        elt = script = scripts[scripts.length - 1]
        while elt = elt.parentElement
            break if elt.classList.contains("CHARACTER") or elt.classList.contains("AREA") or elt is document.body
        return unless elt?

        elt.functions = function_object
        Object.freeze function_object
