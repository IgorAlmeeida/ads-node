const express = require('express');
const {Client} = require("pg");

const client = new Client({
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'fred',
    database : 'ads'
});
client.connect();


app = express();

/** 
 * Cenário I - Requisição com retorno de dados vazio
 */
app.get('/route1',(req, res) => {
    res.status(200).send({})

});

/**
 * Cenário II - Requisição com retorno de dados de uma única entidade 
 * 
 * Entidade: Produto
 */

app.get('/route2', async (req, res) => {
    let {rows} = await client.query("SELECT * FROM produto");
    res.status(200).send({produtos: rows});
});

/**
 * Cenário III - - Requisic ̧  ́ ao com retorno de duas entidades com relacionamentos de cardinalidade 1xN
 * 
 * Entidades: Marca -> Produto
 */

app.get('/route3', async (req, res) => {
    let {rows} = await client.query("SELECT * FROM marca");
    let marcas = rows;

    let tam = marcas.length;
    for (i = 0; i < tam; i++ ){
        let {rows} = await client.query("SELECT * FROM produto WHERE id_marca = "+ marcas[i].id);
        marcas[i].produtos = rows;
    }

    res.status(200).send({marcas});

});

/**
 * Cenario IV - Requisic ̧  ́ ao com retorno de duas entidades com relacionamentos de cardinalidade NxN
 * 
 * Entidades: Produto -> Categoria
 */

app.get('/route4', async (req, res) => {
    let {rows} = await client.query("SELECT * FROM produto LIMIT 5000");
    let produtos = rows;
    
    let tam = produtos.length;
    for (let i = 0; i < tam; i++) {
        let {rows} = await client.query("SELECT * FROM produto_categoria WHERE id_produto = "+produtos[i].id);
        let produtos_categorias = rows;

        let tam2 = produtos_categorias.length;

        let categorias = new Array();
        for (let j = 0; j < tam2; j++) {
            let {rows} = await client.query("SELECT * FROM categoria WHERE id = "+produtos_categorias[j].id_categoria);
            categorias.push(rows);
        }
        produtos[i].categorias = categorias;
    }

    res.status(200).send({produtos});
});

app.listen(3335, (req, res) => {
    console.log("Server on")
});






