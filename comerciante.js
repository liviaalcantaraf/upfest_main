const {queryDB} = require("./connection.js");
const express = require("express");
const router = express.Router({mergeParams: true});

router.post("/comerciantes/criar", async function (req, res) {
    try {
        const [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]
        );
        if (!eventoExiste) {
            return res.status(400).json({message: 'É necessário relacionar o comerciante a um evento.'});
        } else {
            let designacao = req.body.designacao;
            let criarComerciante = await queryDB("INSERT INTO comerciante(evento, designacao) values (?, ?)", [req.params.id_evento, designacao]);
            res.status(200).json(criarComerciante);
        }
    } catch (e) {
        console.error(error);
        res.status(500).json({message: 'Ocorreu um erro ao criar o comerciante.'});

    }


});


router.post("/comerciantes/:id_comerciante/editar", async function (req, res) {
    try {

        const [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]
        );

        if (eventoExiste) {
            let novaDesignacao = req.body;
            let designacao = req.body;

            if (novaDesignacao.length > 0) {
                // Verificar se novaDesignacao tem um valor definido
                let atualizarComerciante = await queryDB("UPDATE comerciante SET designacao = ? WHERE designacao = ? ", [novaDesignacao, designacao]);

                res.status(200).json(atualizarComerciante);
            } else {
                res.status(400).json({
                    message: "O campo 'designacao' deve ser fornecido para a atualização."
                });
            }
        }
    } catch (e) {
        res.status(400).json({
            message: "Não foi possível atualizar o comerciante"
        });
    }
});


router.post("/registar_compra", async function (req, res) {
    try {
        let {participante, produto: id_produto, quantidade} = req.body;
        let {id_evento} = req.params;

        // Validar se existe alguma conta_cashless do participante nesse evento;
        let [conta] = await queryDB(
            "SELECT cc.id FROM participante p INNER JOIN conta_cashless cc ON p.id = cc.id WHERE cc.evento = ? AND p.email = ?",
            [id_evento, participante]
        );

        if (!conta) {
            return res.status(404).send("A conta não existe. Insira uma conta válida");
        }

        let [verificarProduto] = await queryDB(
            "SELECT * FROM produto_comerciante WHERE id = ?",
            [id_produto]
        );

        if (!verificarProduto) {
            return res.status(404).send("O produto indicado não foi encontrado.");
        }


        let [produto] = await queryDB("SELECT valor FROM produto_comerciante WHERE id = ?", [id_produto]);
        let [saldo] = await queryDB("SELECT valor_atual FROM conta_cashless WHERE id = ?", [conta.id]);
        // Calcular valor da compra que está a ser feita (considerar valor do produto e quantidade indicada)


        let valorCompra = produto.valor * quantidade;

        if (valorCompra > saldo.valor_atual) {
            return res.status(400).send("Saldo insuficiente.");
        }

        let novoSaldo = saldo.valor_atual - valorCompra;
        let data = Date.now();

        // Registar o movimento cashless do tipo "gasto"
        let movimento = await queryDB("INSERT INTO movimento_cashless (tipo, conta, valor, saldo, data) VALUES (?, ?, ?, ?, ?)",
            ["gasto", conta.id, valorCompra, novoSaldo, data]);

        // Registar o gasto cashless para o produto comprado e a quantidade
        await queryDB("INSERT INTO gasto_cashless (movimento, produto, quantidade, valor_unitario) VALUES (?, ?, ?, ?)",
            [movimento.insertId, id_produto, quantidade, produto.valor]);

        // Atualizar o saldo atual na tabela conta_cashless
        await queryDB("UPDATE conta_cashless SET valor_atual = ? WHERE id = ?", [novoSaldo, conta.id]);


       // sucesso de compra

        const produtosComprados = [{
            id_produto,
            quantidade,
            valor_unitario: produto.valor
        }];

        return res.status(200).json({
            message: "Compra efetuada com sucesso",
            produtosComprados
        });
    } catch (error) {
        res.status(500).json({
            message: "Ocorreu um erro ao registar sua compra. Tente novamente."
        });
        res.status(400).send(error.message);
    }
});


router.get('/comerciantes/listar', async function (req, res) {

    try {
        // verificação de id_evento
        let [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]);

        if (!eventoExiste) {
            return res.status(400).json({error: "Não existem eventos para listar comerciantes."});
        }

        // Verificação de comerciantes
        let [comercianteExiste] = await queryDB("SELECT id FROM comerciante");

        if (comercianteExiste.length === 0) {
            return res.status(400).json({error: "Não existem comerciantes para listar."});
        }

        // Se existirem evento e comerciantes, listar os comerciantes

        let listaComerciantes = await queryDB("SELECT id as id_comerciante, evento as evento, designacao as nome_comerciante FROM comerciante");

        res.status(200).json(listaComerciantes);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Ocorreu um erro ao listar comerciantes."});
    }


});

module.exports = router;