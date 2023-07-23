import { Database } from './database.js';
import fs from 'fs';
import multer from 'multer';
import { Router } from 'express'
import csvParser from 'csv-parser';

const database = new Database();

const upload = multer({ dest: 'uploads/' });

const routes = Router()

// GET route to read the CSV file.
routes.get('/api/search', (req, res) => {

  try {
    const queryParams = req.query;

    fs.readFile('db.json', 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Error reading the JSON file.' });
      }

      const jsonData = JSON.parse(data);

      let filteredData = jsonData;

      const filterDataBySearchString = (data, searchString) => {
        const lowerCaseSearch = searchString.q.toLowerCase();
        return data.users.filter(user =>
          user.name.toLowerCase().includes(lowerCaseSearch) ||
          user.city.toLowerCase().includes(lowerCaseSearch) ||
          user.country.toLowerCase().includes(lowerCaseSearch) ||
          user.favorite_sport.toLowerCase().includes(lowerCaseSearch)
        );
      }
      filteredData = filterDataBySearchString(jsonData, queryParams);

      const response = {
        queryParams: queryParams,
        filteredData
      };

      res.json(response);
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error reading the JSON file.' });
  }
});

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const jsonArray = []
    fs.createReadStream(filePath)
      .pipe(csvParser()) 
      .on('data', (row) => {
        jsonArray.push(row)
      })
      .on('end', () => {
        resolve(jsonArray);
      })
  })
}




// POST route to handle the uploaded CSV file
routes.post('/api/upload', upload.single('csvFile'), async (req, res) => {
  console.log(req.file, 'req.file');
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
  }

  const csvFile = req.file;
  const filePath = `./${csvFile.path}`;
  const jsonArray = await parseCSV(filePath);
  console.log(jsonArray)
  await database.insertRange('users', jsonArray)
  res.json(jsonArray)
  
});
export default routes;

