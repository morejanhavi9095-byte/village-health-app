let adminPassword = null;

function showSection(sectionId) {
    if (sectionId === 'patients') {
        if (!adminPassword) {
            const pwd = prompt("Enter Admin Password / अ‍ॅडमिन पासवर्ड टाका:");
            if (pwd === "admin123") {
                adminPassword = pwd;
            } else {
                alert("Incorrect Password / चुकीचा पासवर्ड");
                return;
            }
        }
        loadPatients();
    }

    document.querySelectorAll('section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

async function searchDisease() {
    const query = document.getElementById('disease-search').value.trim();
    if (!query) return;

    try {
        const response = await fetch(`/api/diseases/${query}`);
        const data = await response.json();

        const detailsDiv = document.getElementById('disease-details');
        const titleH2 = document.getElementById('disease-title');

        if (data) {
            titleH2.textContent = `${data.name_en} / ${data.name_mr}`;
            detailsDiv.innerHTML = `
                <p><strong>Symptoms / लक्षणे:</strong> ${data.symptoms}</p>
                <p><strong>Precautions / सावधगिरी:</strong> ${data.precautions}</p>
                <p><strong>Care / काळजी:</strong> ${data.care}</p>
            `;
            showSection('precautions');
        } else {
            alert('Disease not found. Try searching Fever, Cold, Cough, or Diabetes.');
        }
    } catch (err) {
        console.error(err);
    }
}

const healthForm = document.getElementById('health-form');
healthForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('form-msg');
    msgDiv.textContent = "Submitting...";

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('age', document.getElementById('age').value);
    formData.append('weight', document.getElementById('weight').value);
    formData.append('photo', document.getElementById('photo').files[0]);

    const healthIssues = [];
    document.querySelectorAll('input[name="healthIssues"]:checked').forEach(cb => {
        healthIssues.push(cb.value);
    });
    formData.append('healthIssues', JSON.stringify(healthIssues));

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get("content-type");
        let result;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. Check terminal for errors.`);
        }

        if (!response.ok) {
            throw new Error(result.error || `Server error: ${response.statusText}`);
        }

        msgDiv.textContent = result.message;
        if (result.status === 'success') {
            msgDiv.style.color = 'green';
            healthForm.reset();
        } else {
            msgDiv.style.color = 'red';
        }
    } catch (err) {
        msgDiv.textContent = `Error / त्रुटी: ${err.message}`;
        msgDiv.style.color = 'red';
        console.error(err);
    }
});

async function loadPatients() {
    const listDiv = document.getElementById('patients-list');
    listDiv.innerHTML = "Loading...";

    try {
        const response = await fetch('/api/patients', {
            headers: { 'x-admin-password': adminPassword }
        });
        
        if (response.status === 401) {
            adminPassword = null;
            alert("Session expired or incorrect password.");
            return;
        }

        const patients = await response.json();
        listDiv.innerHTML = '';
        if (patients.length === 0) {
            listDiv.innerHTML = '<p>No patients found.</p>';
            return;
        }

        patients.forEach(p => {
            let issues = p.health_issues;
            try {
                let parsed = JSON.parse(issues);
                if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                issues = Array.isArray(parsed) ? parsed.join(', ') : issues;
            } catch (e) { console.warn(e); }

            const card = document.createElement('div');
            card.className = 'patient-card';
            card.innerHTML = `
                <img src="${p.photo_path || 'https://via.placeholder.com/150'}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p><strong>Age:</strong> ${p.age}</p>
                <p><strong>Weight:</strong> ${p.weight} kg</p>
                <p><strong>Issues:</strong> ${issues}</p>
                <button class="delete-btn" onclick="deletePatient(${p.id})">Delete / हटवा</button>
            `;
            listDiv.appendChild(card);
        });
    } catch (err) {
        listDiv.innerHTML = "Error loading data.";
        console.error(err);
    }
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient / आपण खात्रीने हे हटवू इच्छिता?')) return;

    try {
        const response = await fetch(`/api/patients/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-password': adminPassword }
        });
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            loadPatients(); 
        } else {
            alert(`Error / त्रुटी: ${result.error || 'Could not delete patient.'}`);
        }
    } catch (err) {
        alert('Connection error.');
        console.error(err);
    }
}
