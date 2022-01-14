import { MigrationInterface, QueryRunner } from "typeorm";

export class fixmigration1642068937442 implements MigrationInterface {
  name = "fixmigration1642068937442";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscribe" ("chanelId" uniqueidentifier NOT NULL, "subscriberId" uniqueidentifier NOT NULL, "isNotification" bit NOT NULL CONSTRAINT "DF_58a857b5a9570136c157f9e9451" DEFAULT 0, "subscribedAt" datetime2 NOT NULL CONSTRAINT "DF_519617dce9c7e96cf4b80ee8973" DEFAULT getdate(), CONSTRAINT "PK_1e70aee18749f162d2e04a75ce0" PRIMARY KEY ("chanelId", "subscriberId"))`
    );
    await queryRunner.query(
      `CREATE TABLE "vote_comment" ("userId" uniqueidentifier NOT NULL, "commentId" uniqueidentifier NOT NULL, "type" int CONSTRAINT CHK_e43477cbf2d5d4726ed4cf412d_ENUM CHECK(type IN ('1','-1')) NOT NULL, CONSTRAINT "PK_850fd745db571631011aaf92edd" PRIMARY KEY ("userId", "commentId"))`
    );
    await queryRunner.query(
      `CREATE TABLE "vote_video" ("videoId" nvarchar(255) NOT NULL, "userId" uniqueidentifier NOT NULL, "type" int CONSTRAINT CHK_5be00039778a3a046c0b3cad2d_ENUM CHECK(type IN ('1','-1')) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_310e78d980a675a86b26e084c8f" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_6d888093505d4e0bf62d4669e5e" DEFAULT getdate(), CONSTRAINT "PK_31341325bb8e4c39f12ebbe1e85" PRIMARY KEY ("videoId", "userId"))`
    );
    await queryRunner.query(
      `CREATE TABLE "watch_later" ("userId" uniqueidentifier NOT NULL, "videoId" nvarchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_96ca43175c88f23fa3699d1302f" DEFAULT getdate(), CONSTRAINT "PK_1c788dd45a57d99a2529d26385e" PRIMARY KEY ("userId", "videoId"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_cace4a159ff9f2512dd42373760" DEFAULT NEWSEQUENTIALID(), "username" nvarchar(255), "password" nvarchar(255), "email" nvarchar(255) NOT NULL, "socialId" nvarchar(255), "firstName" nvarchar(255) NOT NULL, "lastName" nvarchar(255) NOT NULL CONSTRAINT "DF_f0e1b4ecdca13b177e2e3a0613c" DEFAULT ' ', "fullName" nvarchar(255), "channelDecscription" text, "image_url" nvarchar(255), "banner_id" nvarchar(255), "dateOfBirth" datetime, "role" nvarchar(255) CONSTRAINT CHK_ffcf40f029767c1533c9585043_ENUM CHECK(role IN ('ADMIN','USER','GUEST')) NOT NULL CONSTRAINT "DF_6620cd026ee2b231beac7cfe578" DEFAULT 'USER', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_e11e649824a45d8ed01d597fd93" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_80ca6e6ef65fb9ef34ea8c90f42" DEFAULT getdate(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_0b0e4bbc8415ec426f87f3a88e2" DEFAULT NEWSEQUENTIALID(), "userId" uniqueidentifier NOT NULL, "videoId" nvarchar(255) NOT NULL, "content" nvarchar(255) NOT NULL, "parentCommentId" uniqueidentifier, "createdAt" datetimeoffset NOT NULL CONSTRAINT "DF_3edd3cdb7232a3e9220607eabba" DEFAULT getdate(), "updatedAt" datetimeoffset NOT NULL CONSTRAINT "DF_ac0081ff2cbd7d3bc5b0fab55c7" DEFAULT getdate(), "deletedAt" datetime2, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "video" ("id" nvarchar(255) NOT NULL, "title" nvarchar(255) NOT NULL, "description" nvarchar(255) NOT NULL, "commentable" bit NOT NULL CONSTRAINT "DF_d208f66b06926d8444059cce3e1" DEFAULT 1, "thumbnailUrl" nvarchar(255), "size" nvarchar(255) NOT NULL, "userId" uniqueidentifier NOT NULL, "createdAt" datetimeoffset NOT NULL CONSTRAINT "DF_ea76b332802cccfa1e19c800336" DEFAULT getdate(), "updatedAt" datetimeoffset NOT NULL CONSTRAINT "DF_662a254cab721648cdf1d509089" DEFAULT getdate(), CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "video_catagory" ("videoId" nvarchar(255) NOT NULL, "catagoryId" uniqueidentifier NOT NULL, CONSTRAINT "PK_734718e76f93172b512805f3e77" PRIMARY KEY ("videoId", "catagoryId"))`
    );
    await queryRunner.query(
      `CREATE TABLE "catagory" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_1c4ef76d48ef45098ff3aece7c4" DEFAULT NEWSEQUENTIALID(), "name" nvarchar(255) NOT NULL, CONSTRAINT "PK_1c4ef76d48ef45098ff3aece7c4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "subscribe" ADD CONSTRAINT "FK_44b06318cd760c6acf1ede92a91" FOREIGN KEY ("chanelId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "subscribe" ADD CONSTRAINT "FK_ce4d1992337c8dc5e9d7173a2cd" FOREIGN KEY ("subscriberId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vote_comment" ADD CONSTRAINT "FK_0977824b6350e028b80edb35d88" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vote_comment" ADD CONSTRAINT "FK_591b5731ef7824c577687746f5e" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vote_video" ADD CONSTRAINT "FK_f2e351fd00ae528365db88be664" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vote_video" ADD CONSTRAINT "FK_31a25431b0d132dad4e47767b00" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "watch_later" ADD CONSTRAINT "FK_f971d015c35cf30740e90e183eb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "watch_later" ADD CONSTRAINT "FK_6767216d90a81f6eaf9d5bdf108" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_73aac6035a70c5f0313c939f237" FOREIGN KEY ("parentCommentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_fae151444dcca85704ef1fbb285" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "video" ADD CONSTRAINT "FK_74e27b13f8ac66f999400df12f6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "video_catagory" ADD CONSTRAINT "FK_2375b95a79fb5d273fa79b13da5" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "video_catagory" ADD CONSTRAINT "FK_ed87bff4052ac2e2420ba531fc2" FOREIGN KEY ("catagoryId") REFERENCES "catagory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "video_catagory" DROP CONSTRAINT "FK_ed87bff4052ac2e2420ba531fc2"`
    );
    await queryRunner.query(
      `ALTER TABLE "video_catagory" DROP CONSTRAINT "FK_2375b95a79fb5d273fa79b13da5"`
    );
    await queryRunner.query(
      `ALTER TABLE "video" DROP CONSTRAINT "FK_74e27b13f8ac66f999400df12f6"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_fae151444dcca85704ef1fbb285"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_73aac6035a70c5f0313c939f237"`
    );
    await queryRunner.query(
      `ALTER TABLE "watch_later" DROP CONSTRAINT "FK_6767216d90a81f6eaf9d5bdf108"`
    );
    await queryRunner.query(
      `ALTER TABLE "watch_later" DROP CONSTRAINT "FK_f971d015c35cf30740e90e183eb"`
    );
    await queryRunner.query(
      `ALTER TABLE "vote_video" DROP CONSTRAINT "FK_31a25431b0d132dad4e47767b00"`
    );
    await queryRunner.query(
      `ALTER TABLE "vote_video" DROP CONSTRAINT "FK_f2e351fd00ae528365db88be664"`
    );
    await queryRunner.query(
      `ALTER TABLE "vote_comment" DROP CONSTRAINT "FK_591b5731ef7824c577687746f5e"`
    );
    await queryRunner.query(
      `ALTER TABLE "vote_comment" DROP CONSTRAINT "FK_0977824b6350e028b80edb35d88"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscribe" DROP CONSTRAINT "FK_ce4d1992337c8dc5e9d7173a2cd"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscribe" DROP CONSTRAINT "FK_44b06318cd760c6acf1ede92a91"`
    );
    await queryRunner.query(`DROP TABLE "catagory"`);
    await queryRunner.query(`DROP TABLE "video_catagory"`);
    await queryRunner.query(`DROP TABLE "video"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "watch_later"`);
    await queryRunner.query(`DROP TABLE "vote_video"`);
    await queryRunner.query(`DROP TABLE "vote_comment"`);
    await queryRunner.query(`DROP TABLE "subscribe"`);
  }
}
