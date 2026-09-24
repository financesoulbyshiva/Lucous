const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// DEMO data only. The app is data-driven: boards/grades/subjects are rows,
// not hardcoded conditions. Adding more later is an insert, not a code change.
const DATA = [
  {
    board: "CBSE",
    grade: "Class 10",
    subject: "Mathematics",
    chapters: [
      {
        name: "Real Numbers",
        topics: [
          {
            name: "Euclid's Division Lemma",
            contents: [
              {
                title: "Euclid's Division Lemma",
                order: 1,
                body: "For any two positive integers a and b, there exist unique integers q and r such that a = bq + r, where 0 ≤ r < b. This lemma is the basis of the Euclidean algorithm for finding the HCF of two numbers.",
              },
            ],
            questions: [
              { text: "What is the HCF of 8 and 12?", optionA: "2", optionB: "4", optionC: "6", optionD: "8", correct: 1, difficulty: "EASY", explanation: "12 = 8×1 + 4; 8 = 4×2 + 0, so HCF = 4." },
              { text: "Euclid's Division Lemma states a = bq + r where:", optionA: "r > b", optionB: "0 ≤ r < b", optionC: "r = b", optionD: "r < 0", correct: 1, difficulty: "EASY", explanation: "The remainder r always satisfies 0 ≤ r < b." },
              { text: "The smallest prime number is:", optionA: "0", optionB: "1", optionC: "2", optionD: "3", correct: 2, difficulty: "EASY", explanation: "2 is the smallest and only even prime." },
              { text: "HCF × LCM of two numbers equals:", optionA: "Sum of the numbers", optionB: "Product of the numbers", optionC: "Difference of the numbers", optionD: "Twice the product", correct: 1, difficulty: "MEDIUM", explanation: "For any two numbers, HCF × LCM = product of the numbers." },
            ],
          },
          {
            name: "Fundamental Theorem of Arithmetic",
            contents: [
              {
                title: "Fundamental Theorem of Arithmetic",
                order: 1,
                body: "Every composite number can be expressed as a product of primes, and this factorisation is unique apart from the order of the prime factors. For example, 60 = 2 × 2 × 3 × 5.",
              },
            ],
            questions: [
              { text: "The prime factorisation of 96 is:", optionA: "2⁴ × 6", optionB: "2⁵ × 3", optionC: "2³ × 12", optionD: "8 × 12", correct: 1, difficulty: "MEDIUM", explanation: "96 = 2×2×2×2×2×3 = 2⁵ × 3." },
              { text: "Which of the following is irrational?", optionA: "√4", optionB: "√9", optionC: "√5", optionD: "√25", correct: 2, difficulty: "EASY", explanation: "√5 cannot be written as p/q; the others are 2, 3, 5." },
              { text: "Is √2 a rational number?", optionA: "Yes", optionB: "No", optionC: "Sometimes", optionD: "Only when squared", correct: 1, difficulty: "EASY", explanation: "√2 is irrational (proved by contradiction)." },
              { text: "The LCM of 6 and 20 is:", optionA: "30", optionB: "40", optionC: "60", optionD: "120", correct: 2, difficulty: "MEDIUM", explanation: "6 = 2×3, 20 = 2²×5; LCM = 2²×3×5 = 60." },
            ],
          },
        ],
      },
      {
        name: "Quadratic Equations",
        topics: [
          {
            name: "Standard Form and Roots",
            contents: [
              {
                title: "Standard Form and Roots",
                order: 1,
                body: "A quadratic equation has the standard form ax² + bx + c = 0, where a ≠ 0. The values of x that satisfy it are called roots, and there can be at most two real roots.",
              },
            ],
            questions: [
              { text: "Which is a quadratic equation?", optionA: "2x + 3 = 0", optionB: "x² + 2x - 3 = 0", optionC: "x³ = 8", optionD: "1/x = 2", correct: 1, difficulty: "EASY", explanation: "A quadratic has degree 2: x² + 2x - 3 = 0." },
              { text: "Roots of x² - 9 = 0 are:", optionA: "3, -3", optionB: "9, -9", optionC: "0, 3", optionD: "3, 3", correct: 0, difficulty: "EASY", explanation: "x² = 9 ⇒ x = ±3." },
              { text: "Roots of x² = 0 are:", optionA: "0, 0", optionB: "1, -1", optionC: "0, 1", optionD: "No roots", correct: 0, difficulty: "EASY", explanation: "x² = 0 has a repeated root x = 0." },
              { text: "Sum of roots of x² - 7x + 12 = 0 is:", optionA: "12", optionB: "-7", optionC: "7", optionD: "3", correct: 2, difficulty: "MEDIUM", explanation: "Sum = -b/a = 7." },
            ],
          },
          {
            name: "Quadratic Formula and Discriminant",
            contents: [
              {
                title: "Quadratic Formula and Discriminant",
                order: 1,
                body: "The roots of ax² + bx + c = 0 are x = (-b ± √(b² - 4ac)) / 2a. The discriminant D = b² - 4ac decides the nature of roots: D > 0 two distinct real roots, D = 0 two equal roots, D < 0 no real roots.",
              },
            ],
            questions: [
              { text: "The discriminant of x² - 5x + 6 = 0 is:", optionA: "1", optionB: "-1", optionC: "25", optionD: "5", correct: 0, difficulty: "MEDIUM", explanation: "D = 25 - 24 = 1." },
              { text: "If D = b² - 4ac < 0, the equation has:", optionA: "Two equal real roots", optionB: "Two distinct real roots", optionC: "No real roots", optionD: "Infinite roots", correct: 2, difficulty: "EASY", explanation: "Negative discriminant ⇒ no real roots." },
              { text: "Product of roots of x² - 5x + 6 = 0 is:", optionA: "5", optionB: "6", optionC: "-6", optionD: "1", correct: 1, difficulty: "MEDIUM", explanation: "Product = c/a = 6." },
              { text: "The quadratic formula is:", optionA: "x = (-b ± √D)/2a", optionB: "x = (b ± √D)/2a", optionC: "x = -b/2a", optionD: "x = √(b²-4ac)", correct: 0, difficulty: "EASY", explanation: "x = (-b ± √(b²-4ac)) / 2a." },
            ],
          },
        ],
      },
    ],
  },
  {
    board: "CBSE",
    grade: "Class 10",
    subject: "Science",
    chapters: [
      {
        name: "Chemical Reactions and Equations",
        topics: [
          {
            name: "Types of Chemical Reactions",
            contents: [
              {
                title: "Combination, Decomposition and Displacement",
                order: 1,
                body: "In a combination reaction two or more substances form one product. In decomposition one reactant breaks into simpler products. In displacement a more reactive element replaces a less reactive one.",
              },
            ],
            questions: [
              { text: "2H₂ + O₂ → 2H₂O is which type of reaction?", optionA: "Decomposition", optionB: "Combination", optionC: "Displacement", optionD: "Redox only", correct: 1, difficulty: "EASY", explanation: "Two reactants combine to form one product." },
              { text: "A reaction in which one compound breaks down is:", optionA: "Combination", optionB: "Displacement", optionC: "Decomposition", optionD: "Neutralisation", correct: 2, difficulty: "EASY", explanation: "Decomposition breaks a single reactant into products." },
              { text: "Fe + CuSO₄ → FeSO₄ + Cu is an example of:", optionA: "Combination", optionB: "Displacement", optionC: "Decomposition", optionD: "Precipitation", correct: 1, difficulty: "MEDIUM", explanation: "Iron displaces copper from its salt." },
              { text: "A balanced equation obeys the law of:", optionA: "Definite proportions", optionB: "Conservation of mass", optionC: "Multiple proportions", optionD: "Avogadro", correct: 1, difficulty: "EASY", explanation: "Atoms are neither created nor destroyed." },
            ],
          },
        ],
      },
      {
        name: "Light – Reflection and Refraction",
        topics: [
          {
            name: "Laws of Reflection",
            contents: [
              {
                title: "Laws of Reflection",
                order: 1,
                body: "The angle of incidence equals the angle of reflection, and the incident ray, reflected ray and normal all lie in the same plane. For a plane mirror the image is virtual, erect and the same size.",
              },
            ],
            questions: [
              { text: "In reflection, the angle of incidence equals:", optionA: "Twice angle of reflection", optionB: "Angle of reflection", optionC: "90°", optionD: "Zero", correct: 1, difficulty: "EASY", explanation: "∠i = ∠r by the first law of reflection." },
              { text: "The image formed by a plane mirror is:", optionA: "Real and inverted", optionB: "Virtual and erect", optionC: "Real and erect", optionD: "Virtual and inverted", correct: 1, difficulty: "EASY", explanation: "Plane mirrors give virtual, erect, same-size images." },
              { text: "The incident ray, normal and reflected ray lie in:", optionA: "Different planes", optionB: "The same plane", optionC: "Perpendicular planes", optionD: "None", correct: 1, difficulty: "EASY", explanation: "This is the second law of reflection." },
              { text: "If ∠i = 30°, then ∠r is:", optionA: "60°", optionB: "30°", optionC: "90°", optionD: "15°", correct: 1, difficulty: "EASY", explanation: "∠r = ∠i = 30°." },
            ],
          },
        ],
      },
    ],
  },
  {
    board: "Maharashtra State Board",
    grade: "Class 10",
    subject: "Mathematics",
    chapters: [
      {
        name: "Real Numbers",
        topics: [
          {
            name: "HCF and LCM",
            contents: [
              {
                title: "HCF and LCM by Prime Factorisation",
                order: 1,
                body: "HCF is the product of the smallest powers of common prime factors; LCM is the product of the greatest powers of all prime factors. For two numbers, HCF × LCM = product of the numbers.",
              },
            ],
            questions: [
              { text: "HCF of 12 and 18 is:", optionA: "2", optionB: "6", optionC: "12", optionD: "36", correct: 1, difficulty: "EASY", explanation: "12 = 2²×3, 18 = 2×3²; HCF = 2×3 = 6." },
              { text: "LCM of 4 and 6 is:", optionA: "24", optionB: "12", optionC: "10", optionD: "6", correct: 1, difficulty: "EASY", explanation: "4 = 2², 6 = 2×3; LCM = 2²×3 = 12." },
              { text: "If HCF × LCM = 72 and one number is 6, the other is:", optionA: "12", optionB: "18", optionC: "24", optionD: "72", correct: 0, difficulty: "MEDIUM", explanation: "Other number = 72 / 6 = 12." },
              { text: "The HCF of two coprime numbers is:", optionA: "0", optionB: "1", optionC: "Their product", optionD: "Their LCM", correct: 1, difficulty: "EASY", explanation: "Coprime numbers share no factor except 1." },
            ],
          },
        ],
      },
    ],
  },
];

async function main() {
  let boards = 0, grades = 0, subjects = 0, chapters = 0, topics = 0, contents = 0, questions = 0;

  for (const entry of DATA) {
    const board = await prisma.board.upsert({
      where: { name: entry.board },
      update: {},
      create: { name: entry.board },
    });
    const grade = await prisma.grade.upsert({
      where: { name: entry.grade },
      update: {},
      create: { name: entry.grade },
    });
    const subject = await prisma.subject.upsert({
      where: { boardId_gradeId_name: { boardId: board.id, gradeId: grade.id, name: entry.subject } },
      update: {},
      create: { name: entry.subject, boardId: board.id, gradeId: grade.id },
    });

    for (const chapter of entry.chapters) {
      const chapterRow = await prisma.chapter.upsert({
        where: { subjectId_name: { subjectId: subject.id, name: chapter.name } },
        update: {},
        create: { subjectId: subject.id, name: chapter.name },
      });

      for (const topic of chapter.topics) {
        const topicRow = await prisma.topic.upsert({
          where: { chapterId_name: { chapterId: chapterRow.id, name: topic.name } },
          update: {},
          create: { chapterId: chapterRow.id, name: topic.name },
        });

        await prisma.question.deleteMany({ where: { topicId: topicRow.id } });
        await prisma.learningContent.deleteMany({ where: { topicId: topicRow.id } });

        await prisma.learningContent.createMany({
          data: topic.contents.map((c) => ({
            topicId: topicRow.id,
            title: c.title,
            body: c.body,
            order: c.order,
            source: "TEACHER",
            status: "PUBLISHED",
          })),
        });
        await prisma.question.createMany({
          data: topic.questions.map((q) => ({
            topicId: topicRow.id,
            text: q.text,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correct: q.correct,
            explanation: q.explanation ?? null,
            difficulty: q.difficulty ?? "MEDIUM",
            source: "TEACHER",
            status: "PUBLISHED",
          })),
        });

        topics += 1;
        contents += topic.contents.length;
        questions += topic.questions.length;
      }
      chapters += 1;
    }
    subjects += 1;
  }

  boards = await prisma.board.count();
  grades = await prisma.grade.count();
  const realSubjects = await prisma.subject.count();
  const realChapters = await prisma.chapter.count();
  const realTopics = await prisma.topic.count();
  const realContents = await prisma.learningContent.count();
  const realQuestions = await prisma.question.count();

  console.log("Seed complete:", {
    boards,
    grades,
    subjects: realSubjects,
    chapters: realChapters,
    topics: realTopics,
    contents: realContents,
    questions: realQuestions,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
