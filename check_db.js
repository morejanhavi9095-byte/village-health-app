const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
    if (err) {
        console.error("Error fetching tables:", err);
    } else {
        console.log("Tables:", tables);
    }

    db.all("PRAGMA table_info(patients);", (err, info) => {
        if (err) {
            console.error("Error fetching schema:", err);
        } else {
            console.log("Patients Schema:", info);
        }

        db.all("SELECT * FROM patients;", (err, rows) => {
            if (err) {
                console.error("Error fetching patients:", err);
            } else {
                console.log("Patients data:", rows);
            }
            db.close();
        });
    });
});
