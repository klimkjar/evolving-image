var evolver = self.evolver || {};

evolver.generate = (function () {
  "use strict";
  var lib = {};

  function InvalidTagError(expected, received) {
    this.message = "Expected " + expected + " but received " + received;
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, InvalidTagError);
    else
      this.stack = (new Error()).stack;
  }

  InvalidTagError.prototype = Object.create(Error.prototype);
  InvalidTagError.prototype.name = "InvalidTagError";
  InvalidTagError.prototype.constructor = InvalidTagError;

  function InvalidArgumentError(message) {
    this.message = message;
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, InvalidArgumentError);
    else
      this.stack = (new Error()).stack;
  }

  InvalidArgumentError.prototype = Object.create(Error.prototype);
  InvalidArgumentError.prototype.name = "InvalidArgumentError";
  InvalidArgumentError.prototype.constructor = InvalidArgumentError;

  function getTaggedObject(args, tags) {
    if (args.length != 1) return false;
    if (typeof tags === "string")
      tags = [tags];

    var source = args[0];
    if (!(source && tags.some(function (tag) { return source.tag == tag; })))
      throw new InvalidTagError(tags.join("/"), source ? source.tag : source);
    return source;
  }


  lib.colour = (function () {
    function getConfig(args) {
      return (args.length == 1 && !args[0].tag) ? args[0] : null;
    }

    function clone(source) {
      return {
        tag: "colour",
        opaque: source.opaque,
        value: source.value.slice()
      }
    }

    function randomColour(config) {
      config = config || {};
      var opaque = !!config.opaque;
      return {
        tag: "colour",
        opaque: opaque,
        value: [
          evolver.rnd.int(0, 256),
          evolver.rnd.int(0, 256),
          evolver.rnd.int(0, 256),
          opaque ? 1 : Math.random()
        ]
      };
    }

    return function () {
      var p = getTaggedObject(arguments,
        ["colour", "colour-config"]);
      var source = p && p.tag == "colour" ? p : null;
      var config = p && p.tag == "colour-config" ? p : null;

      if (!(source || config) && arguments.length != 0)
        throw new InvalidArgumentError("(), (colour-config) or (colour) expected");

      return source ?
        clone(source) :
        randomColour(config);
    };
  })();


  lib.point = (function () {
    function clone(source) {
      return {
        tag: "point",
        value: source.value.slice()
      };
    }

    function randomPoint(width, height) {
      return {
        tag: "point",
        value: [
          evolver.rnd.int(0, width),
          evolver.rnd.int(0, height)
        ]
      };
    }

    return function () {
      var source = getTaggedObject(arguments, "point");
      if (!source && arguments.length != 2)
        throw new InvalidArgumentError("(width, height) or (point) expected");

      return source ?
        clone(source) :
        randomPoint(arguments[0], arguments[1]);
    };
  })();

  lib.triangleStrip = (function () {
    function clone(source) {
      return {
        tag: "triangleStrip",
        colour: lib.colour(source.colour),
        points: source.points.map(function (point) {
          return lib.point(point);
        })
      };
    }

    function randomTriangleStrip(width, height) {
      var numPoints = evolver.rnd.intIncl(
        evolver.config.triangleStripMinPoints,
        evolver.config.triangleStripMaxPoints);

      var points = [];
      for (var i = 0; i < numPoints; ++i) {
        var point = lib.point(width, height);
        points.push(point);
      }
      return {
        tag: "triangleStrip",
        colour: lib.colour(),
        points: points
      };
    }

    return function () {
      var source = getTaggedObject(arguments, "triangleStrip");
      if (!source && arguments.length != 2)
        throw new InvalidArgumentError(
          "(width, height) or (triangleStrip) expected");

      return source ?
        clone(source) :
        randomTriangleStrip(arguments[0], arguments[1]);
    };
  })();


  lib.image = (function () {
    function clone(source) {
      return {
        tag: "image",
        background: lib.colour(source.background),
        components: source.components.map(function (component) {
          return lib.triangleStrip(component);
        }),
        width: source.width,
        height: source.height
      }
    }

    function randomImage(width, height) {
      var numStrips = evolver.rnd.intIncl(
        evolver.config.imageMinComponents,
        evolver.config.imageMaxComponents);

      var components = [];
      for (var i = 0; i < numStrips; ++i) {
        var strip = lib.triangleStrip(width, height);
        components.push(strip);
      }
      return {
        tag: "image",
        background: lib.colour({
          tag: "colour-config",
          opaque: true
        }),
        components: components,
        width: width,
        height: height
      };
    }

    return function () {
      var source = getTaggedObject(arguments, "image");
      if (!source && arguments.length != 2)
        throw new InvalidArgumentError(
          "(width, height) or (image) expected");

      return source ?
        clone(source) :
        randomImage(arguments[0], arguments[1])
    };
  })();


  return lib;
})();