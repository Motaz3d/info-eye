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

    let articles = [];

    function renderArticles(categoryFilter = "all", searchQuery = "") {
        articlesContainer.innerHTML = "";
        articles.forEach(article => {
            if ((categoryFilter === "all" || article.category === categoryFilter) &&
                (searchQuery === "" || article.title.toLowerCase().includes(searchQuery.toLowerCase()))) {

                const commentsCount = article.comments ? article.comments.length : 0;

                const articleElement = document.createElement("div");
                articleElement.classList.add("article");
                articleElement.innerHTML = `
                    <h3>${article.title}</h3>
                    <p><strong>التصنيف:</strong> ${article.category}</p>
                    <p><strong>عدد التعليقات:</strong> 💬 ${commentsCount}</p>
                    <button class="editArticle" data-id="${article._id}">تعديل</button>
                    <button class="deleteArticle" data-id="${article._id}">حذف</button>
                    <button class="viewComments" data-id="${article._id}">عرض التعليقات</button>
                `;
                articlesContainer.appendChild(articleElement);
            }
        });

        document.querySelectorAll(".editArticle").forEach(button => {
            button.addEventListener("click", function () {
                const articleId = this.getAttribute("data-id");
                editArticle(articleId);
            });
        });

        document.querySelectorAll(".deleteArticle").forEach(button => {
            button.addEventListener("click", function () {
                const articleId = this.getAttribute("data-id");
                deleteArticle(articleId);
            });
        });

        document.querySelectorAll(".viewComments").forEach(button => {
            button.addEventListener("click", function () {
                const articleId = this.getAttribute("data-id");
                fetch(`${API_BASE}/articles/${articleId}/comments`)
                    .then(res => res.json())
                    .then(comments => {
                        if (comments.length === 0) {
                            alert("لا توجد تعليقات على هذا المقال.");
                            return;
                        }
                        let output = "🗨️ التعليقات:\n\n";
                        comments.forEach(comment => {
                            output += `👤 ${comment.author}\n📝 ${comment.text}\n🗑️ ID: ${comment.commentId}\n\n`;
                        });
                        const toDelete = prompt(output + "\n\nاكتب ID التعليق الذي تريد حذفه (أو اتركه فارغًا للإلغاء):");
                        if (toDelete) {
                            fetch(`${API_BASE}/articles/${articleId}/comments/${toDelete}`, {
                                method: "DELETE"
                            })
                                .then(res => res.json())
                                .then(data => {
                                    alert(data.message);
                                    fetchArticles();
                                });
                        }
                    });
            });
        });
    }

    function fetchArticles() {
        fetch(`${API_BASE}/articles`)
            .then(res => res.json())
            .then(data => {
                articles = data;
                renderArticles();
            })
            .catch(() => {
                articlesContainer.innerHTML = "<p>❌ فشل في تحميل المقالات.</p>";
            });
    }

    function fetchSuggestions() {
        fetch(`${API_BASE}/suggestions`)
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

    function editArticle(id) {
        const article = articles.find(a => a._id === id);
        if (article) {
            articleTitle.value = article.title;
            articleCategory.value = article.category;
            articleContent.value = article.content;
            articleModal.style.display = "block";

            articleForm.onsubmit = function (event) {
                event.preventDefault();
                if (!validateInput(articleTitle.value, articleCategory.value, articleContent.value)) return;
                fetch(`${API_BASE}/articles/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: articleTitle.value,
                        category: articleCategory.value,
                        content: articleContent.value
                    })
                })
                    .then(res => res.json())
                    .then(() => {
                        articleModal.style.display = "none";
                        fetchArticles();
                    });
            };
        }
    }

    function deleteArticle(id) {
        if (!confirm("هل أنت متأكد من أنك تريد حذف هذا المقال؟")) return;
        fetch(`${API_BASE}/articles/${id}`, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(() => fetchArticles());
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

        articleForm.onsubmit = function (event) {
            event.preventDefault();
            if (!validateInput(articleTitle.value, articleCategory.value, articleContent.value)) return;
            fetch(`${API_BASE}/articles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    title: articleTitle.value,
                    category: articleCategory.value,
                    content: articleContent.value
                })
            })
                .then(res => res.json())
                .then(() => {
                    articleModal.style.display = "none";
                    fetchArticles();
                });
        };
    });

    closeModal.addEventListener("click", function () {
        articleModal.style.display = "none";
    });

    cancelModal?.addEventListener("click", function () {
        articleModal.style.display = "none";
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && articleModal.style.display === "block") {
            articleModal.style.display = "none";
        }
    });

    filterCategory.addEventListener("change", function () {
        renderArticles(filterCategory.value, searchInput.value);
    });

    searchButton?.addEventListener("click", function () {
        renderArticles(filterCategory.value, searchInput.value);
    });

    fetchArticles();
    fetchSuggestions();
});
