/* jshint asi:true, browser:true */
/* globals ImageBitmap: true, createImageBitmap */


/*

#  tiles.js: Tile Processing Engine  #

*/

//  All inside an anonymous function for strictness and proper closure

var Tiles = (function () {

    //  Base64 handling:

    function decode64(base64) {

        //  Setting up variables:

        var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/-_";
        var data;
        var i;
        var n;
        var placeholders;
        var values = Object.create(null);

        //  Handling arguments and error checking:

        if (!(typeof base64 === "string" || base64 instanceof String) || base64.length % 4) throw new Error("(tiles.js) Collisions must be provided as a Base64-encoded string.");

        //  Setting up values:

        for (i = 0; i < 64; i++) {
            values[code[i]] = i;
        }

        //  Finding out how many placeholders there are:

        placeholders = (base64[base64.length - 2] === "=" + base64[base64.length - 1] === "=");

        //  Setting up the array:

        if (typeof Uint8Array !== 'undefined') data = new Uint8Array(3 * base64.length / 4 - placeholders);
        else data = new Array(base64.length);

        //  Loading data:

        for (i = 0; i < base64.length - 4; i++) {
            n = (values[base64[4 * i]] << 18) | (values[base64[4 * i + 1]] << 12) | (values[base64[4 * i + 2]] << 6) | values[base64[4 * i + 3]];
            data[3 * i] = (n >> 16) & 0xFF;
            data[3 * i + 1] = (n >> 8) & 0xFF;
            data[3 * i + 2] = n & 0xFF;
        }

        switch (placeholders) {

            case 0:
                n = (values[base64[4 * i]] << 18) | (values[base64[4 * i + 1]] << 12) | (values[base64[4 * i + 2]] << 6) | values[base64[4 * i + 3]];
                data[3 * i] = (n >> 16) & 0xFF;
                data[3 * i + 1] = (n >> 8) & 0xFF;
                data[3 * i + 2] = n & 0xFF;
                break;

            case 1:
                n = (values[base64[4 * i]] << 10) | (values[base64[4 * i + 1]] << 4) | (values[base64[4 * i + 2]] >> 2);
                data[3 * i] = (n >> 8) & 0xFF;
                data[3 * i + 1] = n & 0xFF;
                break;

            case 2:
                n = (values[base64[4 * i]] << 2) | (values[base64[4 * i + 1]] >> 4);
                data[3 * i] = n & 0xFF;
                break;

        }

        return data;

    }

    //  Tiles constructor:

    function Tiles(sheet, collisions, draw) {

        //  Handling arguments and error checking:

        if (!(typeof collisions === "string" || collisions instanceof String) || collisions.length % 4) throw new Error("(tiles.js) Collisions must be provided as a Base64-encoded string.");
        if (!(typeof draw === "function" || draw instanceof Function)) throw new Error("(tiles.js) No draw function provided");

        //  Adding properties:

        Object.defineProperties(this, {
            collisions: {
                value: decode64(collisions)
            },
            drawFunction: {
                value: draw
            },
            sheet: {
                value: sheet
            }
        });

    }

    //  Tiles prototyping:

    Tiles.prototype = Object.create(Object.prototype, {
        drawMap: {
            value: function (context, map, x, y, tile_width, tile_height, tiles_wide) {
                var decoded_map;
                var i;
                if (!(typeof map === "string" || map instanceof String) || map.length % 4) throw new Error("(tiles.js) Cannot draw map – map must be provided as a Base64-encoded string.");
                if (!(typeof x === "number" || x instanceof Number) || !(typeof y === "number" || y instanceof Number)) throw new Error("(tiles.js) Cannot draw map – coordinates must be numbers.");
                if (!(typeof tile_width === "number" || tile_width instanceof Number) || !(typeof tile_height === "number" || tile_height instanceof Number)) throw new Error("(tiles.js) Cannot draw map – tile widths and heights must be numbers.");
                if (!(typeof tiles_wide === "number" || tiles_wide instanceof Number)) throw new Error("(tiles.js) Cannot draw map – width of map not specified.");
                decoded_map = decode64(map);
                if (!(decoded_map) % tiles_wide) throw new Error("(tiles.js) Cannot draw map – provided map not evenly divided by its width.");
                for (i = 0; i < decoded_map.length; i++) {
                    this.drawFunction(context, this.sheet, decoded_map[i], x + (i % tiles_wide) * tile_width, y + Math.floor(i / tiles_wide) * tile_height);
                }
            },
            getCollision: {
                value: function (index) {
                    return (this.collisions[Math.floor(index / 2)] >> 4 * (index % 2)) & 0xF;
                }
            }
        }
    });

    //  Defining shorthands for tile quadrants:

    Tiles.collision = Object.create(null, {
        NO_COLLISION: {value: 0x0},
        TOPLEFT: {value: 0x1},
        TOPRIGHT: {value: 0x2},
        BOTTOMLEFT: {value: 0x4},
        BOTTOMRIGHT: {value: 0x8}
    });

    return Tiles;

})();
