const XLSX = require('xlsx');
const fs = require('fs');
const { LicensedUser, License } = require('../models');
const { v4: uuidv4 } = require('uuid');

const uploadStudentExcel = async (req, res) => {
  const { planTitle, startDate, endDate } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Excel file required" });
  }

  try {
    // Create license entry
    const license = await License.create({
      id: uuidv4(),
      plan_title: planTitle || 'Student Upload',
      start_date: startDate || new Date(),
      end_date: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    });

    // Read Excel file
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const users = [];
    const errors = [];

    data.forEach((row, index) => {
      const name = row.name?.toString().trim();
      const email = row.email?.toString().trim().toLowerCase();
      const sin_number = row.sin_number?.toString().trim();
      const department = row.department?.toString().trim();

      if (!name || !email || !sin_number || !department) {
        errors.push(`Row ${index + 2}: Missing required fields (name, email, sin_number, department)`);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${index + 2}: Invalid email format`);
        return;
      }

      users.push({
        id: uuidv4(),
        name,
        email,
        sin_number,
        department,
        activated: false,
        license_id: license.id
      });
    });

    if (errors.length > 0) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        error: "Validation errors found",
        details: errors
      });
    }

    if (users.length === 0) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: "No valid student data found in Excel file" });
    }

    // Check for duplicate emails
    const emails = users.map(u => u.email);
    const existingUsers = await LicensedUser.findAll({
      where: { email: emails },
      attributes: ['email']
    });

    if (existingUsers.length > 0) {
      const duplicateEmails = existingUsers.map(u => u.email);
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: "Duplicate emails found",
        details: duplicateEmails
      });
    }

    // Bulk create users
    await LicensedUser.bulkCreate(users);
    fs.unlinkSync(file.path);

    res.status(200).json({
      message: `Successfully uploaded ${users.length} students`,
      licenseId: license.id,
      uploadedCount: users.length
    });

  } catch (error) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Server Error: " + error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await LicensedUser.findAll({
      attributes: ['id', 'name', 'email', 'sin_number', 'department', 'activated', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      students: students.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        sin_number: student.sin_number,
        department: student.department,
        activated: student.activated,
        joinDate: student.created_at
      }))
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

const activateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await LicensedUser.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    await student.update({ activated: true });

    res.json({
      success: true,
      message: "Student activated successfully"
    });
  } catch (error) {
    console.error("Activate student error:", error);
    res.status(500).json({ error: "Failed to activate student" });
  }
};

module.exports = {
  uploadStudentExcel,
  getStudents,
  activateStudent
};