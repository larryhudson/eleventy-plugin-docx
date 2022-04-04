const mammoth = require('mammoth')
const cheerio = require('cheerio')
const lodashMerge = require('lodash.merge')
const path = require('path')
const fs = require('fs')
const md5 = require('js-md5')
const fsPromises = require('fs/promises')

module.exports = function(eleventyConfig, suppliedOptions) {

    const defaultOptions = {
        layout: 'layouts/docx.njk',
        outputDir: eleventyConfig.dir?.output || '_site',
        imageDir: 'images',
        useGlobalLayout: true,
        cheerioTransform: null,
        mammothConfig: {}
      };

    // Return your Object options:
    let options = lodashMerge({}, defaultOptions, suppliedOptions);

    eleventyConfig.addTemplateFormats("docx");

    // ignore temporary files
    eleventyConfig.ignores.add('**/~*.docx') 

    eleventyConfig.addExtension('docx', {
        getData: function() {
            if (options.useGlobalLayout) {
                // Set layout for all docx files
                return {
                    layout: options.layout
                }
            } else {
                // The layout must be set elsewhere in the data cascade (eg. directory data files)
                return {}
            }            
        },
        compile: function(str, inputPath) {
            return async (data) => {

                // This checks the data cascade for specific mammothConfig and cheerioTransform
                // If they're not in the cascade, we use the global options (set when adding plugin to .eleventy.js)

                const mammothConfig = data.mammothConfig ? data.mammothConfig : options.mammothConfig
                const cheerioTransform = data.cheerioTransform ? data.cheerioTransform : options.cheerioTransform

                const imageSubfolderName = data.page.fileSlug
                const imageNamePrefix = data.page.fileSlug

                if (!mammothConfig.convertImage) {
                    var imageCounter = 1
                    var imageSrcByHash = {};

                    mammothConfig.convertImage = mammoth.images.imgElement(async function(image) {
                    
                        const imageBuffer = await image.read();
                        const imageHash = md5(imageBuffer);
                        // check if image hash is already in our saved hashes.
                        // if it is, we return the saved src
                        if (imageSrcByHash[imageHash]) {
                            return {
                                src: imageSrcByHash[imageHash]
                            };
                        }

                        // no saved image hash - write new image file
                        const imageExt = image.contentType.split('/').pop();

                        const imageDir = path.join(options.outputDir, options.imageDir, imageSubfolderName)
    
                        if (!fs.existsSync(imageDir)) {
                            await fsPromises.mkdir(imageDir, {recursive: true})
                        }
    
                        const imageSrcDir = options.imageDir;
                        const imageFilename = `${imageNamePrefix ? imageNamePrefix + '_' : ''}image${imageCounter}.${imageExt}`;
                        const imageFilePath = path.join(imageDir, imageFilename);

                        fs.writeFile(imageFilePath, imageBuffer, 'base64', function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(`Saved image file: ${imageFilePath}`);
                            }
                        });
                        imageCounter++;

                        // save this src and hash to our saved hashes
                        const src = `${imageSrcDir}/${imageFilename}`;
                        imageSrcByHash[imageHash] = src;
                        return {
                            src
                        };
                      })
                }

                const rawHtml = await mammoth.convertToHtml({path: inputPath}, mammothConfig).then(result => result.value)

                if (typeof cheerioTransform === 'function') {
                    const $ = cheerio.load(rawHtml)
                    cheerioTransform($)
                    return $('body').html();
                } else {
                    return rawHtml
                }
            }
        },
        
    })
  };