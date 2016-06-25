// Generated by CoffeeScript 1.10.0

/*
THE JELLI GAME ENGINE
Programmed by Margaret Russel
-----------------------------
Programmed through several modules in Literate CoffeeScript.
Source code available at https://github.com/literallybenjam/jelli/.
 */

(function() {


}).call(this);
// Generated by CoffeeScript 1.10.0
(function() {
  "use strict";
  var Control,
    slice = [].slice;

  Control = function(doc) {
    if (doc == null) {
      doc = document;
    }
    this.controls = {};
    this.ownerDocument = !(doc instanceof Document) ? document : doc;
    this.keys = {};
    Object.freeze(this);
    doc.defaultView.addEventListener("keydown", this, false);
    return doc.defaultView.addEventListener("keyup", this, false);
  };

  window.Control = Control;

  Control.prototype = {
    add: function(name) {
      if (name == null) {
        return;
      }
      this.controls[name] = false;
      return this;
    },
    addKeys: function() {
      var i, key, keys, len, name;
      name = arguments[0], keys = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (!((name != null) && (this.controls[name] != null))) {
        return;
      }
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        this.keys[key] = name;
      }
      return this;
    },
    getName: function(key) {
      if (!((key != null) && (this.keys[key] != null))) {

      } else {
        return this.keys[key];
      }
    },
    handleEvent: function(e) {
      var i, j, key, len, len1, ref, ref1;
      if (!(e instanceof Event)) {
        return;
      }
      switch (e.type) {
        case "keydown":
          ref = [e.code, e.key, e.keyIdentifier, e.keyCode];
          for (i = 0, len = ref.length; i < len; i++) {
            key = ref[i];
            if (this.isKeyDefined(key)) {
              this.toggleKey(key, true);
            }
          }
          break;
        case "keyup":
          ref1 = [e.code, e.key, e.keyIdentifier, e.keyCode];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            key = ref1[j];
            if (this.isKeyDefined(key)) {
              this.toggleKey(key, false);
            }
          }
      }
    },
    isActive: function(name) {
      if (!((name != null) && (this.controls[name] != null))) {

      } else {
        return !!this.controls[name];
      }
    },
    isDefined: function(name) {
      if (name == null) {

      } else {
        return controls[name] != null;
      }
    },
    isKeyActive: function(key) {
      var name;
      if (!((key != null) && ((name = this.keys[key]) != null) && (this.controls[name] != null))) {

      } else {
        return !!this.controls[name];
      }
    },
    isKeyDefined: function(key) {
      var name;
      if (!((key != null) && ((name = this.keys[key]) != null))) {

      } else {
        return this.controls[name] != null;
      }
    },
    remove: function(name) {
      if (name == null) {
        return;
      }
      delete this.controls[name];
      return this;
    },
    removeKeys: function() {
      var i, key, keys, len;
      keys = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        delete this.keys[key];
      }
      return this;
    },
    toggle: function(name, to) {
      if (to == null) {
        to = !this.controls[name];
      }
      if (!((name != null) && (this.controls[name] != null))) {

      } else {
        return this.controls[name] = !!to;
      }
    },
    toggleKey: function(key, to) {
      var name;
      if (to == null) {
        to = !this.controls[this.keys[key]];
      }
      if (!((key != null) && (name = this.keys[key]) && this.controls[name])) {

      } else {
        return controls[name] = !!to;
      }
    }
  };

  Object.freeze(Control.prototype);

}).call(this);
// Generated by CoffeeScript 1.10.0
(function() {
  "use strict";
  var Screen;

  Screen = function(canvas, context) {
    var doc;
    if (context == null) {
      context = "2d";
    }
    if (!(canvas instanceof HTMLCanvasElement)) {
      doc = document;
      canvas = doc.getElementById(canvas);
      if (!(canvas instanceof HTMLCanvasElement)) {
        canvas = void 0;
      }
    } else {
      doc = canvas.ownerDocument;
    }
    this.canvas = canvas;
    this.context = canvas ? canvas.getContext(context) : void 0;
    this.ownerDocument = doc;
    Object.defineProperties(this, {
      height: {
        get: function() {
          if (this.canvas) {
            return this.canvas.height;
          }
        },
        set: function(n) {
          if (this.canvas) {
            return this.canvas.height = n;
          }
        }
      },
      width: {
        get: function() {
          if (this.canvas) {
            return this.canvas.width;
          }
        },
        set: function(n) {
          if (this.canvas) {
            return this.canvas.width = n;
          }
        }
      }
    });
    return Object.freeze(this);
  };

  window.Screen = Screen;

  Screen.prototype = {
    clear: function() {
      if (!(this.canvas instanceof HTMLCanvasElement)) {
        return;
      }
      if (this.context instanceof CanvasRenderingContext2D) {
        return this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      } else if (this.context instanceof WebGLRenderingContext) {
        return this.context.clear(this.context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
      }
    }
  };

  Object.freeze(Screen.prototype);

}).call(this);
// Generated by CoffeeScript 1.10.0
(function() {
  var Sheet, Sprite, drawSprite;

  drawSprite = function(sheet, start_index, context, x, y, frame) {
    var height, i, image, j, source, width;
    if (frame == null) {
      frame = 1;
    }
    if (!(sheet instanceof Sheet && start_index < sheet.size && context instanceof CanvasRenderingContext2D)) {
      return;
    }
    if (isNaN(start_index = Number(start_index))) {
      start_index = 0;
    }
    if (isNaN(x = Number(x))) {
      x = 0;
    }
    if (isNaN(y = Number(y))) {
      y = 0;
    }
    if (isNaN(frame = Number(frame))) {
      frame = 0;
    }
    start_index += frame;
    i = start_index % sheet.width;
    j = Math.floor(start_index / sheet.width);
    source = sheet.source;
    image = sheet.image;
    if ((source instanceof HTMLImageElement && source.complete || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && createImageBitmap !== null) && (image instanceof ImageBitmap || source instanceof ImageBitmap)) && !isNaN(i) && !isNaN(j) && Number(width = sheet.sprite_width) && Number(height = sheet.sprite_height)) {
      return context.drawImage(((typeof createImageBitmap !== "undefined" && createImageBitmap !== null) && image instanceof ImageBitmap ? image : source), i * width, j * height, width, height, x, y, width, height);
    }
  };

  Sprite = function(sheet, index, length) {
    if (length == null) {
      length = 1;
    }
    if (isNaN(index = Number(index))) {
      index = 0;
    }
    if (isNaN(length = Number(length))) {
      length = 1;
    }
    this.draw = drawSprite.bind(null, sheet, index);
    this.height = sheet instanceof Sheet ? sheet.sprite_height : 0;
    this.index = index;
    this.frames = length;
    this.sheet = sheet instanceof Sheet ? sheet : null;
    this.width = sheet instanceof Sheet ? sheet.sprite_width : 0;
    return Object.freeze(this);
  };

  Sprite.prototype = {
    draw: function() {}
  };

  Object.freeze(Sprite.prototype);

  Sheet = function(source, sprite_width, sprite_height) {
    var source_height, source_width;
    if (!(source instanceof HTMLImageElement || source instanceof SVGImageElement || source instanceof HTMLCanvasElement || (typeof createImageBitmap !== "undefined" && createImageBitmap !== null) && source instanceof ImageBitmap)) {
      source = null;
    }
    if (isNaN(sprite_width = Number(sprite_width))) {
      sprite_width = 0;
    }
    if (isNaN(sprite_height = Number(sprite_height))) {
      sprite_height = 0;
    }
    if (!((source != null) && !isNaN(source_width = Number(source.naturalWidth != null ? source.naturalWidth : source.width)))) {
      source_width = 0;
    }
    if (!((source != null) && !isNaN(source_height = Number(source.naturalHeight != null ? source.naturalHeight : source.height)))) {
      source_height = 0;
    }
    this.height = Math.floor(source_height / sprite_height);
    this.source = source;
    this.sprite_height = sprite_height;
    this.sprite_width = sprite_width;
    this.width = Math.floor(source_width / sprite_width);
    this.size = this.width * this.height;
    if (typeof createImageBitmap !== "undefined" && createImageBitmap !== null) {
      (createImageBitmap(source)).then((function(_this) {
        return function(image) {
          return _this.image = image;
        };
      })(this));
    }
    return Object.freeze(this);
  };

  Sheet.draw = function(context, sprite, x, y, frame) {
    if (frame == null) {
      frame = 0;
    }
    if (sprite instanceof Sprite) {
      return sprite.draw(context, x, y, frame);
    }
  };

  Sheet.drawSheetAtIndex = function(context, sheet, index, x, y) {
    if (sheet instanceof Sheet) {
      return sheet.drawIndex(context, index, x, y);
    }
  };

  Sheet.Sprite = Sprite;

  window.Sheet = Sheet;

  Sheet.prototype = {
    drawIndex: function(context, index, x, y) {
      return drawSprite(this, index, context, x, y);
    },
    getSprite: function(index, length) {
      if (length == null) {
        length = 1;
      }
      return new Sprite(this, index, length);
    }
  };

  Object.freeze(Sheet.prototype);

}).call(this);
