const {queryDB} = require("./connection.js");
const express = require("express");
const router = express.Router();


router.post("/criar", async function (req, res) {

    try {
        let {comerciante, designacao, valor} = req.body;
        let criarProduto = await queryDB("INSERT INTO produto_comerciante(comerciante, designacao, valor) values (?, ?, ?)", [comerciante, designacao, valor]);
        res.json(criarProduto);
    } catch (e) {
        console.error(e)
        res.json({error: "Não foi possível criar produto, tente novamente."});
    }

});

router.post("/editar", async function (req, res) {

    try {
        let { novoComerciante, novaDesignacao, novoValor } = req.body;
        let {comerciante, designacao, valor} = req.body;


        let atualizarProduto = await queryDB("UPDATE produto_comerciante SET comerciante = ?, designacao = ?, valor = ? WHERE comerciante = ? AND designacao = ? AND valor = ?", [novoComerciante, novaDesignacao, novoValor, comerciante, designacao, valor]);

        res.json(atualizarProduto);
    } catch (e) {
        console.error(e)
        res.json({ error: "Não foi possível atualizar o produto, tente novamente." });
    }

});

router.get('/listar', async function (req, res) {
    const comerciante = req.params.id_comerciante;

    try {
        const produtos = await queryDB(`SELECT *
                                        FROM produto_comerciante`);

        res.json(produtos);
    } catch (e) {
        console.error( e);
        res.json({error: "Ocorreu um erro ao listar produtos"});
    }


});


module.exports = router;