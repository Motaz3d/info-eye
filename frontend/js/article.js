document.addEventListener("DOMContentLoaded", function () {
    const articleContainer = document.getElementById("articleContainer");
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get("id");

    function renderArticle(article) {
        if (article) {
            articleContainer.innerHTML = `
                <h2>${article.title}</h2>
                <p><strong>التصنيف:</strong> ${article.category}</p>
                <p>${article.content}</p>
                <div class="share-buttons">
                    <button onclick="shareArticle('facebook')">مشاركة على فيسبوك</button>
                    <button onclick="shareArticle('twitter')">مشاركة على تويتر</button>
                    <button onclick="shareArticle('linkedin')">مشاركة على لينكدإن</button>
                </div>
            `;
        } else {
            articleContainer.innerHTML = "<p>❌ لم يتم العثور على المقال.</p>";
        }
    }

    function fetchArticleFromServer() {
        fetch(`http://localhost:3000/articles/${articleId}`)
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


// ✅ الجزء الخلفي: server.js - إضافة نموذج التعليق ونقاط النهاية

const CommentSchema = new mongoose.Schema({
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
    username: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.model("Comment", CommentSchema);

// 🟢 نقطة لإضافة تعليق على مقال معين
app.post("/articles/:id/comments", async (req, res) => {
    const { username, text } = req.body;
    try {
        const comment = new Comment({
            articleId: req.params.id,
            username,
            text
        });
        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: "فشل في إضافة التعليق" });
    }
});

// 🟢 نقطة لجلب التعليقات لمقال معين
app.get("/articles/:id/comments", async (req, res) => {
    try {
        const comments = await Comment.find({ articleId: req.params.id }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: "فشل في جلب التعليقات" });
    }
});

// 🔄 تحديث article.js لإضافة نظام التعليقات

document.addEventListener("DOMContentLoaded", function () {
    const articleContainer = document.getElementById("articleContainer");
    const commentsContainer = document.getElementById("commentsContainer");
    const commentForm = document.getElementById("commentForm");
    const commentInput = document.getElementById("commentText");
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get("id");

    function renderArticle(article) {
        articleContainer.innerHTML = `
            <h2>${article.title}</h2>
            <p><strong>التصنيف:</strong> ${article.category}</p>
            <p>${article.content}</p>
        `;
    }

    function renderComments(comments) {
        commentsContainer.innerHTML = "";
        if (comments.length === 0) {
            commentsContainer.innerHTML = "<p>لا توجد تعليقات بعد.</p>";
            return;
        }
        comments.forEach(comment => {
            const div = document.createElement("div");
            div.className = "comment";
            div.innerHTML = `
                <p><strong>${comment.author}</strong>:</p>
                <p>${comment.text}</p>
            `;
            commentsContainer.appendChild(div);
        });
    }

    function fetchArticleAndComments() {
        fetch(`http://localhost:3000/articles/${articleId}`)
            .then(res => res.json())
            .then(data => {
                renderArticle(data);
                fetchComments();
            })
            .catch(() => {
                articleContainer.innerHTML = "<p>❌ فشل في تحميل المقال.</p>";
            });
    }

    function fetchComments() {
        fetch(`http://localhost:3000/articles/${articleId}/comments`)
            .then(res => res.json())
            .then(data => renderComments(data))
            .catch(() => {
                commentsContainer.innerHTML = "<p>❌ فشل في تحميل التعليقات.</p>";
            });
    }

    commentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const commentText = commentInput.value.trim();
        if (!commentText) return;

        fetch(`http://localhost:3000/articles/${articleId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ author: "زائر مجهول", text: commentText })
        })
            .then(res => res.json())
            .then(() => {
                commentInput.value = "";
                fetchComments();
            });
    });

    fetchArticleAndComments();
});
