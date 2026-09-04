import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThreadIdLink21787058970316 implements MigrationInterface {
  name = 'AddThreadIdLink21787058970316';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_5cfc18ff706d881a20630222416"`,
    );
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "threadIdId"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "threadId"`);
    await queryRunner.query(`ALTER TABLE "comments" ADD "threadId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_f682eb665c360168731f596b0e3" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_f682eb665c360168731f596b0e3"`,
    );
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "threadId"`);
    await queryRunner.query(
      `ALTER TABLE "comments" ADD "threadId" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "comments" ADD "threadIdId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_5cfc18ff706d881a20630222416" FOREIGN KEY ("threadIdId") REFERENCES "threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
