const express = require("express");
const res = require("express/lib/response");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");
const req = require("express/lib/request");

//database
connection
  .authenticate()
  .then(() =>{
    console.log("Conexão feita com o banco de dados");
  })
  .catch((msgErro) =>{
    console.log(msgErro);
  })

//estou dizendo pro express para o express usar o EJS como view engine
app.set("view engine", "ejs");
//aceitar arquivos estáticos(css, imagens)
app.use(express.static("public"));

//configuração do bodyparser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


/////////////////////////////////////Rotas////////////////////////////////

//index da aplicação
app.get("/", (req, res) => {
  Pergunta.findAll({raw:true,order:[
    ['id','DESC']
  ]}).then(perguntas =>{
    res.render("index",{
      perguntas:perguntas
    });
  });
});

//rota para cadastrar perguntas
app.get("/perguntar", (req, res) => {
  res.render("perguntar");
});



//rota para visualizar pergunta e cadastrar respostas
app.get("/pergunta/:id",(req, res) =>{
  var id = req.params.id;
  Pergunta.findOne({
    where:{
      id:id
    }
  }).then(pergunta =>{
    if (pergunta != undefined) { //Achou
      Resposta.findAll({
        where: {id_pergunta : pergunta.id},
        order: [['id','DESC']]
      }).then(respostas => {
        res.render("pergunta",{
          pergunta:pergunta,
          respostas:respostas
        });
      })      
    }else{ //Não achou
      res.redirect("/")
    }
  });
});

//rota para salvar perguntas
app.post("/salvarpergunta", (req, res) => {
  var titulo = req.body.titulo;
  var descricao = req.body.descricao;
  Pergunta.create({
    titulo: titulo,
    descricao: descricao
  }).then(() => {
    res.redirect("/");
  });
});

//rota para salvar respostas
app.post("/salvarresposta", (req, res) => {
  var corpo = req.body.corpo;
  var pergunta = req.body.pergunta;
  Resposta.create({
    corpo: corpo,
    id_pergunta: pergunta
  }).then(() => {
    res.redirect("/pergunta/" + pergunta);
  });
});

app.listen(8000, () => {
  console.log("App rodando!");
});
