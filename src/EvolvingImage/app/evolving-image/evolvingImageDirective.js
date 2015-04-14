// (C) 2015 Kjetil Limkjær
// MIT licensed, see LICENSE.txt for details

// Usage example:
// <img src="image.jpg" id="imageToMatch" />
// <pre id="statistics" />
// <evolving-img target="imageToMatch" info="statistics" />

angular.module("evolving-image").directive("evolvingImg", [
	"ImageEvolver", "SourceImage", function(ImageEvolver, SourceImage) {
		"use strict";

		function link(scope, element) {
			var infoElement = document.getElementById(scope.info);

			function updateInfo(data) {
				infoElement.textContent =
					"Iterations: " + data.iterations + "\n" +
					"Generation: " + data.generations + "\n" +
					"Iterations per second: " + data.iterationsPerSecond.toFixed(0) + "\n" +
					"Minimum/threshold error: " + (data.realMinimumError / 1000).toFixed(0) + "k/" +
					(data.currentMinimumError / 1000).toFixed(0) + "k";
			}

			var targetImage = new SourceImage(scope.target);
			var evolver = new ImageEvolver(targetImage, updateInfo);
			element[0].appendChild(evolver.progressCanvas);
			evolver.start();
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