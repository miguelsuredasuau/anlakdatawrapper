-- Up
DROP TRIGGER update_keywords;
DROP TRIGGER insert_keywords;

CREATE TRIGGER insert_keywords BEFORE INSERT ON chart
FOR EACH ROW SET NEW.keywords = LEFT(LOWER(CONCAT(
  COALESCE(NEW.metadata->>"$.describe.intro", ""), ". ",
  COALESCE(NEW.metadata->>"$.describe.byline", ""), ". ",
  COALESCE(NEW.metadata->>"$.describe.\"source-name\"", ""),". ",
  COALESCE(NEW.metadata->>"$.describe.\"aria-description\"", ""), ". ",
  COALESCE(NEW.metadata->>"$.annotate.\"notes\"", ""), ". ",
  COALESCE(REPLACE(REPLACE(NEW.metadata->>"$.custom.*", '[', ' '), ']', ''), "")
)), 4096);

CREATE TRIGGER update_keywords BEFORE UPDATE ON chart
FOR EACH ROW SET NEW.keywords = LEFT(LOWER(CONCAT(
  COALESCE(NEW.metadata->>"$.describe.intro", ""), ". ",
  COALESCE(NEW.metadata->>"$.describe.byline", ""), ". ",
  COALESCE(NEW.metadata->>"$.describe.\"source-name\"", ""), ". ",
  COALESCE(NEW.metadata->>"$.describe.\"aria-description\"", ""), ". ",
  COALESCE(NEW.metadata->>"$.annotate.\"notes\"", ""), ". ",
  COALESCE(REPLACE(REPLACE(NEW.metadata->>"$.custom.*", '[', ' '), ']', ''), "")
)), 4096);


-- Down

