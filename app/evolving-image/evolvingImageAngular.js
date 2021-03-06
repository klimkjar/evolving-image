﻿/// <reference path="../../typings/angularjs/angular.d.ts"/>

// (C) 2015 Kjetil Limkjær
// MIT licensed, see LICENSE.txt for details

// Angular module for generation of an image through an evolutionary process.
// The image is composed of a set of semitransparent polygons.
// Typically used within an evolvingImage directive, see
// evolvingImageDirective.js for usage example

(function () {
  "use strict";

  var mod = angular.module("evolving-image", []);

  // ImageEvolver(source, callback)
  //
  // This class is used to evolve a PolygonImage into a close resemblance of
  // a SourceImage. After creating an instance of the class, call start() to
  // begin or resume evolution and stop() to pause it.
  //
  // source - the SourceImage that is the goal of the evolution process
  // callback - will be called twice a second with statistics about the
  //            evolution process
  mod.factory("ImageEvolver", function () {
    return evolver.evolve.ImageEvolverUsingWebWorker;
  });

})();