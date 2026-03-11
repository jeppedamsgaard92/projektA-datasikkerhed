//helper function til password validering
function validatePassword(password, password2) {
  if (password !== password2){
    return 'Kodeordene matcher ikke'
  }
  // mindst 8 tegn
  if (password.length < 8) {
    return "Kodeord skal være mindst 8 tegn";
  }
  // skal inkludere mindst ét stort bogstav
  if (!/[A-ZÆØÅ]/.test(password)) {
    return "Kodeord skal indeholde mindst ét stort bogstav";
  }
  // mindst ét specialtegn
  if (!/[!@#$%^&*_+\-=?\.]/.test(password)) {
    return "Kodeord skal indeholde mindst ét specialtegn";
  }
  return ''; // ingen fejl
}

module.exports = { validatePassword };