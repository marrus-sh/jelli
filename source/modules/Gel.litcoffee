#  GEL  #
Generally Easy Ledger parsing.

- - -

##  Description  ##

The `Gel` module provides a CoffeeScript parser for [Generally Easy Ledgers](http://langdev.xyz/documentation/standards/WD/0003.txt).

###  Record format  ###

The `gel.records` property returns an array of all of the records in the GEL source.
Each record is a frozen object whose own properties are the field names of the record, and whose property values are the field values.
In the instance that multiple fields with the same name exist in the record, the value of the corresponding property will be an array containing the values in order.
For example, the following GEL record:

>   ```gel
>   %%
>   PropA : 5
>   PropB : hello
>   PropC : disco
>   PropB : world
>   %%
>   ```

…will produce the following object:

>   ```javascript
>   {
>       "PropA": "5",
>       "PropB": ["hello", "world"],
>       "PropC": "disco"
>   }
>   ```

The `Gel()` constructor does not validate its input against an ELM or perform any type-checking, and the values of its properties are always strings or arrays thereof.

###  The `Gel` object:  ###

####  The constructor  ####

#####  SYNTAX  #####

>   ```javascript
>   new Gel(source);
>   ```

-   **`source`**—
    A text string containing the source code of the GEL.

#####  PROPERTIES  #####

-   **`Gel.prototype`**—
    The `Gel` prototype object.

#####  METHODS  #####

The `Gel()` constructor does not have any methods.

####  `Gel` instances  ####

#####  PROPERTIES  #####

-   **`gel.source`**—
    The text source code of the GEL.
    **Read-only.**

-   **`gel.records`**—
    An array containing all of the records in the GEL.
    **Read-only.**

#####  METHODS  #####

`Gel()` instances do not have any methods.

###  Examples:  ###

####  Loading a GEL from a file  ####

>   ```javascript
>   var request = new XMLHttpRequest();
>   var gel;
>
>   request.addEventListener("load", function () {gel = Gel(this.responseText);}, false);
>   request.open("GET", "http://example.com/some.gel");
>   request.responseType = "text";
>   request.overrideMimeType("text/plain");
>   request.send();
>   ```

##  Implementation  ##

    "use strict";

    ###
    GEL
    Generally Easy Ledger parsing
    -----------------------------
    ###

The `Gel` constructor simply creates an array of objects, each of which signifies a single GEL record.
Each object associates that record's various field names with their values.

###  The constructor:  ###

The `Gel` constructor takes only one argument: `source`, which must be a string.

    Gel = (source) ->

First we handle the arguments.
If we are not given a string, then we will default to an empty GEL.

        source = "" unless typeof source is "string" or (source instanceof String)

The `records` variable will hold the processed records.
It starts out as an empty array.

        records = []

We can now loop over each record and extract its data.
We'll store the processed data in `record_data` for now.

        for record in source.split("\n%%\n")
            do (record) ->

                record_data = {}

The `last_name` variable keeps track of the last field name to have been read.
It is used when handling continuation lines and starts out `undefined`.
The `record_indent` variable keeps track of the indentation of the record.
It also starts out `undefined`.

                last_name = undefined
                record_indent = undefined

We now read the lines of the record and process each in turn.

                for line in record.split("\n")
                    do (line) ->

If the line is a comment, then we do nothing.
Otherwise, we check for the existence of the field delimeter.

                        return if line[0] is "%"
                        index = line.indexOf(" : ")

If the line has the field delimeter, then we also need to check its indentation.
If the record indentation has not yet been set, we set it.

                        if index isnt -1
                            indentation = 0
                            indentation++ while line[n] is ""
                            record_indent = indentation unless record_indent?

We now have the information we need to identify continuation lines.

                        if index is -1 or indentation isnt record_indent

If there is a `last_name`, we append the data from this line onto its latest data.

                            if last_name?
                                if Array.isArray(record_data[last_name]) then record_data[last_name][record_data[last_name].length - 1] += "\n" + line.trim() else record_data[last_name] += "\n" + line.trim()

Otherwise, the continuation line is in error and we do nothing.

>   [Issue #40](https://github.com/literallybenjam/jelli/issues/40) :
    This should throw an error in strict mode.

If the line wasn't a continuation line, then we need to add it to our record.

                        else
                            last_name = line.substr(0, index).trim()
                            if record_data[last_name]?
                                if Array.isArray(record_data[last_name]) then record_data[last_name][record_data[last_name].length] = line.substr(index + 3).trim() else record_data[last_name] = [record_data[last_name], line.substr(index + 3)]
                            else record_data[last_name] = line.substr(index + 3)

                        return

If `record_data` isn't empty, it should be added to our `records`.

                is_empty = true
                for own key, value of record_data
                    is_empty = false
                    break
                records[records.length] = record_data unless is_empty

                return

Finally, we can allow access to `source` and `records` through the instance's properties.
We want `source` to be a string literal, so we use `String()` to ensure this.
Similarly, we want to make sure we freeze our records.

        Object.defineProperties this, {
            source: {value: String(source)}
            records: {value: Object.freeze(records)}
        }

###  The prototype:  ###

The `Gel` constructor simply uses the `Object` prototype.

    Screen.prototype = Object.freeze(Object.create(Object.prototype))

###  Final touches:  ###

We want `Gel` to be available to the game engine, so of course we attach it to the window.
We freeze it to keep the constructor safe and sound.

    @Gel = Object.freeze(Gel)

And that's a wrap!
