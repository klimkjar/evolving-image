self.evolver = self.evolver || {};
evolver.gfx = (function () {
  "use strict";

  var TwoD = (function () {
    function rgba(values) {
      return "rgba(" + values.join(",") + ")";
    }

    function TwoD(canvas) {
      this._canvas = canvas;
      this._ctx = canvas.getContext("2d");
    }

    TwoD.prototype.clear = function () {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };

    TwoD.prototype.drawTriangleStrip = function (poly, color) {
      var ctx = this._ctx;
      ctx.fillStyle = rgba(color);
      var triangles = poly.length - 2;
      for (var i = 0; i < triangles; i += 2) {
        ctx.beginPath();
        ctx.lineTo(poly[i], poly[i + 1]);
        ctx.lineTo(poly[i + 2], poly[i + 3]);
        ctx.lineTo(poly[i + 4], poly[i + 5]);
        ctx.fill();
      }
    };

    return TwoD;
  })();

  var WebGL = (function () {

    function loadShader(kind, src) {
      var gl = this._gl;
      var shader = gl.createShader(kind);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    function createProgram(shaders) {
      var gl = this._gl;
      var program = gl.createProgram();
      shaders.map(gl.attachShader.bind(gl, program));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    function setColour(values) {
      this._gl.uniform4f(this._clc,
        values[0] / 255.0, values[1] / 255.0, values[2] / 255.0,
        values[3]);
    }

    function recompile() {
      var gl = this._gl;
      var vs = loadShader.call(this,
        gl.VERTEX_SHADER, this._vertexShader);
      var fs = loadShader.call(this,
        gl.FRAGMENT_SHADER, this._fragmentShader);

      this._program = createProgram.call(this, [vs, fs]);
      gl.useProgram(this._program);
    }

    function init() {
      var gl = this._gl;
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
      this.clear();

      this._vertexShader =
      "attribute vec2 a_position;" +
      "uniform vec2 u_resolution;" +
      "void main() {" +
      "    vec2 zeroToOne = a_position / u_resolution;" +
      "    vec2 zeroToTwo = zeroToOne * 2.0;" +
      "    vec2 clipSpace = zeroToTwo - 1.0;" +
      "    gl_Position = vec4(clipSpace, 0, 1);" +
      "}";

      this._fragmentShader =
      "precision mediump float;" +
      "uniform vec4 u_color;" +
      "void main() { gl_FragColor = u_color; }";
      recompile.call(this);

      var program = this._program;
      var plc = gl.getAttribLocation(program, "a_position");
      var rlc = gl.getUniformLocation(program, "u_resolution");
      this._clc = gl.getUniformLocation(program, "u_color");

      gl.uniform2f(rlc, this._canvas.width, this._canvas.height);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(plc);
      gl.vertexAttribPointer(plc, 2, gl.FLOAT, false, 0, 0);
    }

    var glopts = { alpha: false, antialias: true };

    function WebGL(canvas) {
      this._canvas = canvas;
      this._gl = canvas.getContext("webgl", glopts) ||
      canvas.getContext("experimental-webgl", glopts);
      init.call(this);
    }

    WebGL.prototype.clear = function (c) {
      var gl = this._gl;
      if (c != null)
        gl.clearColor(c[0] / 255, c[1] / 255, c[2] / 255, c[3]);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    WebGL.prototype.drawTriangleStrip = function (poly, color) {
      var gl = this._gl;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(poly), gl.STATIC_DRAW);
      setColour.call(this, color);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, poly.length / 2);
    };

    WebGL.prototype.readPixels = function () {
      var width = this._canvas.width;
      var height = this._canvas.height;
      var data = new Uint8Array(4 * width * height);
      var gl = this._gl;
      gl.readPixels(0, 0, width, height,
        gl.RGBA, gl.UNSIGNED_BYTE, data);
      return data;
    }

    return WebGL;
  })();

  return {
    TwoD: TwoD,
    WebGL: WebGL
  };
})();