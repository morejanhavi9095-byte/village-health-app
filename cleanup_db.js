const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.all("SELECT id, health_issues FROM patients", (err, rows) => {
    if (err) {
        console.error("Error reading database:", err);
        return;
    }

    rows.forEach(row => {
        let issues = row.health_issues;
        try {
            // Check if it's double-encoded or stored incorrectly
            let parsed = JSON.parse(issues);
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            
            // Re-save it in the correct JSON format
            let corrected = JSON.stringify(parsed);
            db.run("UPDATE patients SET health_issues = ? WHERE id = ?", [corrected, row.id]);
            console.log(`Corrected patient ID: ${row.id}`);
        } catch (e) {
            console.log(`Patient ID ${row.id} already seems correct or unparseable.`);
        }
    });
    console.log("Database cleanup finished.");
});
