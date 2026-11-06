# Dumka Sports Academy — Coach's Desk

> A sports academy management system built for the coach in Dumka, Jharkhand. Replaces the paper notebook with a digital desk to keep players, mark session attendance, record match scores, and identify players ready for trials.

---

## 🎯 Problem Statement Addressed

> *"A coach in Dumka runs one sports academy. Players come for practice and for matches. The coach cannot say who skipped practice, who scored, or who is ready for a trial. The record is a notebook.*  
> *Build the desk that keeps the players, marks who came, records a match, and shows who is ready."*

---

## 🚀 Key Features

### 1. 👥 Player Management ("keeps the players")
- Add players with **Name**, **Age**, and **Sport** (*Football, Cricket, Athletics, Badminton, Kabaddi, Archery*).
- Single academy scope (*Dumka Sports Academy*).
- Track jersey number, playing role/position, guardian contact, and initial fitness/coach notes.
- Quick search and filtering by sport.

### 2. 📅 Session & Attendance Register ("marks who came", "who skipped practice")
- **SESSION: 1 Open a date and a sport.**
- Interactive roll-call for registered players of that sport.
- 1-click **All Present** or **All Skipped** buttons, plus individual toggle controls.
- Automatic detection of players who skipped practice.

### 3. 🏆 Match Desk ("records a match", "who scored")
- Log fixtures against opponent academies (e.g., *Deoghar FC*, *Ranchi Colts*).
- Enter team scoreline and match result (*Won*, *Lost*, *Drawn*).
- Record player-specific performance:
  - **Football:** Goals scored, assists, coach rating.
  - **Cricket:** Runs scored, wickets taken, coach rating.
  - **Other Sports:** Points and MVP ratings.
- Automatic identification and highlighting of the match's top scorer.

### 4. 🏅 Trial Readiness Desk ("shows who is ready")
- Solves the coach's core dilemma: *"Who is ready for a trial?"*
- Composite Trial Readiness Score (0–100) computed from:
  - **45% Practice Consistency & Attendance Rate** (penalizes frequent skips)
  - **35% Match Scoring & Coach Ratings**
  - **20% Conditioning & Fitness Rating**
- Clear status badges:
  - 🟢 **Ready for Trial** (High attendance + strong match contributions + scout recommended)
  - 🟡 **On Track** (Steady progress, developing)
  - 🔴 **Needs Practice** (Critically low attendance or skipped sessions)
- Exportable / printable nomination list for district and state trials.

---

## 🛠️ Prerequisites & Tech Stack

- **Node.js**: v18+ (tested on Node v26)
- **Framework**: Next.js (App Router), React, Tailwind CSS
- **Database**: MongoDB Atlas via Mongoose (with seamless local JSON fallback if `MONGODB_URI` is not yet configured)
- **Icons**: Lucide React
- **Deployment**: Free Vercel account

---

## 💻 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional - MongoDB Atlas)
The app runs out-of-the-box using local storage. To connect your free MongoDB Atlas database:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Paste your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/dumka_tracker?retryWrites=true&w=majority
   ```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ☁️ Deploying to Vercel

1. Push this repository to your **GitHub** account:
   ```bash
   git init
   git add .
   git commit -m "feat: coach desk implementation for Dumka Sports Academy"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Open [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Add the Environment Variable `MONGODB_URI` with your MongoDB Atlas connection string.
5. Click **Deploy**!

