const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const router = express.Router();

const { requireLoggin } = require('../middleware');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'psehat'
});

db.connect((err) => {
  if (!err) {
    console.log("MYSQL CONNECTED");
  } else {
    console.log("CONNECTION FAILED", err);
  }
});

//register user
router.get('/register', (req, res) => {
  res.render("user/register");
});

router.post('/register', async (req, res) => {
  const { password, username, fullname, tgllahir, golDarah } = req.body;
  const hash = await bcrypt.hash(password, 12);

  db.query(`SELECT * FROM user WHERE username = '${username}'`, async (err, result) => {
    if (result.length !== 0) {
      req.flash('error', 'Username telah terdaftar'); //adding informatin to a session
      res.redirect(`/register`);
    } else {
      let sql = `INSERT INTO user (nama_user, username, password, tgl_lahir, gol_darah) VALUES ('${fullname}', '${username}', '${hash}', '${tgllahir}', '${golDarah}')`;
      db.query(sql, async function (err, result) {
        if (err) {
          console.log(err);
          req.flash('error', 'Gagal menambahkan user'); //adding informatin to a session
          res.redirect(`/register`);
        } else {
          req.session.currentUser = username;
          req.flash('success', `Selamat datang ${req.session.currentUser}`); //adding informatin to a session
          res.redirect(`/dashboard`);
        }
      });
    }
  });
});

router.get("/user", requireLoggin, (req, res) => {
  if (req.query.nama) {
    db.query(`SELECT * FROM user WHERE nama LIKE '%${req.query.nama}%'`, function (err, result, fields) {
      if (err) throw err;
      res.render("user/index", { users: result });
    });
  } else {
    db.query("SELECT * FROM user", function (err, result, fields) {
      if (err) {
        res.redirect(`/user`);
      } else {
        res.render("user/index", { users: result });
      }
    });
  }
});

router.get("/user/new", requireLoggin, (req, res) => {
  res.render("user/new");
});

router.post("/", requireLoggin, (req, res) => {
  const { nama, username, password, tgl_lahir, goldarah } = req.body.user;
  let sql = `INSERT INTO user (nama_user, username, password, tgl_lahir, gol_darah) VALUES
   ( '${nama}', '${username}', '${password}', '${tgl_lahir}', '${goldarah}')`;
  db.query(sql, function (err, result) {
    if (err) {
      console.log(err)
      req.flash('error', 'Gagal menambahkan data'); //adding informatin to a session
      res.redirect(`/user`);
    } else {
      //beri nilai default user
      req.flash('success', 'Berhasil menambahkan user baru'); //adding informatin to a session
      res.redirect(`/user`);
    }
  });
});


//Edit Route
router.get("/user/:id/edit", requireLoggin, (req, res) => {
  db.query(`SELECT * FROM user WHERE id = '${req.params.id}'`, function (err, result) {
    if (err) {
      res.redirect("/user");
    } else {
      console.log("FOUND RESULT", result);
      res.render("user/edit", { users: result });
    }
  });
});

//Update route
router.put("/user/:id", requireLoggin, (req, res) => {
  const { id } = req.params;
  const { nama, username, password, tgl_lahir, goldarah } = req.body.user;
  let sql = `UPDATE user SET nama_user = '${nama}', username = '${username}', password = '${password}', tgl_lahir = '${tgl_lahir}', gol_darah = '${goldarah}'  WHERE id = '${id}'`;
  db.query(sql, function (err, result) {
    if (err) {
      req.flash('error', 'Update data gagal'); //adding informatin to a session
      res.redirect(`/user`);
    } else {
      req.flash('success', 'Berhasil update data user'); //adding informatin to a session
      res.redirect(`/user`);
    }
  });
});


//Delete Route
router.delete("/user/:id", requireLoggin, (req, res) => {
  const sql = `DELETE FROM user WHERE (id = '${req.params.id}')`;
  db.query(sql, function (err, result) {
    if (err) {
      req.flash('error', 'Gagal menghapus data'); //adding informatin to a session
      console.log(err);
      res.redirect("/user");
    } else {
      req.flash('success', 'Berhasil menghapus user'); //adding informatin to a session
      res.redirect("/user");
    }
  });
});

module.exports = router;