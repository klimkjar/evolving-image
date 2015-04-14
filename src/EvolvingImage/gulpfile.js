var del = require("del"),
	ghpages = require("gh-pages");
	gulp = require("gulp"),
	$ = require("gulp-load-plugins")({ pattern: ["gulp-*", "main-bower-files"] });

var target = "./wwwroot";
var distTarget = target + "/dist";
var environment = "development";

gulp.task("set-production", function() {
	environment = "production";
});

gulp.task("clean", function (cb) {
	try {
		del.sync(target);
	} catch (e) {
		console.log(e);
	}
	cb();
});

gulp.task("build:app", ["clean"], function() {
	return gulp.src(["./app/**/*", "../../LICENSE.TXT", "!./app/index.html"])
		.pipe(gulp.dest(target));
});

gulp.task("build:libs", ["clean"], function () {
	return gulp.src($.mainBowerFiles({env: environment}))
		.pipe($.flatten())
		.pipe(gulp.dest(distTarget));
});

gulp.task("build:index", ["build:libs", "build:app"], function () {
	return gulp.src("app/index.html")
		.pipe($.inject(gulp.src(target + "/**/*.css", { read: false }),
		{ ignorePath: "/wwwroot/", addRootSlash: false }))
		.pipe($.inject(gulp.src(target + "/**/*.js", { read: false })
			.pipe($.order([
				"**/angular.js", // ensure angular is first script loaded
				"dist/**/*",     // then other JS dependencies
				"**/*"           // then app JS files
			])),
			{ ignorePath: "/wwwroot/", addRootSlash: false }))
		.pipe(gulp.dest(target));
});

gulp.task("ghpages", ["release"], function (cb) {
	ghpages.publish(target, cb);
});

gulp.task("default", ["build:index"]);
gulp.task("release", ["set-production", "default"]);