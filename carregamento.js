const {queryDB} = require("./connection.js");

const express = require("express");
const router = express.Router();

router.get("/saldo", async function(req, res) {
    let saldo = await queryDB("SELECT saldo FROM movimento_cashless");
    res.json(saldo);
});

router.get("/extrato", async function(req, res) {
});

router.get("/extratoexcel", async function(req, res) {
});

router.post("/carregar", async function(req, res) {
});

router.post("/validar", async function(req, res) {
});

module.exports = router;