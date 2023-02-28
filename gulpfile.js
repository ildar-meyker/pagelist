"use strict";

const fs = require("fs");

const webpackStream = require("webpack-stream");
const webpack4 = require("webpack");

const gulpif = require("gulp-if");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const cleancss = require("gulp-clean-css");
const filelist = require("gulp-filelist");
const rename = require("gulp-rename");
const rsync = require("gulp-rsync");
const zip = require("gulp-zip");
const extender = require("gulp-html-extend");
const cachebust = require("gulp-cache-bust");
const replace = require("gulp-replace");

const server = require("browser-sync").create();
const autoprefixer = require("autoprefixer");
const del = require("del");
const clc = require("cli-color");

const pkg = require("./package.json");
const { series, parallel, src, dest, watch } = require("gulp");

const logWarning = (message) => {
    console.log(clc.yellow(message));
};
const logSuccess = (message) => {
    console.log(clc.green(message));
};
const logError = (message) => {
    console.log(clc.red(message));
};

const production = process.env.NODE_ENV === "production";

if (pkg.name === "project-name") {
    logWarning(
        "Warning! Project has a default name. Change it in package.json"
    );
}

if (pkg.repository.url === "") {
    logWarning("Warning! The repository url is not specified");
}

const assets = [
    "./src/img/**",
    "./src/fonts/**/*",
    "./src/video/**/*",
    "./src/data/**/*",
    "./src/robots.txt",
];

function clean(cb) {
    return del("./public/");
}

function buildAssets(cb, path) {
    const source = path || assets;

    return src(source, { base: "src/" }).pipe(dest("./public"));
}

function buildHtml(cb, path) {
    const source = path || "./src/markup/*.html";

    return src(source)
        .pipe(extender({ annotations: false, verbose: false }))
        .pipe(cachebust({ type: "timestamp" }))
        .pipe(
            gulpif(
                production,
                replace(/(css|js)\/([a-z_-]+).(css|js)/g, "$1/$2.min.$3")
            )
        )
        .pipe(dest("./public"));
}

function buildStyles(cb) {
    return src(["src/styles/*.*", "!src/styles/_*.*"])
        .pipe(
            gulpif(
                "*.scss",
                sass({
                    importer: require("node-sass-tilde-importer"),
                }).on("error", sass.logError)
            )
        )
        .pipe(postcss([autoprefixer()]))
        .pipe(dest("public/css/"))
        .pipe(gulpif(production, cleancss()))
        .pipe(
            gulpif(
                production,
                rename({
                    suffix: ".min",
                })
            )
        )
        .pipe(gulpif(production, dest("public/css/")))
        .pipe(server.stream());
}

function buildScripts(cb) {
    const config = require("./webpack.config.js");
    config.mode = process.env.NODE_ENV;

    return src("src/js/pagelist.js")
        .pipe(webpackStream(config, webpack4))
        .pipe(dest("public/js/"));
}

// required for pagelist
function buildConfig(cb) {
    const content = {
        repoUrl: pkg.repository.url,
        zipUrl: "http://ildar-meyker.ru/html/" + pkg.name + "/archive.zip",
    };

    fs.writeFile("./public/config.json", JSON.stringify(content), cb);
}

// required for pagelist
function buildPagelist(cb) {
    return src("src/markup/*.html")
        .pipe(filelist("pagelist.json", { flatten: true }))
        .pipe(dest("./public"));
}

function watchFiles(cb) {
    watch("./src/markup/*.html", { delay: 2000 }).on("change", (path) => {
        buildHtml(null, path);
        server.reload();
    });
    watch(assets, { delay: 2000 })
        .on("add", (path) => {
            logSuccess(`File ${path} was added`);
            buildAssets(null, path);
            reload(cb);
        })
        .on("change", (path) => {
            logSuccess(`File ${path} was updated`);
            buildAssets(null, path);
            reload(cb);
        });
    watch("./src/styles/**/*", { delay: 2000 }, series(buildStyles));
    watch("./src/js/**/*", { delay: 2000 }, series(buildScripts, reload));
}

function reload(cb) {
    server.reload();
    cb();
}

function runServer(cb) {
    server.init({
        server: {
            baseDir: "public/",
        },
    });
    cb();
}

function compress(cb) {
    return src("./public/**").pipe(zip("archive.zip")).pipe(dest("./public/"));
}

function deploy(cb) {
    if (pkg.name === "project-name") {
        throw new Error(
            clc.red("Project has a default name. Change it in package.json")
        );
    }

    const config = require("./deploy.config.json");

    return src("./public/**").pipe(
        rsync({
            root: "public/",
            hostname: "ildar-meyker.ru",
            destination: config.destination + "libs/" + pkg.name + "/",
        })
    );
}

const buildAll = series(
    parallel(buildAssets, buildHtml, buildStyles, buildScripts),
    buildPagelist,
    buildConfig
);

const browse = parallel(runServer, watchFiles);

exports.watch = series(clean, buildAll, browse);
exports.build = series(clean, buildAll);
exports.push = series(clean, buildAll, compress, deploy);
