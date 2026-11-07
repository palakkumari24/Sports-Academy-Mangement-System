import { NextResponse } from 'next/server';
import { getMatches, addMatch } from '../../../lib/storage.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const matches = await getMatches(sport);
    return NextResponse.json({ success: true, data: matches });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.date || !body.sport || !body.opponent) {
      return NextResponse.json(
        { success: false, error: 'Match date, sport, and opponent name are required.' },
        { status: 400 }
      );
    }
    const created = await addMatch(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
