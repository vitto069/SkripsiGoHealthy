module.exports.requireLoggin = (req, res, next) => {
  // console.log("REQ.USER...;", req.user);
  if (!req.session.currentAdmin && !req.session.currentUser) {
    req.flash("error", "Anda harus login terlebih dahulu");
    return res.redirect('/login')
  }
  next();
}