const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const LEADERBOARD_FILE = path.join(root, 'leaderboard.json');

// --- CLI FLAG: --export-leaderboard out.json ---
const args = process.argv.slice(2);
const exportIdx = args.indexOf('--export-leaderboard');
if (exportIdx >= 0 && exportIdx + 1 < args.length) {
  const outFile = path.resolve(process.cwd(), args[exportIdx + 1]);
  let data = { entries: [] };
  if (fs.existsSync(LEADERBOARD_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
    } catch (e) {}
  }
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + '\n');
  console.log(`[LEADERBOARD] Exported to ${outFile}`);
  process.exit(0);
}

// Load or initialize leaderboard
function getLeaderboard() {
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    const initial = {
      entries: [
        { name: "May_Hero", score: 650, nights_won: 3, achieved_at: new Date(Date.now() - 3600000).toISOString(), seed: 42 },
        { name: "Lien_Hoa", score: 580, nights_won: 3, achieved_at: new Date(Date.now() - 7200000).toISOString(), seed: 7 },
        { name: "Doan_Vien", score: 490, nights_won: 2, achieved_at: new Date(Date.now() - 10800000).toISOString(), seed: 15 },
        { name: "Anh_Trang", score: 420, nights_won: 2, achieved_at: new Date(Date.now() - 14400000).toISOString(), seed: 21 },
        { name: "Bao_Ve", score: 380, nights_won: 1, achieved_at: new Date(Date.now() - 18000000).toISOString(), seed: 3 }
      ]
    };
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
  } catch (e) {
    return { entries: [] };
  }
}

function saveLeaderboardEntry(entry) {
  const data = getLeaderboard();
  data.entries.push(entry);
  // Sort descending by score, earlier timestamp on tie
  data.entries.sort((a, b) => b.score - a.score || new Date(a.achieved_at) - new Date(b.achieved_at));
  // Keep top 10
  data.entries = data.entries.slice(0, 10);
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
  return data;
}

// HTTP Server
http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // API Endpoints
  if (url === '/api/leaderboard') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(getLeaderboard()));
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const entry = JSON.parse(body);
          if (!entry.name || typeof entry.score !== 'number') {
            res.writeHead(400);
            return res.end('Invalid entry');
          }
          const updated = saveLeaderboardEntry({
            name: String(entry.name).slice(0, 12),
            score: entry.score,
            nights_won: entry.nights_won || 0,
            achieved_at: new Date().toISOString(),
            seed: entry.seed || 42
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(updated));
        } catch (e) {
          res.writeHead(400);
          return res.end('Bad JSON');
        }
      });
      return;
    }
  }

  // Static File Server
  let f = path.join(root, url === '/' ? 'index.html' : url);
  if (!f.startsWith(root) || !fs.existsSync(f)) {
    res.writeHead(404);
    return res.end('Not found');
  }

  const ext = path.extname(f);
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.mp4': 'video/mp4'
  };
  res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
  fs.createReadStream(f).pipe(res);
}).listen(8080, () => console.log('Open http://localhost:8080'));
