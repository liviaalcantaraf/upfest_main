const express = require('express');
const app = express();

app.use(express.json());

/*app.use("/palco", require("./palco.js"));
app.use("/serieBilhetes", require("./serieBilhetes.js"));
app.use("/artista", require("./artista.js"));
app.use("/concerto", require("./concerto.js"));

app.use("/bilhete", require("./bilhete.js"));
app.use("/participante", require("./participante.js"));
app.use("/pagamento", require("./pagamento.js"));*/

app.use("/cashless/:id_evento/comerciantes/:id_comerciante/produtos", require("./produto.js"));
app.use("/cashless/:id_evento", require("./comerciante.js"));

//app.use("/carregamento", require("./carregamento.js"));

app.listen(3000);
