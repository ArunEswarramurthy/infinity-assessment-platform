const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const { LicensedUser, License } = require('../models');
const { sanitizeFilePath, sanitizeForLog } = require('../utils/security');
const path = require('path');

const uploadLicenseCSV = async (req, res) => {
  const { planTitle, startDate, endDate } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "CSV file required" });
  }

  try {
    // Create license entry
    const license = await License.create({
      id: uuidv4(),
      plan_title: planTitle,
      start_date: startDate,
      end_date: endDate
    });

    const users = [];

    // Validate file path to prevent path traversal
    const uploadsDir = path.join(__dirname, '../uploads');
    const safePath = sanitizeFilePath(file.path, uploadsDir);
    
    if (!safePath) {
      return res.status(400).json({ error: "Invalid file path" });
    }
    
    fs.createReadStream(safePath)
      .pipe(csv())
      .on('data', (row) => {
        const name = (row['name'] !== undefined && row['name'] !== null) ? String(row['name']).trim() : '';
        const email = (row['email'] !== undefined && row['email'] !== null) ? String(row['email']).trim().toLowerCase() : '';
        const sin_number = (row['sin_number'] !== undefined && row['sin_number'] !== null) ? String(row['sin_number']).trim() : '';
        const department = (row['department'] !== undefined && row['department'] !== null) ? String(row['department']).trim() : '';

        if (!name || !email || !sin_number || !department) return;

        users.push({
          id: uuidv4(),
          name,
          email,
          sin_number,
          department,
          activated: false,
          license_id: license.id
        });
      })
      .on('end', async () => {
        try {
          await LicensedUser.bulkCreate(users);
          fs.unlinkSync(safePath);
          res.status(200).json({ 
            message: `Successfully uploaded ${users.length} users`,
            licenseId: license.id 
          });
        } catch (error) {
          console.error("Error creating users:", sanitizeForLog(error.message));
          res.status(500).json({ error: "Error creating users" });
        }
      });

  } catch (error) {
    console.error("Upload Error:", sanitizeForLog(error.message));
    res.status(500).json({ error: "Server Error" });
  }
};

const activateLicense = async (req, res) => {
  try {
    const { licenseId } = req.body;
    
    if (!licenseId) {
      return res.status(400).json({ error: "License ID required" });
    }
    
    // Use parameterized query to prevent SQL injection
    const users = await LicensedUser.findAll({ 
      where: { license_id: licenseId },
      attributes: ['id', 'name', 'email', 'sin_number', 'department', 'activated']
    });
    
    if (users.length === 0) {
      return res.status(404).json({ error: "No users found for this license" });
    }
    
    await LicensedUser.update(
      { activated: true },
      { where: { license_id: licenseId } }
    );

    // Send activation emails
    for (const user of users) {
      await sendActivationEmail(user);
    }

    res.status(200).json({ 
      message: "License activated successfully",
      activatedUsers: users.length 
    });
  } catch (error) {
    console.error("Activation Error:", sanitizeForLog(error.message));
    res.status(500).json({ error: "Activation failed" });
  }
};

const sendActivationEmail = async (user) => {
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vinothkumar@shanmugha.edu.in',
        pass: 'wnvekqidzmthqhgf'
      }
    });

    const result = await transporter.sendMail({
      from: 'License System <vinothkumar@shanmugha.edu.in>',
      to: user.email,
      subject: 'License Activated - Access Granted',
      html: `
        <h2>License Activated Successfully!</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your license has been activated. You can now log in using:</p>
        <ul>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Password:</strong> ${user.sin_number}</li>
        </ul>
        <p>Login at: <a href="http://localhost:3000">http://localhost:3000</a></p>
      `
    });
    console.log('Email sent successfully to:', user.email);
  } catch (emailError) {
    console.error('Email send failed to', user.email, ':', emailError.message);
  }
};

module.exports = {
  uploadLicenseCSV,
  activateLicense
};