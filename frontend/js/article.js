document.addEventListener("DOMContentLoaded", function () {
    const API_BASE = "https://info-eye.onrender.com";
    const articleContainer = document.getElementById("articleContainer");
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get("id");

    function renderArticle(article) {
        if (article) {
            articleContainer.innerHTML = `
                <h2>${article.title}</h2>
                <p><strong>التصنيف:</strong> ${article.category}</p>
                <p>${article.content}</p>
                <p>⭐ ${article.rating?.toFixed(1) || "0"} من 5 (${article.ratingCount || 0} تقييم)</p>
                <div id="ratingStars">
                    <p>قيّم هذا المقال:</p>
                    ${[1, 2, 3, 4, 5].map(star => `<span data-star="${star}" style="cursor:pointer;font-size:24px;">⭐</span>`).join('')}
                </div>
                <div class="share-buttons">
                    <button onclick="shareArticle('facebook')">مشاركة على فيسبوك</button>
                    <button onclick="shareArticle('twitter')">مشاركة على تويتر</button>
                    <button onclick="shareArticle('linkedin')">مشاركة على لينكدإن</button>
                </div>
            `;

            document.querySelectorAll("#ratingStars span").forEach(star => {
                star.addEventListener("click", () => {
                    const ratingValue = parseInt(star.getAttribute("data-star"));
                    fetch(`${API_BASE}/articles/${articleId}/rate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ rating: ratingValue })
                    })
                        .then(res => res.json())
                        .then(data => {
                            alert(data.message);
                            location.reload();
                        })
                        .catch(() => alert("❌ حدث خطأ أثناء إرسال التقييم"));
                });
            });
        } else {
            articleContainer.innerHTML = "<p>❌ لم يتم العثور على المقال.</p>";
        }
    }

    function fetchArticleFromServer() {
        fetch(`${API_BASE}/articles/${articleId}`)
            .then(res => {
                if (!res.ok) throw new Error("Not Found");
                return res.json();
            })
            .then(data => renderArticle(data))
            .catch(() => {
                articleContainer.innerHTML = "<p>❌ فشل في تحميل المقال من الخادم.</p>";
            });
    }

    function shareArticle(platform) {
        const url = window.location.href;
        let shareUrl = "";

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
        }
        window.open(shareUrl, "_blank");
    }

    fetchArticleFromServer();
});