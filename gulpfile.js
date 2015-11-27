var gulp = require("gulp"),
    rename = require("gulp-rename"),
    minifycss = require("gulp-minify-css"),
    autoprefixer = require("gulp-autoprefixer"),
    uglify = require("gulp-uglify"),
    concat = require("gulp-concat");

gulp.task("add-prefixes", function() {
    gulp.src("resources/css/dev-style.css")
        .pipe(rename("app.css"))
        .pipe(autoprefixer({
            cascade: false,
            remove: true
        }))
        .pipe(gulp.dest("resources/css/"));
});

gulp.task("concat-css", function() {
    return gulp.src([
            "resources/css/app.css",
            "resources/css/input-style.css",
            "resources/css/spinner.css"
        ], {
            base: "resources/"
        })
        .pipe(concat("bundle.css"))
        .pipe(autoprefixer({
            cascade: false,
            remove: true
        }))
        .pipe(gulp.dest("resources/css/"));
});

gulp.task("compress-js", function() {
    return gulp.src([
            "resources/js/config-templates.js",
            "resources/js/screen-config.js",
            "resources/js/app.js"
        ])
        .pipe(concat("app.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("resources/js/"));
});

gulp.task("watch", function() {
    gulp.watch("resources/css/dev-style.css", ["add-prefixes"]);
});