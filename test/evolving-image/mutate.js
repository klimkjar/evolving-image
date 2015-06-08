/// <reference path="../../typings/qunit/qunit.d.ts"/>
var generate = evolver.generate;
var mutate = evolver.mutate;

QUnit.module("likely mutations", {
  beforeEach: function() { 
    evolver.config.mutationRate = 1;
  }
});

QUnit.test("mutates colours", function (assert) {
  var c1 = generate.colour();
  var c2 = generate.colour(c1);
  var mutated = mutate.colour(c2);
  assert.notDeepEqual(c1, c2);
  assert.equal(mutated, true);
});

QUnit.test("mutates points", function (assert) {
  var p1 = generate.point(100, 100);
  var p2 = generate.point(p1);
  var mutated = mutate.point(100, 100, p2);
  assert.notDeepEqual(p1, p2);
  assert.equal(mutated, true);
});

QUnit.test("mutates triangleStrips", function (assert) {
  var t1 = generate.triangleStrip(100, 100);
  var t2 = generate.triangleStrip(t1);
  var mutated = mutate.triangleStrip(100, 100, t2);
  assert.notDeepEqual(t1, t2);
  assert.equal(mutated, true);
});

QUnit.test("mutates images", function (assert) {
  var i1 = generate.image(100, 100);
  var i2 = generate.image(i1);
  var mutated = mutate.image(i2);
  assert.notDeepEqual(i1, i2);
  assert.equal(mutated, true);
});

QUnit.module("unlikely mutations", {
  beforeEach: function() { 
    evolver.config.mutationRate = Math.pow(2, 32);
  }
});

QUnit.test("colour same", function (assert) {
  var c1 = generate.colour();
  var c2 = generate.colour(c1);
  var mutated = mutate.colour(c2);
  assert.deepEqual(c1, c2);
  assert.equal(mutated, false);
});

QUnit.test("points same", function (assert) {
  var p1 = generate.point(100, 100);
  var p2 = generate.point(p1);
  var mutated = mutate.point(100, 100, p2);
  assert.deepEqual(p1, p2);
  assert.equal(mutated, false);
});

QUnit.test("triangleStrips same", function (assert) {
  var t1 = generate.triangleStrip(100, 100);
  var t2 = generate.triangleStrip(t1);
  var mutated = mutate.triangleStrip(100, 100, t2);
  assert.deepEqual(t1, t2);
  assert.equal(mutated, false);
});

QUnit.test("image same", function (assert) {
  var i1 = generate.image(100, 100);
  var i2 = generate.image(i1);
  var mutated = mutate.image(i2);
  assert.deepEqual(i1, i2);
  assert.equal(mutated, false);
});