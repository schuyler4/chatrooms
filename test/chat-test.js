/* this file is for testing everything with the chatrooms */
var Chatroom = require('../data/chatroom');
var mocha = require('mocha');
var should = require('should');
var assert = require('assert');
var supertest = require('supertest');

var server = supertest.agent("http://localhost:3000");

/* all the tests */
describe("Routing", function() {

  /* test everything with the home page */
  describe("home", function() {
    it('should get the home page', function(done) {
      server
      .get('/')
      .expect(200)
      .end(function(err, res) {
         done();
      });
    });

    it('should create a new chatroom', function(done) {
      /*function generateJoinCode() {
        return "panda";
      }*/

      server
      .post('/')
      .send({joinCode: "chatroom", name: 'panda'})
      .expect("Content-type",/json/)
      .expect(200)
      .expect('Location', '/chatroom')
      .end(function(err, res) {
        //should.not.exist(err);
        console.log(res);
        done();
      });
    })
  });

  /* test everything that is in the chatroom*/
  describe("chatroom", function() {

  });
});
