import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '../../../lib/db.js';
import Player from '../../../models/Player.js';
import Session from '../../../models/Session.js';
import Match from '../../../models/Match.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const isDB = await connectDB();
    if (isDB && mongoose.connection.readyState === 1) {
      const db = mongoose.connection.db;
      const databaseName = db.databaseName;

      // Real counts from MongoDB Atlas
      const [playerCount, sessionCount, matchCount] = await Promise.all([
        Player.countDocuments({ active: true }),
        Session.countDocuments(),
        Match.countDocuments(),
      ]);

      return NextResponse.json({
        connected: true,
        type: 'MongoDB Atlas',
        database: databaseName,
        matchesAccessible: true,
        counts: {
          players: playerCount,
          sessions: sessionCount,
          matches: matchCount,
        },
        statusText: `Connected to ${databaseName} (${playerCount} players, ${sessionCount} sessions, ${matchCount} matches)`,
      });
    }

    return NextResponse.json(
      {
        connected: false,
        type: 'Disconnected',
        error: 'MongoDB Atlas connection readyState is not 1',
      },
      { status: 503 }
    );
  } catch (error) {
    let reason = 'CONNECTION_FAILED';
    let suggestion = error.message;

    if (!process.env.MONGODB_URI) {
      reason = 'ENV_MISSING';
      suggestion =
        'MONGODB_URI is not set in Vercel Environment Variables. Add MONGODB_URI in Vercel Project Settings > Environment Variables, then Redeploy.';
    } else if (
      error.message?.includes('whitelist') ||
      error.message?.includes('Could not connect to any servers')
    ) {
      reason = 'IP_NOT_WHITELISTED';
      suggestion =
        'Vercel IP blocked by MongoDB Atlas. In Atlas Network Access, add IP 0.0.0.0/0 (Allow access from anywhere).';
    } else if (
      error.message?.includes('auth') ||
      error.message?.includes('Authentication failed')
    ) {
      reason = 'AUTH_FAILED';
      suggestion =
        'MongoDB Atlas authentication failed. Verify database user password in MONGODB_URI.';
    }

    return NextResponse.json(
      {
        connected: false,
        type: 'Disconnected',
        error: error.message,
        reason,
        suggestion,
      },
      { status: 500 }
    );
  }
}
