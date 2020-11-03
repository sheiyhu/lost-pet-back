var express = require("express");
var router = express.Router();
var Pet = require("../model/Pet");
var path = require("path");
var crypto = require("crypto");
var multer = require("multer");

const storage = multer.diskStorage({
  destination: "public",
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      if (err) return cb(err);
      cb(null, raw.toString("hex") + path.extname(file.originalname));
    });
  },
});

let upload = multer({ storage });

router
  .route("/pets")
    .get(async (req, res, next) => {
      try {
        const pets = await Pet.find({});
        res.status(200).json(pets);
      } catch (err) {
        console.log("Failed " + err);
        res.status(500).send("Error");
      }
    })
    .post(upload.single('image'), async(req, res, next) => {
      try {
        if (!req.file) {
          console.log("Please include a pet image");
          res.send({
            success: false
          })
        } else {
          const host = req.get('host');
          const imageUrl = req.protocol + "://" + host + "/" + req.file.path;
          let pet = new Pet({
            name: req.body.name,
            type: req.body.type,
            description: req.body.description,
            address: req.body.address,
            date: req.body.date,
            contact: req.body.contact,
            imageUrl
          });
          let result = await pet.save()
          res.status(200).send(result)
        }
      } catch (err) {
        console.log('Failed to create' + err);
        res.status(500).send("Error")
      }
    });

router.route('/pet/:id').get(async(req, res) => {
  try {
    let pet = await Pet.findById(req.params.id);
    if (pet) {
      res.status(200).send(pet)
    } else {
      res.status(404).send('Item not found')
    }
  } catch (err) {
    console.log("Failed " + err);
    res.status(500).send("Error")
  }
})

router.route('/pets/:type').get(async(req, res) => {
  try {
    let pet = await Pet.find({type: req.params.type});
    if (pet) {
      res.status(200).send(pet)
    } else {
      res.status(404).send('Item not found')
    }
  } catch (err) {
    console.log("Failed " + err);
    res.status(500).send("Error")
  }
})

module.exports = router;
