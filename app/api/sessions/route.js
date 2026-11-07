import { NextResponse } from 'next/server';
import { getSessions, addSession } from '../../../lib/storage.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const sessions = await getSessions(sport);
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.date || !body.sport) {
      return NextResponse.json(
        { success: false, error: 'Session date and sport are required.' },
        { status: 400 }
      );
    }
    const created = await addSession(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
