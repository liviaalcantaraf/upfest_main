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
        let { participante, produto: id_produto, quantidade } = req.body;
        let { id_evento } = req.params;

        if (!id_evento || !participante || !id_produto || !quantidade) {
            return res.status(400).send("Requisição inválida: Preencha todos os parâmetros necessários");
        }

        // Verificar a existência do produto
        const [verificaProduto] = await queryDB(
            "SELECT * FROM produto_comerciante WHERE id = ?",
            [id_produto]
        );

        if (!verificaProduto) {
            return res.status(404).send("Produto não encontrado");
        }

        // Verificar a existência da conta_cashless
        const [conta] = await queryDB(
            "SELECT cc.id FROM participante p INNER JOIN conta_cashless cc ON p.id = cc.id WHERE cc.evento = ? AND p.email = ?",
            [id_evento, participante]
        );

        if (!conta) {
            return res.status(404).send("Conta_cashless não encontrada.");
        }

        // Obter informações sobre o produto e saldo atual
        const [produto] = await queryDB("SELECT valor FROM produto_comerciante WHERE id = ?", [id_produto]);
        const [saldo] = await queryDB("SELECT valor_atual FROM conta_cashless WHERE id = ?", [conta.id]);

        const valorCompra = produto.valor * quantidade;

        if (valorCompra > saldo.valor_atual) {
            return res.status(400).send("Erro ao efetuar a compra, saldo insuficiente");
        }

        const novoSaldo = saldo.valor_atual - valorCompra;
        const data = Date.now();

        // Registar o movimento cashless do tipo "gasto"
        const movimento = await queryDB("INSERT INTO movimento_cashless (tipo, conta, valor, saldo, data) VALUES (?, ?, ?, ?, ?)",
            ["gasto", conta.id, valorCompra, novoSaldo, data]);

        // Registrar o gasto cashless para o produto comprado e a quantidade

        await queryDB("INSERT INTO gasto_cashless (movimento, produto, quantidade, valor_unitario) VALUES (?, ?, ?, ?)",
            [movimento.insertId, id_produto, quantidade, produto.valor]);

        // Atualizar o saldo atual na tabela conta_cashless
        await queryDB("UPDATE conta_cashless SET valor_atual = ? WHERE id = ?", [novoSaldo, conta.id]);

        return res.status(200).json({ message: "Compra efetuada com sucesso" });
    } catch (error) {
        errorHandler(error, res);
    }
});


router.get('/comerciantes/listar', async function (req, res) {

    try {
        // verificação de id_evento
        const [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]);

        if (!eventoExiste) {
            return res.status(400).json({error: "Não existem eventos para listar comerciantes."});
        }

        // Verificação de comerciantes
        const [comercianteExiste] = await queryDB("SELECT id FROM comerciante");

        if (comercianteExiste.length === 0) {
            return res.status(400).json({error: "Não existem comerciantes para listar."});
        }

        // Se existirem evento e comerciantes, listar os comerciantes
        const listaComerciantes = await queryDB("SELECT id as id_comerciante, evento as evento, designacao as nome_comerciante FROM comerciante");

        res.status(200).json(listaComerciantes);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Ocorreu um erro ao listar comerciantes."});
    }


});

module.exports = router;