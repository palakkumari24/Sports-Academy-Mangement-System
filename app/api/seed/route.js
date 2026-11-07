import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db.js';
import Player from '../../../models/Player.js';
import Session from '../../../models/Session.js';
import Match from '../../../models/Match.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    await connectDB();
    const playerCount = await Player.countDocuments();
    return NextResponse.json({
      success: true,
      message: `Database active with ${playerCount} players in MongoDB Atlas`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
