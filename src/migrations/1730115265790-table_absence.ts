import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFKAbsenceCalendarEvent1683456789012 implements MigrationInterface {
  name = 'AddFKAbsenceCalendarEvent1683456789012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`absence\` ADD \`calendarEventId\` INT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`absence\` ADD CONSTRAINT \`FK_absence_calendarEvent\` FOREIGN KEY (\`calendarEventId\`) REFERENCES \`calendar_event\`(\`id_event\`) ON DELETE SET NULL ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`absence\` DROP FOREIGN KEY \`FK_absence_calendarEvent\``
    );
    await queryRunner.query(
      `ALTER TABLE \`absence\` DROP COLUMN \`calendarEventId\``
    );
  }
}
