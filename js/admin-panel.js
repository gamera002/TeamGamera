/* ⚙️ ADMIN PANEL */
const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const logoutBtn = document.getElementById('logoutBtn');
const errorMessage = document.getElementById('errorMessage');

let currentSelectedQuestionId = null;
let questions = [];

// 🔍 Check if already logged in
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
    showAdminPanel();
    loadAllData();
} else {
    showLoginForm();
}

// 🔓 LOGIN HANDLER
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;

        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
            loadAllData();
        } else {
            errorMessage.textContent = '❌ Mot de passe incorrect';
            errorMessage.style.display = 'block';
            document.getElementById('password').value = '';
        }
    });
}

// 🚪 LOGOUT HANDLER
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            sessionStorage.removeItem('adminLoggedIn');
            showLoginForm();
            document.getElementById('password').value = '';
        }
    });
}

function showLoginForm() {
    if (loginSection) loginSection.style.display = 'flex';
    if (adminPanel) adminPanel.classList.remove('active');
}

function showAdminPanel() {
    if (loginSection) loginSection.style.display = 'none';
    if (adminPanel) adminPanel.classList.add('active');
}

// 📊 LOAD ALL DATA
async function loadAllData() {
    await loadQuestions();
}

// 📝 LOAD QUESTIONS
async function loadQuestions() {
    try {
        questions = await supabase.select('questions');
        renderQuestionsList();
        updateStats();
    } catch (error) {
        console.error('Erreur chargement questions:', error);
        alert('Erreur de connexion à la base de données');
    }
}

// 🎨 RENDER QUESTIONS LIST
function renderQuestionsList() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;

    if (questions.length === 0) {
        questionsList.innerHTML = '<div class="empty-state">🔔 Aucune question reçue</div>';
        return;
    }

    questionsList.innerHTML = '';

    questions.forEach(q => {
        const item = document.createElement('div');
        item.className = `question-item ${q.answer_id ? 'answered' : ''}`;
        item.dataset.questionId = q.id;

        const pseudo = document.createElement('div');
        pseudo.className = 'question-pseudo';
        pseudo.textContent = `👤 ${q.pseudo}`;

        const text = document.createElement('div');
        text.className = 'question-text';
        text.textContent = q.question;

        const status = document.createElement('div');
        status.className = `question-status ${q.answer_id ? 'has-answer' : ''}`;
        status.textContent = q.answer_id ? '✅ Répondée' : '⏳ En attente';

        item.appendChild(pseudo);
        item.appendChild(text);
        item.appendChild(status);

        item.addEventListener('click', () => selectQuestion(q));
        questionsList.appendChild(item);
    });
}

// 🖱️ SELECT QUESTION
async function selectQuestion(question) {
    currentSelectedQuestionId = question.id;

    // Update UI
    document.querySelectorAll('.question-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-question-id="${question.id}"]`).classList.add('selected');

    // Show answer form
    const answerForm = document.getElementById('answerForm');
    const noSelectionState = document.getElementById('noSelectionState');
    const selectedQuestion = document.getElementById('selectedQuestion');

    if (noSelectionState) noSelectionState.style.display = 'none';
    if (answerForm) answerForm.classList.add('active');
    if (selectedQuestion) selectedQuestion.textContent = `❓ ${question.question}`;

    // Load existing answer if any
    const answerText = document.getElementById('answerText');
    if (question.answer_id) {
        try {
            const answers = await supabase.select('answers');
            const existingAnswer = answers.find(a => a.id === question.answer_id);
            if (existingAnswer && answerText) {
                answerText.value = existingAnswer.answer_text;
            }
        } catch (error) {
            console.error('Erreur chargement réponse:', error);
        }
    } else {
        if (answerText) answerText.value = '';
    }
}

// 💾 SAVE ANSWER
const saveAnswerBtn = document.getElementById('saveAnswerBtn');
if (saveAnswerBtn) {
    saveAnswerBtn.addEventListener('click', async () => {
        const answerText = document.getElementById('answerText').value.trim();
        const answerMessage = document.getElementById('answerMessage');

        if (!answerText) {
            showAnswerMessage(answerMessage, '❌ La réponse ne peut pas être vide', 'error');
            return;
        }

        if (answerText.length > 1000) {
            showAnswerMessage(answerMessage, '❌ La réponse doit faire moins de 1000 caractères', 'error');
            return;
        }

        try {
            saveAnswerBtn.disabled = true;
            saveAnswerBtn.innerText = '⏳ Sauvegarde...';

            const question = questions.find(q => q.id === currentSelectedQuestionId);

            if (question.answer_id) {
                // Update existing answer
                await supabase.update('answers', {
                    answer_text: answerText,
                    updated_at: new Date().toISOString()
                }, question.answer_id);
            } else {
                // Create new answer
                const response = await supabase.insert('answers', {
                    question_id: currentSelectedQuestionId,
                    pseudo: question.pseudo,
                    question: question.question,
                    answer_text: answerText,
                    created_at: new Date().toISOString()
                });

                if (response && response.length > 0) {
                    // Update question with answer_id
                    await supabase.update('questions', {
                        answer_id: response[0].id,
                        status: 'answered'
                    }, currentSelectedQuestionId);
                }
            }

            showAnswerMessage(answerMessage, '✅ Réponse sauvegardée!', 'success');
            await loadAllData();

            // Reset selection
            currentSelectedQuestionId = null;
            document.getElementById('answerForm').classList.remove('active');
            document.getElementById('noSelectionState').style.display = 'block';
            document.querySelectorAll('.question-item').forEach(item => {
                item.classList.remove('selected');
            });

            setTimeout(() => {
                answerMessage.style.display = 'none';
            }, 3000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            showAnswerMessage(answerMessage, '❌ Erreur de sauvegarde', 'error');
        } finally {
            saveAnswerBtn.disabled = false;
            saveAnswerBtn.innerText = '💾 Sauvegarder';
        }
    });
}

// ❌ CANCEL BUTTON
const cancelBtn = document.getElementById('cancelBtn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        currentSelectedQuestionId = null;
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.getElementById('answerForm').classList.remove('active');
        document.getElementById('noSelectionState').style.display = 'block';
        document.getElementById('answerText').value = '';
        document.getElementById('answerMessage').style.display = 'none';
    });
}

// 📊 UPDATE STATS
function updateStats() {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => q.answer_id).length;
    const pendingQuestions = totalQuestions - answeredQuestions;

    const totalQuestionsEl = document.getElementById('totalQuestions');
    const answeredQuestionsEl = document.getElementById('answeredQuestions');
    const pendingQuestionsEl = document.getElementById('pendingQuestions');

    if (totalQuestionsEl) totalQuestionsEl.textContent = totalQuestions;
    if (answeredQuestionsEl) answeredQuestionsEl.textContent = answeredQuestions;
    if (pendingQuestionsEl) pendingQuestionsEl.textContent = pendingQuestions;
}

// 💬 SHOW ANSWER MESSAGE
function showAnswerMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
}

// 🔄 Actualiser les données toutes les 30 secondes
setInterval(loadQuestions, 30000);