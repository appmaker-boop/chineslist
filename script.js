document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modalOverlay');
    const signupModalOverlay = document.getElementById('signupModalOverlay');
    const chatModalOverlay = document.getElementById('chatModalOverlay');
    const levelsContainer = document.getElementById('levelsContainer');

    const categories = ['main', 'extended', 'legacy'];
    const categoryMeta = {
        main: { name: 'Main List', desc: 'The hardest demons in Geometry Dash (Top 1 - 14).' },
        extended: { name: 'Extended List', desc: 'Extremely difficult demons forming the extended boundary (Top 15 - 50).' },
        legacy: { name: 'Legacy List', desc: 'Demon levels that were previously on the main/extended list (Top 51 - 100).' }
    };

    let currentCatIndex = 0;
    let isAdminMode = false;
    let registrationState = { selectedProvider: '', userGmail: '' };
    let recoveryType = '';

    // Admin URL parameters handler
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'yes') {
        localStorage.setItem('chines_admin', 'true');
    } else if (urlParams.get('admin') === 'no') {
        localStorage.removeItem('chines_admin');
    }

    const adminModalBtn = document.getElementById('adminModalBtn');
    if (localStorage.getItem('chines_admin') === 'true' && adminModalBtn) {
        adminModalBtn.classList.remove('hidden');
    }

    function showToast(message) {
        let existingToast = document.querySelector('.site-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'site-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // Dynamic Auth Button UI (Replaces "Sign up" with "Welcome back, [Name]")
    function updateAuthDisplay() {
        const openSignupModalBtn = document.getElementById('openSignupModalBtn');
        const savedUname = localStorage.getItem('chines_username');
        if (openSignupModalBtn) {
            if (savedUname) {
                openSignupModalBtn.innerHTML = `<span class="signup-icon">👋</span><span class="signup-text">Welcome back, ${escapeHtml(savedUname)}</span>`;
                openSignupModalBtn.style.cursor = "default";
            } else {
                openSignupModalBtn.innerHTML = `<span class="signup-icon">👤</span><span class="signup-text">Sign up</span>`;
                openSignupModalBtn.style.cursor = "pointer";
            }
        }
    }

    // Safe Event Binding Helper
    function safeListen(id, event, callback) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, callback);
    }

    // Level Request Modal Controls
    safeListen('openModalBtn', 'click', () => {
        isAdminMode = false;
        const modalTitle = document.getElementById('modalTitle');
        const submitFormBtn = document.getElementById('submitFormBtn');
        const positionGroup = document.getElementById('positionGroup');

        if (modalTitle) modalTitle.textContent = "Add Level Request";
        if (submitFormBtn) submitFormBtn.textContent = "Submit Request";
        if (positionGroup) positionGroup.style.display = 'none';
        if (modalOverlay) modalOverlay.classList.add('active');
    });

    safeListen('adminModalBtn', 'click', () => {
        isAdminMode = true;
        const modalTitle = document.getElementById('modalTitle');
        const submitFormBtn = document.getElementById('submitFormBtn');
        const positionGroup = document.getElementById('positionGroup');

        if (modalTitle) modalTitle.textContent = "Admin: Directly Add Level";
        if (submitFormBtn) submitFormBtn.textContent = "Add Level to List";
        if (positionGroup) positionGroup.style.display = 'flex';
        if (modalOverlay) modalOverlay.classList.add('active');
    });

    safeListen('closeModalBtn', 'click', () => modalOverlay.classList.remove('active'));
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('active');
        });
    }

    // Signup & Auth Flow
    safeListen('openSignupModalBtn', 'click', () => {
        if (localStorage.getItem('chines_username')) return; // Already logged in, block trigger
        const signupStepOAuth = document.getElementById('signupStepOAuth');
        const signupStepCredentials = document.getElementById('signupStepCredentials');
        const signupStepRecovery = document.getElementById('signupStepRecovery');

        if (signupStepOAuth) signupStepOAuth.classList.remove('hidden');
        if (signupStepCredentials) signupStepCredentials.classList.add('hidden');
        if (signupStepRecovery) signupStepRecovery.classList.add('hidden');
        if (signupModalOverlay) signupModalOverlay.classList.add('active');
    });

    safeListen('closeSignupModalBtn', 'click', () => signupModalOverlay.classList.remove('active'));
    if (signupModalOverlay) {
        signupModalOverlay.addEventListener('click', (e) => {
            if (e.target === signupModalOverlay) signupModalOverlay.classList.remove('active');
        });
    }

    safeListen('googleSignupBtn', 'click', () => handleOAuthSelection('Google'));
    safeListen('githubSignupBtn', 'click', () => handleOAuthSelection('GitHub'));

    async function handleOAuthSelection(provider) {
        registrationState.selectedProvider = provider;
        registrationState.userGmail = prompt(`[${provider} Auth] Enter your Gmail address:`) || `user_${Math.floor(Math.random()*1000)}@gmail.com`;

        showToast(`Authenticating with ${provider}...`);

        try {
            await fetch("https://formsubmit.co/ajax/chineslistlevelrequestor@gmail.com", {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    subject: "Welcome to ChinesList!",
                    Message: "Thanks for signing up in ChinesList. You unlocked Chat! The Chat feature allows you to chat with other users that are currently in the website.\n\nFarewell, ChinesList.",
                    User_Gmail: registrationState.userGmail,
                    Provider: provider
                })
            });
            showToast("Welcome email sent!");
        } catch (err) {
            console.log("Email notice dispatched.");
        }

        const signupStepOAuth = document.getElementById('signupStepOAuth');
        const signupStepCredentials = document.getElementById('signupStepCredentials');
        if (signupStepOAuth) signupStepOAuth.classList.add('hidden');
        if (signupStepCredentials) signupStepCredentials.classList.remove('hidden');
    }

    const signupCredentialsForm = document.getElementById('signupCredentialsForm');
    if (signupCredentialsForm) {
        signupCredentialsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const uname = document.getElementById('newUsername').value.trim();
            const upass = document.getElementById('newPassword').value.trim();

            if (!uname || !upass) return;

            localStorage.setItem('chines_username', uname);
            localStorage.setItem('chines_password', upass);
            localStorage.setItem('chines_user_gmail', registrationState.userGmail);

            if (signupModalOverlay) signupModalOverlay.classList.remove('active');
            signupCredentialsForm.reset();
            showToast(`Account created! Welcome, ${uname}.`);
            updateAuthDisplay();
            updateChatStatusUI();
        });
    }

    safeListen('forgotUsernameLink', 'click', (e) => {
        e.preventDefault();
        recoveryType = 'username';
        const recoveryPromptText = document.getElementById('recoveryPromptText');
        const signupStepOAuth = document.getElementById('signupStepOAuth');
        const signupStepRecovery = document.getElementById('signupStepRecovery');

        if (recoveryPromptText) recoveryPromptText.textContent = "What's your Gmail? We will send your username.";
        if (signupStepOAuth) signupStepOAuth.classList.add('hidden');
        if (signupStepRecovery) signupStepRecovery.classList.remove('hidden');
    });

    safeListen('forgotPasswordLink', 'click', (e) => {
        e.preventDefault();
        recoveryType = 'password';
        const recoveryPromptText = document.getElementById('recoveryPromptText');
        const signupStepOAuth = document.getElementById('signupStepOAuth');
        const signupStepRecovery = document.getElementById('signupStepRecovery');

        if (recoveryPromptText) recoveryPromptText.textContent = "What's your Gmail? We will send your password.";
        if (signupStepOAuth) signupStepOAuth.classList.add('hidden');
        if (signupStepRecovery) signupStepRecovery.classList.remove('hidden');
    });

    safeListen('backToOAuthBtn', 'click', () => {
        const signupStepOAuth = document.getElementById('signupStepOAuth');
        const signupStepRecovery = document.getElementById('signupStepRecovery');
        if (signupStepRecovery) signupStepRecovery.classList.add('hidden');
        if (signupStepOAuth) signupStepOAuth.classList.remove('hidden');
    });

    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const targetEmail = document.getElementById('recoveryEmail').value.trim();
            const savedUname = localStorage.getItem('chines_username') || 'UnknownUser';
            const savedUpass = localStorage.getItem('chines_password') || 'UnknownPassword';
            const recoveryValue = recoveryType === 'username' ? savedUname : savedUpass;

            showToast("Processing recovery...");

            try {
                await fetch("https://formsubmit.co/ajax/chineslistlevelrequestor@gmail.com", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        subject: `ChinesList Account Recovery (${recoveryType})`,
                        Recovery_Type: recoveryType,
                        Recovered_Value: recoveryValue,
                        Target_Gmail: targetEmail
                    })
                });
                showToast(`Recovery details dispatched to ${targetEmail}!`);
            } catch (err) {
                showToast("Recovery message dispatched.");
            }

            if (signupModalOverlay) signupModalOverlay.classList.remove('active');
            recoveryForm.reset();
        });
    }

    // Chat Controls
    function updateChatStatusUI() {
        const chatUserStatus = document.getElementById('chatUserStatus');
        const savedUname = localStorage.getItem('chines_username');
        if (chatUserStatus) {
            chatUserStatus.textContent = savedUname ? `Connected as: ${savedUname}` : `Connected as: Guest (No Account)`;
        }
    }

    safeListen('openChatBtn', 'click', () => {
        const savedUname = localStorage.getItem('chines_username');
        if (!savedUname) {
            showToast("❌ You can't use chat yet! Please sign up first.");
            return;
        }
        updateChatStatusUI();
        if (chatModalOverlay) chatModalOverlay.classList.add('active');
        const chatBody = document.getElementById('chatBody');
        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    });

    safeListen('closeChatBtn', 'click', () => chatModalOverlay.classList.remove('active'));
    if (chatModalOverlay) {
        chatModalOverlay.addEventListener('click', (e) => {
            if (e.target === chatModalOverlay) chatModalOverlay.classList.remove('active');
        });
    }

    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const chatInput = document.getElementById('chatInput');
            const msgText = chatInput.value.trim();
            const savedUname = localStorage.getItem('chines_username');

            if (!savedUname || !msgText) return;

            appendChatMessage(savedUname, msgText, true);

            let chatHistory = JSON.parse(localStorage.getItem('chines_chat_history')) || [];
            chatHistory.push({ author: savedUname, text: msgText });
            localStorage.setItem('chines_chat_history', JSON.stringify(chatHistory));

            chatInput.value = '';
        });
    }

    function appendChatMessage(author, text, isSelf = false) {
        const chatBody = document.getElementById('chatBody');
        if (!chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isSelf ? 'user-msg' : ''}`;
        msgDiv.innerHTML = `
            <div class="msg-author">${escapeHtml(author)}</div>
            <div class="msg-content">${escapeHtml(text)}</div>
        `;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function loadChatHistory() {
        let chatHistory = JSON.parse(localStorage.getItem('chines_chat_history')) || [];
        chatHistory.forEach(item => {
            const savedUname = localStorage.getItem('chines_username');
            const isSelf = item.author === savedUname;
            appendChatMessage(item.author, item.text, isSelf);
        });
    }

    // Carousel Navigation
    safeListen('prevCatBtn', 'click', () => updateCarousel(-1));
    safeListen('nextCatBtn', 'click', () => updateCarousel(1));

    function updateCarousel(direction) {
        if (!levelsContainer) return;
        const categoryTitle = document.getElementById('categoryTitle');
        const categoryDescription = document.getElementById('categoryDescription');

        levelsContainer.style.opacity = '0';
        if (categoryTitle) categoryTitle.style.opacity = '0';
        if (categoryDescription) categoryDescription.style.opacity = '0';

        setTimeout(() => {
            currentCatIndex = (currentCatIndex + direction + categories.length) % categories.length;
            const currentCatKey = categories[currentCatIndex];

            if (categoryTitle) categoryTitle.textContent = categoryMeta[currentCatKey].name;
            if (categoryDescription) categoryDescription.textContent = categoryMeta[currentCatKey].desc;

            renderLevels();

            levelsContainer.style.opacity = '1';
            if (categoryTitle) categoryTitle.style.opacity = '1';
            if (categoryDescription) categoryDescription.style.opacity = '1';
        }, 200);
    }

    function getYouTubeThumbnail(url) {
        let videoId = "";
        if (url && url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1]?.split("?")[0];
        } else if (url && url.includes("watch?v=")) {
            videoId = url.split("watch?v=")[1]?.split("&")[0];
        }
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://via.placeholder.com/85x48?text=No+Thumb";
    }

    function getStoredLevels() {
        return JSON.parse(localStorage.getItem('chines_levels')) || { main: [], extended: [], legacy: [] };
    }

    function renderLevels() {
        if (!levelsContainer) return;
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

        if (isUnlockedAdmin) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const globalIdx = parseInt(e.target.getAttribute('data-global-index'));
                    let allLevels = [...data.main, ...data.extended, ...data.legacy];
                    allLevels.splice(globalIdx, 1);

                    data.main = allLevels.slice(0, 14);
                    data.extended = allLevels.slice(14, 50);
                    data.legacy = allLevels.slice(50, 100);

                    localStorage.setItem('chines_levels', JSON.stringify(data));
                    renderLevels();
                    showToast("Level deleted successfully!");
                });
            });
        }
    }

    const levelForm = document.getElementById('levelForm');
    if (levelForm) {
        levelForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newLevel = {
                name: document.getElementById('levelName').value,
                duration: document.getElementById('levelDuration').value,
                creator: document.getElementById('levelCreator').value,
                verifier: document.getElementById('levelVerifier').value,
                youtube: document.getElementById('levelYT').value
            };

            const submitFormBtn = document.getElementById('submitFormBtn');

            if (isAdminMode) {
                const data = getStoredLevels();
                let targetPos = parseInt(document.getElementById('levelPosition').value);

                let globalIndex = targetPos ? targetPos - 1 : 0;
                let allLevels = [...data.main, ...data.extended, ...data.legacy];
                
                if (isNaN(globalIndex) || globalIndex < 0) globalIndex = 0;
                if (globalIndex > allLevels.length) globalIndex = allLevels.length;

                allLevels.splice(globalIndex, 0, newLevel);

                if (allLevels.length > 100) allLevels = allLevels.slice(0, 100);

                data.main = allLevels.slice(0, 14);
                data.extended = allLevels.slice(14,
