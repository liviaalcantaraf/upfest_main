const {queryDB} = require("./connection.js");
const express = require("express");
const router = express.Router({mergeParams: true});


router.post("/criar", async function (req, res) {
    try {
        // Validação de id_evento e id_comerciante
        const [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]
        );

        const [comercianteExiste] = await queryDB(
            "SELECT id FROM comerciante WHERE id = ?",
            [req.params.id_comerciante]
        );

        if (!comercianteExiste) {
            throw new Error('É necessário relacionar o produto a um comerciante.');
        }
        if (!eventoExiste) {
            throw new Error('É necessário relacionar o produto a um evento.');
        } else {
            let { designacao, valor } = req.body;
            let comerciante = req.params.id_comerciante;

            let criarProduto = await queryDB("INSERT INTO produto_comerciante(comerciante, designacao, valor) values (?, ?, ?)", [comerciante, designacao, valor]);
            res.status(200).json(criarProduto);
        }
    } catch (error) {

        res.status(400).send(error.message);
    }
});


router.post("/:id_produto/editar", async function (req, res) {
    try {
        const [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]
        );

        const [comercianteExiste] = await queryDB(
            "SELECT id FROM comerciante WHERE id = ?",
            [req.params.id_comerciante]
        );

        const [produtoExiste] = await queryDB(
            "SELECT id FROM produto_comerciante WHERE id = ?",
            [req.params.id_produto]
        );

        // Validação de evento, comerciante e produto
        if (!eventoExiste) {
            throw new Error('É necessário relacionar o produto a um evento.');
        }

        if (!comercianteExiste) {
            throw new Error('É necessário relacionar o produto a um comerciante.');
        }

        if (!produtoExiste) {
            throw new Error('Para editar um produto é necessário indicar qual será editado.');
        } else {
            let { novoComerciante, novaDesignacao, novoValor } = req.body;
            let { comerciante, designacao, valor } = req.body;

            let atualizarProduto = await queryDB("UPDATE produto_comerciante SET  designacao = ?, valor = ? WHERE  designacao = ? AND valor = ?", [novaDesignacao, novoValor, designacao, valor]);

            res.status(200).json(atualizarProduto);
        }
    } catch (error) {

        res.status(400).send(error.message);
    }
});


router.get('/listar', async function (req, res) {
    try {
        // Verificação de evento
        const [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]
        );

        if (!eventoExiste) {
            throw new Error('Não existem eventos para listar produtos.');
        }

        const [comercianteExiste] = await queryDB(
            "SELECT id FROM comerciante WHERE id = ?",
            [req.params.id_comerciante]
        );

        if (!comercianteExiste) {
            throw new Error('Não existem comerciantes.');
        }

        // Verificação de produtos
        const [produtoExiste] = await queryDB("SELECT id FROM produto");

        if (comercianteExiste.length === 0) {
            throw new Error('Não existem produtos para listar.');
        } else {
            const produtos = await queryDB(`SELECT *
                                            FROM produto_comerciante`);

            res.status(200).json(produtos);
        }
    } catch (error) {

        res.status(400).send(error.message);
    }
});

module.exports = router;