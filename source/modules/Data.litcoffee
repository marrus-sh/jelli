#  DATA  #
Typed arrays of varying bit-depths.

- - -

##  Description  ##

`Data` is built off of the ECMAScript 6 typed arrays, using them as compact storage mechanisms for data of any bit-depth.
It is, for the most part, interchangable with `TypedArray`s, although internally it is probably more similar to (and inherits from) a standard `Array`.
The values at each index of a `Data` object are always interpreted as unsigned integers.

Because the bit-depth of the `Data` object and the bit-depth of its underlying `ArrayBuffer` are not necessarily the same, using a `Data` object might be slightly slower than using a corresponding typed array as defined by ECMAScript 6.
However, the memory usage of a `Data` object may be significantly lower; for example, a 6-bit array of 250 units is 200 bytes in a `Data` object, instead of 250.
No space improvements are given for `Data` objects with bit-depths of 7, 8, or greater than 10, but depths up to 32-bit are supported.

The object returned by `Data()` is frozen—this is to say, it may not be reconfigured or extended.
Consequently, users wishing to extend the `Data` class should call the constructor (or `Data.from`) at the end; for example:

>   ```javascript
>   ExtendedData = function (unitSize, contents) {
>       this.name = "Extended Data!!!";
>       // Note that if `ExtendedData` doesn't inherit from `Data`, `Data.from` will silently fail to modify `this`:
>       Data.from.call(this, unitSize, contents);
>   }
>   ExtendedData.prototype = Object.create(Data.prototype);
>   ```

>   **Note :**
`Data` is thus not extensible through ECMAScript 2015 classes, as `this` would be uninitialized *before* the constructor call, and frozen *after*.

`Data` objects interpret their values as unsigned integers and internally use `Uint8Array`, `Uint16Array`, and `Uint32Array` to do their work.
In environments where typed arrays are not supported, `Array` is used instead.

###  Property access:  ###

`Data` objects function just like typed arrays, and their properties can be accessed using standard bracket notation.
Unlike with typed arrays, this lookup does check the prototype chain, however as `Data.prototype` is frozen this is unlikely to cause an issue.

###  The `Data` object:  ###

####  The constructor  ####

#####  SYNTAX  #####

>   ```javascript
>   new Data(unitSize, length);
>   new Data(unitSize, contents);
>   new Data(unitSize, buffer);
>   new Data(unitSize, buffer, byteOffset);
>   new Data(unitSize, buffer, byteOffset, length);
>   ```

>   **Note :**
    The `new` operator is optional with `Data` objects, but recommended.

-   **`unitSize`**—
    This gives the number of bits per item in the `Data` object.
    It is roughly equivalent to `BYTES_PER_ELEMENT` for typed arrays, except that you have to specify it yourself.
    `unitSize` must be between 0 and 32 and will be capped into this range.

-   **`length`**—
    When called with a `length` argument, a internal array buffer is created in memory of size `length` multiplied by `unitSize` bits containing 0 value.
    The internal buffer will be padded as necessary to fit within a whole number of bytes.
    Numeric strings are interpreted as valid lengths (`"2"` is interpreted as `2`) but singleton arrays (for example, `[2]`) are instead interpreted as `contents`.

-   **`contents`**—
    When not called with a `length` or `buffer` argument, the second argument of the `Data()` constructor is coerced into an iterable array, whose length and contents are used to initialize the `Data` object.
    Non-iterable objects are converted into singleton arrays (for example, `null` becomes `[null]`), and strings are interpreted by code point (so `hello` becomes `[104, 101, 108, 108, 111]`).

-   **`buffer`, `byteOffset`, `length`**—
    When called with a `buffer` argument, `Data()` simply creates a new view for a preexisting `ArrayBuffer`. The `byteOffset` and `length` parameters specify the memory range that will be exposed by the `Data` object.  If both are omitted, all of buffer is viewed; if only `length` is omitted, the remainder of buffer is viewed.

#####  PROPERTIES  #####

-   **`Data.BYTES_PER_ELEMENT`**—
    Always returns `NaN`.

-   **`Data.length`**—
    Has a value of `3`, like all typed array constructors.

-   **`Data.name`**—
    Returns the string value `"Data"`.

-   **`Data.prototype`**—
    Prototype for `Data` objects.

#####  METHODS  #####

-   **`Data.from(unitSize, source[, mapFn, thisArg])`**—
    The same as calling `new Data(unitSize, source)`, except that `source` is always interpreted as `contents`, above.

-   **`Data.of(unitSize[, …])`**—
    The same as calling `new Data(unitSize, values)`, where `values` is an array containing the arguments of `Data.of()`, starting from the second argument.

####  `Data` instances  ####

#####  PROPERTIES  #####

All non–array-access properties of `Data` instances are read-only.

-   **`dataobj.unitSize`**—
    Returns the bit-depth of the `Data` instance—that is, the number of bits given to each element.

-   **`dataobj.constructor`**—
    Returns the `Data()` constructor.

-   **`dataobj.buffer`**—
    Gives access to the `Data` instance's `ArrayBuffer`.

-   **`dataobj.byteLength`**—
    Returns the length (in bytes) of the `Data` instance's `ArrayBuffer`.

-   **`dataobj.byteOffset`**—
    Returns the offset (in bytes) for the `Data` instance's `ArrayBuffer`.

-   **`dataobj.length`**—
    Returns the number of elements in the `Data` instance.

-   **`dataobj[n]`**—
    Accesses the `n`th element in the `Data` instance.

#####  METHODS  #####

`Data` inherits from `Array`, so the standard array-like methods apply.
In addition, the following methods (also available with typed arrays) are defined:

-   **`Data.prototype.set(array [,offset])`**—
    Stores multiple values in a `Data` instance, reading input values from a specified array and beginning writing from `offset`.

-   **`Data.prototype.subarray()`**—
    This method does nothing and throws a `TypeError`.

###  Examples:  ###

####  Creating a 6-bit `Data` array with length `12`  ####

>   ```javascript
>   data_array = new Data(6, 12);
>   ```

####  Creating a `Data` array from a character string  ####

>   ```javascript
>   data_array = new Data(8, "hello world!");
>   ```

##  Implementation  ##

    "use strict";

    ###
    DATA
    The Jelli Game Engine
    ---------------------
    ###

The `Data` module provides access to large arrays of data using JavaScript's `ArrayBuffer`s.

###  Before we begin:  ###

If the current browser supports typed arrays, we can get the typed array prototype here.

    TypedArray = Object.getPrototypeOf(Int8Array) if "Int8Array" of window

The size of the typed array that we use for our data depends on its bit-depth.
The following array lists the sizes for various bit-depths of data:

    array_size = [
        0           #  0
        8           #  1
        8           #  2
        16          #  3
        8           #  4
        16          #  5
        32          #  6
        8           #  7
        8           #  8
        32          #  9
        32          #  10
    ]

For bit-depths from `11` to `16`, a `16`-bit array is used.
A `32`-bit array is used for bit-depths from `17` to `32`.

The following array lists how many data-bytes can fit within one array-byte:

    byte_depth = [
        0           #  0:0
        8           #  8:1
        4           #  8:2
        5           #  16:3
        2           #  8:4
        3           #  16:5
        5           #  32:6
        1           #  8:7
        1           #  8:8
        3           #  32:9
        3           #  32:10
    ]

All higher bit-depths have a byte-depth of `1`.

###  Extracting data:  ###

The following functions are used to extract data from our typed arrays.
For the purpose of getting and setting data, units are treated as little-endian (that is, the first unit goes in the rightmost spot).
However, the internal composition of units, as well as the ordering of bytes within the `ArrayBuffer`, is not changed.

    getIndexOfDataArray = (a, d, i) -> a[Math.floor(i / byte_depth[d])] >> d * (i % byte_depth[d]) & 2 ** d - 1
    setIndexOfDataArray = (a, d, i, n) -> a[Math.floor(i / byte_depth[d])] = a[Math.floor(i / byte_depth[d])] & ~(2 ** d - 1 << d * (i % byte_depth[d])) | (n & 2 ** d - 1) << d * (i % byte_depth[d])

###  Handling iterable objects:  ###

The `Data` module allows data to be passed in directly in the form of an iterable object.
`makeArrayFrom()` creates an array from these objects so that the module can properly process its information.
This is essentially a polyfill for `Array.from()`, with a few modifications:

1.  Non-iterable objects are handled differently
2.  The values of the array are always numbers (for strings, the Unicode code points are used)
3.  Arrays of numeric strings (eg, `["2", "57", "9"]`) are not supported (this will evaluate to `[50, 0, 57]` because the strings are interpreted as characters; you can add support however by using `Number()` as a `map_function`)

These changes take place because the `Data` module only supports numeric data.

    makeArrayFrom = (something = [], map_function, this_arg) ->

First, we turn what we are given into an object; this is our array data.

        array_data = Object(something)

If our `something` is a number, we create a singleton array containing that number.
Otherwise, if our `array_data` doesn't have a length, we instead use `something`'s string representation.

>   **Note :**
    This is different from `Array.from()`, which returns an empty array for non-iterable objects.
    It means, for example, that `makeArrayFrom(2)` will process `2` as `[2]` and `null` as `"null"`.

        array_data = (if typeof array_data.valueOf() is "number" or (array_data.valueOf() instanceof Number) then [array_data] else String(array_data)) unless array_data.length?
        length = if array_data.length < 0 then 0 else array_data.length >>> 0

We can now create the array that will hold our data.

        computed_array = []

We iterate over the values of our object and process the map function:

        j = 0
        k = 0
        while k < length
            item = if typeof map_function is "function" or (map_function instanceof Function) then map_function.call((if this_arg? then this_arg else this), array_data[k]) else array_data[k]

If our resultant `item` is a single-character string, we need to get its code point.

            if 1 <= item.length <= 2 and (typeof item is "string" or (item instanceof String))
                first_point = item.charCodeAt(0)

If the first code point is between U+D800 and U+DBFF, then it is part of a surrogate pair.
We get the next point from the same string if possible, and from the next `array_data` value if not.

                if 0xD800 <= first_point <= 0xDBFF
                    if item.length is 2
                        second_point = item.charCodeAt(1)
                        item = if 0xDC00 <= second_point <= 0xDFFF then (first_point - 0xD800) * 0x400 + second_point - 0xDC00 + 0x10000 else 0
                    else
                        second_point = if typeof map_function is "function" or (map_function instanceof Function) then map_function.call((if this_arg? then this_arg else this), array_data[k + 1]) else array_data[k + 1]
                        if typeof second_point is "string" or (second_point instanceof String)
                            second_point = if second_point.length is 1 then second_point.charCodeAt(0) else 0
                        else second_point = 0 if isNaN(second_point = Number(second_point))
                        if 0xDC00 <= second_point <= 0xDFFF
                            item = (first_point - 0xD800) * 0x400 + second_point - 0xDC00 + 0x10000
                            k++
                        else item = first_point

If the first code point wasn't part of a surrogate pair, then we only take its code point if `item` has a length of 1 (ie, is a single character).

                else item = if item.length is 1 then first_point else 0

>   **Note :**
    Non-character strings evaluate to 0 even if they have numeric contents.
    This measure prevents the situation where, for example, both `"2"` and `"50"` evaluate to the same value (`50`).

If we can't compute a numeric value for `item`, we set it to zero.
Either way, we add it to the computed array and move on to the next item.

            item = 0 if isNaN(item = Number(item))
            computed_array[j++] = item
            k++

Finally, we return our array.

        return computed_array

###  The constructor:  ###

There are three possible ways of initializing a `Data` object: by specifying a length, passing through an array of data, or passing through a buffer (with optional byte offset and length).
In each case, the first variable gives us the size of each data unit in bits (ie, the bit-depth).

>   **Note :**
    The numeric arguments of the `Data()` constructor are treated as unsigned 32-bit integers.
    (This is consistent with JavaScript's handling of typed arrays.)
    Consequently, it is not presently possible to create a `Data` object of longer than 4294967295 units.
    As such an array would take .5–16 GiB (depending on unit size) in memory, this is not presently seen as a problem.

    Data = (unit_size, length_or_data, byte_offset, length_for_buffer) ->

It is possible that `Data()` was called without the `new` keyword.
There is no specific reason to disallow this, but we should ensure that the prototype chain is respected regardless.
We do this using `Object.create()`, disregarding the old `this` if it isn't already a `Data` instance.

        this_array = Object.create(Data.prototype) unless (this_array = this) instanceof Data

We need `unit_size` to be a number; if not specified, it defaults to `0`.
If `length_or_data` is a number, then it gives the length.
If it is an array or string, then it gives us our data.

>   **Note :**
    If the value passed to `length_or_data` is a single-element array (such as `[2]`), this will be interpreted as *data*, even though JavaScript is able to interpret these values as numbers.
    The same does *not* hold true for a numeric string (such as "42").
    This design choice was made to allow the reading of lengths directly from HTML/XML attributes, and can be effectively circumvented by using `Data.from()`.
    Because of this quirk in string handling, it is **strongly recommended** that data strings only be passed to `Data()` directly as arrays whenever their contents are not known.

        this_array.unitSize = if unit_size < 0 then 0 else unit_size >>> 0

Right now, `Data` does not support bytes more than `32` bits long.

        this_array.unitSize = 32 if this_array.unitSize > 32

If we were given an `ArrayBuffer`, then we use that to set up our internal typed array.

        if ArrayBuffer? and length_or_data instanceof ArrayBuffer
            this_array.buffer = length_or_data
            this_array.byteOffset = 0 if (this_array.byteOffset = byte_offset) < 0
            this_array.byteOffset = this_array.buffer.byteLength if (this_array.byteOffset >>>= 0) > this_array.buffer.byteLength
            this_array.length = if length_for_buffer < 0 then 0 else length_for_buffer >>> 0
            internal_byte_depth = if this_array.unitSize < 11 then byte_depth[this_array.unitSize] else 1
            internal_byte_size = if this_array.unitSize < 11 then array_size[this_array.unitSize] else if this_array.unitSize < 17 then 16 else 32
            internal_byte_length = Math.ceil(this_array.length / internal_byte_depth) * internal_byte_size / 8
            internal_byte_length = this_array.buffer.byteLength - this_array.byteOffset if internal_byte_length > this_array.buffer.byteLength - this_array.byteOffset
            internal_array = new (
                if TypedArray?
                    switch (internal_byte_size)
                        when 0 then ->
                        when 8 then Uint8Array
                        when 16 then Uint16Array
                        else Uint32Array
                else Array
            )(
                this_array.buffer, this_array.byteOffset, internal_byte_length
            )
            this_array.length = internal_array.length * internal_byte_depth if internal_array.length * internal_byte_depth < this_array.length
            this_array.byteLength = internal_array.byteLength
            given_data = []

Otherwise, we have to create our own.

        else
            if length_or_data? and (length_or_data instanceof Array or isNaN(length_or_data))
                given_data = makeArrayFrom(length_or_data)
                this_array.length = given_data.length
            else
                given_data = []
                this_array.length = if length_or_data < 0 then 0 else length_or_data >>> 0
            internal_byte_depth = if this_array.unitSize < 11 then byte_depth[this_array.unitSize] else 1
            internal_byte_size = if this_array.unitSize < 11 then array_size[this_array.unitSize] else if this_array.unitSize < 17 then 16 else 32
            internal_array = new (
                if TypedArray?
                    switch (internal_byte_size)
                        when 0 then ->
                        when 8 then Uint8Array
                        when 16 then Uint16Array
                        else Uint32Array
                else Array
            )(
                if byte_depth then Math.ceil(this_array.length / internal_byte_depth) else 0
            )
            this_array.buffer = internal_array.buffer
            this_array.byteOffset = 0
            this_array.byteLength = internal_array.byteLength

Next, we programmatically create our getters and setters for specific array values, from `0` through `@length - 1`.
At the same time, we initialize the values of our data array based on `given_data`, if it was provided.

        if this_array.length
            for index in [0 .. this_array.length - 1]
                Object.defineProperty(this_array, index, {
                    get: getIndexOfDataArray.bind(this_array, internal_array, this_array.unitSize, index)
                    set: setIndexOfDataArray.bind(this_array, internal_array, this_array.unitSize, index)
                    enumerable: true
                })
                this_array[index] = given_data[index] if given_data[index]?

The `constructor` property just returns this constructor.

        this_array.constructor = Data

Non-index properties should not be enumerated, so we quickly adjust for that now:

        Object.defineProperties(this_array, {
            buffer: {enumerable: false}
            constructor: {enumerable: false}
            byteLength: {enumerable: false}
            byteOffset: {enumerable: false}
            length: {enumerable: false}
            unitSize: {enumerable: false}
        })

That's it!
`Data` objects are themselves immutable, so we freeze the object and we're done.

        Object.freeze this_array

###  The prototype:  ###

The `Data` prototype provides the same methods as `TypedArray`s, with the exception of `subarray`, which is not presently feasible and throws a `TypeError`.
It inherits from the `Array` prototype to make facilitating this simple.

>   **Note :**
    It would have been ideal to use the `TypedArray` prototype for `Data` inheritance, but unfortunately this is only compatible with ECMAScript-defined typed arrays and cannot be used with others.

    Data.prototype = Object.create(Array.prototype, {

The `set()` function reads input from a specified array and uses this to set the values of a `Data` object.

        set: (given_data, offset) ->
            return unless this instanceof Data
            given_data = makeArrayFrom(given_data)
            offset = if offset < 0 then 0 else offset >>> 0
            index = 0
            while index < given_data.length and index + offset < @length
                this[index + offset] = given_data[index]
                index++
            return

The `subarray()` function throws a `TypeError`, as it is not supported.

>   [Issue #66](https://github.com/marrus-sh/jelli/issues/66) :
    Because the unit boundaries of `Data` arrays do not always line up with the byte boundaries of an `ArrayBuffer`, it is not possible to ensure that a new `Data` array can be created on the same `ArrayBuffer` store.
    For example, for a 6-bit Data object with the following binary data:

>   ```binary
>       000000 000101 000001
>   ```

>   …this would be stored in a 32-bit array as:

>   ```binary
>       (00000000000000)000000000101000001
>   ```

>   …which would then be broken up into the following `ArrayBuffer` bytes:

>   ```binary
>       00000000 00000000 00000001 01000001
>   ```

>   As you can see, creating a new view on this `ArrayBuffer` which starts on the second unit of 6-bit data is not easily feasible, making `subarray` implementation difficult.

        subarray: -> throw new TypeError("subarray not supported for Data objects")

The `Data` prototype should not be extended, so we freeze it.

    })

    Object.freeze Data.prototype

###  Final touches:  ###

A few additional static methods have been defined for `Data` to ease its use.

`Data.from()` is a synonym for `new Data()` that always handles its second argument as an iterable object.
This makes handling of numeric strings consistent with other string arguments, as well as passing numbers in directly to create singleton `Data` objects.
`Data.from()` works in a similar, but not identical, manner to `Array.from()`; for more information, see the above documentation for `makeArrayFrom()`.

    Data.from = (unit_size, given_data, map_function, this_arg) -> Data.call(this, unit_size, makeArrayFrom(given_data, map_function, this_arg))

`Data.of()` allows for the creation of a `Data` object from a list of arguments.

    Data.of = (unit_size, values...) -> Data.call(this, unit_size, values)

The `name`, `length`, and `BYTES_PER_ELEMENT` static properties are defined to make `Data` conform to other `TypedArray`s.
However, note that the value of this last property is `NaN`, as the number of bytes per `Data` unit varies by object.

>   **Note :**
    The `length` property of functions is non-writable, but it *is* configurable.
    Consequently, we can use `Object.defineProperties()` to set it.

    Object.defineProperties(Data, {
        "name": {value: "Data"}
        "length": {value: 3}
        "BYTES_PER_ELEMENT": {value: NaN}
    })

We can now freeze `Data` to keep it safe from interlopers, and add it to the window object.

    @Data = Object.freeze(Data)
