import { NextResponse } from 'next/server';
import { getPlayers, addPlayer } from '../../../lib/storage.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const players = await getPlayers(sport);
    return NextResponse.json({ success: true, data: players });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.age || !body.sport) {
      return NextResponse.json(
        { success: false, error: 'Name, age, and sport are required fields.' },
        { status: 400 }
      );
    }
    const created = await addPlayer(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
