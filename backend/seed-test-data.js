const { sequelize } = require('./models');
const { 
  User, 
  Test, 
  Section, 
  MCQ, 
  TestSession, 
  SectionSubmission,
  LicensedUser,
  License
} = require('./models');

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...');

    // Create sample users
    const users = await User.bulkCreate([
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Computer Science',
        password: 'password123'
      },
      {
        id: 'user2', 
        name: 'Jane Smith',
        email: 'jane@example.com',
        department: 'Information Technology',
        password: 'password123'
      },
      {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@example.com',
        department: 'Administration',
        password: 'admin123',
        role: 'admin'
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Sample users created');

    // Create sample license
    const license = await License.create({
      id: 'license-1',
      plan_title: 'Basic Plan',
      start_date: new Date(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }, { ignoreDuplicates: true });

    // Create licensed users
    const licensedUsers = await LicensedUser.bulkCreate([
      {
        id: 'LU001',
        name: 'Licensed User 1',
        email: 'licensed1@example.com',
        sin_number: 'SIN001',
        department: 'Engineering',
        activated: true,
        license_id: license.id
      },
      {
        id: 'LU002',
        name: 'Licensed User 2', 
        email: 'licensed2@example.com',
        sin_number: 'SIN002',
        department: 'Science',
        activated: true,
        license_id: license.id
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Licensed users created');

    // Create sample test
    const test = await Test.create({
      testId: 'TEST001',
      name: 'Sample MCQ Test',
      description: 'A comprehensive test covering multiple topics',
      instructions: 'Read each question carefully and select the best answer.',
      testDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '12:00',
      duration: 120,
      totalMarks: 100,
      passingMarks: 60,
      isActive: true,
      createdBy: 'admin1'
    }, { ignoreDuplicates: true });

    console.log('✅ Sample test created');

    // Create sections
    const sections = await Section.bulkCreate([
      {
        id: 'SEC001',
        testId: test.testId,
        name: 'General Knowledge',
        duration: 30,
        instructions: 'Answer all questions in this section',
        correctMarks: 2,
        wrongMarks: -0.5,
        type: 'mcq',
        sectionIndex: 0
      },
      {
        id: 'SEC002',
        testId: test.testId,
        name: 'Technical Skills',
        duration: 45,
        instructions: 'Technical questions related to your field',
        correctMarks: 3,
        wrongMarks: -1,
        type: 'mcq',
        sectionIndex: 1
      },
      {
        id: 'SEC003',
        testId: test.testId,
        name: 'Problem Solving',
        duration: 45,
        instructions: 'Analytical and problem-solving questions',
        correctMarks: 4,
        wrongMarks: -1,
        type: 'mcq',
        sectionIndex: 2
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Test sections created');

    // Create MCQ questions for each section
    const mcqQuestions = [];
    
    // Section 1 questions
    for (let i = 1; i <= 10; i++) {
      mcqQuestions.push({
        id: `MCQ_SEC1_${i}`,
        sectionId: 'SEC001',
        question: `General Knowledge Question ${i}: What is the capital of France?`,
        optionA: 'London',
        optionB: 'Berlin',
        optionC: 'Paris',
        optionD: 'Madrid',
        correctOptionLetter: 'C',
        explanation: 'Paris is the capital and most populous city of France.'
      });
    }

    // Section 2 questions  
    for (let i = 1; i <= 15; i++) {
      mcqQuestions.push({
        id: `MCQ_SEC2_${i}`,
        sectionId: 'SEC002',
        question: `Technical Question ${i}: Which programming language is known for its simplicity?`,
        optionA: 'C++',
        optionB: 'Python',
        optionC: 'Assembly',
        optionD: 'Java',
        correctOptionLetter: 'B',
        explanation: 'Python is known for its simple and readable syntax.'
      });
    }

    // Section 3 questions
    for (let i = 1; i <= 10; i++) {
      mcqQuestions.push({
        id: `MCQ_SEC3_${i}`,
        sectionId: 'SEC003',
        question: `Problem Solving Question ${i}: If A = 1, B = 2, C = 3, what is the value of ABC?`,
        optionA: '6',
        optionB: '123',
        optionC: '321',
        optionD: '111',
        correctOptionLetter: 'A',
        explanation: 'A × B × C = 1 × 2 × 3 = 6'
      });
    }

    await MCQ.bulkCreate(mcqQuestions, { ignoreDuplicates: true });
    console.log('✅ MCQ questions created');

    // Create sample test sessions with results
    const testSessions = await TestSession.bulkCreate([
      {
        id: 'SESSION001',
        testId: test.testId,
        studentId: 'user1',
        status: 'completed',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        totalScore: 85,
        maxScore: 100,
        currentSectionIndex: 2
      },
      {
        id: 'SESSION002',
        testId: test.testId,
        studentId: 'user2',
        status: 'completed',
        startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalScore: 72,
        maxScore: 100,
        currentSectionIndex: 2
      },
      {
        id: 'SESSION003',
        testId: test.testId,
        studentId: 'LU001',
        status: 'completed',
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        totalScore: 91,
        maxScore: 100,
        currentSectionIndex: 2
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Test sessions created');

    // Create section submissions
    const sectionSubmissions = await SectionSubmission.bulkCreate([
      // User1 submissions
      {
        testSessionId: 'SESSION001',
        sectionId: 'SEC001',
        sectionIndex: 0,
        score: 18,
        maxScore: 20,
        timeSpent: 25,
        submittedAt: new Date(Date.now() - 90 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC1_1': 'C', 'MCQ_SEC1_2': 'C' })
      },
      {
        testSessionId: 'SESSION001',
        sectionId: 'SEC002',
        sectionIndex: 1,
        score: 39,
        maxScore: 45,
        timeSpent: 40,
        submittedAt: new Date(Date.now() - 50 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC2_1': 'B', 'MCQ_SEC2_2': 'B' })
      },
      {
        testSessionId: 'SESSION001',
        sectionId: 'SEC003',
        sectionIndex: 2,
        score: 28,
        maxScore: 35,
        timeSpent: 35,
        submittedAt: new Date(Date.now() - 60 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC3_1': 'A', 'MCQ_SEC3_2': 'A' })
      },
      // User2 submissions
      {
        testSessionId: 'SESSION002',
        sectionId: 'SEC001',
        sectionIndex: 0,
        score: 16,
        maxScore: 20,
        timeSpent: 28,
        submittedAt: new Date(Date.now() - 150 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC1_1': 'C', 'MCQ_SEC1_2': 'B' })
      },
      {
        testSessionId: 'SESSION002',
        sectionId: 'SEC002',
        sectionIndex: 1,
        score: 33,
        maxScore: 45,
        timeSpent: 43,
        submittedAt: new Date(Date.now() - 110 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC2_1': 'B', 'MCQ_SEC2_2': 'A' })
      },
      {
        testSessionId: 'SESSION002',
        sectionId: 'SEC003',
        sectionIndex: 2,
        score: 23,
        maxScore: 35,
        timeSpent: 38,
        submittedAt: new Date(Date.now() - 120 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC3_1': 'A', 'MCQ_SEC3_2': 'B' })
      },
      // LU001 submissions
      {
        testSessionId: 'SESSION003',
        sectionId: 'SEC001',
        sectionIndex: 0,
        score: 20,
        maxScore: 20,
        timeSpent: 22,
        submittedAt: new Date(Date.now() - 210 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC1_1': 'C', 'MCQ_SEC1_2': 'C' })
      },
      {
        testSessionId: 'SESSION003',
        sectionId: 'SEC002',
        sectionIndex: 1,
        score: 42,
        maxScore: 45,
        timeSpent: 38,
        submittedAt: new Date(Date.now() - 170 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC2_1': 'B', 'MCQ_SEC2_2': 'B' })
      },
      {
        testSessionId: 'SESSION003',
        sectionId: 'SEC003',
        sectionIndex: 2,
        score: 29,
        maxScore: 35,
        timeSpent: 32,
        submittedAt: new Date(Date.now() - 180 * 60 * 1000),
        mcqAnswers: JSON.stringify({ 'MCQ_SEC3_1': 'A', 'MCQ_SEC3_2': 'A' })
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Section submissions created');

    console.log('🎉 Test data seeding completed successfully!');
    console.log('📊 Created:');
    console.log(`   - ${users.length} regular users`);
    console.log(`   - ${licensedUsers.length} licensed users`);
    console.log(`   - 1 test with 3 sections`);
    console.log(`   - ${mcqQuestions.length} MCQ questions`);
    console.log(`   - ${testSessions.length} completed test sessions`);
    console.log(`   - ${sectionSubmissions.length} section submissions`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedTestData;