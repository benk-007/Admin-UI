import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {

  /**
   * Get all available timezones with their labels and offsets
   */
  getTimezones(): TimezoneOption[] {
    const timezones = moment.tz.names();

    return timezones.map(timezone => {
      const momentTz = moment.tz(timezone);
      const offset = momentTz.format('Z');
      const offsetHours = momentTz.utcOffset() / 60;

      return {
        value: timezone,
        label: `${timezone} (GMT${offset})`,
        offset: offset
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Get common/popular timezones
   */
  getCommonTimezones(): TimezoneOption[] {
    const commonTimezones = [
      'Africa/Casablanca',
      'Europe/Paris',
      'Europe/London',
      'America/New_York',
      'America/Los_Angeles',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'America/Toronto',
      'Europe/Berlin',
      'Asia/Dubai',
      'Pacific/Auckland'
    ];

    return commonTimezones.map(timezone => {
      const momentTz = moment.tz(timezone);
      const offset = momentTz.format('Z');

      return {
        value: timezone,
        label: `${timezone} (GMT${offset})`,
        offset: offset
      };
    });
  }

  /**
   * Get timezone by name
   */
  getTimezone(timezoneName: string): TimezoneOption | null {
    try {
      const momentTz = moment.tz(timezoneName);
      const offset = momentTz.format('Z');

      return {
        value: timezoneName,
        label: `${timezoneName} (GMT${offset})`,
        offset: offset
      };
    } catch {
      return null;
    }
  }
}
