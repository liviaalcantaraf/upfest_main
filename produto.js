const {queryDB} = require("./connection.js");
const express = require("express");
const router = express.Router();


router.post("/criar", async function(req, res){
    let {comerciante, designacao, valor} = req.body;
    let criarProduto = await queryDB("INSERT INTO produto_comerciante(comerciante, designacao, valor) values (?, ?, ?)", [comerciante, designacao, valor]);
    res.send(criarProduto);


})




router.get('produtos/listar', async function (req, res) {
    const comerciante = req.params.id_comerciante;

    try {
        const produtos = await queryDB(`SELECT *
                                        FROM produto_comerciante`);

        res.json(produtos);
    } catch (e) {
        console.log("Ocorreu um erro ao listar produtos:", e);
        res.status(500).json({e: "Ocorreu um erro ao listar produtos"});
    }


});


module.exports = router;