cs = require 'coffeescript'
fs = require 'fs'

LoadInstallFileAndDoƑ = (Task) ->
  fs.readFile "INSTALL.litcoffee", "utf8", (
    (Error, Data) ->
      throw Error if Error
      eval cs.compile Data, literate: yes
      do @[Task]
  ).bind {}

task "build",
  "build the Jelli Game Engine"
  -> LoadInstallFileAndDoƑ "BuildƑ"
task "watch",
  "watch for changes"
  -> LoadInstallFileAndDoƑ "WatchƑ"
task "clear",
  "remove built files"
  -> LoadInstallFileAndDoƑ "ClearƑ"
