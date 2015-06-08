importScripts("config.js");
importScripts("rnd.js");
importScripts("generate.js");
importScripts("mutate.js");
importScripts("evolvingImage.js");

var minError;
var realMinError;
var target;
var image;
var candidate;

onmessage = function (e) {
  var message = e.data.message;
  var payload = e.data.payload;
  if (!message) return;

  switch (message) {
    case "init":
      realMinError = minError = payload.minError;
      target = payload.target;
      image = candidate = payload.image;
      postMessage({ message: "render", payload: candidate });
      break;
    case "rendered":
      var data = payload;
      var error = evolver.evolve.calculateError(target, data);
      if (error < minError) {
        if (error < realMinError) realMinError = error;
        image = candidate;
        minError = error;
        postMessage({
          message: "newbest",
          payload: {
            error: error,
            data: data
          }
        });
      } else minError += realMinError * 0.0001;
      candidate = evolver.generate.image(image);
      var mutated = false;
      do {
        mutated = evolver.mutate.image(candidate);
      } while (!mutated);

      postMessage({ message: "render", payload: candidate });
      break;
  }
};