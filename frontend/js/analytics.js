document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("chartCanvas").getContext("2d");
    const API_BASE = "https://info-eye.onrender.com";

    fetch("http://localhost:3000/stats/articles")
        .then(res => res.json())
        .then(data => {
            const labels = data.map(item => item._id);
            const counts = data.map(item => item.count);

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "عدد المقالات حسب التصنيف",
                        data: counts,
                        backgroundColor: "#0073e6"
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: "تحليل التصنيفات"
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(() => {
            document.getElementById("chartContainer").innerHTML = "<p>فشل في تحميل الإحصائيات.</p>";
        });
});

const monthlyCtx = document.getElementById("monthlyChart").getContext("2d");

fetch("http://localhost:3000/stats/monthly")
    .then(res => res.json())
    .then(data => {
        const labels = data.map(item => `${item._id.year}-${String(item._id.month).padStart(2, '0')}`);
        const counts = data.map(item => item.count);

        new Chart(monthlyCtx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "عدد المقالات شهريًا",
                    data: counts,
                    borderColor: "#28a745",
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "تحليل المقالات حسب الأشهر"
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(() => {
        const container = document.getElementById("monthlyChartContainer");
        container.innerHTML = "<p>فشل في تحميل تحليل الأشهر.</p>";
    });