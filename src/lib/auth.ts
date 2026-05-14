import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'apex_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: number): Promise<string> {
  const sessionToken = generateSessionToken();
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ userId, token: sessionToken }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
  
  return sessionToken;
}

export async function getSession(): Promise<{ userId: number; token: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    return session;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  const [user] = await db
    .select({
      id: users.id,
      full_name: users.full_name,
      email: users.email,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  
  return user || null;
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
