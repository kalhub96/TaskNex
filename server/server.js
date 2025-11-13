const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// SPA fallback: return index.html for any other GET (useful for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});