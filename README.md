# tank
Multiplayer online game

## Install
`npm install`

### Errors:
Error: The specified module could not be found.
`..\node_modules\@tensorflow\tfjs-node\lib\napi-v6\tfjs_binding.node`

Solution: move 
`..\node_modules\@tensorflow\tfjs-node\deps\lib\tensorflow.dll`

to 
`..\node_modules\@tensorflow\tfjs-node\lib\napi-v6\`


### Starting the game
```npm start```

### Setting up client side
```npx webpack```

js tensorflow
https://medium.com/@pierrerouhard/reinforcement-learning-in-the-browser-an-introduction-to-tensorflow-js-9a02b143c099 
https://www.tensorflow.org/js/guide/save_load