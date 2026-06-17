/* ❓ FORMULAIRE DE QUESTIONS */
const questionsForm = document.getElementById('questionsForm');

if (questionsForm) {
    questionsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const pseudo = document.getElementById('pseudo').value.trim();
        const question = document.getElementById('question').value.trim();
        const submitBtn = document.getElementById('submitBtn');
        const formMessage = document.getElementById('formMessage');

        if (!pseudo || !question) {
            showMessage(formMessage, '❌ Tous les champs sont requis', 'error');
            return;
        }

        if (pseudo.length > 50) {
            showMessage(formMessage, '❌ Le pseudo doit faire moins de 50 caractères', 'error');
            return;
        }

        if (question.length > 500) {
            showMessage(formMessage, '❌ La question doit faire moins de 500 caractères', 'error');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerText = '⏳ Envoi...';

            const response = await supabase.insert('questions', {
                pseudo: pseudo,
                question: question,
                created_at: new Date().toISOString(),
                status: 'pending',
                answer_id: null
            });

            if (response && response.length > 0) {
                showMessage(formMessage, '✅ Question envoyée! Merci 🎉', 'success');
                questionsForm.reset();

                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                showMessage(formMessage, '❌ Erreur lors de l\'envoi', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showMessage(formMessage, '❌ Erreur de connexion à la base de données', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = '🚀 Envoyer la question';
        }
    });
}

function showMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
}