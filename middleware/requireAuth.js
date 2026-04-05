function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "Du skal logge ind først");
    return res.redirect("/login");
  }
  next();
}

module.exports = requireAuth;



