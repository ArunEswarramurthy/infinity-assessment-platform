exports.saveToBank = async (req, res) => {
  try {
    res.json({ success: true, message: 'Saved to question bank' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save to bank' });
  }
};

exports.getFromBank = async (req, res) => {
  try {
    res.json({ success: true, questions: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get from bank' });
  }
};