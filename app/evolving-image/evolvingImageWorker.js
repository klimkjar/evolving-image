importScripts("config.js");
importScripts("rnd.js");
importScripts("generate.js");
importScripts("mutate.js");
importScripts("evolvingImage.js");

var target;
var image;
var candidate;

onmessage = function (e) {
  var message = e.data.message;
  var payload = e.data.payload;
  if (!message) return;

  switch (message) {
    case "init":
      target = payload;
      break;
    case "imageRequest":
      candidate = evolver.generate.image(payload);
      var mutated;
      do {
        mutated = evolver.mutate.image(candidate);
      } while (!mutated);
      postMessage({ message: "renderRequest", payload: candidate });
      break;
    case "renderResult":
      var data = payload;
      var error = evolver.evolve.calculateError(target, data);
      postMessage({ message: "errorResult", payload: error });
      break;
  }
};