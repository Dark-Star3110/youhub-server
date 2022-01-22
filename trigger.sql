
-- create trigger for delete user
CREATE TRIGGER tg_deleteUser 
on [user]
INSTEAD OF DELETE
AS
BEGIN
  DECLARE @userId uniqueidentifier 
  SELECT @userId = id FROM deleted
  DELETE FROM [subscribe] WHERE chanelId=@userId
  DELETE FROM [video] WHERE userId=@userId
  DELETE FROM [comment] WHERE userId=@userId
  DELETE FROM [user] WHERE id=@userId
END


-- create trigger delete comment
CREATE TRIGGER tg_deleteComment
ON [comment]
INSTEAD OF DELETE
AS
BEGIN
  DECLARE @cmtId uniqueidentifier
  SELECT @cmtId = id FROM deleted
  DELETE FROM [comment] WHERE parentCommentId = @cmtId OR id = @cmtId
END


-- create trigger delete video
CREATE TRIGGER tg_deleteVideo 
on [video]
INSTEAD OF DELETE
AS
BEGIN
  DELETE FROM [comment] WHERE videoId IN (SELECT id FROM deleted)
  DELETE FROM [video] WHERE id IN (SELECT id FROM deleted)
END

-- drop trigger 
DROP TRIGGER tg_deleteUser
DROP TRIGGER tg_deleteComment
DROP TRIGGER tg_deleteVideo