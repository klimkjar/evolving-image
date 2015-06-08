// (C) 2015 Kjetil Limkjær
// MIT licensed, see LICENSE.txt for details

// Module for generation of an image through an evolutionary process.
// The image is composed of a set of semitransparent polygons.
// Adds an imageEvolver object to the main namespace.

var evolver = self.evolver || {};

evolver.evolve = (function () {
  "use strict";

  var lib = {};

  // Calculate the total square error of the image.
  lib.calculateError = function (target, candidate) {
    target = target.data;
    var error = 0;
    var i = 0;
    while (i < target.length) {
      var re = target[i] - candidate[i++];
      var ge = target[i] - candidate[i++];
      var be = target[i] - candidate[i++];
      ++i;
      error += re * re + ge * ge + be * be;
    }
    return error;
  };

  // ImageEvolver(source, callback)
  //
  // This class is used to evolve a PolygonImage into a close resemblance of
  // a SourceImage. After creating an instance of the class, call start() to
  // begin or resume evolution and stop() to pause it.
  //
  // source - the SourceImage that is the goal of the evolution process
  // callback - will be called twice a second with statistics about the
  //            evolution process
  lib.ImageEvolver = function (target, infoCallback) {
    var canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    var webgl = new gfxlib.WebGL(canvas);
    var bufSize = evolver.config.statBufferLength;
    var timings = new evolver.buffer.Circular(bufSize);

    function drawPoly(polygon) {
      var c = polygon.colour.value;
      var path = polygon.points;
      var poly = [];
      for (var i = 0; i < path.length; ++i) {
        poly.push(path[i].value[0]);
        poly.push(path[i].value[1]);
      }
      webgl.drawTriangleStrip(poly, c);
    }

    // Draw the image to the target context
    this.drawImage = function(image) {
      var start = performance.now();
      webgl.clearColour(image.background.value);
      webgl.clear();
      for (var i = 0; i < image.components.length; ++i) {
        drawPoly(image.components[i]);
      }
      var data = webgl.readPixels();
      if (this.drawn % evolver.config.keepEvery == 0)
        timings.push({
          started: start, 
          drawn: this.drawn
        });
      ++this.drawn;
      return data;
    };

    this.calculateFps = function() {
      var first = timings.first();
      var last = timings.last();
      return first === last ? 
        0 :
        1000/ ((last.started - first.started) / (last.drawn - first.drawn));
    };

    this.drawn = 0;
    this.progressCanvas = document.createElement("canvas");
    this.progressCanvas.width = target.width;
    this.progressCanvas.height = target.height;
    this.progressContext = this.progressCanvas.getContext("2d");
  };

  lib.ImageEvolverUsingWebWorker = function (target, infoCallback) {
    var w = target.width; var h = target.height;
    var ie = new lib.ImageEvolver(target, infoCallback);
    var lastUpdate = 0;
    this.progressCanvas = ie.progressCanvas;
    this.rendered = 0;
    this.improved = 0;
    this.error = 0;
    this.minError = Math.pow(2, 64);
    
    var updateInfo = function() {
      infoCallback({
        iterations: this.rendered,
        generations: this.improved,
        iterationsPerSecond: ie.calculateFps(),
        error: this.error,
        minError: this.minError
      });
    }.bind(this);
    setInterval(updateInfo, evolver.config.updateRefreshRate);
    
    var worker = new Worker("evolving-image/evolvingImageWorker.js");
    worker.onmessage = function (e) {
      var refreshRate = evolver.config.progressRefreshRate;
      var message = e.data.message;
      var payload = e.data.payload;
      if (!message) return;

      switch (message) {
        case "render":
          var image = payload;
          var data = ie.drawImage(image);
          ++this.rendered;
          worker.postMessage({message: "rendered", payload: data});
          break;
        case "newbest":
          ++this.improved;
          this.error = payload.error;
          if (this.error < this.minError) this.minError = this.error;
          if (performance.now() - lastUpdate > refreshRate) {
            var imageData = ie.progressContext.createImageData(w, h);
            imageData.data.set(payload.data);
            ie.progressContext.putImageData(imageData, 0, 0);
            lastUpdate = performance.now();
          }
          break;
      }
    }.bind(this);
    
    this.start = function() {
    worker.postMessage({
      message: "init", payload: {
      minError: this.minError,
      target: target,
      image: evolver.generate.image(target.width, target.height)
    }});
    };
  };
  
  return lib;
})();