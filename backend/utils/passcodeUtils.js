function generatePasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  generatePasscode
};