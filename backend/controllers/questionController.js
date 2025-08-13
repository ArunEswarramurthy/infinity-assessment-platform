exports.getAllQuestions = async (req, res) => {
  try {
    res.json({ success: true, questions: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    res.json({ success: true, message: 'Question updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update question' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete question' });
  }
};