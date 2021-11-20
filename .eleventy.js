const mammoth = require('mammoth')
const cheerio = require('cheerio')
const lodashMerge = require('lodash.merge')

const globalOptions = {
    layout: 'layouts/docx.njk',
    cheerioTransform: null,
    mammothConfig: {}
  };

module.exports = function(eleventyConfig, configGlobalOptions = {}) {
    // Return your Object options:
    let options = lodashMerge({}, globalOptions, configGlobalOptions);

    eleventyConfig.addTemplateFormats("docx");

    eleventyConfig.addExtension('docx', {
        getData: function() {
            return {
                layout: options.layout
            }
        },
        compile: function(str, inputPath) {
            return async (data) => {

                const rawHtml = await mammoth.convertToHtml({path: inputPath}, options.mammothConfig).then(result => result.value)

                if (options.cheerioTransform) {
                    const $ = cheerio.load(rawHtml)
                    options.cheerioTransform($)
                    return $('body').html();
                } else {
                    return rawHtml
                }
            }
        },
        
    })
  };