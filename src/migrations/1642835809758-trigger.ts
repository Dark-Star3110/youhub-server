import { MigrationInterface, QueryRunner } from "typeorm";

export class trigger1642835809758 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TRIGGER tg_deleteUser 
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
        END`);

    await queryRunner.query(`
        CREATE TRIGGER tg_deleteComment
        ON [comment]
        INSTEAD OF DELETE
        AS
        BEGIN
        DECLARE @cmtId uniqueidentifier
        SELECT @cmtId = id FROM deleted
        DELETE FROM [comment] WHERE parentCommentId = @cmtId OR id = @cmtId
        END`);

    await queryRunner.query(`CREATE TRIGGER tg_deleteVideo
        on [video]
        INSTEAD OF DELETE
        AS
        BEGIN
        DELETE FROM [comment] WHERE videoId IN (SELECT id FROM deleted)
        DELETE FROM [video] WHERE id IN (SELECT id FROM deleted)
        END`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER tg_deleteUser`);
    await queryRunner.query(`DROP TRIGGER tg_deleteVideo`);
    await queryRunner.query(`DROP TRIGGER tg_deleteComment`);
  }
}
