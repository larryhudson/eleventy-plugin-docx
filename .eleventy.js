const mammoth = require('mammoth')
const cheerio = require('cheerio')
const lodashMerge = require('lodash.merge')

const globalOptions = {
    njkLayout: 'layouts/docx.njk',
    customTransform: null,
    mammothConfig: {}
  };

module.exports = function(eleventyConfig, configGlobalOptions = {}) {
    // Return your Object options:
    let options = lodashMerge({}, globalOptions, configGlobalOptions);

    eleventyConfig.addTemplateFormats("docx");

    eleventyConfig.addExtension('docx', {
        getData: function() {
            return {
                layout: options.njkLayout
            }
        },
        compile: function(str, inputPath) {
            return async (data) => {

                const rawHtml = await mammoth.convertToHtml({path: inputPath}, options.mammothConfig).then(result => result.value)

                if (options.customTransform) {
                    const $ = cheerio.load(rawHtml)
                    options.customTransform($)
                    return $('body').html();
                } else {
                    return rawHtml
                }
            }
        },
        
    })
  };