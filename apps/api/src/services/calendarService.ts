// ============================================================
// SCoT ERP — Calendar Event Service
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { calendarEventRepo, employeeRepo } from '../repositories/index.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';
import type { CalendarEvent } from '@scot-erp/shared';

export class CalendarService {
  async createEvent(data: Partial<CalendarEvent>, userId: string): Promise<CalendarEvent> {
    const event = await calendarEventRepo.create({
      id: uuidv4(),
      title: data.title || '',
      description: data.description || '',
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      location: data.location || '',
      organizer: userId,
      attendees: data.attendees || [],
      icsData: null,
      googleEventId: null,
    });

    // Notify attendees
    for (const attendeeId of event.attendees) {
      const attendee = await employeeRepo.findById(attendeeId);
      if (attendee) {
        await notificationService.send({
          recipientId: attendeeId,
          recipientEmail: attendee.email,
          title: `Calendar: ${event.title}`,
          body: `You have been invited to "${event.title}" on ${event.startTime}.`,
          deepLink: `/calendar`,
          channel: 'both',
        });
      }
    }

    await auditService.log({
      userId,
      action: 'CALENDAR_EVENT_CREATED',
      entity: 'CalendarEvent',
      entityId: event.id,
      before: null,
      after: { title: event.title } as any,
    });

    return event;
  }

  async updateEvent(id: string, data: Partial<CalendarEvent>, userId: string): Promise<CalendarEvent | null> {
    const before = await calendarEventRepo.findById(id);
    const updated = await calendarEventRepo.update(id, data);

    if (updated) {
      await auditService.log({
        userId,
        action: 'CALENDAR_EVENT_UPDATED',
        entity: 'CalendarEvent',
        entityId: id,
        before: { title: before?.title } as any,
        after: { title: updated.title } as any,
      });
    }

    return updated;
  }

  async deleteEvent(id: string, userId: string): Promise<boolean> {
    const event = await calendarEventRepo.findById(id);
    const deleted = await calendarEventRepo.delete(id);

    if (deleted && event) {
      await auditService.log({
        userId,
        action: 'CALENDAR_EVENT_DELETED',
        entity: 'CalendarEvent',
        entityId: id,
        before: { title: event.title } as any,
        after: null,
      });
    }

    return deleted;
  }

  async getEventById(id: string): Promise<CalendarEvent | null> {
    return calendarEventRepo.findById(id);
  }

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    return calendarEventRepo.findUpcoming();
  }

  async getMyEvents(userId: string): Promise<CalendarEvent[]> {
    const organized = await calendarEventRepo.findByOrganizer(userId);
    const attending = await calendarEventRepo.findByAttendee(userId);
    // Merge and dedupe
    const all = [...organized];
    for (const e of attending) {
      if (!all.find((a) => a.id === e.id)) {
        all.push(e);
      }
    }
    return all.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    return calendarEventRepo.findByDateRange(startDate, endDate);
  }
}

export const calendarService = new CalendarService();
