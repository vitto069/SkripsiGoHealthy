const express = require('express');
const mysql = require('mysql');
const router = express.Router();

const { requireLoggin } = require('../middleware');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'skripsidb'
});

db.connect((err) => {
  if (!err) {
    console.log("MYSQL CONNECTED");
  } else {
    console.log("CONNECTION FAILED", err);
  }
});



router.get("/", requireLoggin, (req, res) => {
  if (req.query.nama) {
    db.query(`SELECT * FROM kriteria WHERE nama LIKE '%${req.query.nama}%'`, function (err, result, fields) {
      if (err) throw err;
      res.render("kriteria/index", { kriterias: result });
    });
  } else {
    db.query("SELECT * FROM kriteria", function (err, result, fields) {
      if (err) {
        res.redirect('/kriteria');
      } else {
        let arrBobot = result;
        let total = 0;
        for (let bobot of arrBobot) {
          total += bobot.bobot;
        }
        // total = Math.round(total);
        res.render("kriteria/index", { kriterias: result, totalBobot: total });
      }
    });
  }
});

router.get("/new", requireLoggin, (req, res) => {
  res.render("kriteria/new");
});

router.post("/", requireLoggin, (req, res) => {
  const kriteriaBaru = req.body.kriteria;

  db.query(`SELECT * FROM kriteria WHERE kode = '${kriteriaBaru.kode}'`, async (err, result) => {
    if (result.length !== 0) {
      req.flash('error', `Kode kriteria ${kriteriaBaru.kode} sudah ada, Mohon masukkan kode kriteria yang berbeda`); //adding informatin to a session
      res.redirect(`/kriteria`);
    } else {
      let sql = `INSERT INTO kriteria (kode, nama, bobot) VALUES
   ( '${kriteriaBaru.kode.toUpperCase()}', '${kriteriaBaru.nama}', '${kriteriaBaru.bobot / 100}')`;
      db.query(sql, function (err, result) {
        if (err) {
          req.flash('error', 'Gagal menambahkan data'); //adding informatin to a session
          res.redirect(`/kriteria`);
        } else {
          req.flash('success', 'Berhasil menambahkan kriteria baru'); //adding informatin to a session

          res.redirect(`/kriteria`);
        }
      });
    }
  });
});


//Edit Route
router.get("/:id/edit", requireLoggin, (req, res) => {
  db.query(`SELECT * FROM kriteria WHERE id_kriteria = '${req.params.id}'`, function (err, result) {
    if (err) {
      res.redirect("/kriteria");
    } else {
      console.log("FOUND RESULT", result);
      res.render("kriteria/edit", { kriterias: result });
    }
  });
});

//Update route
router.put("/:id", requireLoggin, (req, res) => {
  const { id } = req.params;
  const { kode, nama, bobot } = req.body.kriteria;
  let sql = `UPDATE kriteria SET kode = '${kode.toUpperCase()}', nama = '${nama}', bobot = '${bobot / 100}'  WHERE id_kriteria = '${id}'`;
  db.query(sql, function (err, result) {
    if (err) {
      req.flash('error', 'Update data gagal'); //adding informatin to a session
      res.redirect(`/kriteria`);
    } else {
      req.flash('success', 'Berhasil update data kriteria'); //adding informatin to a session
      res.redirect(`/kriteria`);
    }
  });
});


//Delete Route
router.delete("/:id", requireLoggin, (req, res) => {
  const sql = `DELETE FROM kriteria WHERE (id_kriteria = '${req.params.id}')`;
  db.query(sql, function (err, result) {
    if (err) {
      req.flash('error', 'Gagal menghapus data'); //adding informatin to a session
      console.log(err);
      res.redirect("/kriteria");
    } else {
      req.flash('success', 'Berhasil menghapus kriteria'); //adding informatin to a session
      res.redirect("/kriteria");
    }
  });
});

module.exports = router;