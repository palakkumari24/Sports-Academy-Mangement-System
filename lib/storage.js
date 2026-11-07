import { connectDB } from './db.js';
import Player from '../models/Player.js';
import Session from '../models/Session.js';
import Match from '../models/Match.js';

// Strict MongoDB Atlas Data Layer
export async function getPlayers(sportFilter = null) {
  await connectDB();
  const query = { active: true };
  if (sportFilter && sportFilter !== 'All') {
    query.sport = sportFilter;
  }
  const docs = await Player.find(query).sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({ ...d, _id: d._id.toString() }));
}

export async function addPlayer(playerData) {
  await connectDB();
  const created = await Player.create({
    ...playerData,
    academy: playerData.academy || 'Dumka Sports Academy',
    active: true,
  });
  return { ...created.toObject(), _id: created._id.toString() };
}

export async function updatePlayer(id, updateData) {
  await connectDB();
  const updated = await Player.findByIdAndUpdate(id, updateData, { new: true }).lean();
  return updated ? { ...updated, _id: updated._id.toString() } : null;
}

export async function deletePlayer(id) {
  await connectDB();
  await Player.findByIdAndDelete(id);
  return true;
}

export async function getSessions(sportFilter = null) {
  await connectDB();
  const query = {};
  if (sportFilter && sportFilter !== 'All') {
    query.sport = sportFilter;
  }
  const docs = await Session.find(query).sort({ date: -1 }).lean();
  return docs.map((d) => ({ ...d, _id: d._id.toString() }));
}

export async function addSession(sessionData) {
  await connectDB();
  const attendance = sessionData.attendance || [];
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;

  const dataToSave = {
    ...sessionData,
    academy: sessionData.academy || 'Dumka Sports Academy',
    totalPlayers: attendance.length,
    presentCount,
    absentCount,
  };

  const created = await Session.create(dataToSave);
  return { ...created.toObject(), _id: created._id.toString() };
}

export async function getMatches(sportFilter = null) {
  await connectDB();
  const query = {};
  if (sportFilter && sportFilter !== 'All') {
    query.sport = sportFilter;
  }
  const docs = await Match.find(query).sort({ date: -1 }).lean();
  return docs.map((d) => ({ ...d, _id: d._id.toString() }));
}

export async function addMatch(matchData) {
  await connectDB();
  const created = await Match.create({
    ...matchData,
    academy: matchData.academy || 'Dumka Sports Academy',
  });
  return { ...created.toObject(), _id: created._id.toString() };
}

// Compute Trial Readiness Report directly from live MongoDB records
export async function getTrialReadinessReport() {
  await connectDB();
  const players = await getPlayers();
  const sessions = await getSessions();
  const matches = await getMatches();

  return players.map((player) => {
    // 1. Calculate Attendance
    let totalEligibleSessions = 0;
    let attendedSessions = 0;
    let skippedSessions = 0;

    sessions.forEach((s) => {
      if (s.sport && s.sport.toLowerCase() === player.sport.toLowerCase()) {
        const record = s.attendance?.find(
          (a) => a.playerId === player._id || a.playerName === player.name
        );
        if (record) {
          totalEligibleSessions++;
          if (record.status === 'Present') {
            attendedSessions++;
          } else if (record.status === 'Absent') {
            skippedSessions++;
          }
        }
      }
    });

    const attendanceRate =
      totalEligibleSessions > 0 ? Math.round((attendedSessions / totalEligibleSessions) * 100) : 100;

    // 2. Calculate Match Stats & Scoring
    let matchAppearances = 0;
    let totalScore = 0;
    let totalAssistsOrWickets = 0;
    let ratings = [];

    matches.forEach((m) => {
      if (m.sport && m.sport.toLowerCase() === player.sport.toLowerCase() && m.players) {
        const rec = m.players.find(
          (p) => p.playerId === player._id || p.playerName === player.name
        );
        if (rec && rec.played) {
          matchAppearances++;
          totalScore += Number(rec.score) || 0;
          totalAssistsOrWickets += Number(rec.assistsOrWickets) || 0;
          if (rec.performanceRating) {
            ratings.push(rec.performanceRating);
          }
        }
      }
    });

    const avgRating =
      ratings.length > 0
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 7.0;

    // 3. Composite Readiness Score (0-100)
    // Formula: 45% Attendance + 35% Match Score/Rating + 20% Base Conditioning
    const fitness = player.fitnessScore || 80;
    const ratingScore = avgRating * 10;
    const compositeScore = Math.round(attendanceRate * 0.45 + ratingScore * 0.35 + fitness * 0.2);

    let status = 'Needs Practice';
    let recommendations = [];

    if (attendanceRate < 60) {
      status = 'Needs Practice';
      recommendations.push('Attendance is critically low. Frequently skipped practice.');
    } else if (attendanceRate >= 80 && compositeScore >= 80) {
      status = 'Ready for Trial';
      recommendations.push('Consistent attendance, proven in match play, and peak physical condition.');
    } else {
      status = 'On Track';
      recommendations.push('Consistent development; recommend 2 more weeks of focused drills.');
    }

    if (totalScore > 0) {
      if (player.sport === 'Football') {
        recommendations.push(`Scored ${totalScore} goal${totalScore > 1 ? 's' : ''} in matches.`);
      } else if (player.sport === 'Cricket') {
        recommendations.push(`Scored ${totalScore} runs with ${totalAssistsOrWickets} wickets.`);
      } else {
        recommendations.push(`Contributed ${totalScore} points in match play.`);
      }
    }

    return {
      player,
      metrics: {
        totalEligibleSessions,
        attendedSessions,
        skippedSessions,
        attendanceRate,
        matchAppearances,
        totalScore,
        totalAssistsOrWickets,
        avgRating,
        fitnessScore: fitness,
        compositeScore,
      },
      status,
      recommendations,
    };
  });
}
