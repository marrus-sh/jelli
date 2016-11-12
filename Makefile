engine_files = source/engine/00\ Introduction.litcoffee source/engine/01\ Jelli.litcoffee source/engine/02\ Game.litcoffee source/engine/03\ Area.litcoffee source/engine/04\ Collection.litcoffee source/engine/05\ Unit.litcoffee source/engine/06\ PlacementImage.litcoffee source/engine/07\ Character.litcoffee source/engine/08\ Text.litcoffee source/engine/09\ View.litcoffee
modules = source/modules/Control.litcoffee source/modules/Data.litcoffee source/modules/Letters.litcoffee source/modules/Screen.litcoffee source/modules/Sheet.litcoffee source/modules/Tileset.litcoffee source/modules/Gel.litcoffee
additional_source = source/README.litcoffee

jelli.js jelli again everything: $(additional_source) $(engine_files) $(modules)
	rm -rf source/compiled source/modules/compiled source/engine/compiled
	coffee -c -o source/compiled $(additional_source)
	coffee -c -o source/modules/compiled $(modules)
	coffee -c -o source/engine/compiled $(engine_files)
	cat source/compiled/* source/modules/compiled/* source/engine/compiled/* > jelli.js
	uglifyjs jelli.js -m -c > jelli.min.js
	rm -rf source/compiled source/modules/compiled source/engine/compiled

clean:
	rm -rf source/compiled source/modules/compiled source/engine/compiled

gone:
	rm -f jelli.js

.PHONY: again clean everything gone jelli
