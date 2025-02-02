
async function fetchSpending() {
    const accountId = sessionStorage.getItem('accessCode');
    const response = await fetch(`/accounts/spending/${accountId}`);
    let data = await response.json();
    data = data.updatedSpendingData
    data.sort((a, b) => {
        if (a.Year !== b.Year) {
            return a.Year - b.Year;
        }
        return a.Month - b.Month;
    });

    const labels = data.map(item => `${item.Year}-${item.Month < 10 ? '0' : ''}${item.Month}`);
    const spendingData = data.map(item => item.TotalSpending);

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Total Spending',
            data: spendingData,
            backgroundColor: 'rgba(251, 198, 207, 0.5)',
            borderColor: 'rgba(251, 198, 207, 0.2)',
            borderWidth: 0.5,
            borderRadius: 24
        }]
    };

    // configuration
    const config = {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    display: false,
                    title: {
                        display: false,
                        text: 'Total Spending ($)'
                    },
                    grid: {
                        color: 'transparent',
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Month-Year'
                    },
                    grid: {
                        color: 'transparent',
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                    position: 'top'
                },
                datalabels: {
                    display: true,
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 12
                    },
                    align: 'top',
                    anchor: 'end'
                },
            }
        }
    };
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, config);
}

fetchSpending();
