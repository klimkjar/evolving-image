// (C) 2015 Kjetil Limkjær
// MIT licensed, see LICENSE.txt for details

// Usage example:
// <img src="image.jpg" id="imageToMatch" />
// <pre id="statistics" />
// <evolving-img target="imageToMatch" info="statistics" />

angular.module("evolving-image").directive("evolvingImg", [
  "ImageEvolver", "SourceImage", function (ImageEvolver, SourceImage) {
    "use strict";

    function link(scope, element) {
      var infoElement = document.getElementById(scope.info);
      var targetElement = document.getElementById(scope.target);

      function updateInfo(data) {
        infoElement.textContent =
        "Iterations: " + data.iterations + "\n" +
        "Generation: " + data.generations + "\n" +
        "Iterations per second: " + data.iterationsPerSecond.toFixed(0) + "\n" +
        "Minimum/threshold error: " + (data.realMinimumError / 1000).toFixed(0) + "k/" +
        (data.currentMinimumError / 1000).toFixed(0) + "k";
      }

      angular.element(targetElement)
        .on("load", function () {
        var targetImage = new SourceImage(scope.target);
        var evolver = new ImageEvolver(targetImage, updateInfo);
        element[0].style.width = targetElement.clientWidth + "px";
        element[0].style.height = targetElement.clientHeight + "px";
        element[0].appendChild(evolver.progressCanvas);
        evolver.start();
      });
      
      // Cover the case where the target image has already been loaded before
      // the script ran
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