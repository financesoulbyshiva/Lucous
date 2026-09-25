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
    await prisma.$runCommandRaw({ ping: 1 });

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

// Register (shared handler; role-specific routes force the role)
const VALID_ROLES = ["STUDENT", "PARENT", "TEACHER", "ADMIN"];

async function registerUser(req, res, forcedRole) {
  try {
    const { name, email, password } = req.body;
    const role = forcedRole || req.body.role;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    if (!VALID_ROLES.includes(role)) {
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
}

app.post("/api/auth/register", (req, res) => registerUser(req, res, null));
app.post("/api/auth/register/student", (req, res) => registerUser(req, res, "STUDENT"));
app.post("/api/auth/register/teacher", (req, res) => registerUser(req, res, "TEACHER"));
app.post("/api/auth/register/parent", (req, res) => registerUser(req, res, "PARENT"));

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

// Current user
app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ success: false, message: "Failed to load user" });
  }
});

// Logout (JWT is stateless; no blacklist needed)
app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

// ------------------------------- OTP ----------------------------------------
// Development-safe: no SMTP configured, so the OTP is logged to the console and
// returned in the response ONLY when NODE_ENV is not "production".

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function isDev() {
  return (process.env.NODE_ENV || "development") !== "production";
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function issueOtp(email, purpose, userId) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Invalidate any previous unused OTPs for this email + purpose.
  await prisma.otp.deleteMany({
    where: { email, purpose, verified: false },
  });

  await prisma.otp.create({
    data: { email, code, purpose, expiresAt, userId: userId ?? null },
  });

  console.log(`[OTP] ${purpose} code for ${email}: ${code} (expires ${expiresAt.toISOString()})`);
  return code;
}

app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otpPurpose = purpose === "RESET" ? "RESET" : "VERIFY";
    const user = await prisma.user.findUnique({ where: { email } });
    const code = await issueOtp(email, otpPurpose, user ? user.id : null);

    res.json({
      success: true,
      message: "OTP sent",
      ...(isDev() ? { otp: code } : {}),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Email and code are required" });
    }

    const otp = await prisma.otp.findFirst({
      where: {
        email,
        code: String(code),
        purpose: "VERIFY",
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } });

    if (otp.userId) {
      await prisma.user.update({
        where: { id: otp.userId },
        data: { isVerified: true },
      });
    }

    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
});

// --------------------------- Password reset ---------------------------------

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const generic = {
      success: true,
      message: "If an account exists for that email, an OTP has been sent",
    };

    if (!user) {
      // Do not reveal whether the email exists.
      return res.json(generic);
    }

    const code = await issueOtp(email, "RESET", user.id);
    res.json({ ...generic, ...(isDev() ? { otp: code } : {}) });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, code and newPassword are required",
      });
    }

    const otp = await prisma.otp.findFirst({
      where: {
        email,
        code: String(code),
        purpose: "RESET",
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!otp || !user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidate the OTP after a successful reset.
    await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } });

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
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

// General JWT auth: verifies the Bearer token and attaches userId + role.
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

// Role gate built on authenticate.
function requireRole(...roles) {
  return (req, res, next) =>
    authenticate(req, res, () => {
      if (!roles.includes(req.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      next();
    });
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
    const boardId = req.query.boardId;
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
    const boardId = req.query.boardId;
    const gradeId = req.query.gradeId;
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
    const subjectId = req.query.subjectId;
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
    const chapterId = req.query.chapterId;
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
    const topicId = req.query.topicId;
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
    const topicId = req.query.topicId;
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
      where: { id: String(questionId) },
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
        topicId: String(topicId),
        id: { in: answers.map((a) => String(a.questionId)) },
      },
    });

    const byId = new Map(questions.map((q) => [q.id, q]));
    let correctCount = 0;

    const perQuestion = answers.map((a) => {
      const question = byId.get(String(a.questionId));
      const correctIndex = question ? question.correct : null;
      const wasCorrect =
        question !== undefined && Number(a.selected) === question.correct;
      if (wasCorrect) correctCount += 1;
      return {
        questionId: String(a.questionId),
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
        topicId: String(topicId),
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
      where: { id: String(contentId) },
    });
    if (!content) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    }
    await prisma.studentProgress.upsert({
      where: {
        userId_contentId: { userId: req.userId, contentId: String(contentId) },
      },
      update: {},
      create: { userId: req.userId, contentId: String(contentId) },
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
        boardId: boardId || null,
        gradeId: gradeId || null,
        subjectId: subjectId || null,
        chapterId: chapterId || null,
        topicId: topicId || null,
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
      where: { id: String(topicId) },
    });
    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found" });
    }

    const content = await prisma.learningContent.create({
      data: {
        topicId: String(topicId),
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

// ------------------------------- Courses ------------------------------------
// Only an authenticated TEACHER can create a course; teacherId always comes
// from the JWT, never the request body. Any authenticated user can view.

app.post("/api/courses", requireRole("TEACHER"), async (req, res) => {
  try {
    const { title, description, subject, board } = req.body;

    if (!title || !description || !subject || !board) {
      return res.status(400).json({
        success: false,
        message: "title, description, subject and board are required",
      });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        subject,
        board,
        teacherId: req.userId,
      },
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("Course create error:", error);
    res.status(500).json({ success: false, message: "Failed to create course" });
  }
});

app.get("/api/courses", authenticate, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("Courses list error:", error);
    res.status(500).json({ success: false, message: "Failed to load courses" });
  }
});

app.get("/api/courses/:id", authenticate, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, course });
  } catch (error) {
    console.error("Course detail error:", error);
    res.status(500).json({ success: false, message: "Failed to load course" });
  }
});

// ----------------------------- Enrollment -----------------------------------
// studentId always comes from the JWT, so a user cannot impersonate another
// student. Duplicate enrollment is prevented by the courseId+studentId unique.

app.post("/api/enrollments", requireRole("STUDENT"), async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "courseId is required" });
    }

    const course = await prisma.course.findUnique({
      where: { id: String(courseId) },
    });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: { courseId: String(courseId), studentId: req.userId },
      },
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Already enrolled in this course" });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: String(courseId),
        studentId: req.userId,
        teacherId: course.teacherId,
        status: "ENROLLED",
      },
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({ success: false, message: "Failed to enroll" });
  }
});

app.get("/api/enrollments/my", requireRole("STUDENT"), async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: { teacher: { select: { id: true, name: true } } },
        },
      },
    });
    res.json({ success: true, enrollments });
  } catch (error) {
    console.error("My enrollments error:", error);
    res.status(500).json({ success: false, message: "Failed to load enrollments" });
  }
});

app.get("/api/teacher/enrollments", requireRole("TEACHER"), async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { teacherId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, subject: true, board: true } },
      },
    });
    res.json({ success: true, enrollments });
  } catch (error) {
    console.error("Teacher enrollments error:", error);
    res.status(500).json({ success: false, message: "Failed to load enrollments" });
  }
});

app.listen(PORT, () => {
  console.log(`LUCOUS backend running on http://localhost:${PORT}`);
});
