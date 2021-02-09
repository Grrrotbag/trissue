"use strict";

const expect = require("chai").expect;
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");

// =============================================================================
// Config
// =============================================================================

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log("Database connection status: ", mongoose.connection.readyState);
});

const { Schema } = mongoose;

const IssueSchema = new Schema({
  project_name: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  created_on: { type: Date, required: true },
  updated_on: { type: Date, required: true },
  assigned_to: { type: String },
  status_text: { type: String },
  open: { type: Boolean, required: true, default: true },
});

let Issue = mongoose.model("Issue", IssueSchema);

// =============================================================================
// API Routes
// =============================================================================

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;

      const params = [
        "_id",
        "issue_title",
        "issue_text",
        "created_on",
        "created_by",
        "updated_on",
        "created_by",
        "assigned_to",
        "open",
        "status_text",
      ];

      let query = { project_name: project };

      params.forEach((param) => {
        if (req.query[param]) {
          query[param] = req.query[param];
        }
      });

      Issue.find(query, (err, issues) => {
        if (err) return res.send(err);
        if (!issues.length) {
          return res.send("no issues");
        } else {
          return res.send(issues);
        }
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      const newIssue = new Issue({
        project_name: project,
        issue_title: issue_title,
        issue_text: issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        open: true,
      });

      newIssue.save((err, issue) => {
        if (err) {
          return res.json({ error: "something went wrong" });
        }

        return res.json({
          _id: issue._id,
          project_name: project,
          issue_title: issue.issue_title,
          issue_text: issue.issue_text,
          created_on: issue.created_on,
          updated_on: issue.updated_on,
          created_by: created_by,
          assigned_to: issue.assigned_to || "",
          status_text: issue.status_text || "",
          open: issue.open,
        });
      });
    })

    .put(function (req, res) {
      const project = req.params.project;

      // console.log("body: ", req.body)

      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }

      let id = req.body._id;

      if (
        !req.body.issue_title &&
        !req.body.issue_text &&
        !req.body.created_by &&
        !req.body.assigned_to &&
        !req.body.status_text &&
        !req.body.open
      ) {
        return res.json({ error: "no update field(s) sent", _id: id });
      }

      const params = [
        "_id",
        "issue_title",
        "issue_text",
        "created_on",
        "created_by",
        "created_by",
        "assigned_to",
        "open",
        "status_text",
      ];

      let update = { updated_on: new Date() };

      params.forEach((param) => {
        if (req.body[param]) {
          update[param] = req.body[param];
        }
      });

      // console.log("update: ", update)

      Issue.findByIdAndUpdate(id, update, { new: true }, (err, doc) => {
        if (err) return res.json({ error: "could not update", _id: id });
        return res.json({ result: "successfully updated", _id: id });
      });
    })

    .delete(function (req, res) {
      let project = req.params.project;

      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }

      let id = req.body._id;

      Issue.deleteOne({ _id: id }, function (err) {
        if (err) return res.json({ error: "could not delete", _id: id });
        res.json({ result: "successfully deleted", _id: id });
      });
    });
};
