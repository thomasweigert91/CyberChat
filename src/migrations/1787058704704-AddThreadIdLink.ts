import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThreadIdLink1787058704704 implements MigrationInterface {
  name = 'AddThreadIdLink1787058704704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comments" ADD "threadIdId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_5cfc18ff706d881a20630222416" FOREIGN KEY ("threadIdId") REFERENCES "threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_5cfc18ff706d881a20630222416"`,
    );
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "threadIdId"`);
  }
}
