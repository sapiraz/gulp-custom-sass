var exports = module.exports = function(gulp,options){
options = !options ? {} : options;
var postcss   = require('gulp-postcss');
var nested    = require('postcss-nested');
var scss      = require('postcss-scss');
var gcallback = require('gulp-callback');
var sass      = require('gulp-sass');
var baseDir   = process.cwd();
var tempDir   = "templib";
var copyDir   = options.copyDir ? options.copyDir : "library";      // What directory to copy to the temp dir.
var customDir = options.customDir ? options.customDir : "custom";   // Directory that contains the customizations
var customDirTarget = options.customDirTarget ? options.customDirTarget : "library";   // Directory to which we'll apply the customizations
var targetDir = options.targetDir ? options.targetDir : "www/css";  // final output folder
var mainCss   = options.mainCss ? options.mainCss : 'style';        // The file we'll ask SASS to compile
var del       = require('del');
var exec      = require('gulp-exec');

var rules = [];

var ruleRecorder = function (css, opts) {

  console.log("RuleRecorder");
  var fileRules = {file:css.source.input.file.replace(baseDir,"").replace(customDir,customDirTarget).replace(copyDir,tempDir),rules:[]};
  for(var i in css.nodes){
    fileRules.rules.push(css.nodes[i]);
  }
  rules.push(fileRules);
  console.log("Recorded "+ fileRules.rules.length +" rules from file: " + css.source.input.file);
  console.log(fileRules.file.replace(baseDir,""));

};


var ruleReplacer = function (css, opts) {
  ///Make sure there were some rules recorded from the same file in the custom folder
  var file = null;
  for(var f in rules){
    //console.log("Comparing:" + rules[f].file + " WITH " + css.source.input.file.replace(baseDir,""));
    if(rules[f].file === css.source.input.file.replace(baseDir,"")){
      file = rules[f];
      break;
    }
  }
  if(file){
    ///Replace the nodes in case they exist there
    for(var i in css.nodes){
      var node = css.nodes[i];
      for(var s in file.rules){
        if(file.rules[s].selector === node.selector){
          console.log("Found node ("+node.selector+") and replacing it..");
          node.replaceWith(file.rules[s]);
          file.rules[s].done = true;
        }
      }
    }

    ///Add the extra nodes in case there are any
    var lastNode = null;
    for(var i in file.rules){
      if(!file.rules[i].hasOwnProperty("done") || file.rules[i].done !== true){
        ///This node is in the custom file but wasn't replaced with anyone, let's add it to the end of the file.
        css.append(file.rules[i]);
      } else {
        lastNode = file.rules[i];
      }
    }

  } else {

  }
};


gulp.task('copyFiles',function(){
  console.log("Copying files");
  ///Copy all files to a temp folder
  return gulp.src(['./'+copyDir+'/**/*'])
  .pipe(gulp.dest(tempDir));
});


gulp.task('recordCustomizations',['copyFiles'],function(){
  console.log("Recording Customizations");
  ///read our customizations and add them to an object
  return gulp.src('./'+copyDir+'/'+customDir+'/**/*.scss')
      .pipe(postcss([ruleRecorder],{syntax: scss}))
      .pipe(gcallback(function() {
        console.log("Done Recording Customizations.");
      }));
});

gulp.task('applyCustomizations',['recordCustomizations'],function(){

  console.log("Applying customizations...");
  return gulp.src('./'+tempDir+'/'+customDirTarget+'/**/*.scss')
  .pipe(postcss([ruleReplacer],{syntax: scss}))
  .pipe(gulp.dest('./'+tempDir+'/'+customDirTarget));

});

gulp.task('customizerMain',['applyCustomizations'], function() {
  return gulp.src("./"+tempDir+"/*.scss")
  .pipe(exec('sass templib/'+mainCss+'.scss:'+targetDir+'/'+mainCss+'.css',function(err){
    if(err){
      throw err;
    }
    del([tempDir]);
  }));
});
}
