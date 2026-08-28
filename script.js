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

const categories = ['main', 'extended', 'legacy'];
const categoryMeta = {
    main: { name: 'Main List', desc: 'The hardest demons in Geometry Dash (Top 1 - 14).' },
    extended: { name: 'Extended List', desc: 'Extremely difficult demons forming the extended boundary (Top 15 - 50).' },
    legacy: { name: 'Legacy List', desc: 'Demon levels that were previously on the main/extended list (Top 51 - 100).' }
};

let currentCatIndex = 0;
let isAdminMode = false;

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'yes') {
    localStorage.setItem('chines_admin', 'true');
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

// Carousel Navigation Arrows with Smooth Fade
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
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://via.placeholder.com/90x50?text=No+Thumb";
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

    // Calculate baseline rank offset based on category tier
    let rankOffset = 0;
    if (currentCatKey === 'extended') rankOffset = 14;
    if (currentCatKey === 'legacy') rankOffset = 50;

    categoryLevels.forEach((lvl, index) => {
        const actualRank = rankOffset + index + 1;
        const thumbUrl = getYouTubeThumbnail(lvl.youtube);
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = `
            <div class="level-left">
                <img src="${thumbUrl}" alt="Thumbnail" class="level-thumb">
                <div class="level-info">
                    <h3>#${actualRank} - ${escapeHtml(lvl.name)}</h3>
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
        let currentCatKey = categories[currentCatIndex];

        let globalIndex = targetPos ? targetPos - 1 : 0;
        
        // Flatten all categories to handle continuous shifting across Main -> Extended -> Legacy (up to 100)
        let allLevels = [...data.main, ...data.extended, ...data.legacy];
        
        if (isNaN(globalIndex) || globalIndex < 0) globalIndex = 0;
        if (globalIndex > allLevels.length) globalIndex = allLevels.length;

        // Insert at target global position
        allLevels.splice(globalIndex, 0, newLevel);

        // Cap legacy at max 100 items total
        if (allLevels.length > 100) {
            allLevels = allLevels.slice(0, 100);
        }

        // Redistribute strictly into tiers: Main (1-14), Extended (15-50), Legacy (51-100)
        data.main = allLevels.slice(0, 14);
        data.extended = allLevels.slice(14, 50);
        data.legacy = allLevels.slice(50, 100);

        localStorage.setItem('chines_levels', JSON.stringify(data));
        
        modalOverlay.classList.remove('active');
        levelForm.reset();
        renderLevels();
        alert(`Level successfully added to position #${globalIndex + 1}! Tiers updated.`);
    } else {
        const email = "zubykyurko@gmail.com";
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
