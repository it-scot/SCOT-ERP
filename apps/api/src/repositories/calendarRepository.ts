// ============================================================
// SCoT ERP — Calendar Event Repository
// ============================================================
import { MockBaseRepository } from './baseRepository.js';
import type { CalendarEvent } from '@scot-erp/shared';

export class MockCalendarEventRepository extends MockBaseRepository<CalendarEvent> {
  constructor() {
    super('calendarEvents');
  }

  async findByOrganizer(organizer: string): Promise<CalendarEvent[]> {
    return this.findByField('organizer', organizer);
  }

  async findByAttendee(attendeeId: string): Promise<CalendarEvent[]> {
    const all = await this.findAll();
    return all.filter((e) => e.attendees.includes(attendeeId));
  }

  async findUpcoming(): Promise<CalendarEvent[]> {
    const now = new Date().toISOString();
    const all = await this.findAll();
    return all
      .filter((e) => e.startTime >= now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async findByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const all = await this.findAll();
    return all.filter(
      (e) => e.startTime >= startDate && e.startTime <= endDate
    );
  }
}
