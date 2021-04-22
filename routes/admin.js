const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const bcrypt = require('bcrypt');
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

router.get('/register', (req, res) => {
  res.render("admin/register");
});

router.post('/register', async (req, res) => {
  const { password, username, fullname, id } = req.body;
  const hash = await bcrypt.hash(password, 12);

  db.query(`SELECT * FROM admin WHERE username = '${username}'`, async (err, result) => {
    if (result.length !== 0) {
      req.flash('error', 'Username telah terdaftar'); //adding informatin to a session
      res.redirect(`/admin`);
    } else {
      let sql = `INSERT INTO admin (fullname, username, password) VALUES
   ('${fullname}' ,'${username}', '${hash}')`;
      db.query(sql, async function (err, result) {
        if (err) {
          console.log(err);
          req.flash('error', 'Gagal menambahkan admin'); //adding informatin to a session
          res.redirect(`/admin`);
        } else {
          req.flash('success', 'Berhasil menambahkan admin'); //adding informatin to a session
          req.session.currentAdmin = username;
          // req.session.idUser = id;
          res.redirect(`/admin`);
        }
      });
    }
  });
});

router.get("/login", (req, res) => {
  res.render('admin/login')
});

router.post("/login", async (req, res) => {
  // console.log(req.body);
  const { password, username } = req.body;
  db.query(`SELECT * FROM admin WHERE username = '${username}'`, async (err, result) => {
    if (err) {
      console.log("ini eror : ", err);
      res.redirect("/admin/login");
    } else {
      if (!result || result.length !== 0) {
        const validPassword = await bcrypt.compare(password, result[0].password);
        if (validPassword) {
          req.session.currentAdmin = username;
          console.log("ini result: ",result);
          // req.session.idAdmin = id;
          console.log(req.session);
          req.flash('success', `Berhasil login, Selamat datang kembali, ${req.session.currentAdmin}`); //adding informatin to a session
          res.redirect("/dashboard")
        } else {
          req.flash('error', 'Gagal login, Username atau password salah!');
          res.redirect("/admin/login")
        }
      } else {
        // req.flash('error', 'Username belum terdaftar');
        req.flash('error', 'Gagal login, Username atau password salah!');
        res.redirect("/admin/login")
      }
    }
  });
});

router.get("/", requireLoggin, (req, res) => {
  db.query(`SELECT * FROM admin`, async (err, result) => {
    if (err) {
      res.redirect("/admin/login");
    } else {
      res.render("admin/index", { admins: result });
    }
  });
});


//Edit Route
router.get("/:id/edit", requireLoggin, (req, res) => {
  db.query(`SELECT * FROM admin WHERE id = '${req.params.id}'`, function (err, result) {
    if (err) {
      res.redirect("/admin");
    } else {
      console.log(result)
      res.render("admin/edit", { admins: result });
    }
  });
});

//Update route
router.put("/:id", requireLoggin, async (req, res) => {
  const { id } = req.params;
  const { username, fullname, password } = req.body.admin;
  console.log("password from edit form: ", req.body.admin.password);
  if (password) {
    const hash = await bcrypt.hash(password, 12);
    let sql = `UPDATE admin SET username = '${username}', fullname = '${fullname}', password = '${hash}' WHERE id = '${id}'`;
    db.query(sql, function (err, result) {
      if (err) {
        req.flash('error', 'Update data gagal'); //adding informatin to a session
        res.redirect(`/admin`);
      } else {
        req.flash('success', 'Berhasil update data admin'); //adding informatin to a session
        res.redirect(`/admin`);
      }
    });
  } else {
    let sql = `UPDATE admin SET username = '${username}', fullname = '${fullname}' WHERE id = '${id}'`;
    db.query(sql, function (err, result) {
      if (err) {
        req.flash('error', 'Update data gagal'); //adding informatin to a session
        res.redirect(`/admin`);
      } else {
        req.flash('success', 'Berhasil update data admin'); //adding informatin to a session
        res.redirect(`/admin`);
      }
    });
  }
});


//Delete Route
router.delete("/:id", requireLoggin, (req, res) => {
  const sql = `DELETE FROM admin WHERE (id = '${req.params.id}')`;
  db.query(sql, function (err, result) {
    if (err) {
      req.flash('error', 'Gagal menghapus data'); //adding informatin to a session
      console.log(err);
      res.redirect("/admin");
    } else {
      req.flash('success', 'Berhasil menghapus admin'); //adding informatin to a session
      res.redirect("/admin");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.currentAdmin = null; //stop tracking the currentUser
  req.flash('success', `Selamat Tinggal Admin`);
  res.redirect('/admin/login');
});

module.exports = router;