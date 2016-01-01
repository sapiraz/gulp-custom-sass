# gulp-custom-sass

This is a simple Gulp task that allows you to customize SCSS frameworks such as Bootstrap without touching their source.

I just personally didn't feel like the customization options were enough and I had to edit their source but whenever I'd update the framework my work would be removed.

Obviously you need Gulp, and currently you need to have SASS installed on your machine.

## Install
```bash
npm install gulp-custom-sass
```

## Basic Usage

```js
var gulp = require('gulp');
var options = {
  copyDir:"scss",               // The name of the folder that contains the main CSS file to be compiled, everything else needs to be in that directory
  customDirTarget:"bootstrap",  // The folder that contains the framework (it's inside of copyDir)
  customDir:"custombootstrap",  // The folder that contains your custom files (They need to be in the exact same structure as the actual framework)
  targetDir:"www/style",        // Final output folder to compile the SCSS to
  mainCss:"main"                // The name of the main file
}

var customizer = require('gulp-custom-sass')(gulp,options);

// We just add customizerMain as a dependency as follows:

gulp.task('default',['customizerMain'],function(){

});
```

It's just a small thing I've made for myself, hope it'll come in handy to some of you
