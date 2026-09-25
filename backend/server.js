require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
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

// Capture the raw body so the Razorpay webhook can verify its HMAC signature.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

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
        phone: req.body.phone || null,
        grade: req.body.grade || null,
        board: req.body.board || null,
        school: req.body.school || null,
        subject: req.body.subject || null,
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
        phone: user.phone,
        grade: user.grade,
        board: user.board,
        school: user.school,
        subject: user.subject,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ success: false, message: "Failed to load user" });
  }
});

// Update the authenticated user's own profile (never the role or password).
app.patch("/api/auth/profile", authenticate, async (req, res) => {
  try {
    const allowed = ["name", "phone", "grade", "board", "school", "subject", "avatarUrl"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        grade: true, board: true, school: true, subject: true, avatarUrl: true, xp: true,
      },
    });
    res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
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
    const { title, description, subject, board, price } = req.body;

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
        price: price !== undefined ? Math.max(0, Number(price) || 0) : 0,
        teacherId: req.userId,
      },
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("Course create error:", error);
    res.status(500).json({ success: false, message: "Failed to create course" });
  }
});

// Edit a course — only its owning teacher (or an admin) may update it.
app.put("/api/courses/:id", authenticate, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (req.role !== "ADMIN" && course.teacherId !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = ["title", "description", "subject", "board", "price"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = key === "price" ? Math.max(0, Number(req.body[key]) || 0) : req.body[key];
      }
    }

    const updated = await prisma.course.update({ where: { id: course.id }, data });
    res.json({ success: true, course: updated });
  } catch (error) {
    console.error("Course update error:", error);
    res.status(500).json({ success: false, message: "Failed to update course" });
  }
});

// A teacher's own courses.
app.get("/api/teacher/courses", requireRole("TEACHER"), async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { teacherId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { enrollments: true } } },
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("Teacher courses error:", error);
    res.status(500).json({ success: false, message: "Failed to load courses" });
  }
});

// Students enrolled across this teacher's courses, with a progress snapshot.
app.get("/api/teacher/students", requireRole("TEACHER"), async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { teacherId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true, grade: true, board: true } },
        course: { select: { id: true, title: true, subject: true } },
      },
    });

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];
    const attempts = await prisma.attempt.findMany({
      where: { userId: { in: studentIds } },
      select: { userId: true, score: true },
    });

    const byStudent = new Map();
    for (const a of attempts) {
      const list = byStudent.get(a.userId) || [];
      list.push(a.score);
      byStudent.set(a.userId, list);
    }

    const students = studentIds.map((id) => {
      const scores = byStudent.get(id) || [];
      const avg =
        scores.length > 0
          ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 100) / 100
          : 0;
      const enr = enrollments.find((e) => e.studentId === id);
      return {
        id,
        name: enr?.student.name,
        email: enr?.student.email,
        grade: enr?.student.grade,
        board: enr?.student.board,
        attempts: scores.length,
        averageScore: avg,
        courses: enrollments.filter((e) => e.studentId === id).map((e) => e.course.title),
      };
    });

    res.json({ success: true, students });
  } catch (error) {
    console.error("Teacher students error:", error);
    res.status(500).json({ success: false, message: "Failed to load students" });
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

// ------------------------------- Admin ------------------------------------
// Every admin endpoint requires the ADMIN role.

app.get("/api/admin/stats", requireRole("ADMIN"), async (req, res) => {
  try {
    const [users, students, teachers, parents, admins, courses, enrollments, attempts, questions] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.user.count({ where: { role: "PARENT" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.attempt.count(),
        prisma.question.count(),
      ]);
    res.json({
      success: true,
      stats: { users, students, teachers, parents, admins, courses, enrollments, attempts, questions },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: "Failed to load stats" });
  }
});

app.get("/api/admin/users", requireRole("ADMIN"), async (req, res) => {
  try {
    const where = {};
    if (req.query.role && VALID_ROLES.includes(req.query.role)) {
      where.role = req.query.role;
    }
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, name: true, email: true, role: true, isVerified: true,
        grade: true, board: true, school: true, subject: true, xp: true, createdAt: true,
      },
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
});

app.get("/api/admin/courses", requireRole("ADMIN"), async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("Admin courses error:", error);
    res.status(500).json({ success: false, message: "Failed to load courses" });
  }
});

// ------------------------------- Parent -----------------------------------
// A parent may only view data for students explicitly linked to them.

app.post("/api/parent/link", requireRole("PARENT"), async (req, res) => {
  try {
    const { studentEmail } = req.body;
    if (!studentEmail) {
      return res.status(400).json({ success: false, message: "studentEmail is required" });
    }
    const student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student || student.role !== "STUDENT") {
      return res.status(404).json({ success: false, message: "No student found for that email" });
    }
    await prisma.parentChild.upsert({
      where: { parentId_studentId: { parentId: req.userId, studentId: student.id } },
      update: {},
      create: { parentId: req.userId, studentId: student.id },
    });
    res.json({
      success: true,
      message: "Student linked",
      child: { id: student.id, name: student.name, email: student.email, grade: student.grade, board: student.board },
    });
  } catch (error) {
    console.error("Parent link error:", error);
    res.status(500).json({ success: false, message: "Failed to link student" });
  }
});

app.get("/api/parent/children", requireRole("PARENT"), async (req, res) => {
  try {
    const links = await prisma.parentChild.findMany({
      where: { parentId: req.userId },
      include: {
        student: { select: { id: true, name: true, email: true, grade: true, board: true } },
      },
    });
    res.json({ success: true, children: links.map((l) => l.student) });
  } catch (error) {
    console.error("Parent children error:", error);
    res.status(500).json({ success: false, message: "Failed to load children" });
  }
});

async function assertParentAccess(req, res, studentId) {
  const link = await prisma.parentChild.findUnique({
    where: { parentId_studentId: { parentId: req.userId, studentId } },
  });
  if (!link) {
    res.status(403).json({ success: false, message: "Not authorized for this student" });
    return false;
  }
  return true;
}

app.get("/api/parent/child/:id/overview", requireRole("PARENT"), async (req, res) => {
  try {
    const studentId = req.params.id;
    if (!(await assertParentAccess(req, res, studentId))) return;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, grade: true, board: true, xp: true },
    });

    const [completedCount, attempts] = await Promise.all([
      prisma.studentProgress.count({ where: { userId: studentId } }),
      prisma.attempt.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { topic: { select: { id: true, name: true, chapter: { select: { name: true } } } } },
      }),
    ]);

    const latestByTopic = new Map();
    for (const a of attempts) {
      if (!latestByTopic.has(a.topicId)) latestByTopic.set(a.topicId, a);
    }
    const weakTopics = [...latestByTopic.values()]
      .filter((a) => a.score < 60)
      .map((a) => ({
        topicId: a.topic.id,
        topicName: a.topic.name,
        chapterName: a.topic.chapter.name,
        score: a.score,
      }));

    res.json({ success: true, student, completedCount, attempts, weakTopics });
  } catch (error) {
    console.error("Parent overview error:", error);
    res.status(500).json({ success: false, message: "Failed to load child data" });
  }
});

// -------------------------------- Games -----------------------------------
// Presentational catalog; questions come from the existing topic bank and are
// scored server-side. XP is stored on the user for the leaderboard.

const GAMES = [
  { id: "rapid-fire", title: "Rapid Fire", description: "10 questions, instant scoring. +10 XP each.", xpPerCorrect: 10, limit: 10 },
  { id: "topic-blitz", title: "Topic Blitz", description: "5 fast questions on one topic. +15 XP each.", xpPerCorrect: 15, limit: 5 },
  { id: "endurance", title: "Endurance", description: "Up to 20 questions. +8 XP each.", xpPerCorrect: 8, limit: 20 },
];

app.get("/api/games", authenticate, async (req, res) => {
  res.json({ success: true, games: GAMES });
});

app.post("/api/games/submit", requireRole("STUDENT"), async (req, res) => {
  try {
    const { gameId, topicId, answers } = req.body;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) {
      return res.status(400).json({ success: false, message: "Unknown game" });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "answers are required" });
    }

    const questions = await prisma.question.findMany({
      where: {
        topicId: String(topicId),
        id: { in: answers.map((a) => String(a.questionId)) },
      },
    });
    const byId = new Map(questions.map((q) => [q.id, q]));
    let correct = 0;
    for (const a of answers) {
      const q = byId.get(String(a.questionId));
      if (q && Number(a.selected) === q.correct) correct += 1;
    }
    const total = answers.length;
    const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;
    const xp = correct * game.xpPerCorrect;

    await prisma.gameScore.create({
      data: { userId: req.userId, gameId, topicId: String(topicId), correct, total, score, xp },
    });
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { xp: { increment: xp } },
      select: { xp: true },
    });

    res.status(201).json({ success: true, correct, total, score, xp, totalXp: user.xp });
  } catch (error) {
    console.error("Game submit error:", error);
    res.status(500).json({ success: false, message: "Failed to record game" });
  }
});

app.get("/api/games/leaderboard", authenticate, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "STUDENT", xp: { gt: 0 } },
      orderBy: { xp: "desc" },
      take: 10,
      select: { id: true, name: true, xp: true },
    });
    res.json({ success: true, leaderboard: users });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load leaderboard" });
  }
});

app.get("/api/games/me", requireRole("STUDENT"), async (req, res) => {
  try {
    const scores = await prisma.gameScore.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { topic: { select: { name: true } } },
    });
    const me = await prisma.user.findUnique({ where: { id: req.userId }, select: { xp: true } });
    const best = scores.reduce((m, s) => Math.max(m, s.score), 0);
    res.json({
      success: true,
      totalXp: me?.xp ?? 0,
      gamesPlayed: scores.length,
      bestScore: best,
      recent: scores,
    });
  } catch (error) {
    console.error("Game me error:", error);
    res.status(500).json({ success: false, message: "Failed to load game stats" });
  }
});

// ------------------------------ AI adapter --------------------------------
// Secrets stay server-side. Without a configured provider we return a clear
// development-mode response and never pretend a request succeeded.

function aiConfigured() {
  return Boolean(process.env.AI_API_KEY);
}

async function callAi(messages, { json = false } = {}) {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey) return { ok: false, reason: "AI provider not configured" };
  if (provider !== "openai") {
    return { ok: false, reason: `Unsupported AI provider: ${provider}` };
  }

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!resp.ok) return { ok: false, reason: `AI request failed (${resp.status})` };
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return { ok: true, text };
  } catch (error) {
    console.error("AI request error:", error);
    return { ok: false, reason: "AI request error" };
  }
}

// -------------------------------- AI Tutor --------------------------------

app.post("/api/ai/tutor", authenticate, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "message is required" });
    }
    const convId = conversationId || `conv_${req.userId}_${Date.now()}`;

    if (!aiConfigured()) {
      return res.json({
        success: true,
        configured: false,
        conversationId: convId,
        reply:
          "The AI tutor is not configured yet. Set AI_PROVIDER, AI_API_KEY and AI_MODEL on the backend to enable live answers.",
      });
    }

    const history = await prisma.aiMessage.findMany({
      where: { conversationId: convId, userId: req.userId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const messages = [
      {
        role: "system",
        content:
          "You are LUCOUS Tutor, a concise and encouraging tutor for school students. Explain concepts clearly and give short examples.",
      },
      ...history.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      { role: "user", content: message },
    ];

    const result = await callAi(messages);
    if (!result.ok) {
      return res.status(502).json({ success: false, message: result.reason });
    }

    await prisma.aiMessage.createMany({
      data: [
        { userId: req.userId, conversationId: convId, role: "user", content: message },
        { userId: req.userId, conversationId: convId, role: "assistant", content: result.text },
      ],
    });

    res.json({ success: true, configured: true, conversationId: convId, reply: result.text });
  } catch (error) {
    console.error("AI tutor error:", error);
    res.status(500).json({ success: false, message: "AI tutor request failed" });
  }
});

// ------------------------- AI content generation --------------------------
// Teacher-only. Generated questions are stored as DRAFT (never auto-published).

app.post("/api/ai/generate-content", requireRole("TEACHER"), async (req, res) => {
  try {
    const { subject, chapter, topic, difficulty, count, topicId, save } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "topic is required" });
    }
    const n = Math.min(Math.max(Number(count) || 5, 1), 20);
    const level = ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM";

    if (!aiConfigured()) {
      return res.status(503).json({
        success: false,
        configured: false,
        message:
          "AI content generation is not configured. Set AI_PROVIDER, AI_API_KEY and AI_MODEL on the backend.",
      });
    }

    const prompt = `Generate ${n} ${level} multiple-choice questions on the topic "${topic}"` +
      (chapter ? ` from the chapter "${chapter}"` : "") +
      (subject ? ` for ${subject}` : "") +
      `. Return JSON of the form {"questions":[{"text":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correct":0,"explanation":"..."}]} where correct is the 0-based index of the right option.`;

    const result = await callAi(
      [{ role: "system", content: "You generate curriculum-aligned MCQs and always respond with valid JSON." },
       { role: "user", content: prompt }],
      { json: true }
    );
    if (!result.ok) {
      return res.status(502).json({ success: false, message: result.reason });
    }

    let parsed;
    try {
      parsed = JSON.parse(result.text);
    } catch {
      return res.status(502).json({ success: false, message: "AI returned invalid JSON" });
    }
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];

    let saved = 0;
    if (save && topicId && questions.length > 0) {
      const target = await prisma.topic.findUnique({ where: { id: String(topicId) } });
      if (target) {
        await prisma.question.createMany({
          data: questions.map((q) => ({
            topicId: String(topicId),
            text: String(q.text || ""),
            optionA: String(q.optionA || ""),
            optionB: String(q.optionB || ""),
            optionC: String(q.optionC || ""),
            optionD: String(q.optionD || ""),
            correct: Number(q.correct) || 0,
            explanation: q.explanation ? String(q.explanation) : null,
            difficulty: level,
            source: "AI",
            status: "DRAFT",
          })),
        });
        saved = questions.length;
      }
    }

    res.json({ success: true, configured: true, questions, saved });
  } catch (error) {
    console.error("AI content generation error:", error);
    res.status(500).json({ success: false, message: "Content generation failed" });
  }
});

// ------------------------------ Payments ----------------------------------
// Razorpay. The key SECRET never leaves the backend; only the public key id is
// exposed. Payment success is granted only after server-side signature check.

function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

app.get("/api/payments/config", (req, res) => {
  res.json({
    success: true,
    configured: razorpayConfigured(),
    keyId: process.env.RAZORPAY_KEY_ID || null,
  });
});

app.post("/api/payments/order", authenticate, async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }
    const course = await prisma.course.findUnique({ where: { id: String(courseId) } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.price <= 0) {
      return res.status(400).json({ success: false, message: "This course is free; enroll directly" });
    }
    if (!razorpayConfigured()) {
      return res.status(503).json({ success: false, message: "Payments are not configured" });
    }

    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const resp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: course.price,
        currency: course.currency || "INR",
        receipt: `course_${course.id}_${Date.now()}`,
        notes: { courseId: course.id, userId: req.userId },
      }),
    });

    if (!resp.ok) {
      return res.status(502).json({ success: false, message: "Failed to create Razorpay order" });
    }
    const order = await resp.json();

    await prisma.payment.create({
      data: {
        userId: req.userId,
        courseId: course.id,
        amount: course.price,
        currency: course.currency || "INR",
        status: "CREATED",
        razorpayOrderId: order.id,
      },
    });

    res.json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      course: { id: course.id, title: course.title },
    });
  } catch (error) {
    console.error("Payment order error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

app.post("/api/payments/verify", authenticate, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: "orderId, paymentId and signature are required",
      });
    }
    if (!razorpayConfigured()) {
      return res.status(503).json({ success: false, message: "Payments are not configured" });
    }

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: String(orderId) } });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (payment.userId !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    // Idempotent: a verified payment already granted access.
    if (payment.status === "PAID") {
      return res.json({ success: true, message: "Payment already verified", status: "PAID" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (!safeEqual(expected, signature)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", razorpayPaymentId: paymentId, razorpaySignature: signature },
      });
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", razorpayPaymentId: paymentId, razorpaySignature: signature },
    });

    // Grant access only after successful verification.
    if (payment.courseId) {
      const course = await prisma.course.findUnique({ where: { id: payment.courseId } });
      await prisma.enrollment.upsert({
        where: {
          courseId_studentId: { courseId: payment.courseId, studentId: req.userId },
        },
        update: { status: "ENROLLED" },
        create: {
          courseId: payment.courseId,
          studentId: req.userId,
          teacherId: course ? course.teacherId : null,
          status: "ENROLLED",
        },
      });
    }

    res.json({ success: true, message: "Payment verified", status: "PAID" });
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
});

// Secure, idempotent webhook. Signature is computed over the raw body.
app.post("/api/payments/webhook", async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    if (!secret || !signature || !req.rawBody) {
      return res.status(400).json({ success: false, message: "Missing webhook signature" });
    }
    const expected = crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
    if (!safeEqual(expected, signature)) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.rawBody.toString("utf8"));
    const entity = event?.payload?.payment?.entity;
    if (entity?.order_id) {
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: entity.order_id },
      });
      if (payment && payment.status !== "PAID") {
        const status = event.event === "payment.captured" ? "PAID" : "FAILED";
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status, razorpayPaymentId: entity.id || payment.razorpayPaymentId },
        });
      }
    }
    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ success: false, message: "Webhook processing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`LUCOUS backend running on http://localhost:${PORT}`);
});
