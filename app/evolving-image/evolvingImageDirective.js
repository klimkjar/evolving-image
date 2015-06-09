/// <reference path="../../typings/angularjs/angular.d.ts"/>

// (C) 2015 Kjetil Limkjær
// MIT licensed, see LICENSE.txt for details

// Usage example:
// <img src="image.jpg" id="imageToMatch" />
// <pre id="statistics" />
// <evolving-img target="imageToMatch" info="statistics" />

angular.module("evolving-image").directive("evolvingImg", [
  "ImageEvolver", function (ImageEvolver) {
    "use strict";

    function link(scope, element) {
      var infoElement = document.getElementById(scope.info);
      var targetElement = document.getElementById(scope.target);

      function updateInfo(data) {
        infoElement.textContent =
        "Iterations: " + data.iterations + "\n" +
        "Generation: " + data.generations + "\n" +
        "FPS: " + data.iterationsPerSecond.toFixed(0) + "\n" +
        "Square difference: " + data.error + "\n" +
        "Min. square difference: " + data.minError;
      }

      angular.element(targetElement)
        .on("load", function () {
        var targetImage = document.getElementById(scope.target);
        var w = targetImage.width; var h = targetImage.height;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = w; canvas.height = h;
        ctx.drawImage(targetImage, 0, 0);
        var targetImageData = ctx.getImageData(0, 0, w, h);
        element[0].style.width = w + "px";
        element[0].style.height = h + "px";

        var evolver = new ImageEvolver(targetImageData, updateInfo);
        element[0].appendChild(evolver.progressCanvas);
        evolver.start();
      });
      
      // Cover the case where the target image is fully loaded before
      // the script runs
      if (targetElement.complete && targetElement.naturalWidth !== 0) {
        angular.element(targetElement).trigger("load");
      }
    }

    return {
      restrict: "E",
      replace: "true",
      scope: {
        "target": "@",
        "info": "@"
      },
      link: link
    };

  }
]);