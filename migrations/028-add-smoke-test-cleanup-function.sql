-- Up
CREATE FUNCTION datawrapper.un_smoke() RETURNS int
BEGIN
	DECLARE smoke_id int DEFAULT -1;
	DECLARE chart_public_removed int DEFAULT 0;
	DECLARE chart_removed int DEFAULT 0;

	SELECT id FROM user WHERE email = 'user@datawrapper.de' INTO smoke_id;

	IF smoke_id < 0 
		THEN RETURN -1;
		END IF;
	
	DELETE FROM chart_public
		WHERE author_id = smoke_id
		AND TIMESTAMPDIFF(MINUTE, first_published_at, NOW()) > 30;
	SELECT ROW_COUNT() INTO chart_public_removed;
	DELETE FROM chart
		WHERE author_id = smoke_id
		AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 30;
	SELECT ROW_COUNT() INTO chart_removed;
	
	RETURN chart_public_removed + chart_removed;
END


-- Down
DROP FUNCTION datawrapper.un_smoke;
