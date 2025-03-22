const API_BASE = "https://info-eye.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("articlesContainer"); // نستخدم نفس الحاوية
    let allArticles = [];

    // جلب جميع المقالات مرة واحدة من السيرفر
    fetch("http://localhost:3000/articles")
        .then(res => res.json())
        .then(data => {
            allArticles = data;
            renderArticles(""); // عرض كل المقالات مبدئيًا
        })
        .catch(() => {
            searchResults.innerHTML = "<p>❌ تعذر تحميل المقالات من الخادم.</p>";
        });

    // عند الكتابة في حقل البحث
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim().toLowerCase();
        renderArticles(query);
    });

    function renderArticles(query) {
        searchResults.innerHTML = "";

        const filtered = allArticles.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.content.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
            filtered.forEach(article => {
                const articleElement = document.createElement("div");
                articleElement.classList.add("article");
                articleElement.innerHTML = `
                    <h3><a href="article.html?id=${article._id}">${article.title}</a></h3>
                    <p>${article.content.substring(0, 100)}...</p>
                `;
                searchResults.appendChild(articleElement);
            });
        } else {
            searchResults.innerHTML = "<p>❌ لم يتم العثور على نتائج.</p>";
        }
    }
});