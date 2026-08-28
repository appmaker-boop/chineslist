document.addEventListener('DOMContentLoaded', () => {
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

    // Signup & Recovery Elements
    const openSignupModalBtn = document.getElementById('openSignupModalBtn');
    const signupModalOverlay = document.getElementById('signupModalOverlay');
    const closeSignupModalBtn = document.getElementById('closeSignupModalBtn');
    const signupStepOAuth = document.getElementById('signupStepOAuth');
    const signupStepCredentials = document.getElementById('signupStepCredentials');
    const signupStepRecovery = document.getElementById('signupStepRecovery');
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    const githubSignupBtn = document.getElementById('githubSignupBtn');
    const signupCredentialsForm = document.getElementById('signupCredentialsForm');
    const forgotUsernameLink = document.getElementById('forgotUsernameLink');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const recoveryForm = document.getElementById('recoveryForm');
    const recoveryPromptText = document.getElementById('recoveryPromptText');
    const backToOAuthBtn = document.getElementById('backToOAuthBtn');

    // Chat Elements
    const openChatBtn = document.getElementById('openChatBtn');
    const chatModalOverlay = document.getElementById('chatModalOverlay');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatBody = document.getElementById('chatBody');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatUserStatus = document.getElementById('chatUserStatus');

    const categories = ['main', 'extended', 'legacy'];
    const categoryMeta = {
        main: { name: 'Main List', desc: 'The hardest demons in Geometry Dash (Top 1 - 14).' },
        extended: { name: 'Extended List', desc: 'Extremely difficult demons forming the extended boundary (Top 15 - 50).' },
        legacy: { name: 'Legacy List', desc: 'Demon levels that were previously on the main/extended list (Top 51 - 100).' }
    };

    let currentCatIndex = 0;
    let isAdminMode = false;
    let pendingDeleteGlobalIndex = null;
    let registrationState = { selectedProvider: '', userGmail: '' };
    let recoveryType = '';

    // Check Admin parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'yes') {
        localStorage.setItem('chines_admin', 'true');
    } else if (urlParams.get('admin') === 'no') {
        localStorage.removeItem('chines_admin');
    }

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

    // Update Top Right Button State based on Login
    function updateAuthDisplay() {
        const savedUname = localStorage.getItem('chines_username');
        if (openSignupModalBtn) {
            if (savedUname) {
                openSignupModalBtn.innerHTML = `<span class="signup-icon">👋</span><span class="signup-text">Welcome back, ${escapeHtml(savedUname)}</span>`;
                openSignupModalBtn.style.cursor = "default";
                openSignupModalBtn.onclick = (e) => e.preventDefault(); // Disable signup modal trigger once logged in
            } else {
                openSignupModalBtn.innerHTML = `<span class="signup-icon">👤</span><span class="signup-text">Sign up</span>`;
                openSignupModalBtn.style.cursor = "pointer";
                openSignupModalBtn.onclick = null;
            }
        }
    }

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            isAdminMode = false;
            if (modalTitle) modalTitle.textContent = "Add Level Request";
            if (submitFormBtn) submitFormBtn.textContent = "Submit Request";
            if (positionGroup) positionGroup.style.display = 'none';
            if (modalOverlay) modalOverlay.classList.add('active');
        });
    }

    if (adminModalBtn) {
        adminModalBtn.addEventListener('click', () => {
            isAdminMode = true;
            if (modalTitle) modalTitle.textContent = "Admin: Directly Add Level";
            if (submitFormBtn) submitFormBtn.textContent = "Add Level to List";
            if (positionGroup) positionGroup.style.display = 'flex';
            if (modalOverlay) modalOverlay.classList.add('active');
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('active');
        });
    }

    // Signup Modal Open/Close & Flow
    if (openSignupModalBtn) {
        openSignupModalBtn.addEventListener('click', () => {
            if (localStorage.getItem('chines_username')) return; // Do nothing if already logged in
            if (signupStepOAuth) signupStepOAuth.classList.remove('hidden');
            if (signupStepCredentials) signupStepCredentials.classList.add('hidden');
            if (signupStepRecovery) signupStepRecovery.classList.add('hidden');
            if (signupModalOverlay) signupModalOverlay.classList.add('active');
        });
    }

    if (closeSignupModalBtn) closeSignupModalBtn.addEventListener('click', () => signupModalOverlay.classList.remove('active'));
    if (signupModalOverlay) {
        signupModalOverlay.addEventListener('click', (e) => {
            if (e.target === signupModalOverlay) signupModalOverlay.classList.remove('active');
        });
    }

    if (googleSignupBtn) googleSignupBtn.addEventListener('click', () => handleOAuthSelection('Google'));
    if (githubSignupBtn) githubSignupBtn.addEventListener('click', () => handleOAuthSelection('GitHub'));

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

        if (signupStepOAuth) signupStepOAuth.classList.add('hidden');
        if (signupStepCredentials) signupStepCredentials.classList.remove('hidden');
    }

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

    if (forgotUsernameLink) {
        forgotUsernameLink.addEventListener('click', (e) => {
            e.preventDefault();
            recoveryType = 'username';
            if (recoveryPromptText) recoveryPromptText.textContent = "What's your Gmail? We will send your username.";
            if (signupStepOAuth) signupStepOAuth.classList.add('hidden');
            if (signupStepRecovery) signupStepRecovery.classList.remove('hidden');
        });
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            recoveryType = 'password';
            if (recoveryPromptText) recoveryPromptText.textContent = "What's your Gmail? We will send your password.";
            if (signupStepOAuth) signupStepOAuth.classList.add('hidden');
            if (signupStepRecovery) signupStepRecovery.classList.remove('hidden');
        });
    }

    if (backToOAuthBtn) {
        backToOAuthBtn.addEventListener('click', () => {
            if (signupStepRecovery) signupStepRecovery.classList.add('hidden');
            if (signupStepOAuth) signupStepOAuth.classList.remove('hidden');
        });
    }

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

    // Chat UI Controls
    function updateChatStatusUI() {
        const savedUname = localStorage.getItem('chines_username');
        if (chatUserStatus) {
            chatUserStatus.textContent = savedUname ? `Connected as: ${savedUname}` : `Connected as: Guest (No Account)`;
        }
    }

    if (openChatBtn) {
        openChatBtn.addEventListener('click', () => {
            const savedUname = localStorage.getItem('chines_username');
            if (!savedUname) {
                showToast("❌ You can't use chat yet! Please sign up first.");
                return;
            }
            updateChatStatusUI();
            if (chatModalOverlay) chatModalOverlay.classList.add('active');
            if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            if (chatModalOverlay) chatModalOverlay.classList.remove('active');
        });
    }

    if (chatModalOverlay) {
        chatModalOverlay.addEventListener('click', (e) => {
            if (e.target === chatModalOverlay) chatModalOverlay.classList.remove('active');
        });
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
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

    if (prevCatBtn) prevCatBtn.addEventListener('click', () => updateCarousel(-1));
    if (nextCatBtn) nextCatBtn.addEventListener('click', () => updateCarousel(1));

    function updateCarousel(direction) {
        if (!levelsContainer) return;
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
                    pendingDeleteGlobalIndex = parseInt(e.target.getAttribute('data-global-index'));
                    if (deleteModalOverlay) deleteModalOverlay.classList.add('active');
                });
            });
        }
    }

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

            if (isAdminMode) {
                const data = getStoredLevels();
                let targetPos = parseInt(document.getElementById('levelPosition').value);

                let globalIndex = targetPos ? targetPos - 1 : 0;
                let allLevels = [...data.main, ...data.extended, ...data.legacy];
                
                if (isNaN(globalIndex) || globalIndex < 0) globalIndex = 0;
                if (globalIndex > allLevels.length) globalIndex = 
