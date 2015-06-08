/// <reference path="../../typings/qunit/qunit.d.ts"/>
var generate = evolver.generate;

function isValidAlpha(a) {
  return typeof a === "number" && (a == 0 || a == 1 || !Number.isInteger(a));
}

QUnit.test("checks colour arguments", function (assert) {
  assert.throws(function () { generate.colour(100); });
  assert.throws(function () { generate.colour(generate.colour(), 100); });
});

QUnit.test("generates colours", function (assert) {
  var c = generate.colour();
  assert.equal(c.tag, "colour");
  assert.ok(typeof c.opaque !== "undefined");
  assert.ok(c.value.length == 4);
  assert.ok(Number.isInteger(c.value[0]), "R should be an integer");
  assert.ok(Number.isInteger(c.value[1]), "G should be an integer");
  assert.ok(Number.isInteger(c.value[2]), "B should be an integer");
  assert.ok(isValidAlpha(c.value[3]), "Alpha should be in the range [0..1]");
});

QUnit.test("generates opaque colours", function (assert) {
  var c = generate.colour({
    tag: "colour-config",
    opaque: true
  });
  assert.equal(c.opaque, true);
});

QUnit.test("generates translucent colours", function (assert) {
  var c = generate.colour();
  assert.equal(c.opaque, false);
  assert.ok(c.value[3] < 1);
});

QUnit.test("copies colours", function (assert) {
  var c1 = generate.colour();
  var c2 = generate.colour(c1);
  assert.deepEqual(c1, c2);
  assert.notEqual(c1, c2);
  assert.notEqual(c1.value, c2.value);
});

QUnit.test("checks point arguments", function (assert) {
  assert.throws(generate.point);
  assert.throws(function () { generate.point(100); });
  assert.throws(function () { generate.point(100, 100, 50); });
});

QUnit.test("generates points", function (assert) {
  var p = generate.point(100, 100);
  assert.equal(p.tag, "point");
  assert.ok(p.value.length == 2);
  assert.ok(Number.isInteger(p.value[0]), "x should be an integer");
  assert.ok(Number.isInteger(p.value[1]), "y should be an integer");
});

QUnit.test("copies points", function (assert) {
  var p1 = generate.point(100, 100);
  var p2 = generate.point(p1);
  assert.deepEqual(p1, p2);
  assert.notEqual(p1, p2);
  assert.notEqual(p1.value, p2.value);
});

QUnit.test("generates triangleStrips", function (assert) {
  var p = generate.triangleStrip(100, 100);
  assert.equal(p.tag, "triangleStrip");
  assert.ok(p.colour.tag == "colour");
  assert.ok(p.points.length > 0);
  assert.ok(p.points.every(function (point) {
    return point.tag == "point";
  }));
});

QUnit.test("copies triangleStrips", function (assert) {
  var t1 = generate.triangleStrip(100, 100);
  var t2 = generate.triangleStrip(t1);
  assert.deepEqual(t1, t2);
  assert.notEqual(t1, t2);
  assert.notEqual(t1.colour, t2.colour);
  assert.notEqual(t1.points, t2.points);
});

QUnit.test("generates images", function (assert) {
  var img = generate.image(100, 100);
  assert.equal(img.tag, "image");
  assert.ok(img.background.tag == "colour");
  assert.ok(img.components.length >= 0);
  assert.equal(img.width, 100);
  assert.equal(img.height, 100);
  assert.ok(img.components.every(function (component) {
    return component.tag == "triangleStrip";
  }));
});

QUnit.test("copies images", function (assert) {
  var i1 = generate.image(100, 100);
  var i2 = generate.image(i1);
  assert.deepEqual(i1, i2);
  assert.notEqual(i1, i2);
  assert.notEqual(i1.background, i2.background);
  assert.notEqual(i1.components, i2.components);
});


QUnit.test("image background colour is opaque", function (assert) {
  var img = generate.image(100, 100);
  assert.equal(img.background.opaque, true);
});