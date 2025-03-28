const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

const ArticleSchema = new mongoose.Schema({
  title: String,
  category: String,
  content: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  comments: [
    {
      commentId: String,
      author: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});
const Article = mongoose.model("Article", ArticleSchema);

const Suggestion = mongoose.model("Suggestion", new mongoose.Schema({
    keyword: String,
    suggestion: String,
    createdAt: { type: Date, default: Date.now }
}));

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (await User.findOne({ username })) {
        return res.status(400).json({ message: "المستخدم موجود بالفعل" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "تم إنشاء الحساب بنجاح" });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "مطلوب تسجيل الدخول" });
    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "التوكن غير صالح" });
        req.user = user;
        next();
    });
}

app.get("/articles", async (req, res) => {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
});

app.post("/articles", authenticateToken, async (req, res) => {
    const { title, category, content } = req.body;
    const newArticle = new Article({ title, category, content, author: req.user.username });
    await newArticle.save();
    res.status(201).json(newArticle);
});

app.get("/articles/:id", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "لم يتم العثور على المقال" });
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء جلب المقال" });
    }
});

app.put("/articles/:id", authenticateToken, async (req, res) => {
    try {
        const updated = await Article.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "❌ لم يتم العثور على المقال لتعديله" });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ في تعديل المقال" });
    }
});

app.delete("/articles/:id", authenticateToken, async (req, res) => {
    try {
        const deleted = await Article.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "❌ لم يتم العثور على المقال لحذفه" });
        res.json({ message: "✅ تم حذف المقال بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ في حذف المقال" });
    }
});

app.post("/articles/:id/rate", async (req, res) => {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "⚠️ التقييم غير صالح" });
    }
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "❌ لم يتم العثور على المقال" });
        const totalRating = article.rating * article.ratingCount;
        article.ratingCount += 1;
        article.rating = (totalRating + rating) / article.ratingCount;
        await article.save();
        res.json({ message: "✅ تم حفظ تقييمك بنجاح" });
    } catch (err) {
        res.status(500).json({ message: "❌ خطأ في حفظ التقييم" });
    }
});

app.get("/suggestions", async (req, res) => {
    try {
        const suggestions = await Suggestion.find().sort({ createdAt: -1 });
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: "خطأ في جلب الاقتراحات" });
    }
});

app.get("/stats/articles", async (req, res) => {
    try {
        const stats = await Article.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "فشل في تحليل المقالات" });
    }
});

app.get("/stats/monthly", async (req, res) => {
    try {
        const monthlyStats = await Article.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        res.json(monthlyStats);
    } catch (error) {
        res.status(500).json({ message: "فشل في تحليل المقالات حسب الشهر" });
    }
});

app.get("/articles/:id/comments", async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "❌ لم يتم العثور على المقال" });
        res.json(article.comments || []);
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ في جلب التعليقات" });
    }
});

app.post("/articles/:id/comments", async (req, res) => {
    const { author, text, commentId } = req.body;
    if (!author || !text || !commentId) {
        return res.status(400).json({ message: "❌ الاسم والنص ومعرف التعليق مطلوبون" });
    }
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: "❌ لم يتم العثور على المقال" });
        article.comments.push({ commentId, author, text });
        await article.save();
        res.json({ message: "✅ تم إضافة التعليق بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "❌ خطأ أثناء حفظ التعليق" });
    }
});

app.delete("/articles/:id/comments/:commentId", async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ message: "❌ المقال غير موجود" });
        article.comments = article.comments.filter(comment => comment.commentId !== commentId);
        await article.save();
        res.json({ message: "✅ تم حذف التعليق بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "❌ فشل في حذف التعليق" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});