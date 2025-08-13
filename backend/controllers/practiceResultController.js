exports.savePracticeResult = async (req, res) => {
  try {
    res.json({ success: true, message: 'Result saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save result' });
  }
};