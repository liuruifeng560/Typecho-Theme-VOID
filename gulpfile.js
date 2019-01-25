/* eslint-disable no-undef */
var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var minify = require('gulp-clean-css');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');

var prefixerOptions = {
    browsers: ['last 2 versions']
};

// 删除旧版与临时文件
gulp.task('clean', function(){
    return del(['build', './assets/VOID.css', './assets/bundle.js', './assets/bundle.css']);
});

// 依赖 CSS minify、打包，除 MathJax
gulp.task('pack:css:dep', function (){
    return  gulp.src(['./assets/libs/**/*.css', '!./assets/libs/mathjax/**/*'])
        .pipe(concat('bundle.css'))
        .pipe(minify())
        .pipe(rev())
        .pipe(gulp.dest('./build/assets/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./temp/rev/css_bundle'));
});

// 主 CSS 编译、autoprefix、minify
gulp.task('pack:css:main', function(){
    return  gulp.src('./assets/VOID.scss')
        .pipe(sass())
        .pipe(prefix(prefixerOptions))
        .pipe(minify())
        .pipe(rev())
        .pipe(gulp.dest('./build/assets/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./temp/rev/css_main'));
});

// 依赖 JS 压缩混淆，除 Mathjax
gulp.task('pack:js:dep', function(){
    return gulp.src(['./assets/libs/jquery/jquery.min.js', './assets/libs/**/*.js', '!./assets/libs/mathjax/**/*'])
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('./build/assets/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('temp/rev/js_bundle'));
});

// 主 JS 压缩混淆
gulp.task('pack:js:main', function(){
    return  gulp.src([
        './assets/VOID.js',
        './assets/editor.js'])
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('./build/assets/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('temp/rev/js_main'));
});

// 静态文件加戳
gulp.task('md5', function(){
    return  gulp.src(['temp/rev/**/*.json', './**/*.php'])
        .pipe(revCollector())
        .pipe(gulp.dest('./build/'));
});

// 无需处理的文件
gulp.task('move', function(){
    gulp.src(['./assets/libs/owo/**/*','./assets/libs/mathjax/**/*'],{base: './assets/libs/'})
        .pipe(gulp.dest('./build/assets/libs/'));
    gulp.src(['./assets/sw-toolbox.js', './assets/VOIDCacheRule.js'])
        .pipe(gulp.dest('./build/assets/'));
    return  gulp.src(['./LICENSE', './README.md', './screenshot.png'])
        .pipe(gulp.dest('./build/'));
});

gulp.task('build', gulp.series('clean', gulp.parallel('pack:css:main', 'pack:css:dep', 'pack:js:main', 'pack:js:dep'), 'md5', 'move'));

// 开发过程，处理一次依赖
gulp.task('dev', function(){
    gulp.src(['./assets/libs/**/*.css', '!./assets/libs/mathjax/**/*'])
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./assets/'));
    gulp.src(['./assets/libs/jquery/jquery.min.js', './assets/libs/**/*.js', '!./assets/libs/mathjax/**/*'])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./assets/'));
    return gulp.watch(['./assets/VOID.scss'], function(){
        gulp.src('./assets/VOID.scss')
            .pipe(sass())
            .pipe(gulp.dest('./assets'));
    });
});