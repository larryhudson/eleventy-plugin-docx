const mammoth = require('mammoth')
const cheerio = require('cheerio')
const lodashMerge = require('lodash.merge')

const globalOptions = {
    layout: 'layouts/docx.njk',
    useGlobalLayout: true,
    cheerioTransform: null,
    mammothConfig: {}
  };

module.exports = function(eleventyConfig, configGlobalOptions = {}) {
    // Return your Object options:
    let options = lodashMerge({}, globalOptions, configGlobalOptions);

    eleventyConfig.addTemplateFormats("docx");

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