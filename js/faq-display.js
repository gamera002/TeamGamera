/* 💬 AFFICHAGE FAQ - Questions répondues */
const faqContainer = document.getElementById('faqContainer');

if (faqContainer) {
    async function loadFAQ() {
        try {
            const answers = await supabase.select('answers');

            if (answers.length === 0) {
                faqContainer.innerHTML = '<div class="empty-state">🔔 Aucune réponse disponible pour le moment...</div>';
                return;
            }

            faqContainer.innerHTML = '';

            answers.forEach(answer => {
                const card = document.createElement('div');
                card.className = 'faq-card';

                const questionDiv = document.createElement('div');
                questionDiv.className = 'question-text';
                questionDiv.textContent = `❓ ${answer.question}`;

                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-text';
                answerDiv.textContent = answer.answer_text;

                const askerDiv = document.createElement('div');
                askerDiv.className = 'asker';
                askerDiv.innerHTML = `👤 <strong>${answer.pseudo}</strong> • ${formatDate(answer.created_at)}`;

                card.appendChild(questionDiv);
                card.appendChild(answerDiv);
                card.appendChild(askerDiv);

                faqContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Erreur chargement FAQ:', error);
            faqContainer.innerHTML = '<div class="empty-state">⚠️ Erreur de chargement</div>';
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }

    loadFAQ();
    
    // Rafraîchir FAQ toutes les 30 secondes
    setInterval(loadFAQ, 30000);
}