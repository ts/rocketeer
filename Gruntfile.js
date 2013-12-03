module.exports = function(grunt) {

	// Load modules
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-shell');

	// Project configuration.
	grunt.initConfig({

		//////////////////////////////////////////////////////////////////
		/////////////////////////////// PATHS ////////////////////////////
		//////////////////////////////////////////////////////////////////

		app        : 'assets',
		builds     : 'assets/compiled',
		components : 'bower_components',

		paths: {
			original: {
				css  : '<%= app %>/css',
				js   : '<%= app %>/js',
				sass : '<%= app %>/sass',
				img  : '<%= app %>/img',
			},
			compiled: {
				css : '<%= builds %>/css',
				js  : '<%= builds %>/js',
				img : '<%= builds %>/img',
			},
		},

		//////////////////////////////////////////////////////////////////
		/////////////////////////////// TASKS ////////////////////////////
		//////////////////////////////////////////////////////////////////

		// Development
		//////////////////////////////////////////////////////////////////

		watch: {
			options: {
				livereload : true,
				interrupt  : true,
			},

			scripts: {
				files: ['<%= paths.original.js %>/**/*'],
				tasks: ['js'],
			},
			stylesheets: {
				files: ['<%= paths.original.sass %>/**/*'],
				tasks: ['css'],
			},
		},

		shell: {
			phar: {
				command: [
					'cd rocketeer',
					'composer install',
					'php bin/compile',
					'mv bin/rocketeer.phar ../versions/rocketeer',
				].join('&&'),
			}
		},

		clean: ['<%= builds %>'],

		// Assets
		//////////////////////////////////////////////////////////////////

		bower: {
			install: {
				options: {
					targetDir: '<%= components %>'
				}
			}
		},

		concat: {
			stylesheets: {
				files: {
					'<%= paths.compiled.css %>/styles.css': [
						'<%= components %>/bootstrap/dist/css/bootstrap.min.css',
						'<%= components %>/rainbow/themes/tomorrow-night.css',
						'<%= paths.original.css %>/*'
					],
				},
			},
			javascript: {
				files: {
					'<%= paths.compiled.js %>/scripts.js': [
						'<%= components %>/jquery/jquery.js',
						'<%= components %>/marked/lib/marked.js',
						'<%= components %>/rainbow/js/rainbow.js',
						'<%= components %>/rainbow/js/language/generic.js',
						'<%= components %>/rainbow/js/language/php.js',

						'<%= paths.original.js %>/*',
					],
				},
			}
		},

		copy: {
			dist: {
				files: [
					{
						expand : true,
						src    : ['**'],
						cwd    : '<%= components %>/bootstrap/fonts',
						dest   : '<%= builds %>/fonts/'
					},
					{
						expand : true,
						src    : ['**'],
						cwd    : '<%= paths.original.img %>',
						dest   : '<%= paths.compiled.img %>'
					}
				]
			}
		},

		cssmin: {
			minify: {
				expand : true,
				cwd    : '<%= paths.compiled.css %>',
				src    : '*.css',
				dest   : '<%= paths.compiled.css %>',
				ext    : '.min.css'
			}
		},

		uglify: {
			dest: {
				files: [{
					expand : true,
					cwd    : '<%= paths.compiled.js %>',
					src    : ['*.js'],
					dest   : '<%= paths.compiled.js %>',
					ext    : '.min.js',
				}],
			}
		},

		// Linting
		//////////////////////////////////////////////////////////////////

		csslint: {
			dist: {
				options: {
					'adjoining-classes'          : false,
					'unique-headings'            : false,
					'qualified-headings'         : false,
					'star-property-hack'         : false,
					'floats'                     : false,
					'display-property-grouping'  : false,
					'duplicate-properties'       : false,
					'text-indent'                : false,
					'known-properties'           : false,
					'font-sizes'                 : false,
					'box-model'                  : false,
					'gradients'                  : false,
					'box-sizing'                 : false,
					'compatible-vendor-prefixes' : false,
				},
				src: ['<%= paths.original.css %>/*']
			},
		},

		jshint: {
			options: {
				boss    : true,
				browser : true,
				bitwise : true,
				curly   : true,
				devel   : true,
				eqeqeq  : true,
				eqnull  : true,
				immed   : true,
				indent  : 2,
				latedef : true,
				newcap  : true,
				noarg   : true,
				noempty : true,
				sub     : true,
				undef   : true,
				unused  : true,
				predef  : [
					'marked', 'Rainbow',
				],
				globals : {
					$ : false,
				}
			},
			all: ['<%= paths.original.js %>/*']
		},

		// Preprocessors
		//////////////////////////////////////////////////////////////////

		compass: {
			options: {
				appDir             : "assets/",
				cssDir             : "css",
				generatedImagesDir : "img/sprite/generated",
				imagesDir          : "img",
				outputStyle        : 'nested',
				noLineComments     : true,
				relativeAssets     : true,
				require            : ['susy'],
			},

			clean: {
				options: {
					clean: true,
				}
			},
			compile: {},
		}

	});

	////////////////////////////////////////////////////////////////////
	/////////////////////////////// COMMANDS ///////////////////////////
	////////////////////////////////////////////////////////////////////

	grunt.registerTask('default', 'Build assets for local', [
		// 'bower:install',
		'compass:compile',
		'jshint', 'csslint',
		'copy',
		'concat'
	]);

	grunt.registerTask('production', 'Build assets for production', [
		'copy',
		'concat',
		'cssmin', 'uglify'
	]);

	grunt.registerTask('rebuild', 'Build assets from scratch', [
		'compass',
		'clean',
		'default',
	]);

	// By filetype
	////////////////////////////////////////////////////////////////////

	grunt.registerTask('js', 'Build scripts', [
		'jshint', 'concat:javascript',
	]);

	grunt.registerTask('css', 'Build stylesheets', [
		'compass:compile',
		'csslint',
		'concat:stylesheets'
	]);
};