exports.getAllChallenges = async (req, res) => {
  try {
    res.json({ success: true, challenges: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch challenges' });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    res.status(404).json({ success: false, error: 'Challenge not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch challenge' });
  }
};