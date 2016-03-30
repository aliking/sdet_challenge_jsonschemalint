'use strict';

var app = angular.module('app', false);

app.controller('validatorController', function ($scope, $http, $window) {

  var validator = $window['isMyJsonValid'];
  var YAML = $window['YAML'];

  var self = this;

  // Load the meta-schema
  $http.get('meta-schema/schema.json').success(function (data) {
    self.metaSchema = data;
  });

  this.reset = function() {
    self.document = "";
    self.schema = "";
  };


  this.parseMarkup = function(thing) {
    try {
      return JSON.parse(thing);
    } catch (e) {
      console.log('not json, trying yaml');
      return YAML.parse(thing);
    }
  };

  this.reformatMarkup = function(thing) {
    try {
      return JSON.stringify(JSON.parse(thing), null, '  ');
    } catch (e) {
      return YAML.stringify(YAML.parse(thing), 4, 2);
    }
  };

  this.formatDocument = function() {
    console.debug('formatDocument');

    try {
      var documentObject = this.parseMarkup(self.document);
      this.document = this.reformatMarkup(self.document);
    } catch (e) {
      // *shrug*
    }
  };



  this.validateDocument = function () {
    console.debug("document");
    self.documentErrors = [];
    self.documentMessage = "";

    // Parse as JSON
    try {
      self.documentObject = this.parseMarkup(self.document);

      // Do validation
      var schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "http://jsonschema.net",
  "type": "object",
  "properties": {
    "name": {
      "id": "http://jsonschema.net/name",
      "type": "string"
    },
    "contact_details": {
      "id": "http://jsonschema.net/contact_details",
      "type": "object",
      "anyOf": [
        {
          "required": [
            "phone"
          ]
        },
        {
          "required": [
            "email"
          ]
        }
      ],
      "properties": {
        "phone": {
          "id": "http://jsonschema.net/contact_details/phone",
          "type": "string",
"pattern": "^[0-9+()# -]*$",
"minLength": 5,
"maxLength": 30
        },
        "website": {
          "id": "http://jsonschema.net/contact_details/website",
          "type": "string",
"format" : "uri"
        },
        "email": {
          "id": "http://jsonschema.net/contact_details/email",
          "format": "email",
          "type": "string"
        },
        "other": {
          "id": "http://jsonschema.net/contact_details/other",
          "type": "array",
          "items": {
            "id": "http://jsonschema.net/contact_details/other/0",
            "type": "object",
            "properties": {
              "type": {
                "id": "http://jsonschema.net/contact_details/other/0/type",
                "type": "string"
              },
              "value": {
                "id": "http://jsonschema.net/contact_details/other/0/value",
                "type": "string"
              }
            },
            "additionalProperties": false
          },
          "additionalItems": false
        }
      },
      "additionalProperties": false
    },
    "content": {
      "id": "http://jsonschema.net/content",
      "type": "object",
      "properties": {
        "letter_body": {
          "id": "http://jsonschema.net/content/letter_body",
          "type": "string"
        },
        "challenge_checkvalue": {
          "id": "http://jsonschema.net/content/challenge_checkvalue",
          "type": "string",
          "pattern": "162329778993"
        }
      },
      "additionalProperties": false,
      "required": [
        "letter_body",
        "challenge_checkvalue"
      ]
    }
  },
  "additionalProperties": false,
  "required": [
    "name",
    "contact_details",
    "content"
  ]
};
      var documentValidator = validator(schema, {
        verbose: true
      });
      documentValidator(this.documentObject);
      console.log(documentValidator.errors)
      if (documentValidator.errors && documentValidator.errors.length) {
        this.documentErrors = documentValidator.errors;
      } else {
        this.documentMessage = "Document conforms to the JSON schema.";
      }
    } catch (e) {
      // Error parsing as JSON
      self.documentErrors = [{message: "Document is invalid JSON. Try http://jsonlint.com to fix it." }];
    }

    console.log("validateDocument");

  };


  // Document changes
  $scope.$watch(function () {
    return self.document;
  }, function (newValue, oldValue) {
    self.validateDocument();
  });


});
