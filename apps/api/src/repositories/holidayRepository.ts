// ============================================================
// SCoT ERP — Public Holiday Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { PublicHoliday } from '@scot-erp/shared';

export class MockPublicHolidayRepository extends MockBaseRepository<PublicHoliday> {
  constructor() {
    super('publicHolidays');
  }

  async findByDate(date: string): Promise<PublicHoliday | null> {
    return this.findOneByField('date', date);
  }

  async findByYear(year: number): Promise<PublicHoliday[]> {
    const all = await this.findAll();
    return all.filter((h) => h.date.startsWith(String(year)));
  }

  async isHoliday(date: string): Promise<boolean> {
    const h = await this.findByDate(date);
    return h !== null;
  }
}
