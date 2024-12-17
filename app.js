// Incluir as bibliotecas
// Extensão para gerenciar as requisições, rotas e URLs, entre outras funcionalidades
const express = require('express');
// Incluir a biblioteca para ler o conteúdo do arquivo CSV
const csv = require('csv');
// Permite interagir com o sistema de arquivos
const fs = require('fs');
// Incluir a conexão com banco de dados
const db = require('./db/models');
const { delimiter } = require('path');
// Chamar a função express
const app = express();

// Criar a rota importar CSV
app.get("/", (req, res) => {

    // Caminho para o arquivo CSV
    const arquivoCSV = 'campanha.csv';

    // Ler o arquivo CSV
    fs.createReadStream(arquivoCSV)
        
        // pipe - Conecta fluxos de leitura e escrita sem armazenar os dados intermediários em memória
        // columns: true - Faz com que a primeira linha do arquivo CSV seja tratada como cabeçalho, o nome do cabeçalho corresponde ao nome da coluna do banco de dados
        // delimiter: ';' - É o delimitador que faz a quebra das linhas (divisão de colunas) dentro do arquivo CSV
        .pipe(csv.parse({ columns: true, delimiter: ';'}))

        // Acionar o evento data quando ler uma linha e executar a função enviando os dados como parâmetro
        .on('data', async (dadosLinha) => {
            console.log(dadosLinha);
            //console.log(dadosLinha[0]);

            // Recuperar o registro do banco de dados
            const registro = await db.Registros.findOne({

                // Indicar quais colunas recuperar
                attributes: ['id'],

                // Acrescentando condição para indicar qual registro deve ser retornado do banco de dados
                where: { telefone: dadosLinha.telefone}
            });

            // Acessa o IF quando o telefone não está cadastrado no banco de dados
            if(!registro){
                
                // Cadastrar o usário no banco de dados
                await db.Registros.create(dadosLinha);
            }
        });

    return res.send("Importação concluída.");
});

// Iniciar o servidor na porta 8080, criar a função utilizando modelo Arrow function para retornar a mensagem de sucesso
app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});