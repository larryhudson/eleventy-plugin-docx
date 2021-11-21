// This is a directory data file: https://www.11ty.dev/docs/data-template-dir/
// It overrides the default options set when adding the plugin to .eleventy.js
module.exports = {
    layout: 'layouts/docx.njk',
    mammothConfig: {
        styleMap: [
            "p[style-name='Heading 1'] => h1.heading"
        ]
    },
    cheerioTransform: ($) => {
        $('h1').attr('data-cheerio', 'true');
    },
}