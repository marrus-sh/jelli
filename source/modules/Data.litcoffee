#  DATA  #
Typed arrays of varying bit-depths.

- - -

##  Introduction  ##

>   *To come.*

##  Implementation  ##

    "use strict";

    ###
    DATA
    The Jelli Game Engine
    ---------------------
    ###

The `Data` module provides access to large arrays of data using JavaScript's `ArrayBuffer`s.

###  Before we begin:  ###

If the current browser doesn't support typed arrays, then we will just use normal ones.
(This allows us to maintain support for IE9).

>   **Note :**
If you have your own polyfill and/or require typed array feature-detection, this must take place *before* loading the `Data` module, as this mapping is done globally.

    for typed_array in ["Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"]
        window[typed_array] = Array unless typed_array of window

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
        0           #  null:0
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

    makeArrayFrom = (something, map_function, this_arg) ->

First, we turn what we are given into an object; this is our array data.

        array_data = Object(something)

If our `something` is a number, we create a singleton array containing that number.
Otherwise, if our `array_data` doesn't have a length, we instead use `something`'s string representation.

>   **Note :**
    This is different from `Array.from()`, which returns an empty array for non-iterable objects.
    It means, for example, that `makeArrayFrom(2)` will process `2` as `[2]` and `null` as `"null"`.

        array_data = (if typeof something is "number" or (something instanceof Number) then [something] else new String(something)) unless array_data.length?
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

We need `unit_size` to be a number; if not specified, it defaults to `0`.
If `length_or_data` is a number, then it gives the length.
If it is an array or string, then it gives us our data.

>   **Note :**
    If the value passed to `length_or_data` is a single-element array (such as `[2]`), this will be interpreted as *data*, even though JavaScript is able to interpret these values as numbers.
    The same does *not* hold true for a numeric string (such as "42").
    This design choice was made to allow the reading of lengths directly from HTML/XML attributes, and can be effectively circumvented by using `Data.from()`.
    Because of this quirk in string handling, it is **strongly recommended** that data strings only be passed to `Data()` directly as arrays whenever their contents are not known.

        @unitSize = if unit_size < 0 then 0 else unit_size >>> 0

Right now, `Data` does not support bytes more than `32` bits long.

        @unitSize = 32 if @unitSize > 32

If we were given an `ArrayBuffer`, then we use that to set up our internal typed array.

        if ArrayBuffer? and length_or_data instanceof ArrayBuffer
            @buffer = length_or_data
            @byteOffset = 0 if (@byteOffset = byte_offset) < 0
            @byteOffset = @buffer.byteLength if (@byteOffset >>>= 0) > @buffer.byteLength
            @length = if length_for_buffer < 0 then 0 else length_for_buffer >>> 0
            internal_byte_depth = if @unitSize < 11 then byte_depth[@unitSize] else 1
            internal_byte_size = if @unitSize < 11 then array_size[@unitSize] else if @unitSize < 17 then 16 else 32
            @byteLength = Math.ceil(@length / internal_byte_depth) * internal_byte_size / 8
            @byteLength = @buffer.byteLength - @byteOffset if @byteLength > @buffer.byteLength - @byteOffset
            internal_array = new (
                    switch (internal_byte_size)
                        when 0 then ->
                        when 8 then Uint8Array
                        when 16 then Uint16Array
                        else Uint32Array
            )(
                @buffer, @byteOffset, @byteLength
            )
            @length = internal_array.length * internal_byte_depth if internal_array.length * internal_byte_depth < @length
            given_data = []

Otherwise, we have to create our own.

        else
            if length_or_data? and (length_or_data instanceof Array or isNaN(length_or_data))
                given_data = makeArrayFrom(length_or_data)
                @length = given_data.length
            else
                given_data = []
                @length = if length_or_data < 0 then 0 else length_or_data >>> 0
            internal_byte_depth = if @unitSize < 11 then byte_depth[@unitSize] else 1
            internal_byte_size = if @unitSize < 11 then array_size[@unitSize] else if @unitSize < 17 then 16 else 32
            internal_array = new (
                    switch (internal_byte_size)
                        when 0 then ->
                        when 8 then Uint8Array
                        when 16 then Uint16Array
                        else Uint32Array
            )(
                if byte_depth then Math.ceil(@length / internal_byte_depth) else 0
            )
            @buffer = internal_array.buffer
            @byteOffset = 0
            @byteLength = internal_array.byteLength

Next, we programmatically create our getters and setters for specific array values, from `0` through `@length - 1`.
At the same time, we initialize the values of our data array based on `given_data`, if it was provided.

        if @length
            for index in [0 .. @length - 1]
                Object.defineProperty(this, index, {
                    get: getIndexOfDataArray.bind(this, internal_array, @unitSize, index)
                    set: setIndexOfDataArray.bind(this, internal_array, @unitSize, index)
                    enumerable: true
                })
                this[index] = given_data[index] if given_data[index]?

The `constructor` property just returns this constructor.

        @constructor = Data

Properties which are not indices should not be enumerated, so we quickly adjust for that here:

        Object.defineProperties(this, {
            buffer: {enumerable: false}
            constructor: {enumerable: false}
            byteLength: {enumerable: false}
            byteOffset: {enumerable: false}
            length: {enumerable: false}
            unitSize: {enumerable: false}
        })

That's it!
`Data` objects are themselves immutable, so we freeze the object, we're done.

        Object.freeze this

###  The prototype:  ###

The `Data` prototype provides the same methods as `TypedArray`s, with the exception of `subarray`, which is not presently feasible.
It inherits from the `Array` prototype to make facilitating this simple.

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

The `Data` prototype should not be extended, so we freeze it.

    })

    Object.freeze Data.prototype

###  Final touches:  ###

A few additional static methods have been defined for `Data` to ease its use.

`Data.from()` is a synonym for `new Data()` that always handles its second argument as an iterable object.
This makes handling of numeric strings consistent with other string arguments, as well as passing numbers in directly to create singleton `Data` objects.
`Data.from()` works in a similar, but not identical, manner to `Array.from()`; for more information, see the above documentation for `makeArrayFrom()`.

    Data.from = (unit_size, given_data, map_function, this_arg) -> new Data(unit_size, makeArrayFrom(given_data, map_function, this_arg))

`Data.of()` allows for the creation of a `Data` object from a list of arguments.

    Data.of = (unit_size, values...) -> new Data(unit_size, values)

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
