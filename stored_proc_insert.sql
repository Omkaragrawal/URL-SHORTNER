CREATE PROCEDURE insert_ShortLink(
    inout @shorted VARCHAR(32), 
    in longLink VARCHAR(3000), 
    in createDate DATETIME, 
    out insertID INT
    )
    BEGIN
    insert into shortlinks(shortend, actual_link, creation_date) values (shorted, longLink, createDate);
    SELECT LAST_INSERT_ID() into @insertID;
    select shortend INTO @shorted from shortlinks where id = @insertID ;
    END