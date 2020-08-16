#  01. JELLO  #
The Jelli Game Engine

 - - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    ###
    JELLO
    The Jelli Game Engine
    ---------------------
    ###

###  The constructor:

At face value, a `JellO` is no different than `Object`, so its constructor does very little.
It only initializes the `functions` object, using `Object.defineProperty` to prevent it from being enumerated or deleted.

    JellO  =  ->  Object.defineProperty  @ , "functions" , value : {}

Many `JellO` objects redefine the `functions` object as non-writable after setting its value.

###  The prototype:

The `JellO` prototype provides useful extensions for game objects.

    Object.defineProperty  JellO , "prototype" , value : Object.freeze  Object.create  Object:: ,

`run()` calls a function assigned to the `functions` object with `this` assigned to the object.

        run : value :  (name)  ->  @functions[name].call  @    if  @functions? and typeof @functions[name] is "function"

###  Final touches:

Most other engine modules need access to `JellO`, so let's freeze it and attach it to our `Jelli` object:

    Object.defineProperty  Jelli , "JellO" , value : JellO
