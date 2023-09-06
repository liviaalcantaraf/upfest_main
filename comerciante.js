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
                throw new Error('É necessário relacionar o comerciante a um evento.');
            } else {
                let designacao = req.body.designacao;
                let criarComerciante = await queryDB("INSERT INTO comerciante(evento, designacao) values (?, ?)", [req.params.id_evento, designacao]);
                res.status(200).json(criarComerciante);
            }
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    });


router.post("/comerciantes/:id_comerciante/editar", async function (req, res) {
    try {
        const [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]
        );

        if (!eventoExiste) {
            throw new Error('É necessário relacionar o comerciante a um evento.');
        }

        let novaDesignacao = req.body;
        let designacao = req.body;

        if (novaDesignacao.length > 0) {
            // Verificar se novaDesignacao tem um valor definido
            let atualizarComerciante = await queryDB("UPDATE comerciante SET designacao = ? WHERE designacao = ? ", [novaDesignacao, designacao]);

            res.status(200).json(atualizarComerciante);
        } else {
            throw new Error("O campo 'designacao' deve ser fornecido para a atualização.");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});


router.post("/registar_compra", async function (req, res) {
    try {
        let { participante, produto: id_produto, quantidade } = req.body;


// necessidade de preencher todos os campos do registo de compra
        if (!participante || !id_produto || !quantidade) {
            throw new Error("Para registar a compra, é necessário que todos os campos estejam preenchidos.");
        }


        // Validar se existe alguma conta_cashless do participante nesse evento;
        let { id_evento } = req.params;
        let [conta] = await queryDB(
            "SELECT c.id FROM participante p INNER JOIN conta_cashless c ON p.id = c.id WHERE c.evento = ? AND p.email = ?",
            [id_evento, participante]
        );

        if (!conta) {
            throw new Error("A conta não existe. Insira uma conta válida");
        }

        let [verificarProduto] = await queryDB(
            "SELECT * FROM produto_comerciante WHERE id = ?",
            [id_produto]
        );

        if (!verificarProduto) {
            throw new Error("O produto indicado não foi encontrado.");
        }

        let [produto] = await queryDB("SELECT valor FROM produto_comerciante WHERE id = ?", [id_produto]);
        let [saldo] = await queryDB("SELECT valor_atual FROM conta_cashless WHERE id = ?", [conta.id]);

        // Calcular valor da compra que está sendo feita (considerando valor do produto e quantidade indicada)
        let valorCompra = produto.valor * quantidade;

        if (valorCompra > saldo.valor_atual) {
            throw new Error("Saldo insuficiente.");
        }

        let novoSaldo = saldo.valor_atual - valorCompra;
        let data = Date.now();

        // Registar movimento
        let movimento = await queryDB("INSERT INTO movimento_cashless (tipo, conta, valor, saldo, data) VALUES (?, ?, ?, ?, ?)",
            ["gasto", conta.id, valorCompra, novoSaldo, data]);

        // Registo de gasto
        await queryDB("INSERT INTO gasto_cashless (movimento, produto, quantidade, valor_unitario) VALUES (?, ?, ?, ?)",
            [movimento.insertId, id_produto, quantidade, produto.valor]);

        // Atualizar o saldo atual na tabela conta_cashless
        await queryDB("UPDATE conta_cashless SET valor_atual = ? WHERE id = ?", [novoSaldo, conta.id]);

        // Sucesso de compra

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

        res.status(400).send(error.message);
    }
});

router.get('/comerciantes/listar', async function (req, res) {

    try {
        // Verificação de id_evento
        let [eventoExiste] = await queryDB(
            "SELECT id FROM evento WHERE id = ?",
            [req.params.id_evento]);

        if (!eventoExiste) {
            throw new Error("Não existem eventos para listar comerciantes.");
        }

        // Verificação de comerciantes
        let [comercianteExiste] = await queryDB("SELECT id FROM comerciante");

        if (comercianteExiste.length === 0) {
            throw new Error("Não existem comerciantes para listar.");
        }

        // Se existirem eventos e comerciantes, listar os comerciantes

        let listaComerciantes = await queryDB("SELECT id as id_comerciante, evento as evento, designacao as nome_comerciante FROM comerciante");

        res.status(200).json(listaComerciantes);
    } catch (error) {

        res.status(400).send(error.message);
    }
});

module.exports = router;