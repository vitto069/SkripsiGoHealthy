const express = require('express');
const mysql = require('mysql');
const { requireLoggin } = require('../middleware');
const router = express.Router();



// const { requireLoggin } = require('../middleware');

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



// cetak route
router.get("/", requireLoggin, (req, res) => {
  let query = `SELECT kriteria.id_kriteria, kriteria.bobot as bobot_kriteria, karyawan.id_karyawan AS id_karyawan, karyawan.nama, karyawan.ktp, subkriteria.bobot AS bobot_subkriteria FROM penilaian INNER JOIN karyawan ON penilaian.id_karyawan=karyawan.id_karyawan INNER JOIN subkriteria ON penilaian.id_subkriteria=subkriteria.id_subkriteria INNER JOIN kriteria ON penilaian.id_kriteria=kriteria.id_kriteria ORDER BY karyawan.id_karyawan ASC`;
  db.query(query, function (err, results, fields) {
    if (err) {
      res.redirect('/dashboard');
    } else {
      let query = `SELECT kriteria.id_kriteria, kriteria.bobot as bobot_kriteria, karyawan.id_karyawan AS id_karyawan, subkriteria.bobot AS bobot_subkriteria FROM penilaian INNER JOIN karyawan ON penilaian.id_karyawan=karyawan.id_karyawan INNER JOIN subkriteria ON penilaian.id_subkriteria=subkriteria.id_subkriteria INNER JOIN kriteria ON penilaian.id_kriteria=kriteria.id_kriteria ORDER BY karyawan.id_karyawan ASC`;
  db.query(query, function (err, resultss, fields) {
    if (err) {
      res.redirect('/dashboard');
    } else {
      const uniqueKriteria = Array.from(new Set(results.map(a => a.id_kriteria)))
  .map(id_kriteria => {
    return results.find(a => a.id_kriteria === id_kriteria)
  });

  const uniqueKaryawan = Array.from(new Set(results.map(a => a.id_karyawan)))
  .map(id_karyawan => {
    return results.find(a => a.id_karyawan === id_karyawan)
  }); 

  var hasilArr = [];
  for (let u of uniqueKriteria) {
    var option = results.filter(el => {
      return el.id_kriteria === u.id_kriteria;
  });
    hasilArr.push(option);
  }
  var hasilArrr = [];
  for (let u of uniqueKriteria) {
    var optionn = resultss.filter(el => {
      return el.id_kriteria === u.id_kriteria;
  });
    hasilArrr.push(optionn);
  }

  const maxArr = [];
  const minArr = [];

  for(let i = 0; i <hasilArrr.length; i++) {
    const max = hasilArrr[i].reduce(function(prev, current) {
      return (prev.bobot_subkriteria > current.bobot_subkriteria) ? prev : current
    })
    maxArr.push(max);
  }
  for(let i = 0; i <hasilArrr.length; i++) {
  const min = hasilArrr[i].reduce(function(prev, current) {
    return (prev.bobot_subkriteria < current.bobot_subkriteria) ? prev : current
})
minArr.push(min);
  }

const hasilNormalisasi = [];
const nkaryawan = [];
for(let i = 0; i <hasilArr.length; i++){
  for(let j = 0; j <uniqueKaryawan.length; j++){
    hasilArr[i][j].bobot_subkriteria = (hasilArr[i][j].bobot_subkriteria - minArr[i].bobot_subkriteria) / (maxArr[i].bobot_subkriteria - minArr[i].bobot_subkriteria);
  }
}

// hasilArr = 5 kali looping , karyawan = 7 kali looping
for(let i = 0; i <uniqueKaryawan.length; i++){
  // debugger;
var nilai = 0;
  for(let j = 0; j <hasilArr.length; j++){
    nilai = nilai + (hasilArr[j][i].bobot_subkriteria * hasilArr[j][i].bobot_kriteria);
}
// nilaiEvaluasi.push(nilai);
uniqueKaryawan[i].bobot_subkriteria = nilai
}
//Urutrkan nilai dari yang terbesar
uniqueKaryawan.sort((a, b) => parseFloat(b.bobot_subkriteria) - parseFloat(a.bobot_subkriteria));

    res.render('hasil/laporan', {skors: uniqueKaryawan});
    
    }
  });

    }
  });
});




module.exports = router;