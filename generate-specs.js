const $RefParser = require('@apidevtools/json-schema-ref-parser')
const fs = require('fs')

if (!fs.existsSync('./dist')){
  fs.mkdirSync('./dist');
}

$RefParser
  .dereference('./async_api/websocket_api.yaml')
  .then((schema) => {
    fs.writeFileSync('dist/async_api.json', JSON.stringify(schema, null, 2))
  })
  // .then(() => $RefParser.dereference('./open_api/json_api.yaml'))
  // .then((schema) => {
  //   // Deleting the licence key as it is not needed for codegenerators
  //   delete schema?.info?.license;
  //   fs.writeFileSync('dist/open_api.json', JSON.stringify(schema, null, 2))
  // })
  .catch((err) => {
    console.error(err)
  }).finally(() => {
    console.log("Generation process completed");
  })
