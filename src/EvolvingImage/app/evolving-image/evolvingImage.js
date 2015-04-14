// (C) 2015 Kjetil Limkjær
// MIT licensed, see LICENSE.txt for details

// Angular module for generation of an image through an evolutionary process.
// The image is composed of a set of semitransparent polygons.
// Typically used within an evolvingImage directive, see evolvingImageDirective.js for usage example

(function () {
	"use strict";

	var mod = angular.module("evolving-image", []);

	// TODO: Make mutation rate user-configurable
	var RATE = 1000;

	// Random helper functions

	function getRandomIntInRange(min, maxExclusive) {
		return Math.floor(Math.random() * (maxExclusive - min)) + min;
	}

	function getRandomIntInRangeInclusive(min, maxInclusive) {
		var maxExclusive = maxInclusive + 1;
		return getRandomIntInRange(min, maxExclusive);
	}

	function getRandomInRange(min, maxExclusive) {
		return Math.random() * (maxExclusive - min) + min;
	}

	function willMutate(rate) {
		return getRandomIntInRange(0, rate) === 0;
	}

	function fudgeAndClamp(value, adjustment, min, max) {
		return Math.min(Math.max(min, value +
			getRandomInRange(-adjustment, adjustment)), max);
	}

	function fudgeAndClampInt(value, adjustment, min, max) {
		return Math.min(Math.max(min, value +
			getRandomIntInRangeInclusive(-adjustment, adjustment)), max);
	}

	// Colour(owner, source)
	//
	// A mutatable RGBA colour value. 
	//
	// owner - required, specifies the PolygonImage where this colour is used.
	// source - optional, if specified the created colour will be a clone of the 
	//			source colour. If left out, a random colour will be created.
	mod.factory("Colour", function() {

		// Colour array index constants
		var RED = 0;
		var GREEN = 1;
		var BLUE = 2;
		var ALPHA = 3;

		// Colour-specific random helper functions

		function getRandomRgb() {
			return getRandomIntInRange(0, 256);
		}

		function getRandomAlpha() {
			return Math.random();
		}

		function Colour(owner, source) {

			// Mutates the colour. Every colour field has a probability of mutating
			// by a large (full range), medium (+/- 20) or small (+/- 3) amount.
			// For the alpha channel, the medium range is (+/- 0.1) and the small
			// range is (+/- 0.01). The odds of mutation happening is defined
			// in the RATE constant, every step has a 1 in RATE chance of happening.
			//
			// If the colour is opaque, no mutation of the alpha channel will occur.
			//
			// If any mutations have occured, the owner PolygonImage is marked as dirty.
			this.mutate = function() {
				var self = this;

				function mutateRgbField(index) {
					if (willMutate(RATE)) {
						self.values[index] = getRandomRgb(0, 256);
						owner.isDirty = true;
					}
					if (willMutate(RATE)) {
						self.values[index] = fudgeAndClampInt(self.values[index], 20, 0, 255);
						owner.isDirty = true;
					}
					if (willMutate(RATE)) {
						self.values[index] = fudgeAndClampInt(self.values[index], 3, 0, 255);
						owner.isDirty = true;
					}
				}

				function mutateAlphaField() {
					if (self.isOpaque) return;
					if (willMutate(RATE)) {
						self.values[ALPHA] = getRandomAlpha();
						owner.isDirty = true;
					}
					if (willMutate(RATE)) {
						self.values[ALPHA] = fudgeAndClamp(self.values[ALPHA], 0.1, 0, 1);
						owner.isDirty = true;
					}
					if (willMutate(RATE)) {
						self.values[ALPHA] = fudgeAndClamp(self.values[ALPHA], 0.01, 0, 1);
						owner.isDirty = true;
					}
				}

				mutateRgbField(RED);
				mutateRgbField(GREEN);
				mutateRgbField(BLUE);
				mutateAlphaField();
			};

			if (source != null) {
				this.isOpaque = source.isOpaque;
				this.values = [
					source.values[0],
					source.values[1],
					source.values[2],
					source.values[3]
				];
			} else {
				this.isOpaque = false;
				this.values = [
					getRandomRgb(),
					getRandomRgb(),
					getRandomRgb(),
					getRandomAlpha()
				];
				owner.isDirty = true;
			}
		}

		// Returns the rgba() css representation of the colour.
		Colour.prototype.toString = function() {
			return "rgba(" + this.values.join(",") + ")";
		};

		// Marks the colour as being opaque. This forces the alpha value to 1.0
		// and prevents further mutations to the alpha value.
		Colour.prototype.setOpaque = function() {
			this.isOpaque = true;
			this.values[3] = 1.0;
		};

		return Colour;

	});

	// Point(owner, source)
	//
	// A mutatable x/y-coordinate.
	//
	// owner - required, specifies the PolygonImage where this point is used.
	// source - optional, if specified the created point will be a clone of the 
	//			source point. If left out, a random point will be created.
	mod.factory("Point", function() {
		function Point(owner, source) {
			var self = this;

			function getRandomX() {
				return getRandomIntInRange(0, owner.width);
			}

			function getRandomY() {
				return getRandomIntInRange(0, owner.height);
			}

			function randomize() {
				self.x = getRandomX();
				self.y = getRandomY();
				owner.isDirty = true;
			};

			// Mutates the point. The X and Y axis has a probability of mutating
			// by a large (full range), medium (+/- 20) or small (+/- 3) amount.
			// The odds of mutation happening is defined in the RATE constant, every
			// step has a 1 in RATE chance of happening.
			//
			// If any mutations have occured, the owner PolygonImage is marked as dirty.
			this.mutate = function() {
				if (willMutate(RATE)) {
					randomize();
				}
				if (willMutate(RATE)) {
					this.x = Math.min(Math.max(0, this.x + getRandomIntInRangeInclusive(-20, 20)), owner.width);
					this.y = Math.min(Math.max(0, this.y + getRandomIntInRangeInclusive(-20, 20)), owner.height);
					owner.isDirty = true;
				}
				if (willMutate(RATE)) {
					this.x = Math.min(Math.max(0, this.x + getRandomIntInRangeInclusive(-3, 3)), owner.width);
					this.y = Math.min(Math.max(0, this.y + getRandomIntInRangeInclusive(-3, 3)), owner.height);
					owner.isDirty = true;
				}
			};

			if (source != null) {
				this.x = source.x;
				this.y = source.y;
			} else {
				randomize();
			}
		}

		return Point;
	});

	// Polygon(owner, source)
	//
	// A mutatable polygon.
	//
	// owner - required, specifies the PolygonImage where this polygon is used.
	// source - optional, if specified the created polygon will be a clone of the 
	//			source polygon. If left out, a random polygon will be created.
	mod.factory("Polygon", [
		"Colour", "Point",
		function (Colour, Point) {
			// TODO: Make min/max number of points in polygon user-configurable
			var MINPOINTS = 3;
			var MAXPOINTS = 10;

			function Polygon(owner, source) {

				function generatePath() {
					var points = getRandomIntInRangeInclusive(MINPOINTS, MAXPOINTS);
					var path = new Array(points);
					for (var i = 0; i < points; ++i) {
						path[i] = new Point(owner);
					}
					return path;
				}

				function copyPath(source) {
					var points = source.length;
					var path = new Array(points);
					for (var i = 0; i < points; ++i) {
						path[i] = new Point(owner, source[i]);
					}
					return path;
				}

				// Mutates the polygon. Possible mutations are:
				//   * Colour change (see Colour.mutate for details)
				//   * Addition of a point, if the polygon has fewer than the maximum points
				//   * Removal of a point, if the polygon has more than the minimum points
				//   * Mutation of all points in the polygon (see Point.mutate for details)
				this.mutate = function() {
					this.colour.mutate();
					if (willMutate(RATE) && this.path.length > MINPOINTS) {
						var index = getRandomIntInRange(0, this.path.length);
						this.path.splice(index, 1);
						owner.isDirty = true;
					}
					if (willMutate(RATE) && this.path.length < MAXPOINTS) {
						var index = getRandomIntInRange(0, this.path.length);
						this.path.splice(index, 0, new Point(this));
						owner.isDirty = true;
					}
					for (var i = 0; i < this.path.length; ++i) {
						this.path[i].mutate();
					}
				};

				if (source != null) {
					this.colour = new Colour(owner, source.colour);
					this.path = copyPath(source.path);
				} else {
					this.colour = new Colour(owner);
					this.path = generatePath();
					owner.isDirty = true;
				}
			}

			return Polygon;

		}
	]);

	// PolygonImage(width, height)
	// PolygonImage(source)
	//
	// A mutatable polygon image.
	//
	// source - optional - if specified the created image will be a clone of the 
	//			source image. If left out, a random image will be created. When
	//          this parameter is left out, the width and height parameters are
	//			required.
	// width - width of the image. Required when creating a new image.
	// height - height of the image. Required when creating a new image.
	mod.factory("PolygonImage", [
		"Polygon", "Colour", function(Polygon, Colour) {
			// TODO: Make min/max number of polygons in image user-configurable
			var MINPOLYGONS = 0;
			var MAXPOLYGONS = 50;

			// overloaded constructor, signatures:
			// PolygonImage(width, height)
			// PolygonImage(source)
			function PolygonImage(p1, p2) {
				var polygonCount, polygons, i, source;

				// parse parameters
				if (p2 == null) {
					source = p1;
				} else {
					this.width = p1;
					this.height = p2;
				}

				if (source != null) {
					this.width = source.width;
					this.height = source.height;
					this.background = source.background;
					polygonCount = source.polygons.length;
					polygons = new Array(polygonCount);
					for (i = 0; i < polygonCount; ++i) {
						polygons[i] = new Polygon(this, source.polygons[i]);
					}
					this.polygons = polygons;
					this.isDirty = source.isDirty;
				} else {
					this.background = new Colour(this);
					this.background.setOpaque();
					polygonCount = getRandomIntInRangeInclusive(MINPOLYGONS, MAXPOLYGONS);
					polygons = new Array(polygonCount);
					for (i = 0; i < polygonCount; ++i) {
						polygons[i] = new Polygon(this);
					}
					this.polygons = polygons;
					this.isDirty = true;
				}
			};

			// Mutates the polygon image. Possible mutations are:
			//   * Background colour change (see Colour.mutate for details)
			//   * Addition of a polygon, if the image has fewer than the maximum polygons
			//   * Removal of a polygon, if the polygon has more than the minimum polygons
			//   * Mutation of all polygons in the image (see Polygon.mutate for details)
			PolygonImage.prototype.mutate = function() {
				this.background.mutate();
				if (willMutate(RATE) && this.polygons.length > MINPOLYGONS) {
					var index = getRandomIntInRange(0, this.polygons.length);
					this.polygons.splice(index, 1);
					this.isDirty = true;
				}
				if (willMutate(RATE / 10) && this.polygons.length < MAXPOLYGONS) {
					var index = getRandomIntInRange(0, this.polygons.length);
					this.polygons.splice(index, 0, new Polygon(this));
					this.isDirty = true;
				}
				for (var i = 0; i < this.polygons.length; ++i) {
					this.polygons[i].mutate();
				}
			};

			return PolygonImage;

		}
	]);

	// SourceImage(id)
	//
	// A source image used for getting pixel values to compare the evolved images
	// with.
	//
	// id - the id of the <img> on the page.
	mod.factory("SourceImage", function() {
		function SourceImage(id) {
			var img = document.getElementById(id),
				width = img.width,
				height = img.height,
				canvas = document.createElement("canvas"),
				context = canvas.getContext("2d");

			canvas.width = width;
			canvas.height = height;
			context.drawImage(img, 0, 0);

			this.data = context.getImageData(0, 0, width, height).data;
			this.width = width;
			this.height = height;
		}

		return SourceImage;
	});

	// ImageEvolver(source, callback)
	//
	// This class is used to evolve a PolygonImage into a close resemblance of a SourceImage.
	// After creating an instance of the class, call start() to begin or resume evolution and 
	// stop() to pause it.
	//
	// source - the SourceImage that is the goal of the evolution process
	// callback - will be called twice a second with statistics about the evolution process
	mod.factory("ImageEvolver", [
		"PolygonImage",
		function(PolygonImage) {
			function ImageEvolver(source, infoCallback) {
				// Number of timing statistics to keep for calculating average fps
				var STAT_BUFFER_LENGTH = 1000;
				// TODO: Make refresh rate of progress canvas user-configurable
				var PROGRESS_REFRESH_RATE = 1000 / 25;

				var canvas = document.createElement("canvas"),
					context = canvas.getContext("2d"),
					image = new PolygonImage(source.width, source.height),
					minError = Math.pow(2, 32),
					realMinError = Math.pow(2, 32),
					iterations = 0,
					generations = 0,
					lastUpdate = 0,
					timings = new Array(STAT_BUFFER_LENGTH),
					isRunning = false,
					evolveInterval,
					infoInterval,
					evolutionStarted,
					progressContext;

				// Calculate the total square error of the image.
				function calculateError() {
					var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
					var targetData = source.data;
					var error = 0;
					var i = 0;
					while (i < data.length) {
						var rdiff = data[i] - targetData[i++];
						var gdiff = data[i] - targetData[i++];
						var bdiff = data[i] - targetData[i++];
						++i;
						error += rdiff * rdiff + gdiff * gdiff + bdiff * bdiff;
					}
					return error;
				}

				// Draw the image to the target context
				function drawImage() {
					function drawPoly(polygon) {
						context.fillStyle = polygon.colour.toString();
						context.beginPath();
						for (var i = 0; i < polygon.path.length; ++i)
							context.lineTo(polygon.path[i].x, polygon.path[i].y);
						context.fill();
					}

					context.fillStyle = image.background.toString();
					context.fillRect(0, 0, source.width, source.height);
					for (var i = 0; i < image.polygons.length; ++i) {
						drawPoly(image.polygons[i]);
					}
				}

				// Evolution process. Every step mutates the image, draws it to an in-memory
				// canvas and compares the result with the target image. If the error is smaller
				// than the threshold, the result is kept as the current best result, otherwise
				// it is discarded.
				//
				// After every iteration, the acceptance threshold is increased by 1/10 000 of the
				// minimum error achived, to prevent the evolution from getting stuck in a local
				// minimum.
				function evolve() {
					var startTime = performance.now();
					if (!isRunning) {
						clearInterval(evolveInterval);
						clearInterval(infoInterval);
						return;
					}

					var previous = new PolygonImage(image);
					image.isDirty = false;
					do {
						image.mutate();
					} while (!image.isDirty);

					drawImage();

					var error = calculateError();
					if (error < minError) {
						minError = error;
						if (error < realMinError) realMinError = error;
						++generations;
						if (performance.now() - lastUpdate > PROGRESS_REFRESH_RATE) {
							// If a better image has been generated and the progress image has been displayed long enough,
							// push the new image to the progress context
							progressContext.putImageData(context.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
							lastUpdate = performance.now();
						}
					} else image = previous;
					// penalize solutions that take too long to improve
					minError += realMinError * 0.0001;

					timings[iterations++ % STAT_BUFFER_LENGTH] =
						performance.now() - startTime;
				};

				function calculateAverageIterationTimeInMilliseconds() {
					var total = 0;
					var samples = Math.min(iterations, STAT_BUFFER_LENGTH);
					for (var i = 0; i < samples; ++i) {
						total += timings[i];
					}
					return total / samples;
				}

				function updateInfo() {
					if (!infoCallback) return;
					infoCallback({
						iterations: iterations,
						generations: generations,
						averageMillisecondsPerIteration: calculateAverageIterationTimeInMilliseconds(),
						iterationsPerSecond: 1000 * iterations / (performance.now() - evolutionStarted),
						currentMinimumError: minError,
						realMinimumError: realMinError
					});
				}

				this.start = function() {
					if (isRunning) return false;
					isRunning = true;
					evolutionStarted = performance.now();
					evolveInterval = setInterval(evolve, 1000 / 250);
					infoInterval = setInterval(updateInfo, 1000 * 0.5);
					return true;
				};

				this.stop = function() {
					isRunning = false;
				};

				canvas.width = source.width;
				canvas.height = source.height;
				this.progressCanvas = document.createElement("canvas");
				this.progressCanvas.width = source.width;
				this.progressCanvas.height = source.height;
				progressContext = this.progressCanvas.getContext("2d");
			}

			return ImageEvolver;
		}
	]);

})();