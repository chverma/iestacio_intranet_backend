import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalendarEventDeleteTrigger1730115265791 implements MigrationInterface {
  name = 'AddCalendarEventDeleteTrigger1730115265791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Añadir columna 'deleted' si no existe
    await queryRunner.query(`
      ALTER TABLE \`calendar_event\` ADD COLUMN IF NOT EXISTS \`deleted\` TINYINT(1) NOT NULL DEFAULT 0
    `);

    // Elimina el trigger si ya existe para evitar duplicados
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS calendarEvent_softdelete_absence;
    `);

    // Crea el trigger para borrar ausencias relacionadas cuando deleted pasa a true
    await queryRunner.query(`
      CREATE TRIGGER calendarEvent_softdelete_absence
      BEFORE UPDATE ON calendar_event
      FOR EACH ROW
      BEGIN
        IF NEW.deleted = TRUE AND OLD.deleted = FALSE THEN
            SET NEW.processed = TRUE;
            DELETE FROM absence WHERE eventIdEvent = NEW.id_event;
        END IF;
      END;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS calendarEvent_softdelete_absence;
    `);

    // Eliminar columna 'deleted'
    await queryRunner.query(`
      ALTER TABLE \`calendar_event\` DROP COLUMN \`deleted\`
    `);
  }
}
