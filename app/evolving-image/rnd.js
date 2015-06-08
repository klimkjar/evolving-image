var evolver = self.evolver || {};

evolver.rnd = (function () {
  "use strict";
  var lib = {};

  lib.int = function (min, maxExclusive) {
    return Math.floor(Math.random() * (maxExclusive - min)) + min;
  };

  lib.intIncl = function (min, maxInclusive) {
    return lib.int(min, maxInclusive + 1);
  };

  lib.num = function (min, maxExclusive) {
    return Math.random() * (maxExclusive - min) + min;
  };

  lib.fudgeInt = function (value, adjustment, min, maxExclusive) {
    return Math.min(Math.max(min, value +
      lib.intIncl(-adjustment, adjustment)), maxExclusive - 1);
  };

  lib.fudgeNum = function (value, adjustment, min, max) {
    return Math.min(Math.max(min, value +
      lib.num(-adjustment, adjustment)), max);
  };

  return lib;
})();