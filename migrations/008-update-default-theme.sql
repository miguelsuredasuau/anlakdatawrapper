-- Updates Datawrapper theme

-- Up
REPLACE INTO theme
(id, created_at, extend, title, `data`, less, assets)
VALUES('default', '2017-05-04 12:00:00.000', NULL, 'Datawrapper (2012)', '{"colors":{"general":{"padding":0,"background":"transparent"},"palette":["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd"],"picker":{"rowCount":6,"controls":{"hexEditable":true,"hue":true,"saturation":true,"lightness":true}},"secondary":[],"positive":"#85B4D4","negative":"#E31A1C","neutral":"#CCCCCC","background":"#ffffff","text":"#333333","gradients":[["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"],["#fefaca","#008b15"],["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],["#8c510a","#d8b365","#f6e8c3","#f5f7ea","#c7eae5","#5ab4ac","#01665e"],["#c51b7d","#e9a3c9","#fde0ef","#faf6ea","#e6f5d0","#a1d76a","#4d9221"],["#b2182b","#ef8a62","#fddbc7","#f8f6e9","#d1e5f0","#67a9cf","#2166ac"]],"categories":[["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"],["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"],["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]]},"options":{"footer":{"logo":{"height":30,"enabled":0},"embed":{"caption":"Embed","enabled":0},"getTheData":{"caption":"Get the data","enabled":0},"mapCaption":"Map:","forkCaption":"footer / based-on","staticImage":{"enabled":0},"chartCaption":"Chart:","tableCaption":"Table:","sourceCaption":"Source","sourcePosition":"left","createdWithCaption":"Created with"}},"typography":{"chart":{"color":"#333333","fontSize":12,"typeface":"Helvetica"},"links":{"color":"#0088CC","cursive":0,"fontWeight":"normal","underlined":0},"notes":{"cursive":1,"fontSize":12,"fontWeight":"normal","underlined":0},"footer":{"color":"#888","cursive":0,"fontSize":11,"fontWeight":"normal","underlined":0},"headline":{"cursive":0,"fontSize":22,"fontWeight":"lighter","underlined":0},"description":{"cursive":0,"fontSize":12,"fontWeight":"normal","lineHeight":17,"underlined":0}},"padding":{"left":0,"right":20,"bottom":30,"top":10},"columnChart":{"barAttrs":{"stroke-width":1}},"barChart":{"barAttrs":{"stroke-width":1}},"horizontalGrid":{"stroke":"#d9d9d9"},"hover":true,"duration":1000,"easing":"expoInOut"}', '.chart.png-export {
    .dw-chart-footer {
        .static-image, .chart-action-data, .dw-data-link {
            display:none!important;
        }
    }
    a {
        color: unset!important;
    }
}', NULL);

-- Down
DELETE FROM theme WHERE id = 'default';