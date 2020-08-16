#  04. COLLECTION  #
The Jelli Game Engine

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    ###
    COLLECTION
    The Jelli Game Engine
    ---------------------
    ###

`Collection` creates a simple packaging for objects, and methods for interacting with them.
[`Area`](03 Area.litcoffee) uses it to package its `Character`s and `PlacementImage`s.

###  Privileging code

We wrap our `Collection()` constructor in a closure with a special `privileged` variable.
When this variable is `true`, then the `"🙊+"()` function is made available on all `Collection` instances.
Of course, the only functions with access to this variable are those defined here.

    Collection  =  null
    do =>
        privileged  =  no

###  General functions:

`addNameless()` is used to create "nameless" instances in a `Collection`.
It is not exposed to the window.

        addNameless  =  (nameless , item) ->

We unprivilege our code to guard against nefarious getters.

            initial_privilege  =  privileged
            privileged         =  no

`this`, `nameless`, and `item` need to be an objects and `nameless.next` must be defined in order for `addNameless()` to work.

            unless  typeof @ is "object" and typeof nameless is "object" and typeof item is "object" and nameless.next?
                privileged  =  initial_privilege
                return  null

We can now add the `item`:

            nameless[nameless.next]  =  item

Because `item`s can't actually be accessed, we need to ensure that they have a `kill()` function.

            Object.defineProperty  nameless[nameless.next] , "kill" , value : @kill.bind  nameless , nameless.next

We can now reset our privilege, increment `nameless.next`, and return the new object.

            privileged  =  initial_privilege
            return         nameless[nameless.next++]

`iterateNameless()` is used by `Collection` to iterate over "nameless" instances.
It is not exposed to the window.

        iterateNameless = (nameless, fn) ->

`nameless` needs to be an object and `fn` needs to be a function, so we check that first:

            return  @    unless  typeof nameless is "object" and typeof fn is "function"

Then we call `fn()` for each item in `nameless`:

            fn  item    for  i , item    of  nameless    when  not @Type? or item instanceof @Type

…And we're done:

            return  @

###  The constructor:

The `Collection()` constructor takes two arguments: a `parent` object, and the `constructor` for its objects.
The `constructor` should take the form `(collection, args…) ->`, where `collection` will be this `Collection` object, and `args…` are any number of additional arguments.
(Note that there is no requirement that `constructor`s actually *do* anything with this information; you are more than welcome to throw them away.)

        Collection  =  (parent , constructor) ->

If `parent` is an `Area`, we can get both `area` and `game`.
If it is `Game`, we can only get `game`.
(If it is neither, then we can't get anything.)

            if    parent instanceof Area
                  area       =      parent
                  game       =      parent.game    if  parent.game instanceof Game
            else  game       =      parent         if  parent      instanceof Game

The `constructor` must be a function and the `parent` must be an object.

            constructor  =  null    unless  typeof constructor is "function"
            parent       =  null    unless  typeof parent      is "object"

We can now define the `Collection` properties.
All of these need to be non-enumerable, so we use `Object.defineProperties()`.

            Object.defineProperties  @ ,
                area   : value : area        or null
                Type   : value : constructor
                game   : value : game        or null
                parent : value : parent

The `nameless` object is used to manage "nameless" instances, through use of the `"🙊+"()` and `doForEachNameless()` functions.
Improper use of `"🙊+"()` can create memory leaks, so we only allow it for `privileged` code.

            Object.defineProperty    nameless  =  {} , "next" ,
                value    : 0
                writable : yes
            Object.defineProperties  @               ,
                "🙊+"         : get   :  =>  addNameless    .bind  @ , nameless    if privileged
                doForNameless : value :      iterateNameless.bind  @ , nameless

`Collection` objects store their contents as direct properties, so we can't freeze them or prevent extensions.
However, you **really shouldn't** manually change their contents.

            return  @

###  The prototype:

Instead, you should use the functions provided by `Collection.prototype`!
These allow you to create new instances, delete old ones, and enumerate over all of them.

        Object.defineProperty  Collection , "prototype" , value : Object.freeze  Object.create  Object:: ,

`doForEach()` is a convenience function for `for … of…` (or the JavaScript equivalent, `for (… in…)`) which *also* checks to ensure that the returned properties are instances of `Collection.Type`.
It takes a function as its argument, which should take the form of `(value, key)  ->`.
It returns the `Collection` itself.

            doForEach : value :  (fn)  ->
                return          @              unless  typeof fn  is "function"
                fn              value , key    for            key ,  value         of  @    when  not @Type? or value instanceof @Type
                @doForNameless  fn
                return          @

`kill()` deletes the instance specified by `name` from `this`, if it exists, returning the deleted instance.
Note that, as with any instance of the `delete` operator, this won't free up memory if the instance is still referenced somewhere else.

            kill : value :  (name)  ->
                if      @?       and (Object.getOwnPropertyDescriptor  @ , name)?.configurable
                        instance  =  this[name]
                        delete       this[name]
                else    instance  =  null
                return  instance

The advantages to using `kill()` over `delete` are:

1.  `kill()` checks to see if properties are configurable first, and so won't throw a `TypeError` and won't allow you to delete the properties defined by the `Collection` constructor.
    (`delete` only does this in non-strict mode.)

2.  `kill()` is a function, and thus can be used in callbacks and bound to specific values.

3.  `kill()` returns the instance that it deletes.

For consistency, using `kill()` is recommended in *every* instance, but in many instances `delete` will work just as well.

The `load()` function creates an instance and stores it in `name`.
`load()` will **not** overwrite properties which already have values (if this is important, call `kill()` first).
`load()` returns the newly-created instance, but if it is unable to load the instance, it returns `null`.

            load : value :  (name, args...)  ->
                unless  @[name]?
                        result                 =  if  typeof @Type is "function"    then  new @Type  @       , args...                                   else  null
                        Object.defineProperty                                                        @       , name    ,
                            configurable : yes
                            enumerable   : yes
                            value        : result
                        Object.defineProperty                                                        @[name] , "kill"  , value : @kill.bind  @ , name
                else    result                 =  null
                return  result

By default, `load()` makes properties non-writable, and it is *recommended* that you not change this.
Calling `kill()` and then `load()` is the best way to overwrite an instance.

`load()` attempts to bind `kill()` to the instance that it creates for convenience.

`loadNameless()` is very similar to `load()`, but is intended for autonomous instances which rarely need to be referenced by name.
Instances loaded with `loadNameless()` aren't accessible from the outside, so you should be careful when using it to avoid memory leaks.

The code is below:

            loadNameless : value :  (args...)  ->
                privileged  =                       yes
                result      =  @["🙊+"]  new @Type  @       , args...    if  typeof @Type is "function"
                privileged  =                       no
                return                              result

###  Final touches:

We now need only to freeze `Collection` and make it available to everyone else through the window:

    Object.defineProperty  Jelli , "Collection" , value : Collection

Happy collecting!
