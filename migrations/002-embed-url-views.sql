-- Adds pixeltracker_chart_embedurl.views

-- Up
ALTER TABLE pixeltracker_chart_embedurl ADD views INT NULL;

-- Down
ALTER TABLE pixeltracker_chart_embedurl DROP views;