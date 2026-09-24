const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "lucous-development-secret";

// Allow the LUCOUS Next.js frontend to communicate with the backend
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Express 5 equivalent of app.options("*", cors())
app.options("/*splat", cors());

app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "LUCOUS backend is running",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    const validRoles = ["STUDENT", "PARENT", "TEACHER", "ADMIN"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// ----------------------------- Auth guards --------------------------------

function verifyRole(req, res, next, expectedRole) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.role !== expectedRole) {
      return res
        .status(403)
        .json({ success: false, message: `${expectedRole.toLowerCase()} access only` });
    }

    req.userId = payload.userId;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

function requireStudent(req, res, next) {
  return verifyRole(req, res, next, "STUDENT");
}

function requireTeacher(req, res, next) {
  return verifyRole(req, res, next, "TEACHER");
}

// ------------------------- Student MVP endpoints --------------------------
// Data-driven: Board -> Grade (Class) -> Subject -> Chapter -> Topic.
// Nothing here is hardcoded to a specific board/class/subject.

const ATTEMPT_MODES = ["PLAY", "PRACTICE", "TEST", "RETEST"];

app.get("/api/student/boards", requireStudent, async (req, res) => {
  try {
    const boards = await prisma.board.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, boards });
  } catch (error) {
    console.error("Boards error:", error);
    res.status(500).json({ success: false, message: "Failed to load boards" });
  }
});

app.get("/api/student/classes", requireStudent, async (req, res) => {
  try {
    const boardId = Number(req.query.boardId);
    const where = boardId ? { subjects: { some: { boardId } } } : {};
    const classes = await prisma.grade.findMany({
      where,
      orderBy: { name: "asc" },
    });
    res.json({ success: true, classes });
  } catch (error) {
    console.error("Classes error:", error);
    res.status(500).json({ success: false, message: "Failed to load classes" });
  }
});

app.get("/api/student/subjects", requireStudent, async (req, res) => {
  try {
    const boardId = Number(req.query.boardId);
    const gradeId = Number(req.query.gradeId);
    const where = {};
    if (boardId) where.boardId = boardId;
    if (gradeId) where.gradeId = gradeId;

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { chapters: true } },
        board: { select: { name: true } },
        grade: { select: { name: true } },
      },
    });
    res.json({ success: true, subjects });
  } catch (error) {
    console.error("Subjects error:", error);
    res.status(500).json({ success: false, message: "Failed to load subjects" });
  }
});

app.get("/api/student/chapters", requireStudent, async (req, res) => {
  try {
    const subjectId = Number(req.query.subjectId);
    if (!subjectId) {
      return res
        .status(400)
        .json({ success: false, message: "subjectId is required" });
    }
    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { id: "asc" },
      include: { _count: { select: { topics: true } } },
    });
    res.json({ success: true, chapters });
  } catch (error) {
    console.error("Chapters error:", error);
    res.status(500).json({ success: false, message: "Failed to load chapters" });
  }
});

app.get("/api/student/topics", requireStudent, async (req, res) => {
  try {
    const chapterId = Number(req.query.chapterId);
    if (!chapterId) {
      return res
        .status(400)
        .json({ success: false, message: "chapterId is required" });
    }
    const topics = await prisma.topic.findMany({
      where: { chapterId },
      orderBy: { id: "asc" },
      include: { _count: { select: { questions: true, contents: true } } },
    });
    res.json({ success: true, topics });
  } catch (error) {
    console.error("Topics error:", error);
    res.status(500).json({ success: false, message: "Failed to load topics" });
  }
});

app.get("/api/student/content", requireStudent, async (req, res) => {
  try {
    const topicId = Number(req.query.topicId);
    if (!topicId) {
      return res
        .status(400)
        .json({ success: false, message: "topicId is required" });
    }

    const contents = await prisma.learningContent.findMany({
      where: { topicId, status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, topicId: true, title: true, body: true, order: true },
    });

    const progress = await prisma.studentProgress.findMany({
      where: {
        userId: req.userId,
        contentId: { in: contents.map((c) => c.id) },
      },
      select: { contentId: true },
    });

    res.json({
      success: true,
      contents,
      completedIds: progress.map((p) => p.contentId),
    });
  } catch (error) {
    console.error("Content error:", error);
    res.status(500).json({ success: false, message: "Failed to load content" });
  }
});

app.get("/api/student/questions", requireStudent, async (req, res) => {
  try {
    const topicId = Number(req.query.topicId);
    const limit = Math.min(Number(req.query.limit) || 10, 30);
    if (!topicId) {
      return res
        .status(400)
        .json({ success: false, message: "topicId is required" });
    }

    // The correct answer is never sent to the client.
    const questions = await prisma.question.findMany({
      where: { topicId, status: "PUBLISHED" },
      take: limit,
      select: {
        id: true,
        text: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
      },
    });

    res.json({ success: true, questions });
  } catch (error) {
    console.error("Questions error:", error);
    res.status(500).json({ success: false, message: "Failed to load questions" });
  }
});

// Immediate feedback for Play mode (single question).
app.post("/api/student/check", requireStudent, async (req, res) => {
  try {
    const { questionId, selected } = req.body;
    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
    });
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }
    res.json({
      success: true,
      correct: Number(selected) === question.correct,
      correctIndex: question.correct,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Check error:", error);
    res.status(500).json({ success: false, message: "Failed to check answer" });
  }
});

// Server-side grading; the client never decides the score.
app.post("/api/student/attempts", requireStudent, async (req, res) => {
  try {
    const { topicId, mode, answers } = req.body;

    if (!ATTEMPT_MODES.includes(mode)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid attempt mode" });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "answers are required" });
    }

    const questions = await prisma.question.findMany({
      where: {
        topicId: Number(topicId),
        id: { in: answers.map((a) => Number(a.questionId)) },
      },
    });

    const byId = new Map(questions.map((q) => [q.id, q]));
    let correctCount = 0;

    const perQuestion = answers.map((a) => {
      const question = byId.get(Number(a.questionId));
      const correctIndex = question ? question.correct : null;
      const wasCorrect =
        question !== undefined && Number(a.selected) === question.correct;
      if (wasCorrect) correctCount += 1;
      return {
        questionId: Number(a.questionId),
        selected: Number(a.selected),
        correctIndex,
        wasCorrect,
        explanation: question ? question.explanation : null,
      };
    });

    const total = perQuestion.length;
    const score = total > 0 ? Math.round((correctCount / total) * 10000) / 100 : 0;

    const attempt = await prisma.attempt.create({
      data: {
        userId: req.userId,
        topicId: Number(topicId),
        mode,
        correct: correctCount,
        total,
        score,
      },
    });

    res.status(201).json({ success: true, attempt, perQuestion });
  } catch (error) {
    console.error("Attempt error:", error);
    res.status(500).json({ success: false, message: "Failed to save attempt" });
  }
});

app.get("/api/student/results", requireStudent, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            chapter: { select: { id: true, name: true } },
          },
        },
      },
    });
    res.json({ success: true, attempts });
  } catch (error) {
    console.error("Results error:", error);
    res.status(500).json({ success: false, message: "Failed to load results" });
  }
});

// Simple rule: latest attempt per topic below 60% = weak topic.
app.get("/api/student/weak-topics", requireStudent, async (req, res) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            chapter: { select: { id: true, name: true } },
          },
        },
      },
    });

    const latestByTopic = new Map();
    for (const attempt of attempts) {
      if (!latestByTopic.has(attempt.topicId)) {
        latestByTopic.set(attempt.topicId, attempt);
      }
    }

    const weakTopics = [...latestByTopic.values()]
      .filter((a) => a.score < 60)
      .map((a) => ({
        topicId: a.topic.id,
        topicName: a.topic.name,
        chapterName: a.topic.chapter.name,
        score: a.score,
        action:
          a.mode === "PRACTICE" || a.mode === "RETEST" ? "Retest" : "Practice",
      }));

    res.json({ success: true, weakTopics });
  } catch (error) {
    console.error("Weak topics error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load weak topics" });
  }
});

app.post("/api/student/progress", requireStudent, async (req, res) => {
  try {
    const { contentId } = req.body;
    const content = await prisma.learningContent.findUnique({
      where: { id: Number(contentId) },
    });
    if (!content) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    }
    await prisma.studentProgress.upsert({
      where: {
        userId_contentId: { userId: req.userId, contentId: Number(contentId) },
      },
      update: {},
      create: { userId: req.userId, contentId: Number(contentId) },
    });
    res.json({ success: true, message: "Progress saved" });
  } catch (error) {
    console.error("Progress error:", error);
    res.status(500).json({ success: false, message: "Failed to save progress" });
  }
});

app.get("/api/student/progress", requireStudent, async (req, res) => {
  try {
    const [completedCount, totalContent] = await Promise.all([
      prisma.studentProgress.count({ where: { userId: req.userId } }),
      prisma.learningContent.count({ where: { status: "PUBLISHED" } }),
    ]);
    res.json({ success: true, completedCount, totalContent });
  } catch (error) {
    console.error("Progress error:", error);
    res.status(500).json({ success: false, message: "Failed to load progress" });
  }
});

// ------------------- Teacher content-pipeline foundation --------------------
// Metadata-only today. Real file storage + AI processing plug in later via the
// MaterialStatus / ContentStatus workflow. AI/teacher content is never
// auto-published: it starts as a draft for teacher review.

const MATERIAL_STATUSES = ["UPLOADED", "PROCESSING", "ANALYZED", "READY", "FAILED"];
const CONTENT_STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED"];
const CONTENT_SOURCES = ["TEACHER", "UPLOADED", "AI"];

app.get("/api/teacher/materials", requireTeacher, async (req, res) => {
  try {
    const materials = await prisma.uploadedMaterial.findMany({
      where: { teacherId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { name: true } },
        chapter: { select: { name: true } },
        topic: { select: { name: true } },
      },
    });
    res.json({ success: true, materials });
  } catch (error) {
    console.error("Teacher materials error:", error);
    res.status(500).json({ success: false, message: "Failed to load materials" });
  }
});

app.post("/api/teacher/materials", requireTeacher, async (req, res) => {
  try {
    const {
      originalName,
      fileType,
      fileSize,
      boardId,
      gradeId,
      subjectId,
      chapterId,
      topicId,
      status,
    } = req.body;

    if (!originalName || !fileType || fileSize === undefined) {
      return res.status(400).json({
        success: false,
        message: "originalName, fileType and fileSize are required",
      });
    }

    const material = await prisma.uploadedMaterial.create({
      data: {
        teacherId: req.userId,
        originalName,
        fileType,
        fileSize: Number(fileSize),
        boardId: boardId ? Number(boardId) : null,
        gradeId: gradeId ? Number(gradeId) : null,
        subjectId: subjectId ? Number(subjectId) : null,
        chapterId: chapterId ? Number(chapterId) : null,
        topicId: topicId ? Number(topicId) : null,
        status: MATERIAL_STATUSES.includes(status) ? status : "UPLOADED",
      },
    });

    res.status(201).json({ success: true, material });
  } catch (error) {
    console.error("Teacher material create error:", error);
    res.status(500).json({ success: false, message: "Failed to save material" });
  }
});

app.get("/api/teacher/content", requireTeacher, async (req, res) => {
  try {
    const where = { authorId: req.userId };
    if (req.query.status && CONTENT_STATUSES.includes(req.query.status)) {
      where.status = req.query.status;
    }
    const content = await prisma.learningContent.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        topic: {
          select: { name: true, chapter: { select: { name: true } } },
        },
      },
    });
    res.json({ success: true, content });
  } catch (error) {
    console.error("Teacher content error:", error);
    res.status(500).json({ success: false, message: "Failed to load content" });
  }
});

app.post("/api/teacher/content", requireTeacher, async (req, res) => {
  try {
    const { topicId, title, body, source, status, order } = req.body;

    if (!topicId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "topicId, title and body are required",
      });
    }

    const topic = await prisma.topic.findUnique({
      where: { id: Number(topicId) },
    });
    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found" });
    }

    const content = await prisma.learningContent.create({
      data: {
        topicId: Number(topicId),
        title,
        body,
        order: order !== undefined ? Number(order) : 0,
        source: CONTENT_SOURCES.includes(source) ? source : "TEACHER",
        // Never auto-publish: new content awaits teacher review.
        status: CONTENT_STATUSES.includes(status) ? status : "DRAFT",
        authorId: req.userId,
      },
    });

    res.status(201).json({ success: true, content });
  } catch (error) {
    console.error("Teacher content create error:", error);
    res.status(500).json({ success: false, message: "Failed to save content" });
  }
});

app.listen(PORT, () => {
  console.log(`LUCOUS backend running on http://localhost:${PORT}`);
});
