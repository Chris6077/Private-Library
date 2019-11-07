/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const CONN = process.env.CONN;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(CONN, (err, db) => {
        db.collection("books").find().toArray((err, docs) => {
          res.status(200).json(docs.map(item => ({
            title: item.title,
            _id: item._id,
            commentcount: item.comments.length
          })));
          db.close();
        })
      });
    })
    
    .post(function (req, res){
      if (req.body.title === "") return res.status(403).send("missing title");
      MongoClient.connect(CONN, (err, db) => {
        db.collection("books").insertOne({title: req.body.title, comments: []}, (err, docs) => {
          res.json(docs.ops[0]);
          db.close();
        })
      });
    })
    
    .delete(function(req, res){
      MongoClient.connect(CONN, (err, db) => {
        db.collection("books").remove({}, (err, docs) => {
          err || !docs.result.ok ? res.status(403).json("no book exists") : res.status(200).json("complete delete successful");
          db.close();
        })
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      MongoClient.connect(CONN, (err, db) => {
        db.collection("books").findOne({_id: ObjectId(req.params.id)}, (err, docs) => {
          err || docs === null ? res.status(403).send("no book exists") : res.status(200).json(docs);
          db.close();
        })
      });
    })
    
    .post(function(req, res){
      MongoClient.connect(CONN, (err, db) => {
        db.collection("books").findOneAndUpdate({_id: ObjectId(req.params.id)}, {$push: {comments: req.body.comment}}, {returnOriginal: false}, (err, docs) => {
          err || docs.lastErrorObject.updatedExisting === false ? res.status(403).send("no book exists") : res.status(200).json(docs.value);
          db.close();
        })
      });
    })
    
    .delete(function(req, res){
      MongoClient.connect(CONN, function(err, db) {
        db.collection("books").remove({_id: ObjectId(req.params.id)}, (err, docs) => {
          err || !docs.result.ok ? res.status(403).send("invalid _id") : res.status(200).json("delete successful");
          db.close();
        })
      });
    });
};