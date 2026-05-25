import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../database/db';
import { CalendarConfig, Settings } from '../types';

export const setCalendarConfig = async (date: string, dayType: 'workday' | 'rest_day'): Promise<CalendarConfig> => {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  // Try to update first
  const existing = await dbGet('SELECT id FROM calendar_config WHERE date = ?', [date]);
  
  if (existing) {
    await dbRun('UPDATE calendar_config SET day_type = ?, updated_at = ? WHERE date = ?', [dayType, now, date]);
  } else {
    await dbRun(
      `INSERT INTO calendar_config (id, date, day_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [id, date, dayType, now, now]
    );
  }

  return { id: existing?.id || id, date, day_type: dayType, created_at: now, updated_at: now };
};

export const getCalendarConfig = (date: string): Promise<CalendarConfig> => {
  return dbGet('SELECT * FROM calendar_config WHERE date = ?', [date]);
};

export const getCalendarConfigRange = (startDate: string, endDate: string): Promise<CalendarConfig[]> => {
  return dbAll('SELECT * FROM calendar_config WHERE date BETWEEN ? AND ?', [startDate, endDate]);
};

export const deleteCalendarConfig = (date: string): Promise<void> => {
  return dbRun('DELETE FROM calendar_config WHERE date = ?', [date]);
};

export const getSettings = async (): Promise<Settings> => {
  let settings = await dbGet('SELECT * FROM settings LIMIT 1');
  
  if (!settings) {
    const id = uuidv4();
    const now = new Date().toISOString();
    await dbRun(
      `INSERT INTO settings (id, focus_duration, short_break_duration, long_break_duration, theme, created_at, updated_at)
       VALUES (?, 25, 5, 15, 'light', ?, ?)`,
      [id, now, now]
    );
    settings = await dbGet('SELECT * FROM settings LIMIT 1');
  }
  
  return settings;
};

export const updateSettings = async (focusDuration?: number, shortBreakDuration?: number, longBreakDuration?: number, theme?: 'light' | 'dark'): Promise<void> => {
  const now = new Date().toISOString();
  const updates = [];
  const values = [];

  if (focusDuration !== undefined) {
    updates.push('focus_duration = ?');
    values.push(focusDuration);
  }
  if (shortBreakDuration !== undefined) {
    updates.push('short_break_duration = ?');
    values.push(shortBreakDuration);
  }
  if (longBreakDuration !== undefined) {
    updates.push('long_break_duration = ?');
    values.push(longBreakDuration);
  }
  if (theme) {
    updates.push('theme = ?');
    values.push(theme);
  }

  if (updates.length > 0) {
    updates.push('updated_at = ?');
    values.push(now);
    await dbRun(`UPDATE settings SET ${updates.join(', ')} LIMIT 1`, values);
  }
};
