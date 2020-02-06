require('dotenv').config();
const express = require('express');
const {PORT} = require('./config');
//const {checkKey} = require('./tools/configTools');
const {router:postRouter} = require('./routers/postReceive');
const {router:inventoryRouter} = require('./routers/inventoryRouter');
const {router:getTokenRouter} = require('./routers/getTokenRouter');
const app = express();

//app.use(checkKey);
//app.use(jsonParser);
app.use('/order',postRouter);
app.use('/inventory',inventoryRouter);
app.use('/token',getTokenRouter);

let server;

function runServer(port = PORT) {
  return new Promise((resolve, reject) => {
      server = app.listen(port, () => {
		console.log(`Your app is listening on port ${port}`);
		console.log("anything");
		console.log("2nd=");
        resolve();
      })
        .on('error', err => {
          reject(err);
        });
    });
}

function closeServer(){
	return new Promise((resolve,reject) => {
		console.log("closing server");
		server.close(err => {
			if(err){
				return reject(err);
			}
			resolve();
		});
	});
}

if (require.main === module){
	runServer().catch(err => console.error(err));
}
//test
module.exports = { app, runServer, closeServer };