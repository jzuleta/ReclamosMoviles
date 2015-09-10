var gulp = require("gulp"),
    rename = require("gulp-rename"),
    minifycss = require("gulp-minify-css"),
    autoprefixer = require("gulp-autoprefixer");

gulp.task("add-prefixes", function() {
    gulp.src("resources/css/dev-style.css")
        .pipe(rename("app.css"))
        .pipe(autoprefixer({
            cascade: false,
            remove: true
        }))
        .pipe(gulp.dest("resources/css/"));
});

gulp.task("minify-css", function() {
    gulp.src("resources/css/app.css")
        .pipe(minifycss())
        .pipe(gulp.dest("resources/css/"));
});

gulp.task("watch", function() {
    gulp.watch("resources/css/dev-style.css", ["add-prefixes"]);
});