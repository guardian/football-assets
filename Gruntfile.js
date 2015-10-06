/*global module:false*/
module.exports = function(grunt) {
    require('jit-grunt')(grunt);
    var aws = grunt.file.readJSON('aws-keys.json');

    // Project configuration.
    grunt.initConfig({
        image_resize: {
            resize: {
                options: {
                    width: 120,
                    height: '',
                    overwrite: true
                },
                src: 'source/crests/*.png',
                dest: 'build/crests/120/'
            }
        },
        pngmin: {
            compile: {
                options: {
                    force: true,
                    ext: '.png'
                },
                files: [{
                    expand: true,
                    src: '**/*.png',
                    cwd: 'build',
                    dest: 'build' 
                }]
            }
        },
        aws_s3: {
            options: {
                accessKeyId: aws.AWSAccessKeyID,
                secretAccessKey: aws.AWSSecretKey,
                region: 'us-east-1'
            },
            production: {
                options: {
                    bucket: 'aws-frontend-sport',
                },
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: ['**/*.png'],
                    dest: 'football',
                    params: {
                        CacheControl: 'max-age=60'
                    }
                }]
            }
        },
    });

    // Tasks
    grunt.registerTask('default', ['image_resize', 'pngmin', 'aws_s3']);
};