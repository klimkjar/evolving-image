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
    this.drawImage = function (image) {
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

    this.calculateFps = function () {
      var first = timings.first();
      var last = timings.last();
      return first === last ?
        0 :
        1000 / ((last.started - first.started) / (last.drawn - first.drawn));
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
    var refreshRate = evolver.config.progressRefreshRate;

    this.progressCanvas = ie.progressCanvas;
    this.rendered = 0;
    this.improved = 0;
    this.error = 0;
    this.minError = this.realMinError = Math.pow(2, 64);
    this.image = evolver.generate.image(w, h);

    var updateInfo = function () {
      infoCallback({
        iterations: this.rendered,
        generations: this.improved,
        iterationsPerSecond: ie.calculateFps(),
        error: this.error,
        minError: this.realMinError
      });
    }.bind(this);
    setInterval(updateInfo, evolver.config.updateRefreshRate);

    var createMessageHandler = function (worker) {
      var candidate; var data;
      return function (e) {
        var message = e.data.message;
        var payload = e.data.payload;
        switch (message) {
          case "renderRequest":
            candidate = payload;
            data = ie.drawImage(candidate);
            ++this.rendered;
            worker.postMessage(
              { message: "renderResult", payload: data });
            break;
          case "errorResult":
            var error = payload;
            if (error < this.minError) {
              if (error < this.realMinError) this.realMinError = error;
              this.image = candidate;
              this.error = this.minError = error;
              if (performance.now() - lastUpdate > refreshRate) {
                var imageData = ie.progressContext.createImageData(w, h);
                imageData.data.set(data);
                ie.progressContext.putImageData(imageData, 0, 0);
                lastUpdate = performance.now();
              }
              ++this.improved;
            } else this.minError += this.realMinError * 0.0001;
            worker.postMessage({
              message: "imageRequest",
              payload: this.image
            });
            break;
        }
      }.bind(this);
    }.bind(this);

    var workers = [];
    for (var i = 0; i < evolver.config.workers; ++i) {
      var worker = new Worker("evolving-image/evolvingImageWorker.js");
      worker.onmessage = createMessageHandler(worker);
      workers.push(worker);
    }

    this.start = function () {
      for (var i = 0; i < workers.length; ++i) {
        var worker = workers[i];
        worker.postMessage({
          message: "init",
          payload: target
        });
        worker.postMessage({
          message: "imageRequest",
          payload: this.image
        });
      }
    };
  };

  return lib;
})();