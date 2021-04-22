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

router.get("/",requireLoggin, (req, res) => {
  db.query("SELECT * FROM karyawan", function (err, result, fields) {
    if (err) {
      res.redirect('/dashboard');
    } else {
      db.query("SELECT * FROM penilaian", function (err, penilaians, fields) {
        if(err){
          console.log(err);
        }else{
          // console.log("===============PENILAIAN ARR : ",penilaians, "=============")
          res.render("penilaian/index", { karyawans: result, penilaianArr: penilaians });
        }
      });
    }
  });
});


router.get("/:idkaryawan/:namakyw/input",requireLoggin, (req, res) => {
  const { idkaryawan, namakyw } = req.params;
  db.query("SELECT * FROM kriteria", function (err, kriterias, fields) {
    if (err) {
      console.log(err);
      res.redirect('/penilaian');
    } else {
      // let oldQuery = `SELECT kriteria.id_kriteria, subkriteria.id_subkriteria, kriteria.nama AS nama_kriteria, subkriteria.nama AS nama_subkriteria FROM subkriteria INNER JOIN kriteria ON subkriteria.id_kriteria=kriteria.id_kriteria`
      let query= `SELECT kriteria.id_kriteria, subkriteria.id_subkriteria, subkriteria.bobot AS bobot_sub, kriteria.nama AS nama_kriteria, subkriteria.nama AS nama_subkriteria FROM subkriteria INNER JOIN kriteria ON subkriteria.id_kriteria=kriteria.id_kriteria ORDER BY bobot_sub DESC`; //bobot sub hanya digunukan u/ mengurutkan option
      db.query(query, function (err, penilaians, fields) {
        if (err) {
          console.log(err);
          res.redirect('/penilaian')
        } else {
          var hasilArr = [];
          for (let k of kriterias) {
            var option = penilaians.filter(el => {
              return el.id_kriteria === k['id_kriteria'];
            });
            hasilArr.push(option);
          }
          // console.log("HASIL ARRRRRRRRRRRRRR", hasilArr)
          // console.log("HASIL PENILAIANSSSS", penilaians);
          // console.log("length PENILAIANSSSS", hasilArr.length)
          
          //Filter hanya array yang memiliki isi
          const hasilArrr = hasilArr.filter(arr => arr.length > 0);
          // console.log(hasilArrr);

          //to get selected option
          let query= `SELECT * FROM penilaian WHERE id_karyawan = '${idkaryawan}'`; 
          db.query(query, function (err, nkars, fields) {
            if(err){
              console.log(err);
              res.redirect('/penilaian')
            }else{
              console.log(nkars.length)
              console.log("hasil ARRR", hasilArrr.length)
              console.log("hasil ARRR", hasilArrr[0].length)
              console.log("hasil ARRR", hasilArrr)
              console.log(nkars)
              res.render("penilaian/inputnilai", { hasilArrr, nkars, idkaryawan, namakyw });
            }
          });
        }
      });
    }
  });
});

// Input nilai route
router.post("/:idkaryawan/input",requireLoggin, (req, res) => {
  const idKriteria = req.body.idKriteria;
  const idsub = req.body.nilai;
  const { idkaryawan } = req.params;
  console.log("THIS IS ID SUB(nilai) FROM SELECT : ",idsub);
  console.log("THIS IS idkriteria FROM hidden input : ",idKriteria);

  //CHECK APAKAH KARYAWAN SUDAH PUNYA NILAI
  db.query(`SELECT * FROM penilaian WHERE id_karyawan = '${idkaryawan}'`, function (err, result) {
    if(err){
      console.log(err)
    }else{
      // console.log("NILAI RESULT NILAI : ", result)
      console.log("NILAI RESULT length : ", result.length)
      if(result.length !== 0){ //jika sudah diberi nilai
        for(let i = 0; i < result.length; i++){
      // console.log("NILAI per index dari db : ", result[i].id_subkriteria);
      // console.log("NILAI per index dari form : ", idsub[i]);
          let sql = `UPDATE penilaian SET id_kriteria = '${idKriteria[i]}', id_subkriteria = '${idsub[i]}', id_karyawan = '${idkaryawan}' WHERE id_penilaian = '${result[i].id_penilaian}'`;
          db.query(sql, function (err, result) {
            if (err) {
              req.flash('error', 'Gagal input nilai'); //adding informatin to a session
              // res.redirect(`/penilaian`);
            } else {
              req.flash('success', 'Berhasil input nilai'); //adding informatin to a session
              // res.redirect(`/penilaian`);
            }
          });
        }
      }else{//jika belum diberi nilaI
        for(let i = 0; i < idsub.length; i++){
          let sql = `INSERT INTO penilaian (id_karyawan, id_subkriteria, id_kriteria) VALUES('${idkaryawan}', '${idsub[i]}', '${idKriteria[i]}')`;
          db.query(sql, function (err, result) {
            if (err) {
              req.flash('error', 'Gagal update nilai'); //adding informatin to a session
              // res.redirect(`/penilaian`);
            } else {
              req.flash('success', 'Berhasil update nilai'); //adding informatin to a session
              // res.redirect(`/penilaian`);
            }
          });
        }
      }
      
    }
  });
  req.flash('success', 'Berhasil mengisi nilai');
  res.redirect(`/penilaian`);
});



module.exports = router;