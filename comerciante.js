const {queryDB} = require("./connection.js");
const express = require("express");
const router = express.Router();

router.post("/criar", async function (req, res) {

    try {
        let {evento, designacao} = req.body;
        let criarComerciante = await queryDB("INSERT INTO comerciante(evento, designacao) values (?, ?)", [evento, designacao]);
        res.json(criarComerciante);
    } catch (e) {
        console.error(e)
        res.json({error: "Não foi possível criar comerciante, tente novamente."});
    }

});

router.post("/editar", async function (req, res) {

    try {
        let { novoEvento, novaDesignacao} = req.body;
        let {evento, designacao} = req.body;


        let atualizarComerciante = await queryDB("UPDATE comerciante SET evento = ?, designacao = ? WHERE evento = ? AND designacao = ? ", [novoEvento, novaDesignacao, evento, designacao]);

        res.json(atualizarComerciante);
    } catch (e) {
        console.error(e)
        res.json({ error: "Não foi possível atualizar o comerciante, tente novamente." });
    }

});

/*router.post("/registar_compra", async function (req, res) {


});*/




router.get('/listar', async function (req, res) {

    try {
        const comerciante = await queryDB(`SELECT *
                                           FROM comerciante`);

        res.json(comerciante);
    } catch (e) {
        console.error(e);
        res.json({error: "Ocorreu um erro ao listar comerciante"});
    }


});

module.exports = router;