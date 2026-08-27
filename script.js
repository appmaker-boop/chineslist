const openModalBtn = document.getElementById('openModalBtn');
const adminModalBtn = document.getElementById('adminModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const levelForm = document.getElementById('levelForm');
const modalTitle = document.getElementById('modalTitle');
const submitFormBtn = document.getElementById('submitFormBtn');
const levelsContainer = document.getElementById('levelsContainer');
const catButtons = document.querySelectorAll('.cat-btn');
const positionGroup = document.getElementById('positionGroup');

let currentCategory = 'main';
let isAdminMode = false;

// Check URL for admin=yes and save it permanently on this browser
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'yes') {
    localStorage.setItem('chines_admin', 'true');
}

// If saved, show the rainbow admin button
if (localStorage.getItem('chines_admin') === 'true') {
    adminModalBtn.classList.remove('hidden');
}

openModalBtn.addEventListener('click', () => {
    isAdminMode = false;
    modalTitle.textContent = "Add Level Request";
    submitFormBtn.textContent = "Submit Request";
    positionGroup.style.display = 'none';
    modalOverlay.classList.add('active');
});

adminModalBtn.addEventListener('click', () => {
    isAdminMode = true;
    modalTitle.textContent = "Admin: Directly Add Level";
    submitFormBtn.textContent = "Add Level to List";
    positionGroup.style.display = 'flex';
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

function getYouTubeThumbnail(url) {
    let videoId = "";
    if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("watch?v=")) {
        videoId = url.split("watch?v=")[1]?.split("&")[0];
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://via.placeholder.com/90x50?text=No+Thumb";
}

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
        const thumbUrl = getYouTubeThumbnail(lvl.youtube);
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = `
            <div class="level-left">
                <img src="${thumbUrl}" alt="Thumbnail" class="level-thumb">
                <div class="level-info">
                    <h3>#${index + 1} - ${escapeHtml(lvl.name)}</h3>
                    <p>Creator: <strong>${escapeHtml(lvl.creator)}</strong> | Verifier: <strong>${escapeHtml(lvl.verifier)}</strong> | Duration: ${escapeHtml(lvl.duration)}</p>
                </div>
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
        let targetPos = parseInt(document.getElementById('levelPosition').value);

        if (!targetPos || targetPos < 1) {
            targetPos = data[currentCategory].length + 1;
        }
        
        let index = targetPos - 1;
        if (index > data[currentCategory].length) {
            index = data[currentCategory].length;
        }

        data[currentCategory].splice(index, 0, newLevel);
        localStorage.setItem('chines_levels', JSON.stringify(data));
        
        modalOverlay.classList.remove('active');
        levelForm.reset();
        renderLevels();
        alert(`Level successfully added to Top ${targetPos}!`);
    } else {
        const email = "zubykyurko@gmail.com";
        const subject = encodeURIComponent("New level request!");
        const body = encodeURIComponent(
            `Level Name: ${newLevel.name}\n` +
            `Duration: ${newLevel.duration}\n` +
            `Creator: ${newLevel.creator}\n` +
            `Verifier: ${newLevel.verifier}\n` +
            `YouTube Link: ${newLevel.youtube}\n` +
            `Category: ${currentCategory}`
        );

        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
});

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

renderLevels();
