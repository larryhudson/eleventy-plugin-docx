# eleventy-plugin-docx

This Eleventy plugin adds a [custom file extension handler](https://github.com/11ty/eleventy/issues/117) for Microsoft Word `.docx` documents.

## What it does

This plugin uses the [mammoth.js](https://github.com/mwilliamson/mammoth.js/) library to convert docx files to HTML.

It can also be configured with a custom transformer function using [cheerio](https://cheerio.js.org/). `cheerio` lets you use a jQuery-like syntax to adjust the HTML.

## Compatibility

This is compatible with Eleventy 1.0.0 beta 8 and newer.

## Installation

Install using npm:

```bash
npm i eleventy-plugin-docx
```

## Usage

Add it to your Eleventy config file (`.eleventy.js`):

```js
const DocxPlugin = require('eleventy-plugin-docx');

module.exports = function(eleventyConfig) {
    // Use default options
    eleventyConfig.addPlugin(DocxPlugin)
  };
```

### Add a layout for docx files

By default, the plugin will try to use `layouts/docx.njk` as the layout for docx files in the Eleventy site's input directory.

The docx content is rendered in the template using `{{content|safe}}`.

You can either:
- make a layout at `layouts/docx.njk`
- adjust the layout path using the plugin's configuration option - see below.


### Use configuration options

```js
const DocxPlugin = require('eleventy-plugin-docx');

module.exports = function(eleventyConfig) {
    // Customise configuration options
    eleventyConfig.addPlugin(DocxPlugin, {
        // Layout path for docx files, relative to 'includes' directory
        layout: 'layouts/docx.njk', 

        // Configuration object that gets passed through to mammoth.js
        // See documentation: https://github.com/mwilliamson/mammoth.js/#api
        mammothConfig: {
            styleMap: [
                "p[style-name='Quote'] => blockquote"
            ]
        },

        // Transformer function that gives you cheerio's $ function to adjust Mammoth's output
        // You don't need to return anything - this is handled by the plugin
        cheerioTransform: ($) => {

            // Add IDs to each subheading
            $('h2').each((index, h2Tag) => {
                $(h2Tag).attr('id', `section-${index + 1}`)
            })

            // Add alt="" to img tags without alt attribute
            $('img:not([alt])').attr('alt', '');

            // Remove manual line breaks
            $('br').remove();
            
        },

    })
  };
```

## To do list

This plugin needs some work:
- **image handling** - need to set up default behaviour to copy image files through to output directory 