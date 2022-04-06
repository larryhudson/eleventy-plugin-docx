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

### Working with layouts

By default, the plugin will try to use `layouts/docx.njk` as the layout for all `.docx` files in the Eleventy site's input directory.

The docx content is rendered in the template using `{{content|safe}}`.

You can:
- change the global layout path by setting the `layout` option in the [configuration options](#configuration-options)
- [use different layouts for different directories by using directory data files](#overriding-configuration-with-directory-data-files)

### Configuration options
Configuration options can be included as an object when you add the plugin to `.eleventy.js`:

```js
const DocxPlugin = require('eleventy-plugin-docx');

module.exports = function(eleventyConfig) {
    // Customise configuration options
    eleventyConfig.addPlugin(DocxPlugin, {
        // Layout path for docx files, relative to 'includes' directory
        layout: 'layouts/docx.njk',

        // Where to use the layout above for all docx files
        // If this is set to false, you must set the layout in the data cascade (see below for details)
        useGlobalLayout: true,

        // Configuration object that gets passed through to mammoth.js
        // See documentation: https://github.com/mwilliamson/mammoth.js/#api
        mammothConfig: {
            styleMap: [
                "p[style-name='Quote'] => blockquote"
            ]
        },

        // Transformer function that gives you cheerio's $ function to adjust Mammoth's output
        // You don't need to return anything - this is handled by the plugin
        // See cheerio docs for more info: https://cheerio.js.org/
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

## Overriding configuration with directory data files

The configuration you set when you add the plugin to `.eleventy.js` will be used by default for all `.docx` files.

If you want to set specific configuration options for different documents, you can override these options in [directory data files](https://www.11ty.dev/docs/data-template-dir/).

For example, you might have content set up like this:

```
src/
├── index.docx
└── second-page/
    ├── index.docx
    └── second-page.11tydata.js
```

In this case, you could set your configuration in `second-page.11tydata.js` and it would only apply to the documents in that directory and subdirectories:
```js
// src/second-page/second-page.11tydata.js
module.exports = {
    mammothConfig: {
        styleMap: [
            "p[style-name='Heading 1'] => h1.heading"
        ]
    },
    cheerioTransform: ($) => {
        $('h1').attr('data-cheerio', 'true');
    },
}
```

### Overriding the global layout setting

At the moment, it's not possible to set a default layout, and then override the default layout in directory data files, like you can for `mammothConfig` and `cheerioTransform` ([see above](#overriding-configuration-with-directory-data-files)).

If you want to set different layouts, you need to:
- set `useGlobalLayout` to `false` when adding the plugin to `.eleventy.js`
- make sure you set `layout` in directory data files:
```js
// Directory data file (eg. about-page.11tydata.js)
module.exports = {
    layout: 'layouts/about-page.njk'
}
```

## Using with `eleventy-plugin-render`

This plugin pairs nicely with the new `eleventy-plugin-render`, which gives you a shortcode to render files inside templates.

This means you can render Word document content within your other content.

To use with `eleventy-plugin-render`:
1. Make sure you're using Eleventy 1.0.0 beta 7 or newer.
2. add `eleventy-plugin-render` to your Eleventy config by following [the plugin's installation instructions](https://www.11ty.dev/docs/plugins/render/).
3. use the `renderFile` shortcode wherever you want (in Markdown files, Nunjucks templates etc.):

```
{% renderFile './src/word-document.docx' %}
```

Note: the file path is relative to the project root folder.