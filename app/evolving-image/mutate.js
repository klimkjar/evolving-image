var evolver = self.evolver || {};

evolver.mutate = (function () {
  "use strict";
  function willMutate() {
    return evolver.rnd.int(0, evolver.config.mutationRate) == 0;
  }

  function willLikelyMutate() {
    return evolver.rnd.int(0, evolver.config.mutationRate / 10) == 0;
  }

  function swapRandom(array, condition) {
    condition = condition || willMutate;
    if (array.length < 2 || !condition()) return false;
    var i1; var i2 = evolver.rnd.int(0, array.length);
    do {
      i1 = evolver.rnd.int(0, array.length);
    } while (i1 == i2);
    var tmp = array[i1];
    array[i1] = array[i2];
    array[i2] = tmp;
    return true;
  }

  function removeRandom(array, minEntries, condition) {
    condition = condition || willMutate;
    if (array.length <= minEntries || !condition()) return false;
    var index = evolver.rnd.int(0, array.length);
    array.splice(index, 1);
    return true;
  }

  function addRandom(array, maxEntries, generator, condition) {
    condition = condition || willMutate;
    if (array.length >= maxEntries || !condition()) return false;
    var index = evolver.rnd.int(0, array.length);
    array.splice(index, 0, generator());
    return true;
  }

  var mutate = {};


  mutate.colour = function (colour) {
    var val = colour.value;
    var rnd = evolver.rnd;
    var mutated = false;
    
    // mutate rgb values
    for (var i = 0; i < 3; ++i) {
      if (willMutate()) {
        val[i] = rnd.int(0, 256);
        mutated = true;
      }
      if (willMutate()) {
        val[i] = rnd.fudgeInt(val[i], rnd.int(5, 30), 0, 256);
        mutated = true;
      }
      if (willMutate()) {
        val[i] = rnd.fudgeInt(val[i], rnd.int(1, 5), 0, 256);
        mutated = true;
      }
    }

    if (!colour.opaque) {
      // mutate alpha value
      if (willMutate()) {
        val[3] = Math.random();
        mutated = true;
      }
      if (willMutate()) {
        val[3] = rnd.fudgeNum(val[3], rnd.num(0.02, 0.2), 0, 1);
        mutated = true;
      }
      if (willMutate()) {
        val[3] = rnd.fudgeNum(val[3], rnd.num(0, 0.02), 0, 1);
        mutated = true;
      }
    }

    return mutated;
  };


  mutate.point = function (w, h, point) {
    var val = point.value;
    var rnd = evolver.rnd;
    var mutated = false;

    if (willMutate()) {
      val[0] = rnd.int(0, w);
      val[1] = rnd.int(0, h);
      mutated = true;
    }
    if (willMutate()) {
      val[0] = rnd.fudgeInt(val[0], rnd.int(w / 50, w / 10), 0, w);
      val[1] = rnd.fudgeInt(val[1], rnd.int(w / 50, w / 10), 0, h);
      mutated = true;
    }
    if (willMutate()) {
      val[0] = rnd.fudgeInt(val[0], rnd.int(1, w / 50), 0, w);
      val[1] = rnd.fudgeInt(val[1], rnd.int(1, w / 50), 0, h);
      mutated = true;
    }

    return mutated;
  };


  mutate.triangleStrip = (function () {
    return function (w, h, triangleStrip) {
      var points = triangleStrip.points;
      var min = evolver.config.triangleStripMinPoints;
      var max = evolver.config.triangleStripMaxPoints;
      var generator = evolver.generate.point.bind(null, w, h);
      
      var mutated = mutate.colour(triangleStrip.colour);
      for (var i = 0; i < points.length; ++i) {
        mutated = mutate.point(w, h, points[i]) || mutated;
      }
      mutated = swapRandom(points) || mutated;
      mutated = removeRandom(points, min) || mutated;
      mutated = addRandom(points, max, generator) || mutated;
      return mutated;
    };
  })();


  mutate.image = (function () {
    return function (image) {
      var w = image.width; var h = image.height;
      var components = image.components;
      var min = evolver.config.imageMinComponents;
      var max = evolver.config.imageMaxComponents;
      var gen = evolver.generate.triangleStrip.bind(null, w, h);
      
      var mutated = mutate.colour(image.background);
      for (var i = 0; i < components.length; ++i) {
        mutated = mutate.triangleStrip(w, h, components[i]) || mutated;
      }
      mutated = swapRandom(components) || mutated;
      mutated = removeRandom(components, min) || mutated;
      mutated = addRandom(components, max, gen, willLikelyMutate) || mutated;
      return mutated;
    };
  })();

  return mutate;
})();