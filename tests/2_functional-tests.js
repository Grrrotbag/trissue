const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let test_id;
let test_id2;

suite('Functional Tests', function() {

  suite('POST to /api/issues/{project}', function() {
    test("Create an issue with every field", function (done) {
      chai.request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: 'Test Title',
          issue_text: 'test text',
          created_by: 'Functional Test - Every field filled (valid input)',
          assigned_to: 'Test assignee',
          status_text: 'In QA'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'Test Title')
          assert.equal(res.body.issue_text, 'test text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled (valid input)')
          assert.equal(res.body.assigned_to, 'Test assignee')
          assert.equal(res.body.status_text, 'In QA')
          assert.equal(res.body.open, true)
          assert.property(res.body, 'created_on')
          assert.property(res.body, 'updated_on')
          assert.property(res.body, '_id')
          test_id = res.body._id
          done()
        });
    });

    test("Create an issue with only required fields", function (done) {
      chai.request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: 'Test Title',
          issue_text: 'test text',
          created_by: 'Functional Test - only required fields (valid input)',
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'Test Title')
          assert.equal(res.body.issue_text, 'test text')
          assert.equal(res.body.created_by, 'Functional Test - only required fields (valid input)')
          assert.equal(res.body.assigned_to, '')
          assert.equal(res.body.status_text, '')
          assert.equal(res.body.open, true)
          assert.property(res.body, 'created_on')
          assert.property(res.body, 'updated_on')
          assert.property(res.body, '_id')
          test_id2 = res.body._id
          done()
        });
    });

    test("Create an issue with missing required fields", function (done) {
      chai.request(server)
        .post("/api/issues/test_project")
        .send({
          issue_title: 'Test Title',
          // issue_text: 'test text',
          created_by: 'Functional Test - missing required fields (invalid input)',
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.text, '{"error":"required field(s) missing"}')
          
          done()
        });
    });
  })

  suite("GET from /api/issues/{project}", function() {
    test("Get all issues related to project", function (done) {
      chai
        .request(server)
        .get("/api/issues/test_project")
        .query({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'assigned_to')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          assert.equal(res.body[0].project_name, "test_project")
          done();
        });
    });

    test("View issues on a project with one filter", function (done) {
      chai
        .request(server)
        .get("/api/issues/test_project")
        .query({ assigned_to: "test assignee"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          assert.equal(res.body[0].project_name, "test_project")
          assert.equal(res.body[0].assigned_to, "test assignee")
          done();
        });
    });

    test("View issues on a project with multiple filters", function (done) {
      chai
        .request(server)
        .get("/api/issues/test_project")
        .send({ assigned_to: "test assignee", status: "test status" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], '_id')
          assert.equal(res.body[0].project_name, "test_project")
          assert.equal(res.body[0].assigned_to, "test assignee")
          assert.equal(res.body[0].status_text, "test status")
          done();
        });
    });
  })

  suite("PUT to /api/issues/{project}", function() {
    test("Update one field on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/test_project")
        .send({ _id: test_id, issue_title: "changed title" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, `{"result":"successfully updated", "_id":"${test_id}"}`)
          done();
        });
    });

    test("Update multiple fields on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/test_project")
        .send({ _id: test_id, issue_title: "changed title and text", issue_text: "changed title and text" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, `{"result":"successfully updated", "_id":"${test_id}"}`)
          done();
        });
    });

    test("Update an issue with missing _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test_project")
        .send({ issue_title: "changed title and text", issue_text: "changed title and text" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, `{"error":"missing _id"}`)
          done();
        });
    });

    test("Update an issue with no fields to update", function (done) {
      chai
        .request(server)
        .put("/api/issues/test_project")
        .send({ _id: test_id })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, `{"error":"no update field(s) sent","_id":"${test_id}"}`)
          done();
        });
    });

    test("Update an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test_project")
        .send({ _id: "1234" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"could not update","_id":"1234"}')
          done();
        });
    });
  })

  suite("DELETE /api/issues/{project}", function() {
    test("Delete an issue", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test_project")
        .send({ _id: test_id })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, `{"result":"succesfully deleted","_id":"${test_id}"}`)
          done();
        });
    });

    test("Delete an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test_project")
        .send({ _id: "1234" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"could not delete","_id":"1234"}')
          done();
        });
    });

    test("Delete an issue with missing _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test_project")
        .query({ })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"missing _id"}')
          done();
        });
    });
  })

});