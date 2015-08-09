var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

router.get('/', function(req, res) {
	res.json({"success": true});
});

router.get('/find', function(req, res){
	var conn = req.mongoConn;
	var collection = conn.collection('world_google');
	
	var o_id = new ObjectID("55c79546d65198e51b534813");

  	collection.find({"_id": o_id}).toArray(function(err, docs) {
    	if(err) throw err;
    	res.json({"success": true, "records": docs});
  	});
});

module.exports = router;
