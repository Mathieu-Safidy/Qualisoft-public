document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('myChart');

    const myChart = new Chart(ctx, {
        type: 'line', // 'line', 'pie', etc. aussi possibles
        data: {
            labels: ['Janvier', 'Février', 'Mars', 'Avril'],
            datasets: [{
                label: 'Ventes',
                data: [12, 19, 3, 5],
                backgroundColor: '#7EE2A7', // Couleur entreprise
                borderColor: '#53b67c',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const bread = document.getElementById('bread');
    const sidebar = document.getElementById('sidebar');
    const corp = document.getElementById('body-corps');
    const indexs = document.querySelectorAll('.index');
    const menu = document.querySelectorAll('.menu');
    bread.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        console.log(menu)
        indexs.forEach(element => {
            if (isCollapsed) {
                element.classList.add('d-none');
            } else {
                element.classList.remove('d-none');
            }
        });
        menu.forEach(element => {
            if (isCollapsed) {
                element.classList.remove('ps-3');
            } else {
                element.classList.add('ps-3');
            }
        });
    });

})
