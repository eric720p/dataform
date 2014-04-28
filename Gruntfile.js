module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    concat: {
      options: {
        stripBanners: true,
        process: function(src, filepath) {
          return "// Source: " + filepath + "\n" + src;
        }
      },
      build: {
        src: [
          "src/dataform.js",
          "src/lib/format.js",
          "src/lib/sort.js",
          "src/lib/average.js",
          "src/lib/count.js",
          "src/lib/maximum.js",
          "src/lib/median.js",
          "src/lib/minimum.js",
          "src/lib/mode.js",
          "src/lib/sum.js"
        ],
        dest: "dist/<%= pkg.name %>.js"
      }
    },

    uglify: {
      options : {
        beautify : {
          ascii_only : true
        }
      },
      dist: {
        files: {
          "dist/<%= pkg.name %>.min.js": "dist/<%= pkg.name %>.js",
        }
      }
    },

    watch: {
      javascript: {
        files: "src/**/*.js",
        tasks: [ "concat", "uglify" ]
      }
    },

    connect: {
      test: {
        options: {
          base: 'test',
          port: 9999
        }
      }
    }

  });

  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('dev', ['build', 'connect:test', 'watch']);
  grunt.registerTask('test', ['build', 'connect:test']);
  grunt.registerTask('default', ['build']);
};
