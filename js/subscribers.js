/* 👥 COMPTEUR ABONNÉS */
function loadSubscribers() {
    let savedSubs = localStorage.getItem('abonnes');
    if (!savedSubs) {
        fetch('stats.json')
            .then(res => res.json())
            .then(data => {
                let cible = data.abonnes || 128;
                localStorage.setItem('abonnes', cible);
                animateAbonnes(cible);
            })
            .catch(() => {
                animateAbonnes(128);
            });
    } else {
        animateAbonnes(parseInt(savedSubs));
    }
}

function animateAbonnes(cible) {
    let actuel = 0;
    const interval = setInterval(() => {
        actuel += Math.ceil(cible / 80);
        if (actuel >= cible) {
            actuel = cible;
            clearInterval(interval);
        }
        const subsElement = document.getElementById('subs');
        if (subsElement) {
            subsElement.innerText = actuel + '+';
        }
    }, 30);
}

if (document.getElementById('subs')) {
    loadSubscribers();
}