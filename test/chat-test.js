/* this file is for testing everything with the chatrooms */
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var mocha = require('mocha');
var should = chai.should();
chai.use(chaiHttp);

/* all the tests */
describe("Routing", function() {

  /* test everything with the home page */
  describe("home", function() {
    it('should get the home page', function(done) {
      chai.request(server)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
    });

    it('should create a new chatroom', function(done) {
      /*function generateJoinCode() {
        return "panda";
      }*/

      chai.request(server)
      .post('/')
      .send({joinCode: "chatroom", name: 'panda'})
      .end(function(err, res) {
        res.should.have.status(200);
     done();
        done();
      });
    });

    it('should join a chatroom', function(done) {
      chai.request(server)
      .post('/join')
      .send({joinCode: "chatroom", name: "alpha"})
      .end(function(err, res) {
        //should.not.exist(err);
        done();
      });
    });
  });

  /* test everything that is in the chatroom*/
  describe("chatroom", function() {
    it('should get the chatroom created', function(done) {
      chai.request(server)
      .get('/chatroom')
      .end(function(err, res) {
         done();
      });
    })

    it('should leave a chatroom', function(done) {
      chai.request(server)
      .post('/message')
      .end(function(err, res) {
        done();
      })
    });
  });
});
