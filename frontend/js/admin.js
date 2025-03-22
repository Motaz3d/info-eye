document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("isAuthenticated") !== "true") {
        window.location.href = "login.html";
    }

    const articlesContainer = document.getElementById("articlesAdmin");
    const suggestionsContainer = document.getElementById("suggestionsBox");
    const addArticleButton = document.getElementById("addArticle");
    const articleForm = document.getElementById("articleForm");
    const articleModal = document.getElementById("articleModal");
    const closeModal = document.getElementById("closeModal");
    const cancelModal = document.getElementById("cancelModal");
    const filterCategory = document.getElementById("filterCategory");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const articleTitle = document.getElementById("articleTitle");
    const articleCategory = document.getElementById("articleCategory");
    const articleContent = document.getElementById("articleContent");
    const API_BASE = "https://info-eye.onrender.com";

    let articles = JSON.parse(localStorage.getItem("articles")) || [
        { id: 1, title: "Future of Renewable Energy", category: "Industry", content: "An in-depth look at renewable energy." },
        { id: 2, title: "AI in Marketing Strategies", category: "Marketing", content: "How AI is transforming marketing strategies." },
        { id: 3, title: "Breakthroughs in Agricultural Tech", category: "Agriculture", content: "The latest advancements in agricultural technology." }
    ];

    function saveArticles() {
        localStorage.setItem("articles", JSON.stringify(articles));
    }

    function renderArticles(categoryFilter = "all", searchQuery = "") {
        articlesContainer.innerHTML = "";
        articles.forEach(article => {
            if ((categoryFilter === "all" || article.category === categoryFilter) &&
                (searchQuery === "" || article.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
                const articleElement = document.createElement("div");
                articleElement.classList.add("article");
                articleElement.innerHTML = `
                    <h3>${article.title}</h3>
                    <p><strong>التصنيف:</strong> ${article.category}</p>
                    <button class="editArticle" data-id="${article.id}">تعديل</button>
                    <button class="deleteArticle" data-id="${article.id}">حذف</button>
                `;
                articlesContainer.appendChild(articleElement);
            }
        });

        document.querySelectorAll(".editArticle").forEach(button => {
            button.addEventListener("click", function () {
                const articleId = parseInt(this.getAttribute("data-id"));
                editArticle(articleId);
            });
        });

        document.querySelectorAll(".deleteArticle").forEach(button => {
            button.addEventListener("click", function () {
                const articleId = parseInt(this.getAttribute("data-id"));
                deleteArticle(articleId);
            });
        });
    }

    function fetchSuggestions() {
        fetch("http://localhost:3000/suggestions")
            .then(res => res.json())
            .then(data => {
                suggestionsContainer.innerHTML = "<h3>🧠 اقتراحات المواضيع:</h3>";
                const wrapper = document.createElement("div");
                wrapper.style.display = "flex";
                wrapper.style.flexWrap = "wrap";
                wrapper.style.gap = "10px";

                data.forEach(s => {
                    const btn = document.createElement("button");
                    btn.textContent = s.suggestion;
                    btn.style.padding = "8px 12px";
                    btn.style.cursor = "pointer";
                    btn.style.border = "1px solid #ccc";
                    btn.style.borderRadius = "8px";
                    btn.style.background = "#f1f1f1";
                    btn.addEventListener("click", () => {
                        articleTitle.value = s.suggestion;
                        articleCategory.value = "Industry";
                        articleContent.value = "";
                        articleModal.style.display = "block";
                    });
                    wrapper.appendChild(btn);
                });

                suggestionsContainer.appendChild(wrapper);
            })
            .catch(() => {
                suggestionsContainer.innerHTML = "<p>تعذر تحميل الاقتراحات.</p>";
            });
    }

    function addArticle(title, category, content) {
        if (!validateInput(title, category, content)) return;
        const newArticle = { id: articles.length + 1, title, category, content };
        articles.push(newArticle);
        saveArticles();
        renderArticles(filterCategory.value, searchInput.value);
    }

    function editArticle(id) {
        const article = articles.find(a => a.id === id);
        if (article) {
            articleTitle.value = article.title;
            articleCategory.value = article.category;
            articleContent.value = article.content;
            articleModal.style.display = "block";

            articleForm.onsubmit = function (event) {
                event.preventDefault();
                if (!validateInput(articleTitle.value, articleCategory.value, articleContent.value)) return;
                article.title = articleTitle.value;
                article.category = articleCategory.value;
                article.content = articleContent.value;
                saveArticles();
                articleModal.style.display = "none";
                renderArticles(filterCategory.value, searchInput.value);
            };
        }
    }

    function deleteArticle(id) {
        if (!confirm("هل أنت متأكد من أنك تريد حذف هذا المقال؟")) return;
        articles = articles.filter(a => a.id !== id);
        saveArticles();
        renderArticles(filterCategory.value, searchInput.value);
    }

    function validateInput(title, category, content) {
        if (!title.trim() || !category.trim() || !content.trim()) {
            alert("جميع الحقول مطلوبة!");
            return false;
        }
        return true;
    }

    addArticleButton.addEventListener("click", function () {
        articleTitle.value = "";
        articleCategory.value = "";
        articleContent.value = "";
        articleModal.style.display = "block";
    });

    closeModal.addEventListener("click", function () {
        articleModal.style.display = "none";
    });

    cancelModal.addEventListener("click", function () {
        articleModal.style.display = "none";
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && articleModal.style.display === "block") {
            articleModal.style.display = "none";
        }
    });

    articleForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!validateInput(articleTitle.value, articleCategory.value, articleContent.value)) return;
        addArticle(articleTitle.value, articleCategory.value, articleContent.value);
        articleModal.style.display = "none";
    });

    filterCategory.addEventListener("change", function () {
        renderArticles(filterCategory.value, searchInput.value);
    });

    searchButton.addEventListener("click", function () {
        renderArticles(filterCategory.value, searchInput.value);
    });

    renderArticles();
    fetchSuggestions();
});
