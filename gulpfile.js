'use strict';

var del = require("del");
var ghpages = require("gh-pages");
var gulp = require("gulp");
var $ = require("gulp-load-plugins")({
  pattern: ["gulp-*", "main-bower-files", "run-sequence"]
});

var target = "./wwwroot";
var distTarget = target + "/dist";
var environment = "development";

gulp.task("set-production", function (cb) {
  environment = "production";
  cb();
});

gulp.task("clean", function (cb) {
  try {
    del.sync(target);
  } catch (e) {
    console.log(e);
  }
  cb();
});

gulp.task("build:app", function () {
  return gulp.src(["./app/**/*", "./LICENSE.TXT", "!./app/index.html"])
    .pipe(gulp.dest(target));
});

gulp.task("build:libs", function () {
  return gulp.src($.mainBowerFiles({ env: environment }))
    .pipe($.flatten())
    .pipe(gulp.dest(distTarget));
});

gulp.task("build:index", ["build:libs", "build:app"], function () {
  return gulp.src("app/index.html")
    .pipe($.inject(gulp.src(target + "/**/*.css", { read: false }),
    { ignorePath: "/wwwroot/", addRootSlash: false }))
    .pipe($.inject(gulp.src([target + "/**/*.js",
       "!/**/evolvingImageWorker.js"], { read: false })
    .pipe($.order([
				"**/jquery.*",   // load primary dependencies
				"**/bootstrap.*",
				"**/angular.*",
				"dist/**/*",     // then other JS dependencies
				"**/*"           // then app JS files
  ])),
    { ignorePath: "/wwwroot/", addRootSlash: false }))
    .pipe(gulp.dest(target));
});

gulp.task("ghpages", ["release"], function (cb) {
  ghpages.publish(target, cb);
});

gulp.task("connect", function () {
  return $.connect.server({
    root: "wwwroot",
    livereload: true
  });
});

gulp.task("watch", function () {
  return $.watch(target + "/**/*").pipe($.connect.reload());
});

gulp.task("release", function (cb) {
  $.runSequence("set-production", "clean", "build:index", cb);
});

gulp.task("debug", ["connect", "watch"]);
gulp.task("default", ["build:index"]);