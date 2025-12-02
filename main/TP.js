const sidebar = document.getElementById('mySidebar');

// --- Sidebar ---
function w3_open() { if (sidebar) sidebar.style.display = 'block'; }
function w3_close() { if (sidebar) sidebar.style.display = 'none'; }


// --- Tasks Completed ---
const overallFill = document.getElementById('overallFill');
const weeklyFill = document.getElementById('weeklyFill');
const monthlyFill = document.getElementById('monthlyFill');

async function loadProgress() {
    const res = await fetch("/get-progress");
    const data = await res.json ();

    overallFill.style.width = (data.overall ?? 0) +"%";
    weeklyFill.style.width = (data.Weekly ?? 0) +"%";
    monthlyFill.style.width = (data.monthly ?? 0) +"%";
}

window.onload = loadProgress;