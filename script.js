const openModalBtn = document.getElementById('openModalBtn');
const adminModalBtn = document.getElementById('adminModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const levelForm = document.getElementById('levelForm');
const modalTitle = document.getElementById('modalTitle');
const submitFormBtn = document.getElementById('submitFormBtn');
const levelsContainer = document.getElementById('levelsContainer');
const positionGroup = document.getElementById('positionGroup');

const prevCatBtn = document.getElementById('prevCatBtn');
const nextCatBtn = document.getElementById('nextCatBtn');
const categoryTitle = document.getElementById('categoryTitle');
const categoryDescription = document.getElementById('categoryDescription');

const deleteModalOverlay = document.getElementById('deleteModalOverlay');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

const categories = ['main', 'extended', 'legacy'];
const categoryMeta = {
    main: { name: 'Main List', desc: 'The hardest demons in Geometry Dash (Top 1 - 14).' },
    extended: { name: 'Extended List', desc: 'Extremely difficult demons forming the extended boundary (Top 15 - 50).' },
    legacy: { name: 'Legacy List', desc: 'Demon levels that were previously on the main/extended list (Top 51 - 100).' }
};

let currentCatIndex = 0;
let isAdminMode = false;
let pendingDeleteGlobalIndex = null;

// Handle Admin URL parameters (?admin=yes or ?admin=no)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'yes') {
    localStorage.setItem('chines_admin', 'true');
} else if (urlParams.get('admin') === 'no') {
    localStorage.removeItem('chines_admin');
}

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

// Delete Modal Controls
closeDeleteModalBtn.addEventListener('click', () => {
    deleteModalOverlay.classList.remove('active');
    pendingDeleteGlobalIndex = null;
});

cancelDeleteBtn.addEventListener('click', () => {
    deleteModalOverlay.classList.remove('active');
    pendingDeleteGlobalIndex = null;
});

deleteModalOverlay.addEventListener('click', (e) => {
    if (e.target === deleteModalOverlay) {
        deleteModalOverlay.classList.remove('active');
        pendingDeleteGlobalIndex = null;
    }
});

confirmDeleteBtn.addEventListener('click', () => {
    if (pendingDeleteGlobalIndex !== null) {
        const data = getStoredLevels();
        let allLevels = [...data.main, ...data.extended, ...data.legacy];
        
        // Remove target index
        allLevels.splice(pendingDeleteGlobalIndex, 1);

        // Re-distribute tiers cleanly
        data.main = allLevels.slice(0, 14);
        data.extended = allLevels.slice(14, 50);
        data.legacy = allLevels.slice(50, 100);

        localStorage.setItem('chines_levels', JSON.stringify(data));
        deleteModalOverlay.classList.remove('active');
        pendingDeleteGlobalIndex = null;
        renderLevels();
    }
});

function updateCarousel(direction) {
    levelsContainer.style.opacity = '0';
    categoryTitle.style.opacity = '0';
    categoryDescription.style.opacity = '0';

    setTimeout(() => {
        currentCatIndex = (currentCatIndex + direction + categories.length) % categories.length;
        const currentCatKey = categories[currentCatIndex];

        categoryTitle.textContent = categoryMeta[currentCatKey].name;
        categoryDescription.textContent = categoryMeta[currentCatKey].desc;

        renderLevels();

        levelsContainer.style.opacity = '1';
        categoryTitle.style.opacity = '1';
        categoryDescription.style.opacity = '1';
    }, 200);
}

prevCatBtn.addEventListener('click', () => updateCarousel(-1));
nextCatBtn.addEventListener('click', () => updateCarousel(1));

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
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://via.placeholder.com/85x48?text=No+Thumb";
}

function getStoredLevels() {
    return JSON.parse(localStorage.getItem('chines_levels')) || { main: [], extended: [], legacy: [] };
}

function renderLevels() {
    const data = getStoredLevels();
    const currentCatKey = categories[currentCatIndex];
    const categoryLevels = data[currentCatKey] || [];

    levelsContainer.innerHTML = '';

    if (categoryLevels.length === 0) {
        levelsContainer.innerHTML = `<div class="no-levels">No levels in this category yet.</div>`;
        return;
    }

    let rankOffset = 0;
    if (currentCatKey === 'extended') rankOffset = 14;
    if (currentCatKey === 'legacy') rankOffset = 50;

    const isUnlockedAdmin = localStorage.getItem('chines_admin') === 'true';

    categoryLevels.forEach((lvl, index) => {
        const actualRank = rankOffset + index + 1;
        const globalIndex = rankOffset + index;
        const thumbUrl = getYouTubeThumbnail(lvl.youtube);
        
        const card = document.createElement('div');
        card.className = 'level-card';

        // Build action buttons layout (shows Delete button next to Watch Proof if admin is unlocked)
        let actionsHTML = `<a href="${escapeHtml(lvl.youtube)}" target="_blank" class="yt-link">Watch Proof</a>`;
        if (isUnlockedAdmin) {
            actionsHTML = `
                <button class="delete-btn" data-global-index="${globalIndex}">Delete from list</button>
                <a href="${escapeHtml(lvl.youtube)}" target="_blank" class="yt-link">Watch Proof</a>
            `;
        }

        card.innerHTML = `
            <div class="level-left">
                <img src="${thumbUrl}" alt="Thumbnail" class="level-thumb">
                <div class="level-info">
                    <h3>#${actualRank} - ${escapeHtml(lvl.name)}</h3>
                    <p>Creator: <strong>${escapeHtml(lvl.creator)}</strong> | Verifier: <strong>${escapeHtml(lvl.verifier)}</strong> | Duration: ${escapeHtml(lvl.duration)}</p>
                </div>
            </div>
            <div class="level-actions">
                ${actionsHTML}
            </div>
        `;
        levelsContainer.appendChild(card);
    });

    // Attach click listeners to all dynamically created delete buttons
    if (isUnlockedAdmin) {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                pendingDeleteGlobalIndex = parseInt(e.target.getAttribute('data-global-index'));
                deleteModalOverlay.classList.add('active');
            });
        });
    }
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

        let globalIndex = targetPos ? targetPos - 1 : 0;
        let allLevels = [...data.main, ...data.extended, ...data.legacy];
        
        if (isNaN(globalIndex) || globalIndex < 0) globalIndex = 0;
        if (globalIndex > allLevels.length) globalIndex = allLevels.length;

        allLevels.splice(globalIndex, 0, newLevel);

        if (allLevels.length > 100) {
            allLevels = allLevels.slice(0, 100);
        }

        data.main = allLevels.slice(0, 14);
        data.extended = allLevels.slice(14, 50);
        data.legacy = allLevels.slice(50, 100);

        localStorage.setItem('chines_levels', JSON.stringify(data));
        
        modalOverlay.classList.remove('active');
        levelForm.reset();
        renderLevels();
        alert(`Level successfully added to position #${globalIndex + 1}!`);
    } else {
        const email = "chineslistlevelrequestor@gmail.com";
        const subject = encodeURIComponent("New level request!");
        const body = encodeURIComponent(
            `Level Name: ${newLevel.name}\n` +
            `Duration: ${newLevel.duration}\n` +
            `Creator: ${newLevel.creator}\n` +
            `Verifier: ${newLevel.verifier}\n` +
            `YouTube Link: ${newLevel.youtube}\n` +
            `Category: ${categories[currentCatIndex]}`
        );

        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
});

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

renderLevels();
