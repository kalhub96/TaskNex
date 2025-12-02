const express = require('express');
const fs = require('fs');
const app = require();
app.use(express.json());

// save progress (POST)
app.post('/save-progress',(req, res) => {
    const progress = req.body;

    fs.writeFileSync('progress.json', JSON.stringify(progress, null, 2));

    res.json({ Message: 'progress saved'});
});

//Get progress (GET)

app.get('/get-progress', (req, res) => {
    if (!fs.existsSync('progress.json')){
        return res.json({progress: 0 });
    }

    const data =
    JSON.parse(fs,fs.readFileSync('progress.json'));
    res.json(data);
});

app.listen(3000,() => console.log('server runing on port 3000'));