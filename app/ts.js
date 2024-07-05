const fetch = require('node-fetch');

const url = 'https://api.play.ht/api/v2/cloned-voices';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    AUTHORIZATION: 'f92f525195cb4b0eb136b2f4c92c88be',
    'X-USER-ID': 'd4ktcZTYe4TEix9S57OkV0vMZej1'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));