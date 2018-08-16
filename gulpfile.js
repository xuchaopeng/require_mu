var gulp = require('gulp'),
  minifycss = require('gulp-minify-css'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  clean = require('gulp-clean'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace');

var srcStaticPath = 'src';
var distStaticPath = 'dist';
var browserSync = require('browser-sync');
var baseJsArr = ['require.js', 'jquery.js', 'config.js', 'cookie.js'];
var baseCssArr = ['common.scss'];


// 删除dist文件夹以及其内容
gulp.task('clean', function () {
  return gulp.src(['dist'])
    .pipe(clean());
});

//html复制
gulp.task('html', function () {
  return gulp.src([
    'src/*.html'
  ])
    .pipe(gulp.dest('dist'));
});

//swf复制
gulp.task('swf', function () {
  return gulp.src(srcStaticPath + '/javascript/common/*.swf')
    .pipe(gulp.dest(distStaticPath + '/javascript/common'));
});

//字体复制
gulp.task('font', function () {
  return gulp.src(srcStaticPath + '/font/**')
    .pipe(gulp.dest(distStaticPath + '/font'));
});

//图片复制
gulp.task('image', function () {
  return gulp.src(srcStaticPath + '/image/**/*')
    .pipe(gulp.dest(distStaticPath + '/image'));
});

//插件复制
gulp.task('plugin', function (cb) {
  gulp.src(srcStaticPath + '/javascript/plugin/**')
    .pipe(gulp.dest(distStaticPath + '/javascript/plugin'));
  cb();
});

//页面scss的处理
gulp.task('pageCss', function (cb) {
  // scss转成css压缩
  gulp.src(srcStaticPath + '/css/page/*.scss')
    .pipe(sass())
    .pipe(minifycss())
    .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: false,
      remove: true
    }))
    .pipe(rename(function (path) {
      path.basename = path.basename + '.min';
    }))
    .pipe(gulp.dest(distStaticPath + '/css/page'));

  cb();
});

//公共样式处理
gulp.task('commonCss', function (cb) {
  gulp.src(srcStaticPath + '/css/common/*.scss')
    .pipe(sass())
    .pipe(minifycss())
    .pipe(concat('base.css'))
    .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: false,
      remove: true
    }))
    .pipe(rename(function (path) {
      path.basename = path.basename + '.min';
    }))
    .pipe(gulp.dest(distStaticPath + '/css/common'));
  cb();
});

//公共js处理
gulp.task('commonJs', function (cb) {
  var arr = [];
  for (var i = 0; i < baseJsArr.length; i++) {
    arr.push(srcStaticPath + '/javascript/common/' + baseJsArr[i]);
  }
  gulp.src(arr)
    .pipe(concat('base.js'))
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename = path.basename + '.min';
    }))
    .pipe(gulp.dest(distStaticPath + '/javascript/common'));
  cb();
});

//页面js处理
gulp.task('pageJs', function (cb) {
  gulp.src([srcStaticPath + '/javascript/page/*.js'])
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename = path.basename + '.min';
    }))
    .pipe(gulp.dest(distStaticPath + '/javascript/page'));
  cb();
});

//生产环境
gulp.task('production', ['clean'], function () {
  gulp.start(['image', 'pageJs', 'commonJs', 'commonCss', 'pageCss', 'html', 'swf', 'font', 'plugin'], function () {
    console.log('编译打包完成');
  });
});

//开发环境
gulp.task('development', function () {
  function scssSolve(pathname) {
    var sass = require('node-sass');
    var str = '';
    if (pathname.match(/css\/common\/base/)) {
      var files = baseCssArr;
      for (var i = 0; i < files.length; i++) {
        str += sass.renderSync({
          file: 'src/css/common/' + files[i]
        }).css.toString();
      }
      return str;
    } else if (pathname.match(/css\/page/)) {
      var path = 'src' + pathname.replace(/\.min/, '').replace(/\.css/, '.scss');
      str = sass.renderSync({
        file: path
      }).css.toString();
      return str;
    } else {
      console.log('不符合预期');
    }
  }

  function jsSolve(pathname) {
    var str = '';
    if (pathname.match(/javascript\/common/)) {
      var files = baseJsArr;
      for (var i = 0; i < files.length; i++) {
        var path = 'src/static/javascript/common/' + files[i];
        str += require('fs').readFileSync(path).toString();
      }
      return str;
    } else if (pathname.match(/javascript\/page/)) {
      var path = 'src' + pathname.replace(/\.min/, '');
      str = require('fs').readFileSync(path).toString();
      return str;
    } else {
      console.log('不需要处理的文件，直接返回');
    }
  }

  browserSync.init({
    https: true,
    server: {
      baseDir: './src'
    },
    middleware: function (req, res, next) {
      var pathname = require("url").parse(req.url).pathname;
      if (pathname.match(/\.css/)) {
        var str = scssSolve(pathname);
        if (str) {
          res.end(str);
        }
      }
      if (pathname.match(/\.js/)) {
        var str = jsSolve(pathname);
        if (str) {
          res.end(str);
        }
      }
      next();
    }
  });

  gulp.watch('src/*.html').on('change', function () {
    browserSync.reload('*.html');
  });
  gulp.watch(srcStaticPath + '/css/**/*.scss').on('change', function () {
    browserSync.reload('*.css');
  });
  gulp.watch(srcStaticPath + '/javascript/**/*.js').on('change', function () {
    browserSync.reload('*.js');
  });
  browserSync.reload();

});
