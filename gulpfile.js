const path              = require("path");
const del               = require("del");
const merge             = require("merge2");
const tslint            = require("tslint");
const gulp              = require("gulp");
const gulpSourcemaps    = require("gulp-sourcemaps");
const gulpTypescript    = require("gulp-typescript");
const gulpTslint        = require("gulp-tslint");
const gulpTypedoc       = require("gulp-typedoc");

const name = "Node WebUSB";
const docsToc = "";

const srcDir = "src";
const srcFiles = srcDir + "/**/*.ts";
const docsDir = "docs";
const nodeDir = "lib";
const typesDir = "types";

let watching = false;

function handleError(cb) {
    if (watching) this.emit("end");
    else process.exit(1);
    cb();
}

// Set watching
function setWatch(cb) {
    watching = true;
    cb();
}

// Clear built directories
function clean(cb) {
    if (!watching) del([nodeDir, typesDir]);
    cb();
}

// Lint the source
function lint() {
    return gulp.src(srcFiles)
    .pipe(gulpTslint({
        program: tslint.Linter.createProgram("./tsconfig.json"),
        formatter: "stylish"
    }))
    .pipe(gulpTslint.report({
        emitError: !watching
    }))
}

// Create documentation
function doc() {
    return gulp.src(srcFiles)
    .pipe(gulpTypedoc({
        name: name,
        readme: "src/documentation.md",
        theme: "src/theme",
        mode: "file",
        target: "es6",
        module: "commonjs",
        out: docsDir,
        excludeExternals: true,
        excludePrivate: true,
        hideGenerator: true,
        toc: docsToc
    }))
    .on("error", handleError);
}

// Build TypeScript source into CommonJS Node modules
function compile() {
    var tsResult = gulp.src(srcFiles)
    .pipe(gulpSourcemaps.init())
    .pipe(gulpTypescript.createProject("tsconfig.json")())
    .on("error", handleError);

    return merge([
        tsResult.js.pipe(gulpSourcemaps.write(".", {
            sourceRoot: path.relative(nodeDir, srcDir)
        })).pipe(gulp.dest(nodeDir)),
        tsResult.dts.pipe(gulp.dest(typesDir))
    ]);
}

exports.default = gulp.series(lint, doc, clean, compile);
exports.watch = gulp.series(setWatch, exports.default, function(cb) {
    gulp.watch(srcFiles, gulp.series(lint, clean, compile));
    cb();
});
