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

    /*it('should return a 404', function(done) {
      chai.request(server)
      .get('/hello/hello')
      .end(function(err, res) {
        res.should.have.status(404);
      });
    });*/
  });

  /* test everything that is in the chatroom
  - join the chatroom with a different user
  - make sure it gets the chatroom
  - have a different user leave the chatroom
  - have the creator destroy the chatroom
  */

  describe("chatroom", function() {
    function generateJoinCode() {
      return Date.now();
    }

    var joinCode = generateJoinCode();

    it('should create a new chatroom', function(done) {
      console.log(joinCode);
      chai.request(server)
      .post('/')
      .send({joinCode: joinCode, name: 'creator'})
      .end(function(err, res) {
        res.should.have.status(200);
        res.type.should.equal('text/html');
        done();
      });
    });

    it('should join the chatroom with the first user', function(done) {
      console.log(joinCode);
      chai.request(server)
      .post('/join')
      .send({joinCode: joinCode, name: 'first user'})
      .end(function(err, res) {
        res.should.have.status(200);
        res.type.should.equal('text/html');
        done();
      });
    });

    it('should join the chatroom with the secound user', function(done) {
      console.log(joinCode);
      chai.request(server)
      .post('/join')
      .send({joinCode: joinCode, name: 'secound user'})
      .end(function(err, res) {
        res.should.have.status(200);
        res.type.should.equal('text/html');
        done();
      });
    });

    it('should leave a chatroom with the secound user', function(done) {
      chai.request(server)
      .post('/leave')
      .end(function(err, res) {
        res.should.have.status(200);
        res.type.should.equal('text/html');
        done();
      });
    });

    it('should destroy a chatroom', function(done) {
      chai.request(server)
      .post('/destroy')
      .end(function(err, res) {
        res.should.have.status(200);
        res.type.should.equal('text/html');
        done();
      });
    });
  });
});
