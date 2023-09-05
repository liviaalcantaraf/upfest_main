const {queryDB} = require("./connection.js");
const express = require("express");
const router = express.Router({mergeParams: true});


router.post("/criar", async function (req, res) {


        try {
//validação de id_evento e id_comerciante
            const [eventoExiste] = await queryDB(
                "SELECT id FROM evento WHERE id = ?",
                [req.params.id_evento]
            );

            const [comercianteExiste] = await queryDB(
                "SELECT id FROM comerciante WHERE id = ?",
                [req.params.id_comerciante]
            );


            if (!comercianteExiste) {
                return res.status(400).json({message: 'É necessário relacionar o produto a um comerciante.'});
            }
            if (!eventoExiste) {
                return res.status(400).json({message: 'É necessário relacionar o produto a um evento.'});
            } else {
                let {designacao, valor} = req.body;
                let comerciante = req.params.id_comerciante;

                let criarProduto = await queryDB("INSERT INTO produto_comerciante( comerciante, designacao, valor) values (?, ?, ?)", [comerciante, designacao, valor]);
                res.status(200).json(criarProduto);
            }


        } catch
            (e) {
            console.error(e)
            res.json({error: "Não foi possível criar produto, tente novamente."});
        }
        console.log(req.params.id_comerciante);

    }
)
;

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
        //validação de evento, comerciante e produto
        if (!eventoExiste) {
            return res.status(400).json({message: 'É necessário relacionar o produto a um evento.'});
        }

        if (!comercianteExiste) {
            return res.status(400).json({message: 'É necessário relacionar o produto a um comerciante.'});
        }

        if (!produtoExiste) {
            return res.status(400).json({message: 'Para editar um produto é necessário indicar qual será editado.'});
        } else {
            let {novoComerciante, novaDesignacao, novoValor} = req.body;
            let {comerciante, designacao, valor} = req.body;

            let atualizarProduto = await queryDB("UPDATE produto_comerciante SET  designacao = ?, valor = ? WHERE  designacao = ? AND valor = ?", [novaDesignacao, novoValor, designacao, valor]);

            res.status(200).json(atualizarProduto);
        }


    } catch (e) {
        console.error(e)
        res.json({error: "Não foi possível atualizar o produto, tente novamente."});
    }
});


router.get('/listar', async function (req, res) {


    try {
        // Verificação de evento
        const [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]);

        if (!eventoExiste) {
            return res.status(400).json({error: "Não existem eventos para listar produtos."});
        }

        const [comercianteExiste] = await queryDB(
            "SELECT id FROM comerciante WHERE id = ?",
            [req.params.id_comerciante]);

        if (!comercianteExiste) {
            return res.status(400).json({error: "Não existem comerciantes"});
        }

        // Verificação de produtos
        const [produtoExiste] = await queryDB("SELECT id FROM produto");

        if (comercianteExiste.length === 0) {
            return res.status(400).json({error: "Não existem produtos para listar"});

        } else {
            const produtos = await queryDB(`SELECT *
                                            FROM produto_comerciante`);

            res.status(200).json(produtos);
        }

    } catch (e) {
        console.error(error);
        res.status(500).json({message: 'Ocorreu um erro ao listar os produtos.'});

    }


});


module.exports = router;