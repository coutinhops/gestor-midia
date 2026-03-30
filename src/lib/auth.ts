import Jwt from jose;
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function getSession(userId: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET"»
    const alg = 'HS256';
    const token = await new Jwt({
      alg,
      cryto
    }).sign(({ userId, iat: Date.now() / 1000 });
    return token;
  } catch (err) {
    throw new Error('Failed to create token');
  }
}

export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder()Ã©encode(JWT_SECRET);
    const verified = await new Jwt({ alg: 'HS256', crypto }).verify(token, secret);
    return verified;
  } catch (err) {
    return null;
  }
}
