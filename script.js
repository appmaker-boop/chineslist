emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

const openModalBtn = document.getElementById('openModalBtn');
const adminModalBtn = document.getElementById('adminModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const levelForm = document.getElementById('levelForm');
const modalTitle = document.getElementById('modalTitle');
const submitFormBtn = document.getElementById('submitFormBtn');
const levelsContainer = document.getElementById('levelsContainer');
const catButtons = document.querySelectorAll('.cat-btn');

let currentCategory = 'main';
let isAdminMode = false;

if (localStorage.getItem('chines_admin') === 'true') {
    adminModalBtn.classList.remove('hidden');
}

openModalBtn.addEventListener('click', () => {
    isAdminMode = false;
    modalTitle.textContent = "Add Level Request";
    submitFormBtn.textContent = "Submit Request";
    modalOverlay.classList.add('active');
});

adminModalBtn.addEventListener('click', () => {
    isAdminMode = true;
    modalTitle.textContent = "Admin: Directly Add Level";
    submitFormBtn.textContent = "Add Level to List";
    modalOverlay.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        renderLevels();
    });
});

document.querySelectorAll('.apply-field-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = e.target.previousElementSibling;
        if(input.value.trim() !== "") {
            input.style.borderColor = "#00ff00";
            btn.textContent = "Applied ✓";
            setTimeout(() => btn.textContent = "Apply", 2000);
        } else {
            input.style.borderColor = "#ff0000";
        }
    });
});

function getStoredLevels() {
    return JSON.parse(localStorage.getItem('chines_levels')) || { main: [], extended: [], legacy: [] };
}

function renderLevels() {
    const data = getStoredLevels();
    const categoryLevels = data[currentCategory] || [];

    levelsContainer.innerHTML = '';

    if (categoryLevels.length === 0) {
        levelsContainer.innerHTML = `<div class="no-levels">No levels in this category yet.</div>`;
        return;
    }

    categoryLevels.forEach((lvl, index) => {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = `
            <div class="level-info">
                <h3>#${index + 1} - ${escapeHtml(lvl.name)}</h3>
                <p>Creator: <strong>${escapeHtml(lvl.creator)}</strong> | Verifier: <strong>${escapeHtml(lvl.verifier)}</strong> | Duration: ${escapeHtml(lvl.duration)}</p>
            </div>
            <a href="${escapeHtml(lvl.youtube)}" target="_blank" class="yt-link">Watch Proof</a>
        `;
        levelsContainer.appendChild(card);
    });
}

levelForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newLevel = {
        name: document.getElementById('levelName').value,
        duration: document.getElementById('levelDuration').value,
        creator: document.getElementById('levelCreator').value,
        verifier: document.getElementById('levelVerifier').value,
        youtube: document.getElementById('levelYT').value
    };

    if (isAdminMode) {
        const data = getStoredLevels();
        data[currentCategory].push(newLevel);
        localStorage.setItem('chines_levels', JSON.stringify(data));
        
        modalOverlay.classList.remove('active');
        levelForm.reset();
        renderLevels();
        alert("Level successfully added to the list!");
    } else {
        const emailParams = {
            to_email: "zubykyurko@gmail.com",
            level_name: newLevel.name,
            duration: newLevel.duration,
            creator: newLevel.creator,
            verifier: newLevel.verifier,
            youtube: newLevel.youtube,
            category: currentCategory
        };

        submitFormBtn.textContent = "Sending...";
        
        emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", emailParams)
            .then(() => {
                alert("Level request sent successfully to zubykyurko@gmail.com!");
                modalOverlay.classList.remove('active');
                levelForm.reset();
                submitFormBtn.textContent = "Submit Request";
            }, (error) => {
                alert("Failed to send request. Check EmailJS configuration.");
                console.error(error);
                submitFormBtn.textContent = "Submit Request";
            });
    }
});

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

renderLevels();
