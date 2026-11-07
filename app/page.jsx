'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Trophy,
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Activity,
  MapPin,
  Clock,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Download,
  RotateCcw,
  UserCheck,
  UserX,
  Star,
  Sparkles,
} from 'lucide-react';

const SPORTS = ['Football', 'Cricket', 'Athletics', 'Badminton', 'Kabaddi', 'Archery'];

export default function CoachDesk() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, players, sessions, matches, readiness
  const [selectedSport, setSelectedSport] = useState('All');
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [readinessData, setReadinessData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbStatus, setDbStatus] = useState({ connected: false, type: 'Checking...' });

  // Modals
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showRecordMatchModal, setShowRecordMatchModal] = useState(false);
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState(null);

  // Form states
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    age: '',
    sport: 'Football',
    position: '',
    contact: '',
    jerseyNumber: '',
    fitnessScore: 85,
    coachNotes: '',
  });

  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    sport: 'Football',
    sessionType: 'Practice',
    focusArea: 'Passing drills & physical conditioning',
    attendance: [],
  });

  const [newMatch, setNewMatch] = useState({
    date: new Date().toISOString().split('T')[0],
    sport: 'Football',
    opponent: '',
    location: 'Dumka Stadium Ground',
    academyScore: '0',
    opponentScore: '0',
    result: 'Won',
    coachNotes: '',
    players: [],
  });

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      fetch('/api/status')
        .then((r) => r.json())
        .then((d) => setDbStatus(d))
        .catch((err) =>
          setDbStatus({
            connected: false,
            type: 'Disconnected',
            error: err.message,
            suggestion: 'Failed to contact database status endpoint.',
          })
        );

      const [pRes, sRes, mRes, rRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/sessions'),
        fetch('/api/matches'),
        fetch('/api/readiness'),
      ]);

      const [pData, sData, mData, rData] = await Promise.all([
        pRes.json(),
        sRes.json(),
        mRes.json(),
        rRes.json(),
      ]);

      if (pData.success) setPlayers(pData.data);
      if (sData.success) setSessions(sData.data);
      if (mData.success) setMatches(mData.data);
      if (rData.success) setReadinessData(rData.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update session attendance roster when sport changes in modal
  useEffect(() => {
    const eligible = players.filter(
      (p) => p.sport.toLowerCase() === newSession.sport.toLowerCase()
    );
    setNewSession((prev) => ({
      ...prev,
      attendance: eligible.map((p) => ({
        playerId: p._id,
        playerName: p.name,
        status: 'Present',
        notes: '',
      })),
    }));
  }, [newSession.sport, players]);

  // Update match player roster when sport changes in match modal
  useEffect(() => {
    const eligible = players.filter(
      (p) => p.sport.toLowerCase() === newMatch.sport.toLowerCase()
    );
    setNewMatch((prev) => ({
      ...prev,
      players: eligible.map((p) => ({
        playerId: p._id,
        playerName: p.name,
        played: true,
        score: 0,
        assistsOrWickets: 0,
        performanceRating: 7,
        notes: '',
      })),
    }));
  }, [newMatch.sport, players]);

  // Submit Player
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.age || !newPlayer.sport) return;

    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPlayer,
          age: Number(newPlayer.age),
          fitnessScore: Number(newPlayer.fitnessScore) || 80,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddPlayerModal(false);
        setNewPlayer({
          name: '',
          age: '',
          sport: 'Football',
          position: '',
          contact: '',
          jerseyNumber: '',
          fitnessScore: 85,
          coachNotes: '',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Session
  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewSessionModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Match
  const handleAddMatch = async (e) => {
    e.preventDefault();
    try {
      // Find top scorer
      let topScorerText = '';
      const playedPlayers = (newMatch.players || []).filter((p) => p.played);
      if (playedPlayers.length > 0) {
        const sorted = [...playedPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));
        if (sorted[0] && sorted[0].score > 0) {
          topScorerText = `${sorted[0].playerName} (${sorted[0].score} ${
            newMatch.sport === 'Football'
              ? 'goals'
              : newMatch.sport === 'Cricket'
              ? 'runs'
              : 'pts'
          })`;
        }
      }

      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMatch,
          topScorer: topScorerText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRecordMatchModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Player
  const handleDeletePlayer = async (id) => {
    if (!confirm('Are you sure you want to remove this player?')) return;
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (selectedPlayerDetail?._id === id) setSelectedPlayerDetail(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter players
  const filteredPlayers = players.filter((p) => {
    const matchesSport = selectedSport === 'All' || p.sport === selectedSport;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.position?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSport && matchesSearch;
  });

  // Calculate overview metrics
  const totalPlayersCount = players.length;
  const readyForTrialCount = readinessData.filter((r) => r.status === 'Ready for Trial').length;
  const onTrackCount = readinessData.filter((r) => r.status === 'On Track').length;
  const needsPracticeCount = readinessData.filter((r) => r.status === 'Needs Practice').length;

  // Find who skipped practice recently (last 3 sessions)
  const recentSkippers = [];
  sessions.slice(0, 3).forEach((s) => {
    s.attendance?.forEach((att) => {
      if (att.status === 'Absent') {
        const existing = recentSkippers.find((sk) => sk.playerName === att.playerName);
        if (existing) {
          existing.count += 1;
        } else {
          recentSkippers.push({
            playerName: att.playerName,
            sport: s.sport,
            count: 1,
            lastAbsentDate: s.date,
          });
        }
      }
    });
  });

  // Top scorers across matches
  const topScorers = [];
  matches.forEach((m) => {
    m.players?.forEach((p) => {
      if (p.score > 0) {
        const ex = topScorers.find((ts) => ts.playerName === p.playerName);
        if (ex) {
          ex.totalScore += Number(p.score);
        } else {
          topScorers.push({
            playerName: p.playerName,
            sport: m.sport,
            totalScore: Number(p.score),
          });
        }
      }
    });
  });
  topScorers.sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold text-lg">
              DS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-white tracking-tight">Dumka Sports Academy</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Coach Desk
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-400 space-x-2">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>Dumka, Jharkhand</span>
                <span className="text-slate-600">•</span>
                <span>Notebook Replaced & Digitalized</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg border shadow-sm ${
                dbStatus.connected
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-300'
              }`}
              title={
                dbStatus.connected
                  ? `Database: ${dbStatus.database} | matches: ${
                      dbStatus.matchesAccessible ? 'Accessible' : 'Unavailable'
                    }`
                  : dbStatus.suggestion || 'Database connection error'
              }
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1.5 leading-tight">
                <span className="font-bold">
                  {dbStatus.connected ? 'MongoDB Atlas Connected' : 'Database Offline'}
                </span>
                {dbStatus.connected && (
                  <span className="text-[10px] text-emerald-400/90 font-mono">
                    ({dbStatus.database} • matches: {dbStatus.matchesAccessible ? '✓' : '✗'})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                fetch('/api/seed', { method: 'POST' }).then(() => fetchData());
              }}
              title="Reset starter demo records"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
            <button
              onClick={() => setShowAddPlayerModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Player</span>
            </button>
            <button
              onClick={() => setShowNewSessionModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Open Session</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center space-x-2 whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview & Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center space-x-2 whitespace-nowrap transition ${
              activeTab === 'players'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Players Roster ({players.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center space-x-2 whitespace-nowrap transition ${
              activeTab === 'sessions'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Practice Attendance ({sessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center space-x-2 whitespace-nowrap transition ${
              activeTab === 'matches'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Match Desk ({matches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('readiness')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center space-x-2 whitespace-nowrap transition ${
              activeTab === 'readiness'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="flex items-center space-x-1">
              <span>Trial Readiness</span>
              {readyForTrialCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-1.5 py-0.2 rounded-full">
                  {readyForTrialCount} Ready
                </span>
              )}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!dbStatus.connected && dbStatus.suggestion && (
          <div className="mb-6 bg-red-950/40 border border-red-500/50 rounded-2xl p-4 flex items-start space-x-3 text-xs text-red-200 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-red-300 text-sm">MongoDB Atlas Connection Alert</div>
              <p className="text-red-200/90 leading-relaxed">{dbStatus.suggestion}</p>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Loading Dumka Sports Academy desk...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Problem Statement Hero Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                  <div className="max-w-3xl space-y-2">
                    <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>The Notebook Dilemma Solved</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Dumka Academy Daily Command Desk
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Track who skipped practice, view exact scores from match day, and accurately
                      identify players ready for district and state trials at a single glance.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
                    <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                        <span>Total Registered</span>
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{totalPlayersCount}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Across {SPORTS.length} sports</div>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                        <span>Sessions Recorded</span>
                        <CalendarCheck className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{sessions.length}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Practice & conditioning</div>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                        <span>Matches Logged</span>
                        <Trophy className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">{matches.length}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">With individual scores</div>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                        <span>Ready For Trial</span>
                        <Award className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-400">{readyForTrialCount}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {onTrackCount} developing, {needsPracticeCount} need drills
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Core Coaches Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Who Skipped Practice */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white">Who Skipped Practice</h3>
                            <p className="text-xs text-slate-400">Recent session absences</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                          {recentSkippers.length} flagged
                        </span>
                      </div>

                      {recentSkippers.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                          100% attendance in recent practice sessions!
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {recentSkippers.map((skipper, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800"
                            >
                              <div>
                                <div className="text-xs font-semibold text-white">
                                  {skipper.playerName}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {skipper.sport} • Last absent: {skipper.lastAbsentDate}
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                Skipped {skipper.count}x
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveTab('sessions')}
                      className="mt-4 w-full py-2 text-xs font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition flex items-center justify-center space-x-1"
                    >
                      <span>Open Attendance Desk</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2: Who Scored in Matches */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                            <Flame className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white">Who Scored</h3>
                            <p className="text-xs text-slate-400">Top performers in match play</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                          Match Stats
                        </span>
                      </div>

                      {topScorers.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No matches recorded yet. Record your first match!
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {topScorers.slice(0, 4).map((ts, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <div className="text-xs font-semibold text-white">
                                    {ts.playerName}
                                  </div>
                                  <div className="text-[11px] text-slate-400">{ts.sport}</div>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {ts.totalScore}{' '}
                                {ts.sport === 'Football'
                                  ? 'Goals'
                                  : ts.sport === 'Cricket'
                                  ? 'Runs'
                                  : 'Pts'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveTab('matches')}
                      className="mt-4 w-full py-2 text-xs font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition flex items-center justify-center space-x-1"
                    >
                      <span>View Match Scores</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 3: Who is Ready for a Trial */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white">Trial Ready Roster</h3>
                            <p className="text-xs text-slate-400">Calculated readiness</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          {readyForTrialCount} Ready
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {readinessData
                          .filter((r) => r.status === 'Ready for Trial')
                          .slice(0, 3)
                          .map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                                  <span>{item.player.name}</span>
                                  <span className="text-[10px] text-emerald-400 font-normal">
                                    ({item.player.age}y, {item.player.sport})
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Att: {item.metrics.attendanceRate}% • Rating:{' '}
                                  {item.metrics.avgRating}/10
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                🟢 Ready
                              </span>
                            </div>
                          ))}
                        {readyForTrialCount === 0 && (
                          <div className="py-6 text-center text-xs text-slate-400">
                            Log more practice sessions and matches to see trial readiness!
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('readiness')}
                      className="mt-4 w-full py-2 text-xs font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition flex items-center justify-center space-x-1"
                    >
                      <span>Open Trial Readiness Desk</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Action Banner */}
                <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        SESSION 1: Open a date and a sport
                      </h4>
                      <p className="text-xs text-slate-400">
                        Mark attendance for practice drills today so no player skips unrecorded.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewSessionModal(true)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition whitespace-nowrap"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Open Today's Session</span>
                  </button>
                </div>
              </div>
            )}

            {/* PLAYERS TAB */}
            {activeTab === 'players' && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search player name or position..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center">
                      <Filter className="w-3.5 h-3.5 mr-1" /> Sport:
                    </span>
                    {['All', ...SPORTS].map((sport) => (
                      <button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                          selectedSport === sport
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center justify-center space-x-1 transition whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Player</span>
                  </button>
                </div>

                {/* Players Table / Grid */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Player</th>
                          <th className="py-3 px-4">Sport & Role</th>
                          <th className="py-3 px-4">Academy</th>
                          <th className="py-3 px-4">Attendance Rate</th>
                          <th className="py-3 px-4">Match Scoring</th>
                          <th className="py-3 px-4">Trial Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {filteredPlayers.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-12 text-slate-400">
                              No players found matching your filter.
                            </td>
                          </tr>
                        ) : (
                          filteredPlayers.map((player) => {
                            const readiness = readinessData.find((r) => r.player._id === player._id);
                            return (
                              <tr
                                key={player._id}
                                className="hover:bg-slate-700/30 transition cursor-pointer"
                                onClick={() => setSelectedPlayerDetail(player)}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 text-emerald-400 font-bold flex items-center justify-center text-xs border border-slate-600">
                                      {player.jerseyNumber || player.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-bold text-white text-sm">{player.name}</div>
                                      <div className="text-[11px] text-slate-400">
                                        Age: {player.age} yrs • {player.contact || 'No contact'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-semibold text-white">{player.sport}</span>
                                  <div className="text-[11px] text-slate-400">{player.position || 'General'}</div>
                                </td>
                                <td className="py-3 px-4 text-slate-300">
                                  {player.academy || 'Dumka Sports Academy'}
                                </td>
                                <td className="py-3 px-4">
                                  {readiness ? (
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-white">
                                          {readiness.metrics.attendanceRate}%
                                        </span>
                                        <span className="text-slate-400">
                                          {readiness.metrics.attendedSessions}/
                                          {readiness.metrics.totalEligibleSessions}
                                        </span>
                                      </div>
                                      <div className="w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            readiness.metrics.attendanceRate >= 80
                                              ? 'bg-emerald-500'
                                              : readiness.metrics.attendanceRate >= 60
                                              ? 'bg-amber-500'
                                              : 'bg-red-500'
                                          }`}
                                          style={{ width: `${readiness.metrics.attendanceRate}%` }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500">100%</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {readiness ? (
                                    <div className="text-[11px]">
                                      <span className="font-bold text-amber-400">
                                        {readiness.metrics.totalScore}{' '}
                                        {player.sport === 'Football'
                                          ? 'Goals'
                                          : player.sport === 'Cricket'
                                          ? 'Runs'
                                          : 'Pts'}
                                      </span>
                                      <div className="text-slate-400">
                                        {readiness.metrics.matchAppearances} match app.
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500">0</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {readiness ? (
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        readiness.status === 'Ready for Trial'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : readiness.status === 'On Track'
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      }`}
                                    >
                                      {readiness.status}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">Pending</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePlayer(player._id);
                                    }}
                                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SESSIONS & ATTENDANCE TAB */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center space-x-2">
                      <CalendarCheck className="w-5 h-5 text-blue-400" />
                      <span>Practice Sessions & Attendance Register</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      "SESSION: 1 Open. A date and a sport..." — Record who came and who skipped practice.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewSessionModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Open New Session</span>
                  </button>
                </div>

                {/* Sessions list */}
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-12 text-center">
                      <CalendarCheck className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-60" />
                      <h3 className="text-sm font-bold text-white">No sessions recorded yet</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Open your first training session to mark players present or skipped.
                      </p>
                      <button
                        onClick={() => setShowNewSessionModal(true)}
                        className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                      >
                        Open Session 1
                      </button>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session._id}
                        className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-700/70">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                {session.sport}
                              </span>
                              <h3 className="text-sm font-bold text-white">
                                {session.sessionType} • {session.focusArea}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>Date: {session.date}</span>
                              </span>
                              <span>•</span>
                              <span>{session.academy || 'Dumka Sports Academy'}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{session.presentCount} Present</span>
                            </span>
                            {session.absentCount > 0 && (
                              <span className="flex items-center space-x-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>{session.absentCount} Skipped</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Attendance Roster inside session card */}
                        <div className="mt-4">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Attendance Roll Call:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {session.attendance?.map((rec, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded-xl flex items-center justify-between border text-xs ${
                                  rec.status === 'Present'
                                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                                    : rec.status === 'Absent'
                                    ? 'bg-red-950/20 border-red-900/40 text-red-200'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {rec.status === 'Present' ? (
                                    <UserCheck className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <UserX className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className="font-semibold">{rec.playerName}</span>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    rec.status === 'Present'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-red-500/20 text-red-300'
                                  }`}
                                >
                                  {rec.status === 'Absent' ? 'Skipped' : rec.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MATCH DESK TAB */}
            {activeTab === 'matches' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <span>Match Desk — Records & Scorer Log</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      "records a match, who scored" — Record academy fixtures and credit exact player contributions.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRecordMatchModal(true)}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record New Match</span>
                  </button>
                </div>

                {/* Match Cards */}
                <div className="space-y-4">
                  {matches.length === 0 ? (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-12 text-center">
                      <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
                      <h3 className="text-sm font-bold text-white">No matches recorded yet</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Record your academy's competitive fixtures, who played, and who scored goals/runs.
                      </p>
                      <button
                        onClick={() => setShowRecordMatchModal(true)}
                        className="mt-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                      >
                        Record First Match
                      </button>
                    </div>
                  ) : (
                    matches.map((match) => (
                      <div
                        key={match._id}
                        className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/70">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {match.sport}
                              </span>
                              <span className="text-xs text-slate-400">{match.date}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-400">{match.location}</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-base font-bold text-white">
                                Dumka Academy ({match.academyScore})
                              </span>
                              <span className="text-xs font-bold text-slate-500 uppercase">VS</span>
                              <span className="text-base font-bold text-slate-300">
                                {match.opponent} ({match.opponentScore})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                match.result === 'Won'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : match.result === 'Lost'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              Match Result: {match.result}
                            </span>
                            {match.topScorer && (
                              <div className="text-xs bg-amber-500/10 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center space-x-1">
                                <Flame className="w-3.5 h-3.5" />
                                <span>{match.topScorer}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Player Performances in Match */}
                        <div className="mt-4">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Individual Scores & Match Ratings:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {match.players
                              ?.filter((p) => p.played)
                              .map((p, i) => (
                                <div
                                  key={i}
                                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-bold text-white">{p.playerName}</div>
                                    <div className="text-[11px] text-slate-400">
                                      Rating: {p.performanceRating}/10{' '}
                                      {p.notes && `• ${p.notes}`}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-amber-400 text-sm">
                                      {p.score}{' '}
                                      <span className="text-[10px] text-slate-400 font-normal">
                                        {match.sport === 'Football'
                                          ? 'goals'
                                          : match.sport === 'Cricket'
                                          ? 'runs'
                                          : 'pts'}
                                      </span>
                                    </span>
                                    {p.assistsOrWickets > 0 && (
                                      <div className="text-[10px] text-emerald-400">
                                        +{p.assistsOrWickets}{' '}
                                        {match.sport === 'Cricket' ? 'wkts' : 'assists'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TRIAL READINESS DESK TAB */}
            {activeTab === 'readiness' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/40 to-slate-900 p-5 rounded-2xl border border-purple-500/30">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full mb-1 border border-purple-500/30">
                      <Award className="w-3.5 h-3.5" />
                      <span>District & State Scout Readiness Desk</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      Who is Ready for a Trial?
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                      Formula combines practice consistency (45%), match day scoring and coach ratings (35%), and base conditioning (20%). Players with unexcused skips are penalized automatically.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.print()}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Roster</span>
                    </button>
                  </div>
                </div>

                {/* Readiness Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readinessData.map((item) => (
                    <div
                      key={item.player._id}
                      className={`rounded-2xl p-5 border flex flex-col justify-between transition bg-slate-800/60 ${
                        item.status === 'Ready for Trial'
                          ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                          : item.status === 'On Track'
                          ? 'border-amber-500/30'
                          : 'border-red-500/30'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-white text-sm">{item.player.name}</h3>
                              <span className="text-xs text-slate-400">({item.player.age} yrs)</span>
                            </div>
                            <div className="text-xs text-emerald-400 font-medium">
                              {item.player.sport} • {item.player.position || 'Player'}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              item.status === 'Ready for Trial'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : item.status === 'On Track'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {/* Readiness Composite Score Bar */}
                        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 mb-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Readiness Score</span>
                            <span className="font-extrabold text-white text-sm">
                              {item.metrics.compositeScore} / 100
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.metrics.compositeScore >= 80
                                  ? 'bg-emerald-500'
                                  : item.metrics.compositeScore >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${item.metrics.compositeScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Breakdown Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                          <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Attendance</div>
                            <div
                              className={`font-bold ${
                                item.metrics.attendanceRate >= 80
                                  ? 'text-emerald-400'
                                  : item.metrics.attendanceRate >= 60
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {item.metrics.attendanceRate}%
                            </div>
                            <div className="text-[9px] text-slate-500">
                              {item.metrics.skippedSessions > 0
                                ? `${item.metrics.skippedSessions} skips`
                                : 'No skips'}
                            </div>
                          </div>

                          <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Scoring</div>
                            <div className="font-bold text-amber-400">{item.metrics.totalScore}</div>
                            <div className="text-[9px] text-slate-500">
                              {item.player.sport === 'Football'
                                ? 'goals'
                                : item.player.sport === 'Cricket'
                                ? 'runs'
                                : 'pts'}
                            </div>
                          </div>

                          <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Rating</div>
                            <div className="font-bold text-purple-400">
                              {item.metrics.avgRating} / 10
                            </div>
                            <div className="text-[9px] text-slate-500">coach score</div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-1 text-xs">
                          {item.recommendations.map((rec, i) => (
                            <div key={i} className="text-slate-300 flex items-start space-x-1.5">
                              <span className="text-emerald-400">•</span>
                              <span className="text-[11px] leading-tight">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Coach Action */}
                      <div className="mt-4 pt-3 border-t border-slate-700/60">
                        {item.status === 'Ready for Trial' ? (
                          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            <span className="flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Recommended for District Trials</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Requires additional practice sessions</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL: ADD PLAYER */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Add New Player</h3>
                <p className="text-xs text-slate-400">Enroll player into Dumka Sports Academy</p>
              </div>
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Player Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birsa Murmu"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="8"
                    max="35"
                    placeholder="e.g. 16"
                    value={newPlayer.age}
                    onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sport *</label>
                  <select
                    value={newPlayer.sport}
                    onChange={(e) => setNewPlayer({ ...newPlayer, sport: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Position / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Striker, Fast Bowler"
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Jersey / Bib #</label>
                  <input
                    type="text"
                    placeholder="e.g. 10"
                    value={newPlayer.jerseyNumber}
                    onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Contact / Guardian Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 00000"
                  value={newPlayer.contact}
                  onChange={(e) => setNewPlayer({ ...newPlayer, contact: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Initial Coach Notes</label>
                <textarea
                  rows="2"
                  placeholder="Strengths, pace, stamina, development goals..."
                  value={newPlayer.coachNotes}
                  onChange={(e) => setNewPlayer({ ...newPlayer, coachNotes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OPEN SESSION & ATTENDANCE */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Open Session: A date and a sport</span>
                </h3>
                <p className="text-xs text-slate-400">Mark who attended and who skipped practice</p>
              </div>
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSession} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Session Date *</label>
                  <input
                    type="date"
                    required
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sport *</label>
                  <select
                    value={newSession.sport}
                    onChange={(e) => setNewSession({ ...newSession, sport: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Session Type</label>
                  <select
                    value={newSession.sessionType}
                    onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Practice">Regular Practice</option>
                    <option value="Morning Conditioning">Morning Conditioning</option>
                    <option value="Match Prep Drills">Match Prep Drills</option>
                    <option value="Trial Selection Trial">Trial Selection Trial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Focus Area</label>
                  <input
                    type="text"
                    value={newSession.focusArea}
                    onChange={(e) => setNewSession({ ...newSession, focusArea: e.target.value })}
                    placeholder="e.g. Corner kicks & endurance"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Attendance Checklist */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-200 font-bold">
                    Mark Attendance ({newSession.attendance.length} registered {newSession.sport} players):
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNewSession((prev) => ({
                          ...prev,
                          attendance: prev.attendance.map((a) => ({ ...a, status: 'Present' })),
                        }))
                      }
                      className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20"
                    >
                      All Present
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewSession((prev) => ({
                          ...prev,
                          attendance: prev.attendance.map((a) => ({ ...a, status: 'Absent' })),
                        }))
                      }
                      className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 hover:bg-red-500/20"
                    >
                      All Skipped
                    </button>
                  </div>
                </div>

                {newSession.attendance.length === 0 ? (
                  <p className="text-slate-500 italic p-3 text-center bg-slate-800/40 rounded-xl">
                    No players registered in {newSession.sport} yet. Add players first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {newSession.attendance.map((att, idx) => (
                      <div
                        key={att.playerId}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                          att.status === 'Present'
                            ? 'bg-slate-800/70 border-emerald-500/30'
                            : 'bg-red-950/20 border-red-500/40'
                        }`}
                      >
                        <span className="font-semibold text-white">{att.playerName}</span>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...newSession.attendance];
                              updated[idx].status = 'Present';
                              setNewSession({ ...newSession, attendance: updated });
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                              att.status === 'Present'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...newSession.attendance];
                              updated[idx].status = 'Absent';
                              setNewSession({ ...newSession, attendance: updated });
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                              att.status === 'Absent'
                                ? 'bg-red-600 text-white shadow'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            ✕ Skipped
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  Save Session & Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD MATCH & SCORES */}
      {showRecordMatchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Record Match & Player Scores</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Log the fixture and attribute exact goals, runs, or points
                </p>
              </div>
              <button
                onClick={() => setShowRecordMatchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMatch} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Match Date *</label>
                  <input
                    type="date"
                    required
                    value={newMatch.date}
                    onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sport *</label>
                  <select
                    value={newMatch.sport}
                    onChange={(e) => setNewMatch({ ...newMatch, sport: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Opponent Team *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deoghar FC / Ranchi Colts"
                    value={newMatch.opponent}
                    onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Location / Ground</label>
                  <input
                    type="text"
                    value={newMatch.location}
                    onChange={(e) => setNewMatch({ ...newMatch, location: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Scoreline */}
              <div className="grid grid-cols-3 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dumka Score</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 or 185/6"
                    value={newMatch.academyScore}
                    onChange={(e) => setNewMatch({ ...newMatch, academyScore: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Opponent Score</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 or 170/9"
                    value={newMatch.opponentScore}
                    onChange={(e) => setNewMatch({ ...newMatch, opponentScore: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Result</label>
                  <select
                    value={newMatch.result}
                    onChange={(e) => setNewMatch({ ...newMatch, result: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                    <option value="Drawn">Drawn</option>
                  </select>
                </div>
              </div>

              {/* Individual Player Scorer breakdown */}
              <div>
                <label className="block text-slate-200 font-bold mb-2">
                  Player Performances & Individual Scores:
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {newMatch.players.map((p, idx) => (
                    <div
                      key={p.playerId}
                      className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={p.played}
                          onChange={(e) => {
                            const updated = [...newMatch.players];
                            updated[idx].played = e.target.checked;
                            setNewMatch({ ...newMatch, players: updated });
                          }}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                        <span className="font-semibold text-white">{p.playerName}</span>
                      </div>

                      {p.played && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400">
                              {newMatch.sport === 'Football'
                                ? 'Goals:'
                                : newMatch.sport === 'Cricket'
                                ? 'Runs:'
                                : 'Pts:'}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={p.score}
                              onChange={(e) => {
                                const updated = [...newMatch.players];
                                updated[idx].score = Number(e.target.value);
                                setNewMatch({ ...newMatch, players: updated });
                              }}
                              className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold text-center"
                            />
                          </div>

                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400">
                              {newMatch.sport === 'Cricket' ? 'Wkts:' : 'Ast:'}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={p.assistsOrWickets}
                              onChange={(e) => {
                                const updated = [...newMatch.players];
                                updated[idx].assistsOrWickets = Number(e.target.value);
                                setNewMatch({ ...newMatch, players: updated });
                              }}
                              className="w-12 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
                            />
                          </div>

                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400">Rate:</span>
                            <select
                              value={p.performanceRating}
                              onChange={(e) => {
                                const updated = [...newMatch.players];
                                updated[idx].performanceRating = Number(e.target.value);
                                setNewMatch({ ...newMatch, players: updated });
                              }}
                              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white"
                            >
                              {[10, 9, 8, 7, 6, 5, 4].map((r) => (
                                <option key={r} value={r}>
                                  {r}/10
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRecordMatchModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  Record Match & Scores
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Dumka Sports Academy Desk • MongoDB Atlas & Vercel Ready • Built for Coach in Dumka
      </footer>
    </div>
  );
}

