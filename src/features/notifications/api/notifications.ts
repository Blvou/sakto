import { supabase } from '@/src/lib/supabase';

export interface UserNotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  href: string | null;
  booking_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface UserNotification {
  id: string;
  title: string;
  body: string;
  href: string | null;
  bookingId: string | null;
  read: boolean;
  createdAt: string;
}

function mapRow(row: UserNotificationRow): UserNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    href: row.href,
    bookingId: row.booking_id,
    read: row.read_at != null,
    createdAt: row.created_at,
  };
}

export async function fetchUserNotifications(userId: string): Promise<UserNotification[]> {
  const { data, error } = await supabase
    .from('user_notifications')
    .select('id, user_id, title, body, href, booking_id, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return ((data ?? []) as UserNotificationRow[]).map(mapRow);
}

export interface InsertUserNotificationInput {
  userId: string;
  title: string;
  body: string;
  href?: string;
  bookingId: string;
}

export async function insertUserNotification(input: InsertUserNotificationInput): Promise<void> {
  const { error } = await supabase.from('user_notifications').insert({
    user_id: input.userId,
    title: input.title,
    body: input.body,
    href: input.href ?? null,
    booking_id: input.bookingId,
  });

  if (error) throw error;
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw error;
}
