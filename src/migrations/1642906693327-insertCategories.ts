import { MigrationInterface, QueryRunner } from "typeorm";

export class insertCategories1642906693327 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO [catagory] (id, name)
        VALUES ('9e53165f-f37b-ec11-8359-405bd82e7629', 'music'),
            ('9f53165f-f37b-ec11-8359-405bd82e7629', 'sport'),
            ('a053165f-f37b-ec11-8359-405bd82e7629', 'news'), 
            ('a153165f-f37b-ec11-8359-405bd82e7629', 'game'), 
            ('a253165f-f37b-ec11-8359-405bd82e7629', 'other') `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM [catagory] WHERE name='music' OR name='sport' OR name='news' OR name='game' OR name='other'`
    );
  }
}
