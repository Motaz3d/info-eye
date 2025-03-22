document.addEventListener("DOMContentLoaded", function () {
    const articlesContainer = document.getElementById("articles");
    const loader = document.createElement("div");
    loader.id = "loader";
    loader.innerHTML = "جاري التحميل...";
    document.body.appendChild(loader);

    let page = 1;
    let isLoading = false;

    function fetchArticles(pageNumber) {
        if (isLoading) return;
        isLoading = true;
        loader.style.display = "block";

        setTimeout(() => {
            const newArticles = [
                { id: pageNumber * 10 + 1, title: "New Insights in AI", category: "Technology", summary: "How AI is reshaping the industry." },
                { id: pageNumber * 10 + 2, title: "Advancements in Space Tech", category: "Science", summary: "Exploring the latest discoveries in space technology." }
            ];

            newArticles.forEach(article => {
                const articleElement = document.createElement("div");
                articleElement.classList.add("article");
                articleElement.innerHTML = `
                    <h3><a href="article.html?id=${article.id}">${article.title}</a></h3>
                    <p>${article.summary}</p>
                `;
                articlesContainer.appendChild(articleElement);
            });

            loader.style.display = "none";
            isLoading = false;
        }, 1000);
    }

    function handleScroll() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            page++;
            fetchArticles(page);
        }
    }

    window.addEventListener("scroll", handleScroll);
    fetchArticles(page);
});
document.addEventListener("DOMContentLoaded", function () {
    const articlesContainer = document.getElementById("articles");

    fetch("http://localhost:3000/articles")
        .then(res => res.json())
        .then(articles => {
            articles.forEach(article => {
                const articleElement = document.createElement("div");
                articleElement.classList.add("article");
                articleElement.innerHTML = `
                    <h3><a href="article.html?id=${article._id}">${article.title}</a></h3>
                    <p><strong>التصنيف:</strong> ${article.category}</p>
                    <p>${article.content.substring(0, 150)}...</p>
                `;
                articlesContainer.appendChild(articleElement);
            });
        })
        .catch(() => {
            articlesContainer.innerHTML = "<p>تعذر تحميل المقالات من الخادم.</p>";
        });
});