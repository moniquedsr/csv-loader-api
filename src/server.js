import express from 'express';
import routes from './routes.js';

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.options('*', (req, res) => {
  res.status(200).end();
});

app.use(express.json());

app.use(routes);

app.use((req, res) => {
  res.status(404).end();
});

const port = 3333;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
