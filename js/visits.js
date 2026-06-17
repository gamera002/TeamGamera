/* 🔴 COMPTEUR DE VISITES */
async function loadAndIncrementVisits() {
    try {
        const visits = await supabase.select('visits');
        const currentCount = visits[0]?.visit_count || 1;

        const visitsElement = document.getElementById('visits');
        if (visitsElement) {
            visitsElement.innerText = currentCount;
        }

        const newCount = currentCount + 1;
        await supabase.update('visits', { visit_count: newCount }, 1);

        if (visitsElement) {
            setTimeout(() => {
                visitsElement.innerText = newCount;
            }, 500);
        }
    } catch (err) {
        console.error('Erreur compteur:', err);
        const visitsElement = document.getElementById('visits');
        if (visitsElement) {
            visitsElement.innerText = '?';
        }
    }
}

if (document.getElementById('visits')) {
    loadAndIncrementVisits();
}