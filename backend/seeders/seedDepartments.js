const { Department, Class } = require('../models');

const seedDepartments = async () => {
  try {
    // Create departments
    const departments = await Department.bulkCreate([
      { name: 'Electronics and Communication Engineering', code: 'ECE' },
      { name: 'Computer Science Engineering', code: 'CSE' },
      { name: 'Mechanical Engineering', code: 'MECH' },
      { name: 'Civil Engineering', code: 'CIVIL' },
      { name: 'Electrical Engineering', code: 'EEE' }
    ], { ignoreDuplicates: true });

    // Create classes for each department
    const classes = [];
    for (const dept of departments) {
      for (let year = 1; year <= 4; year++) {
        classes.push({
          name: `BE ${dept.code} - ${['I', 'II', 'III', 'IV'][year - 1]}`,
          year: year,
          departmentId: dept.id
        });
      }
    }

    await Class.bulkCreate(classes, { ignoreDuplicates: true });
    console.log('✅ Departments and classes seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
  }
};

module.exports = { seedDepartments };