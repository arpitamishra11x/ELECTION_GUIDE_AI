// === Global App State ===
window.appState = {
    userType: 'first-time',
    userProfile: {
        age: 0,
        hasVoterID: false,
        votedBefore: false,
        isEligible: 'pending',
        hasDocs: false,
        simCompleted: false
    },
    nearestBooth: null,
    progress: 0,
    totalSteps: 11,
    currentStep: 1,
    unlockedStep: 1,
    language: localStorage.getItem('electionGuideLang') || 'en'
};

// === Translation Content ===
window.translations = {
    en: {
        choose_lang: "Choose Language",
        nav_home: "Home",
        nav_guide: "Guide",
        nav_eligibility: "Eligibility",
        nav_timeline: "Timeline",
        nav_locate: "Locate Booth",
        nav_interact: "Interact",
        nav_quiz: "Quiz",
        nav_chat: "START CHATTING",
        hero_pill: "🗳️ 2026 Elections",
        hero_title: "Start Your Voting Journey",
        hero_desc: "Empowering every citizen with the knowledge to make their vote count. Select your profile below to begin your personalized guidance.",
        hero_start: "Start Your Journey →",
        hero_how: "How it works",
        dashboard_title: "Your Election Journey 🗺️",
        dashboard_desc: "Track your progress and complete all phases to become a prepared voter.",
        phase_register: "Register",
        phase_verify: "Verify",
        phase_prepare: "Prepare",
        phase_vote: "Vote",
        phase_current: "Active ▶️",
        phase_locked: "Locked 🔒",
        phase_completed: "Completed ✅",
        cta_continue: "Continue Your Journey →",
        cta_quiz: "Take the Final Quiz →",
        cta_explore: "Continue Exploring →",
        rec_next: "Next Step",
        rec_goal: "Goal Reached",
        restart: "Restart Journey ↺"
    },
    hi: {
        choose_lang: "भाषा चुनें",
        nav_home: "होम",
        nav_guide: "गाइड",
        nav_eligibility: "पात्रता",
        nav_timeline: "समयरेखा",
        nav_locate: "बूथ खोजें",
        nav_interact: "संवाद",
        nav_quiz: "प्रश्नोत्तरी",
        nav_chat: "चैट शुरू करें",
        hero_pill: "🗳️ 2026 चुनाव",
        hero_title: "अपनी मतदान यात्रा शुरू करें",
        hero_desc: "प्रत्येक नागरिक को अपने वोट के महत्व को समझाने के लिए सशक्त बनाना। अपने लिए व्यक्तिगत मार्गदर्शन शुरू करने के लिए नीचे अपनी प्रोफाइल चुनें।",
        hero_start: "अपनी यात्रा शुरू करें →",
        hero_how: "यह कैसे काम करता है",
        dashboard_title: "आपकी चुनावी यात्रा 🗺️",
        dashboard_desc: "तैयार मतदाता बनने के लिए अपनी प्रगति को ट्रैक करें और सभी चरणों को पूरा करें।",
        phase_register: "पंजीकरण",
        phase_verify: "सत्यापित करें",
        phase_prepare: "तैयारी",
        phase_vote: "मतदान",
        phase_current: "सक्रिय ▶️",
        phase_locked: "लॉक किया गया 🔒",
        phase_completed: "पूरा हुआ ✅",
        cta_continue: "अपनी यात्रा जारी रखें →",
        cta_quiz: "अंतिम प्रश्नोत्तरी लें →",
        cta_explore: "खोज जारी रखें →",
        rec_next: "अगला कदम",
        rec_goal: "लक्ष्य प्राप्त हुआ",
        restart: "यात्रा पुनः प्रारंभ करें ↺"
    }
};

window.toggleLanguage = function() {
    window.appState.language = window.appState.language === 'en' ? 'hi' : 'en';
    localStorage.setItem('electionGuideLang', window.appState.language);
    window.updateUI();
    window.saveState();
};

window.updateUI = function() {
    const lang = window.appState.language;
    document.documentElement.lang = lang;
    
    // Update Toggle Switch UI
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.classList.contains(lang));
    });

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (window.translations[lang][key]) {
            el.classList.add('lang-fade');
            el.innerText = window.translations[lang][key];
            setTimeout(() => el.classList.remove('lang-fade'), 400);
        }
    });

    // Specific logic for steps and dashboard
    if (window.updateDashboardProgress) window.updateDashboardProgress();
};

// === Persistence Logic ===
window.saveState = function() {
    localStorage.setItem('electionGuideState', JSON.stringify(window.appState));
};

window.loadState = function() {
    const saved = localStorage.getItem('electionGuideState');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(window.appState, parsed);
        return true;
    }
    return false;
};

// === App Navigation ===
window.goToStep = function(stepNumber) {
    const currentStepEl = document.querySelector('.step-container.active');
    if (currentStepEl) currentStepEl.classList.remove('active');
    
    window.appState.currentStep = stepNumber;
    if (stepNumber > window.appState.unlockedStep) window.appState.unlockedStep = stepNumber;
    
    window.appState.progress = (window.appState.currentStep / window.appState.totalSteps) * 100;
    
    const nextStepEl = document.querySelector(`.step-container[data-step="${stepNumber}"]`);
    if (nextStepEl) {
        nextStepEl.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (window.updateJourneyIndicator) window.updateJourneyIndicator(stepNumber);
    if (window.updateNavbar) window.updateNavbar(stepNumber);
    if (window.updateDashboardProgress) window.updateDashboardProgress();

    // Call step-specific renders
    if (stepNumber === 7 && window.renderPersonalizedTimeline) window.renderPersonalizedTimeline();
    if (stepNumber === 10 && window.initQuiz) window.initQuiz();
    if (stepNumber === 4 && window.resetRegStep) window.resetRegStep();
    
    window.saveState();
};

window.nextStep = () => window.goToStep(window.appState.currentStep + 1);
window.prevStep = () => window.goToStep(window.appState.currentStep - 1);

window.updateJourneyIndicator = function(stepId) {
    const journeySteps = document.querySelectorAll('.journey-step');
    const mapping = { 4: 'guide', 5: 'eligibility', 7: 'timeline', 8: 'polling-booth', 9: 'simulator', 10: 'quiz' };
    const current = mapping[stepId.toString()];
    journeySteps.forEach(link => link.classList.toggle('active', link.getAttribute('data-step') === current));
};

window.updateNavbar = function(stepNumber) {
    const navLinks = document.querySelectorAll('.nav-link');
    const mapping = { 1: 'home', 4: 'guide', 5: 'eligibility', 7: 'timeline', 8: 'polling-booth', 9: 'simulator', 10: 'quiz' };
    const current = mapping[stepNumber];
    if (current) {
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('data-section') === current));
    }
};

window.updateDashboardProgress = function() {
    const totalSteps = 11;
    const unlockedStep = window.appState.unlockedStep;
    const currentStep = window.appState.currentStep;
    const userType = window.appState.userType;
    
    // Calculate and update overall progress
    const percentage = Math.min(100, Math.round(((unlockedStep - 1) / totalSteps) * 100));
    const progressText = document.getElementById('overallProgressText');
    const progressBar = document.getElementById('overallProgressBar');
    if (progressText) progressText.innerText = `${percentage}%`;
    if (progressBar) progressBar.style.width = `${percentage}%`;
    
    // Define Phases
    const phases = [
        { id: 'phase-register', step: 4, name: 'Register', desc: 'Registration flow' },
        { id: 'phase-verify', step: 5, name: 'Verify', desc: 'Eligibility check' },
        { id: 'phase-prepare', step: 7, name: 'Prepare', desc: 'Timeline & Documents' },
        { id: 'phase-vote', step: 9, name: 'Vote', desc: 'Voting Simulator' }
    ];
    
    let nextStepToRecommend = 4;
    let foundNext = false;

    phases.forEach(phase => {
        const el = document.getElementById(phase.id);
        if (!el) return;
        
        const statusEl = el.querySelector('.phase-status');
        const labelEl = el.querySelector('.phase-label');
        el.classList.remove('active', 'locked', 'completed');
        
        // Translate Label
        if (labelEl) {
            const labelKey = `phase_${phase.id.replace('phase-', '')}`;
            labelEl.innerText = window.translations[lang][labelKey] || phase.name;
        }
        
        // Logical State Determination
        let state = 'locked';
        
        if (userType === 'exploring' || userType === 'experienced') {
            // Free navigation or experienced
            if (unlockedStep >= phase.step) state = 'completed';
            if (currentStep === phase.step) state = 'active';
            if (state === 'locked' && unlockedStep < phase.step) state = 'unlocked'; // but we use completed visual
            // In these modes, nothing is really "locked"
            el.classList.remove('locked');
            if (currentStep === phase.step) el.classList.add('active');
            else if (unlockedStep >= phase.step) el.classList.add('completed');
        } else {
            // Sequential for first-time
            if (unlockedStep > phase.step) {
                state = 'completed';
                el.classList.add('completed');
            } else if (unlockedStep === phase.step || (unlockedStep >= 3 && phase.step === 4)) {
                state = 'active';
                el.classList.add('active');
                if (!foundNext) { nextStepToRecommend = phase.step; foundNext = true; }
            } else {
                state = 'locked';
                el.classList.add('locked');
            }
        }

        // Update status text with translations
        if (statusEl) {
            if (el.classList.contains('active')) statusEl.innerText = window.translations[lang].phase_current;
            else if (el.classList.contains('completed')) statusEl.innerText = window.translations[lang].phase_completed;
            else statusEl.innerText = window.translations[lang].phase_locked;
        }
    });

    // Handle Dynamic CTA Button
    const ctaBtn = document.getElementById('journeyCTA');
    const recText = document.getElementById('recommendationText');
    const quizBtn = document.getElementById('goToQuizBtn');

    if (ctaBtn) {
        if (unlockedStep >= 10) {
            ctaBtn.innerText = window.translations[lang].cta_quiz;
            if (recText) recText.innerText = `${window.translations[lang].rec_goal}: ${window.translations[lang].nav_quiz}`;
        } else if (userType === 'exploring') {
            ctaBtn.innerText = window.translations[lang].cta_explore;
            if (recText) recText.innerText = `${window.translations[lang].rec_next}: ${window.translations[lang].nav_guide}`;
        } else {
            ctaBtn.innerText = window.translations[lang].cta_continue;
            const nextPhase = phases.find(p => p.step >= unlockedStep) || phases[0];
            if (recText) recText.innerText = `${window.translations[lang].rec_next}: ${window.translations[lang][`phase_${nextPhase.id.replace('phase-', '')}`]}`;
        }
    }

    // Secondary Quiz Button
    if (quizBtn) {
        quizBtn.style.display = (unlockedStep >= 9) ? 'block' : 'none';
        quizBtn.innerText = window.translations[lang].cta_quiz;
    }

    // Update Restart Button (if any other specific elements need manual updates)
    const restartBtn = document.querySelector('button[onclick="restartJourney()"]');
    if (restartBtn) restartBtn.innerText = window.translations[lang].restart;
};

window.handleJourneyCTA = function() {
    const unlockedStep = window.appState.unlockedStep;
    if (unlockedStep >= 10) {
        window.goToStep(10);
    } else if (unlockedStep < 4) {
        window.goToStep(4);
    } else {
        // Go to the highest unlocked step or the next step
        window.goToStep(unlockedStep);
    }
};

window.handlePhaseClick = function(step) {
    const userType = window.appState.userType;
    const unlockedStep = window.appState.unlockedStep;

    if (userType === 'first-time' && step > unlockedStep && unlockedStep < step) {
        // Shaking effect for locked cards
        const el = document.querySelector(`.phase-item[onclick*="${step}"]`);
        if (el) {
            el.classList.add('shake');
            setTimeout(() => el.classList.remove('shake'), 400);
        }
        return;
    }
    window.goToStep(step);
};

window.restartJourney = function() {
    if (confirm("Are you sure you want to restart your journey? All progress will be reset.")) {
        window.appState.unlockedStep = 1;
        window.appState.currentStep = 1;
        window.appState.progress = 0;
        window.appState.userProfile = {
            age: 0,
            hasVoterID: false,
            votedBefore: false,
            isEligible: 'pending',
            hasDocs: false,
            simCompleted: false
        };
        window.saveState();
        window.goToStep(1);
    }
};

window.selectUserType = function(type) {
    window.appState.userType = type;
    window.goToStep(2);
};

window.handleProfileSubmit = function() {
    const age = document.getElementById('userAge')?.value;
    const hasID = document.querySelector('input[name="hasVoterID"]:checked')?.value === 'yes';
    const voted = document.querySelector('input[name="votedBefore"]:checked')?.value === 'yes';
    if (!age) { alert('Please enter your age'); return; }
    window.appState.userProfile.age = parseInt(age);
    window.appState.userProfile.hasVoterID = hasID;
    window.appState.userProfile.votedBefore = voted;
    window.goToStep(3);
};

// === Registration Step Logic ===
window.handleRegistrationAnswer = function(isRegistered) {
    if (isRegistered) {
        if (window.confetti) window.confetti();
        const initialQ = document.getElementById('regInitialQuestion');
        if (initialQ) initialQ.innerHTML = `<h3 style="color: #2f855a; margin-bottom: 1rem;">Great! You're ready for the next step. ✅</h3><p>Moving forward to Eligibility Check...</p>`;
        setTimeout(() => window.goToStep(5), 1500);
    } else {
        const initialQ = document.getElementById('regInitialQuestion');
        const applyFlow = document.getElementById('regApplyFlow');
        if (initialQ) initialQ.style.display = 'none';
        if (applyFlow) applyFlow.style.display = 'block';
    }
};

window.updateRegProgress = function() {
    const steps = ['regStep1', 'regStep2', 'regStep3'];
    let completed = 0;
    steps.forEach(id => { if (document.getElementById(id)?.checked) completed++; });
    const percent = Math.round((completed / steps.length) * 100);
    const bar = document.getElementById('regProgressBar');
    const text = document.getElementById('regProgressPercent');
    const btn = document.getElementById('regCompleteBtn');
    if (bar) bar.style.width = `${percent}%`;
    if (text) text.innerText = `${percent}%`;
    if (btn) {
        btn.style.opacity = completed === steps.length ? '1' : '0.5';
        btn.style.pointerEvents = completed === steps.length ? 'all' : 'none';
    }
};

window.resetRegStep = function() {
    const initialQ = document.getElementById('regInitialQuestion');
    const applyFlow = document.getElementById('regApplyFlow');
    if (initialQ) initialQ.style.display = 'block';
    if (applyFlow) applyFlow.style.display = 'none';
};

// === Eligibility Step Logic ===
window.checkEligibility = function() {
    const age = parseInt(document.getElementById('eligAge')?.value || 0);
    const isCitizen = document.querySelector('input[name="eligCitizen"]:checked')?.value === 'yes';
    const hasDocs = document.querySelector('input[name="eligDocs"]:checked')?.value === 'yes';
    const form = document.getElementById('eligibilityForm');
    const result = document.getElementById('eligResult');
    if (form) form.style.display = 'none';
    if (result) result.style.display = 'block';
    let status = (age < 18 || !isCitizen) ? 'ineligible' : (!hasDocs ? 'warning' : 'eligible');
    window.appState.userProfile.isEligible = status;
    const title = document.getElementById('eligTitle');
    const desc = document.getElementById('eligDesc');
    const icon = document.getElementById('eligIcon');
    if (status === 'eligible') {
        if (window.confetti) window.confetti();
        icon.innerText = '✅'; title.innerText = 'You are Eligible!'; title.style.color = '#2f855a';
        desc.innerText = 'You meet all requirements! Proceed to check the required documents.';
    } else {
        icon.innerText = '❌'; title.innerText = 'Not Eligible'; title.style.color = '#c53030';
        desc.innerText = 'You do not meet the criteria at this time.';
    }
};

// === Timeline Step Logic ===
window.renderPersonalizedTimeline = function() {
    const countdownEl = document.getElementById('countdownDays');
    if (countdownEl) {
        const electionDate = new Date('2026-05-15');
        const diffDays = Math.ceil((electionDate - new Date()) / (1000 * 60 * 60 * 24));
        countdownEl.innerText = diffDays > 0 ? diffDays : '0';
    }
};

// === Booth Step Logic ===
window.findNearestBooth = function() {
    const btn = document.getElementById('findBoothBtn');
    const result = document.getElementById('boothResultArea');
    if (btn) btn.style.display = 'none';
    if (result) result.style.display = 'block';
};

// === Upgraded Quiz Logic (GLOBAL) ===
const quizData = [
    { q: "What is the minimum voting age in India?", a: "18 years", options: ["18 years", "21 years", "25 years"], exp: "The voting age was lowered from 21 to 18 by the 61st Amendment Act in 1988." },
    { q: "Which ID is primarily used for voting identification?", a: "Voter ID / EPIC", options: ["Voter ID / EPIC", "PAN Card", "College ID"], exp: "The Electors Photo Identity Card (EPIC) is the primary document issued by the ECI." },
    { q: "What is the purpose of the electoral roll?", a: "List of eligible voters", options: ["List of candidates", "List of eligible voters", "List of polling stations"], exp: "The electoral roll is the official list of all citizens who are registered to vote in a particular constituency." },
    { q: "What should you do if your name is missing from the list?", a: "Apply for registration", options: ["Apply for registration", "Wait for next election", "Protest at booth"], exp: "If your name is missing, you must fill Form 6 to register yourself before the electoral roll is finalized." },
    { q: "What is NOT allowed inside a polling booth?", a: "Mobile phone usage", options: ["Wearing a watch", "Mobile phone usage", "Carrying a pen"], exp: "Mobile phones and cameras are strictly prohibited inside the booth to maintain secrecy of the vote." },
    { q: "Who conducts elections in India?", a: "Election Commission of India", options: ["Supreme Court", "Parliament", "Election Commission of India"], exp: "The ECI is an autonomous constitutional authority responsible for administering election processes." },
    { q: "What happens after you cast your vote?", a: "It is recorded in EVM", options: ["It is printed instantly", "It is recorded in EVM", "It is sent via SMS"], exp: "Your vote is securely recorded in the Electronic Voting Machine (EVM) and verified by the VVPAT slip." }
];

let currentQuizStep = 0;
let quizScore = 0;
let currentQuestions = [];
let showingExplanation = false;
window.selectedQuizOption = null;

window.initQuiz = function() {
    currentQuizStep = 0;
    quizScore = 0;
    showingExplanation = false;
    currentQuestions = quizData;
    const subtitle = document.getElementById('quizSubtitle');
    if (subtitle) subtitle.innerText = "Test your election awareness and readiness.";
    window.renderQuestion();
};

window.renderQuestion = function() {
    const area = document.getElementById('quizContentArea');
    const nextBtn = document.getElementById('nextQuizBtn');
    const feedback = document.getElementById('quizFeedbackArea');
    const counter = document.getElementById('quizStepCounter');
    if (!area) return;
    if (feedback) feedback.style.display = 'none';
    if (nextBtn) { nextBtn.disabled = true; nextBtn.innerText = "Check Answer →"; nextBtn.style.opacity = "0.5"; }
    const q = currentQuestions[currentQuizStep];
    if (counter) {
        counter.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span class="pill-badge" style="background: var(--surface-color); color: var(--primary-color);">Question ${currentQuizStep + 1} of ${currentQuestions.length}</span>
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">${Math.round((currentQuizStep / currentQuestions.length) * 100)}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--surface-color); border-radius: 10px; overflow: hidden; margin-bottom: 2rem;">
                <div style="width: ${(currentQuizStep / currentQuestions.length) * 100}%; height: 100%; background: var(--primary-color); transition: width 0.4s ease;"></div>
            </div>
        `;
    }
    area.innerHTML = `
        <div class="quiz-question">
            <h3 style="font-size: 1.5rem; margin-bottom: 2.5rem; line-height: 1.4; color: var(--text-main);">${q.q}</h3>
            <div class="options-grid" style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                ${q.options.map((opt, idx) => `
                    <button class="quiz-option-btn" onclick="selectQuizOption('${opt}', this)">
                        <span style="margin-right: 1rem; color: var(--text-muted); opacity: 0.6;">${String.fromCharCode(65 + idx)}.</span> ${opt}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
};

window.selectQuizOption = function(opt, btn) {
    if (showingExplanation) return;
    document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    window.selectedQuizOption = opt;
    const nextBtn = document.getElementById('nextQuizBtn');
    if (nextBtn) { nextBtn.disabled = false; nextBtn.style.opacity = "1"; }
};

window.handleQuizNext = function() {
    const q = currentQuestions[currentQuizStep];
    const selected = (window.selectedQuizOption || "").trim();
    const correctAnswer = (q.a || "").trim();
    const feedback = document.getElementById('quizFeedbackArea');
    const nextBtn = document.getElementById('nextQuizBtn');

    if (!showingExplanation) {
        showingExplanation = true;
        const isCorrect = selected === correctAnswer;
        if (isCorrect) quizScore++;

        // Highlight buttons
        document.querySelectorAll('.quiz-option-btn').forEach(btn => {
            const btnText = (btn.innerText.split('. ')[1] || "").trim();
            if (btnText === correctAnswer) {
                btn.classList.add('correct');
            } else if (btnText === selected && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (feedback) { 
            feedback.style.display = 'block'; 
            feedback.style.background = isCorrect ? '#f0fff4' : '#fff5f5';
            feedback.style.borderColor = isCorrect ? '#c6f6d5' : '#fed7d7';
            
            const iconEl = document.getElementById('feedbackIcon');
            if (iconEl) iconEl.innerText = isCorrect ? '✅' : '❌';
            
            const titleEl = document.getElementById('feedbackTitle');
            if (titleEl) {
                titleEl.innerText = isCorrect ? 'Correct!' : 'Not quite!';
                titleEl.style.color = isCorrect ? '#2f855a' : '#c53030';
            }
            
            const textEl = document.getElementById('feedbackText');
            if (textEl) {
                textEl.innerText = q.exp;
                textEl.style.color = isCorrect ? '#22543d' : '#742a2a';
            }
        }
        
        if (nextBtn) nextBtn.innerText = (currentQuizStep === currentQuestions.length - 1) ? "See Final Results →" : "Next Question →";
    } else {
        showingExplanation = false; window.selectedQuizOption = null; currentQuizStep++;
        if (currentQuizStep < currentQuestions.length) window.renderQuestion();
        else window.showConfidenceDashboard();
    }
};

window.showConfidenceDashboard = function() {
    window.goToStep(11);
    const score = Math.round((quizScore / currentQuestions.length) * 100);
    const scoreEl = document.getElementById('finalConfidenceScore');
    if (scoreEl) scoreEl.innerText = `${score}%`;
    const readinessMsg = document.getElementById('readinessMessage');
    if (readinessMsg) readinessMsg.innerText = score >= 80 ? "You're exceptionally well-prepared!" : "You're ready, but a quick review might help.";
};

// === Sidebar & Chat Modal Logic ===
window.openDrawer = function() {
    document.getElementById('sidebarDrawer').classList.add('active');
    document.getElementById('drawerOverlay').classList.add('active');
};

window.closeDrawer = function() {
    document.getElementById('sidebarDrawer').classList.remove('active');
    document.getElementById('drawerOverlay').classList.remove('active');
};

window.openChatModal = function() {
    document.getElementById('chatModalOverlay').classList.add('active');
    const input = document.getElementById('chatModalInput');
    if (input) input.focus();
};

window.closeChatModal = function() {
    document.getElementById('chatModalOverlay').classList.remove('active');
};

// === Gemini AI Integration ===
// === AI Integration via Cloud Run Backend ===
window.fetchAIResponse = async (userQuery) => {
    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userQuery
            })
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        return data.reply || "No response from AI.";

    } catch (error) {
        console.error("AI Error:", error);
        return "Unable to fetch response, please try again.";
    }
};
   

window.sendModalMessage = async function() {
    const input = document.getElementById('chatModalInput');
    const body = document.getElementById('chatModalBody');
    const userText = input.value.trim();
    
    if (!userText) return;

    // 1. Add User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.innerText = userText;
    body.appendChild(userBubble);
    
    input.value = '';
    body.scrollTop = body.scrollHeight;

    // 2. Add Typing Indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble ai typing';
    typingBubble.style.cssText = 'background: white; padding: 0.75rem 1.25rem; border-radius: 15px 15px 15px 5px; align-self: flex-start; border: 1px solid var(--card-border); font-style: italic; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;';
    typingBubble.innerText = "Assistant is thinking...";
    body.appendChild(typingBubble);
    body.scrollTop = body.scrollHeight;

    // 3. Fetch AI Response
    const responseText = await window.fetchAIResponse(userText);

    // 4. Remove Typing Indicator and Add AI Bubble
    body.removeChild(typingBubble);
    
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    aiBubble.style.cssText = 'background: white; padding: 1rem; border-radius: 15px 15px 15px 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); align-self: flex-start; max-width: 85%; font-size: 0.9rem; line-height: 1.5; color: var(--text-main); border: 1px solid var(--card-border); margin-bottom: 1rem; animation: slideUp 0.3s ease;';
    aiBubble.innerText = responseText;
    body.appendChild(aiBubble);
    body.scrollTop = body.scrollHeight;
};

window.openInfoModal = function(title, content) {
    document.getElementById('infoModalTitle').innerText = title;
    document.getElementById('infoModalBody').innerHTML = content;
    document.getElementById('infoModalOverlay').classList.add('active');
};

window.closeInfoModal = function() {
    document.getElementById('infoModalOverlay').classList.remove('active');
};

window.openHowItWorks = function() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                <span style="font-size: 1.5rem;">👤</span>
                <div>
                    <h4 style="margin-bottom: 0.25rem;">Step 1: Choose your voter profile</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Tell us about your age and voting history.</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                <span style="font-size: 1.5rem;">🗺️</span>
                <div>
                    <h4 style="margin-bottom: 0.25rem;">Step 2: Get a personalized voting journey</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Receive a customized plan for your electoral process.</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                <span style="font-size: 1.5rem;">✅</span>
                <div>
                    <h4 style="margin-bottom: 0.25rem;">Step 3: Follow step-by-step guidance</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Track your progress through registration and prep.</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                <span style="font-size: 1.5rem;">📄</span>
                <div>
                    <h4 style="margin-bottom: 0.25rem;">Step 4: Check eligibility and documents</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Ensure you have all the required IDs to vote.</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                <span style="font-size: 1.5rem;">📍</span>
                <div>
                    <h4 style="margin-bottom: 0.25rem;">Step 5: Locate your polling booth</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Find out exactly where to cast your vote.</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                <span style="font-size: 1.5rem;">🗳️</span>
                <div>
                    <h4 style="margin-bottom: 0.25rem;">Step 6: Practice with voting simulator</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Get comfortable with an EVM before election day.</p>
                </div>
            </div>
        </div>
    `;
    window.openInfoModal("How Election Guide AI Works", content);
    window.closeDrawer();
};

window.openFAQ = function() {
    const faqContent = `
        <div class="faq-accordion" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="faq-item" style="border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden;">
                <button onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'" style="width: 100%; text-align: left; padding: 1rem; background: var(--bg-main); border: none; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: var(--text-main);">
                    What is the legal voting age in India?
                    <span style="color: var(--primary-color);">+</span>
                </button>
                <div style="display: none; padding: 1rem; background: white; border-top: 1px solid var(--card-border); color: var(--text-muted); font-size: 0.95rem;">
                    18 years and above
                </div>
            </div>
            <div class="faq-item" style="border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden;">
                <button onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'" style="width: 100%; text-align: left; padding: 1rem; background: var(--bg-main); border: none; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: var(--text-main);">
                    Do I need a voter ID?
                    <span style="color: var(--primary-color);">+</span>
                </button>
                <div style="display: none; padding: 1rem; background: white; border-top: 1px solid var(--card-border); color: var(--text-muted); font-size: 0.95rem;">
                    Yes, or any valid government ID
                </div>
            </div>
            <div class="faq-item" style="border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden;">
                <button onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'" style="width: 100%; text-align: left; padding: 1rem; background: var(--bg-main); border: none; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: var(--text-main);">
                    Can I vote without registration?
                    <span style="color: var(--primary-color);">+</span>
                </button>
                <div style="display: none; padding: 1rem; background: white; border-top: 1px solid var(--card-border); color: var(--text-muted); font-size: 0.95rem;">
                    No, registration is mandatory
                </div>
            </div>
            <div class="faq-item" style="border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden;">
                <button onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'" style="width: 100%; text-align: left; padding: 1rem; background: var(--bg-main); border: none; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: var(--text-main);">
                    How do I find my polling booth?
                    <span style="color: var(--primary-color);">+</span>
                </button>
                <div style="display: none; padding: 1rem; background: white; border-top: 1px solid var(--card-border); color: var(--text-muted); font-size: 0.95rem;">
                    Use the "Locate Booth" feature
                </div>
            </div>
            <div class="faq-item" style="border: 1px solid var(--card-border); border-radius: 12px; overflow: hidden;">
                <button onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'" style="width: 100%; text-align: left; padding: 1rem; background: var(--bg-main); border: none; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: var(--text-main);">
                    Is my data stored?
                    <span style="color: var(--primary-color);">+</span>
                </button>
                <div style="display: none; padding: 1rem; background: white; border-top: 1px solid var(--card-border); color: var(--text-muted); font-size: 0.95rem;">
                    No, this platform is privacy-first
                </div>
            </div>
        </div>
    `;
    window.openInfoModal("Frequently Asked Questions", faqContent);
    window.closeDrawer();
};

window.openSupport = function() {
    const supportContent = `
        <div style="padding: 1rem 0;">
            <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                    <div style="font-size: 1.5rem;">📧</div>
                    <div>
                        <div style="font-weight: 700; color: var(--text-main);">Email Us</div>
                        <a href="mailto:support@electionguide.ai" style="color: var(--primary-color); text-decoration: none; font-size: 0.9rem;">support@electionguide.ai</a>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                    <div style="font-size: 1.5rem;">⏱</div>
                    <div>
                        <div style="font-weight: 700; color: var(--text-main);">Response time</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Within 24 hours</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border);">
                    <div style="font-size: 1.5rem;">💬</div>
                    <div>
                        <div style="font-weight: 700; color: var(--text-main);">Live Assistant</div>
                        <button onclick="window.closeInfoModal(); window.openChatModal();" style="background: none; border: none; color: var(--primary-color); font-weight: 600; padding: 0; cursor: pointer; text-decoration: underline;">Start Chatting</button>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <label style="font-weight: 600; color: var(--text-main); text-align: left;">Send us a quick message</label>
                <textarea rows="3" placeholder="Describe your issue..." style="width: 100%; padding: 0.75rem; border-radius: 12px; border: 1px solid var(--card-border); font-family: inherit; font-size: 0.9rem; resize: vertical; outline: none;"></textarea>
                <button onclick="alert('Ticket submitted successfully! We will get back to you shortly.'); window.closeInfoModal();" style="background: var(--primary-color); color: white; border: none; padding: 0.75rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s;">Submit Ticket</button>
            </div>
        </div>
    `;
    window.openInfoModal("Need Help?", supportContent);
    window.closeDrawer();
};

window.openPrivacy = function() {
    const privacyContent = `
        <div style="text-align: center; padding: 1rem 0;">
            <div style="font-size: 3rem; margin-bottom: 1.5rem;">🔒</div>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 1.05rem;">We believe in absolute privacy and transparency.</p>
            <ul style="text-align: left; display: flex; flex-direction: column; gap: 1rem; margin: 0 auto 2rem; max-width: 400px; list-style: none; padding: 0;">
                <li style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-main);"><span style="color: var(--primary-color); font-weight: bold;">✓</span> We do not store personal user data</li>
                <li style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-main);"><span style="color: var(--primary-color); font-weight: bold;">✓</span> No login or tracking required</li>
                <li style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-main);"><span style="color: var(--primary-color); font-weight: bold;">✓</span> All interactions are session-based</li>
                <li style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-main);"><span style="color: var(--primary-color); font-weight: bold;">✓</span> This is an educational platform</li>
            </ul>
            <p style="font-size: 0.85rem; padding: 1rem; background: var(--bg-main); border-radius: 12px; border: 1px solid var(--card-border); color: var(--text-muted);">All state management is handled locally in your browser's memory and local storage.</p>
        </div>
    `;
    window.openInfoModal("Privacy Policy", privacyContent);
    window.closeDrawer();
};

// === Document Step Logic ===
window.simulateDocUpload = function(docName) {
    const status = document.getElementById('docUploadStatus');
    const title = document.getElementById('uploadTitle');
    const bar = document.getElementById('uploadProgressBar');
    if (status) status.style.display = 'block';
    if (title) title.innerText = `Uploading ${docName}...`;
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        if (bar) bar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (status) status.style.display = 'none';
                alert(`${docName} uploaded and verified! ✅`);
                window.appState.userProfile.hasDocs = true;
            }, 500);
        }
    }, 50);
};

window.verifyAllDocs = function() {
    if (window.appState.userProfile.hasDocs) {
        if (window.confetti) window.confetti();
        window.goToStep(7);
    } else {
        alert("Please upload at least one valid document for verification.");
    }
};

// === Booth Finder Logic ===
window.simulateDirections = function() {
    alert("📍 Directions: Head North on Main St for 200m, then turn right at the community center. Your booth is inside the school hall.");
};

window.resetBoothFinder = function() {
    const btn = document.getElementById('findBoothBtn');
    const result = document.getElementById('boothResultArea');
    if (btn) btn.style.display = 'block';
    if (result) result.style.display = 'none';
};

// === Simulator Step Logic ===
window.currentSimPhase = 'booth';
window.selectedCandidate = null;

window.advanceSimulator = function(phase) {
    const phases = ['booth', 'candidate', 'confirm', 'success'];
    phases.forEach(p => {
        const el = document.getElementById(`simPhase-${p}`);
        if (el) el.style.display = (p === phase) ? 'block' : 'none';
    });
    
    const label = document.getElementById('simStepLabel');
    if (label) {
        const labels = {
            booth: 'STEP 1: ENTERING THE BOOTH',
            candidate: 'STEP 2: SELECT CANDIDATE',
            confirm: 'STEP 3: VVPAT CONFIRMATION',
            success: 'STEP 4: VOTE CAST'
        };
        label.innerText = labels[phase] || '';
    }
};

window.selectCandidate = function(name, symbol) {
    window.selectedCandidate = { name, symbol };
    const rows = document.querySelectorAll('.evm-row');
    rows.forEach(row => {
        const rowName = row.querySelector('div:nth-child(2)').innerText;
        row.style.borderColor = (rowName === name) ? 'var(--primary-color)' : '#e2e8f0';
        row.style.background = (rowName === name) ? '#f7fafc' : '#fff';
    });
    const status = document.getElementById('selectionStatus');
    if (status) status.innerText = `Selected: ${name}. Now press the red button below.`;
    const castBtn = document.getElementById('evmCastBtn');
    if (castBtn) {
        castBtn.disabled = false;
        castBtn.style.opacity = "1";
        castBtn.style.pointerEvents = "all";
    }
};

window.castFinalVote = function() {
    const confirmName = document.getElementById('confirmedCandidate');
    if (confirmName && window.selectedCandidate) confirmName.innerText = `${window.selectedCandidate.symbol} ${window.selectedCandidate.name}`;
    window.advanceSimulator('success');
    window.appState.userProfile.simCompleted = true;
    if (window.confetti) window.confetti();
};

// === Final Step Logic ===
window.setElectionReminder = function() {
    alert("⏰ Reminder Set! We will notify you on May 15th, 2026. Make sure to carry your documents!");
};

// === Core Logic (Initialization) ===
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Listener
    const hamburger = document.getElementById('hamburgerBtn');
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            window.openDrawer();
        });
    }

    // Close components on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeDrawer();
            window.closeChatModal();
            window.closeInfoModal();
        }
    });

    // Confetti
    window.confetti = function() {
        const canvas = document.getElementById('confettiCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
        const particles = []; const colors = ['#D3AB9E', '#EAC9C1', '#22c55e', '#f59e0b', '#3b82f6'];
        for (let i = 0; i < 50; i++) particles.push({ x: canvas.width / 2, y: canvas.height / 2, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, size: Math.random() * 5 + 2, color: colors[Math.floor(Math.random() * colors.length)], opacity: 1 });
        function anim() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); let alive = false;
            particles.forEach(p => { if (p.opacity <= 0) return; alive = true; p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.opacity -= 0.01; ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
            if (alive) requestAnimationFrame(anim);
        }
        anim();
    };

    // Load progress but always start at Home (Step 1)
    window.loadState();
    window.goToStep(1);

    // Initialize UI language
    window.updateUI();
});
