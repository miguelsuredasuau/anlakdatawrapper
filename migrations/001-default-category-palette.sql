--- Up
UPDATE theme SET
`data` = JSON_SET(JSON_SET(`data`, "$.colors.categories",
    JSON_ARRAY(
        JSON_ARRAY("#F6D500","#0B91A7","#00CABD","#C2C100","#BA403E","#EF7F36","#2D4F84","#85BDF4","#9EF1BF","#D3F3FD"),
        JSON_ARRAY("#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"),
        JSON_ARRAY("#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"),
        JSON_ARRAY("#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928")
    )
 ), "$.colors.gradients", JSON_ARRAY(
        JSON_ARRAY("#f0f9e8","#b6e3bb","#75c8c5","#4ba8c9","#2989bd","#0a6aad","#254b8c"),
        JSON_ARRAY("#fcfcbe","#fdc78d","#fb8d67","#e45563","#ac337b","#6b1f7b","#2c1160"),
        JSON_ARRAY("#f0f723","#fbbf2b","#f38a47","#d8586a","#ac2790","#6703a5","#0d0787"),
        JSON_ARRAY("#fefaca","#008b15"),
        JSON_ARRAY("#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"),
        JSON_ARRAY("#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"),
        JSON_ARRAY("#8c510a","#d8b365","#f6e8c3","#f5f7ea","#c7eae5","#5ab4ac","#01665e"),
        JSON_ARRAY("#c51b7d","#e9a3c9","#fde0ef","#faf6ea","#e6f5d0","#a1d76a","#4d9221"),
        JSON_ARRAY("#b2182b","#ef8a62","#fddbc7","#f8f6e9","#d1e5f0","#67a9cf","#2166ac")
    )
 )
WHERE id = 'default';

--- Down
UPDATE theme SET
`data` = JSON_SET(JSON_SET(`data`, "$.colors.categories",
    JSON_ARRAY(
        JSON_ARRAY("#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"),
        JSON_ARRAY("#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"),
        JSON_ARRAY("#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928")
    )
 ), "$.colors.gradients", JSON_ARRAY(
        JSON_ARRAY("#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"),
       JSON_ARRAY("#fefaca","#008b15"),
       JSON_ARRAY("#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"),
       JSON_ARRAY("#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"),
       JSON_ARRAY("#8c510a","#d8b365","#f6e8c3","#f5f7ea","#c7eae5","#5ab4ac","#01665e"),
       JSON_ARRAY("#c51b7d","#e9a3c9","#fde0ef","#faf6ea","#e6f5d0","#a1d76a","#4d9221"),
       JSON_ARRAY("#b2182b","#ef8a62","#fddbc7","#f8f6e9","#d1e5f0","#67a9cf","#2166ac")
    )
 )
 WHERE id = 'default';


