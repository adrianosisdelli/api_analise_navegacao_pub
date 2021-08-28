var express = require('express');
var MySql  = require('sync-mysql');

var app = express();
var connection_info = {
    //
};


function cadastra_atendimento(conn, id_contrato, fase) {

    conn.query('insert into atendimento (id_contrato, fase) values (?, ?)', [id_contrato, fase]);
    return conn.query('SELECT MAX(id_atendimento) last_id_atendimento FROM atendimento;');
}

app.post("/atendimento/:id_contrato", function(req, resp) {
    
    let connection = new MySql(connection_info);
    let contrato = connection.query('select * from contrato where id_contrato_datacob = ?', [ req.params.id_contrato ]);
    
    if (contrato.length == 0) {
        let sql_inserir_contrato = 'insert into contrato (id_contrato_datacob, id_financiado_datacob, numero_contrato, nome_financiado, cpfcnpj_financiado) values (?, ?, ?, ?, ?)';
        let novo_contrato = connection.query(sql_inserir_contrato, [
            req.params.id_contrato,
            req.headers.id_financiado_datacob,
            req.headers.numero_contrato,
            req.headers.nome_financiado,
            req.headers.cpfcnpj_financiado
        ]);

        novo_contrato = connection.query('SELECT MAX(id_contrato) AS id_contrato FROM contrato;')[0].id_contrato;
        novo_atendimento = cadastra_atendimento(connection, novo_contrato, 'AM');

        resp.json(novo_atendimento);

        return;
    }
    else {
        id_contrato_bi = contrato[0].id_contrato;
        novo_atendimento = cadastra_atendimento(connection, id_contrato_bi, 'AM');

        resp.json(novo_atendimento);
    }

    connection.dispose();
});

app.get("/atendimento/:id_contrato", function(req, resp){

    let connection = new MySql(connection_info);

    let contrato = connection.query('select * from contrato where id_contrato = ?', [req.params.id_contrato]);
    let atendimentos = connection.query('select * from atendimento where id_contrato = ?', [req.params.id_contrato]);


    resp.json({
        dados_contrato: contrato[0],
        historico_atendimento: atendimentos
    });

    connection.dispose();
});



app.listen(3000);
