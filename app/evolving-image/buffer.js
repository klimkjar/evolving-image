var evolver = self.evolver || {};

evolver.buffer = (function () {
  "use strict";
  var lib = {};

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  lib.Circular = (function () {
    function Circular(size) {
      this._idx = -1;
      this._size = size;
      this.values = [];
    };

    Circular.prototype.push = function (value) {
      this._idx = (this._idx + 1) % this._size;
      this.values[this._idx] = value;
    };

    Circular.prototype.last = function () {
      return this.values[this._idx];
    };

    Circular.prototype.first = function () {
      var idx = (this.values.length < this._size) ?
        0 :
        (this._idx + 1) % this._size;
      return this.values[idx];
    };

    return Circular;
  })();

  return lib;
})();