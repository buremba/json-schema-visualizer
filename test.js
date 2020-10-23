const betterAjvErrors = require('./ajv/index');
const Ajv = require('ajv');

const a = {
  "type":"object",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title":"The analytics model definition",
  "required":[
    "version",
    "name",
    "from"
  ],
  "definitions":{
    "hidden":{
      "type":"boolean",
      "default":false
    },
    "label":{
      "type":"string",
      "title":"The label that will be visible in UI",
      "minLength":1
    },
    "description":{
      "type":"string",
      "title":"The description will be used in UI"
    },
    "stringOperators":{
      "type": "string",
      "enum":[
        "equals",
        "notEquals",
        "in",
        "contains",
        "startsWith",
        "endsWith",
        "notContains"
      ]

    },
    "anyOperators":{
      "type": "string",
      "enum":[
        "isSet",
        "isNotSet"
      ]

    },
    "numberOperators":{
      "type": "string",
      "enum":[
        "equals",
        "lessThan",
        "greaterThan"
      ]

    },
    "dateOperators":{
      "type": "string",
      "enum":[
        "equals",
        "lessThan",
        "greaterThan"
      ]

    },
    "arrayOperators":{
      "type": "string",
      "enum":[
        "includes",
        "notIncludes"
      ]

    },
    "timeOperators":{
      "type": "string",
      "enum":[
        "includes",
        "notIncludes"
      ]

    },
    "booleanOperators":{
      "type": "string",
      "enum":[
        "is"
      ]

    },
    "timestampOperators":{
      "type": "string",
      "enum":[
        "equals",
        "lessThan",
        "greaterThan"
      ]

    },
    "fieldType":{
      "type": "string",
      "enum":[
        "string",
        "integer",
        "double",
        "long",
        "boolean",
        "date",
        "time",
        "timestamp",
        null
      ]
    },
    "reportOptions":{
      "type":"object",
      "title":"Defines how should we show the value of the metric in user interface",
      "properties":{
        "suffix":{
          "type":"string",
          "title":"The value will be added to the dimension value as suffix",
          "default":"",
          "examples":[
            "USD"
          ]
        },
        "prefix":{
          "type":"string",
          "title":"The value will be added to the dimension value as prefix",
          "default":"",
          "examples":[
            "$"
          ]
        }
      }
    },
    "filters":{
      "type":"array",
      "items":{
        "type":"object",
        "title":"The list of filters",
        "required":[
          "dimension",
          "operator"
        ],
        "allOf":[
          {
            "if":{
              "properties":{
                "fieldType":{
                  "const":"string"
                }
              }
            },
            "then":{
              "properties":{
                "operator": {
                  "$ref":"#/definitions/stringOperators"
                }
              },
              "required": ["operator"]
            }
          },
          {
            "if":{
              "properties":{
                "fieldType":{
                  "enum":["integer","double","long"]
                }
              }
            },
            "then":{
              "properties":{
                "operator": {
                  "$ref":"#/definitions/numberOperators"
                }
              },
              "required": ["operator"]
            }
          },
          {
            "if":{
              "properties":{
                "fieldType":{
                  "const":"timestamp"
                }
              }
            },
            "then":{
              "properties":{
                "operator": {
                  "$ref":"#/definitions/timestampOperators"
                }
              },
              "required": ["operator"]
            }
          },
          {
            "if":{
              "properties":{
                "fieldType":{
                  "const":"date"
                }
              }
            },
            "then":{
              "properties":{
                "operator": {
                  "$ref":"#/definitions/dateOperators"
                }
              },
              "required": ["operator"]
            }
          },
          {
            "if":{
              "properties":{
                "fieldType":{
                  "const":"boolean"
                }
              }
            },
            "then":{
              "properties":{
                "operator": {
                  "$ref":"#/definitions/booleanOperators"
                }
              },
              "required": ["operator"]
            }
          },
          {
            "if":{
              "properties":{
                "fieldType":{
                  "const":"time"
                }
              }
            },
            "then":{
              "properties":{
                "operator": {
                  "$ref":"#/definitions/timeOperators"
                }
              },
              "required": ["operator"]
            }
          },
          {
            "if":{
              "properties":{
                "fieldType":{
                  "pattern": "^array+"
                }
              }
            },
            "then":{
              "properties":{
                "operator": {
                  "$ref":"#/definitions/arrayOperators"
                }
              },
              "required": ["operator"]
            }
          }
        ],
        "properties":{
          "dimension":{
            "type":"string",
            "examples":[
              "campaign_name"
            ]
          },
          "fieldType": {
            "$ref":"#/definitions/fieldType"
          },
          "connector":{
            "default":"and",
            "enum":[
              "and",
              "or"
            ]
          },
          "value":{
            "title":"The value that will be passed to the operator. Note that if operator is not isSet or isNotSet, this value is required."
          }
        }
      }
    }
  },
  "properties":{
    "version":{
      "type":"string",
      "title":"The version of the model schema"
    },
    "from":{
      "type":"string",
      "title":"The target table in your database"
    },
    "label":{
      "$ref":"#/definitions/label"
    },
    "description":{
      "$ref":"#/definitions/description"
    },
    "hidden":{
      "$ref":"#/definitions/hidden"
    },
    "category":{
      "type":"string",
      "minLength":1
    },
    "relations":{
      "type":"object",
      "examples": [{"relationName": {"model": "campaign", "targetColumn": "id", "sourceColumn": "campaign_id"}}],
      "additionalProperties":{
        "type":"object",
        "additionalProperties":false,
        "oneOf":[
          {
            "required":[
              "targetColumn",
              "sourceColumn"
            ]
          },
          {
            "required":[
              "sql"
            ]
          }
        ],
        "properties":{
          "label":{
            "$ref":"#/definitions/label"
          },
          "description":{
            "$ref":"#/definitions/description"
          },
          "hidden":{
            "$ref":"#/definitions/hidden"
          },
          "model":{
            "type":"string",
            "title":"The target model of the relation",
            "examples": ["campaign"]
          },
          "relationType":{
            "type":"string",
            "enum":[
              "oneToOne",
              "oneToMany",
              "manyToOne",
              "manyToMany"
            ],
            "title":"The Relationtype Schema",
            "default":"oneToOne"
          },
          "sql":{
            "type":"string",
            "title":"The SQL expression join relation to the target table",
            "examples":[
              "{{TABLE}}.campaign_id = {{TARGET}}.id"
            ]
          },
          "targetColumn":{
            "type":"string",
            "title":"The column of the target model",
            "examples":[
              "id"
            ]
          },
          "sourceColumn":{
            "type":"string",
            "title":"The column of the source model",
            "examples":[
              "campaign_id"
            ]
          },
          "joinType":{
            "type":"string",
            "enum":[
              "leftJoin",
              "innerJoin",
              "rightJoin",
              "fullJoin"
            ],
            "title":"Defines how should we join to the target modeol",
            "default":"leftJoin"
          }
        },
        "required":[
          "model"
        ]
      }
    },
    "measures":{
      "type":"object",
      "examples": [{"measureName": {"sql": "total_spent", "aggregation": "sum", "reportOptions": {"prefix": "$"}}}],
      "additionalProperties":{

        "type":"object",
        "additionalProperties":false,
        "oneOf":[
          {
            "required":[
              "column"
            ]
          },
          {
            "required":[
              "sql"
            ]
          }
        ],
        "required":[
          "aggregation"
        ],
        "properties":{
          "label":{
            "$ref":"#/definitions/label"
          },
          "description":{
            "$ref":"#/definitions/description"
          },
          "hidden":{
            "$ref":"#/definitions/hidden"
          },
          "category":{
            "type":"string",
            "minLength":1
          },
          "column":{
            "type":"string",
            "title":"The column of the measure",
            "description":"The column must be present the the source table",
            "examples":[
              "total_spent"
            ]
          },
          "sql":{
            "type":"string",
            "title":"The SQL expression of the measure",
            "description":"The SQL expression must evaulate to a number value",
            "examples":[
              "total_spent / 2"
            ]
          },
          "filters":{
            "$ref":"#/definitions/filters"
          },
          "aggregation":{
            "type":"string",
            "title":"The aggregation function that will calculate the final value.",
            "enum":[
              "count",
              "countUnique",
              "sum",
              "minimum",
              "maximum",
              "average",
              "approximateUnique"
            ]
          },
          "reportOptions":{
            "$ref":"#/definitions/reportOptions"
          }
        }
      }
    },
    "dimensions":{
      "type":"object",
      "examples": [{"dimensionName": {"column": "campaign_name" }}],
      "additionalProperties":{
        "type":"object",
        "dependencies":{
          "postOperations":[
            "fieldType"
          ]
        },
        "oneOf":[
          {
            "required":[
              "column"
            ]
          },
          {
            "required":[
              "sql"
            ]
          }
        ],
        "allOf":[
          {
            "if":{
              "properties":{
                "fieldType":{
                  "const":"timestamp"
                }
              }
            },
            "then":{
              "properties":{
                "postOperations":{
                  "type":"array",
                  "uniqueItems": true,
                  "items":{
                    "enum":[
                      "hour",
                      "day",
                      "week",
                      "month",
                      "year",
                      "hourOfDay",
                      "dayOfMonth",
                      "weekOfYear",
                      "monthOfYear",
                      "quarterOfYear",
                      "dayOfWeek"
                    ]
                  }
                }
              }
            }
          },
          {
            "if":{
              "properties":{
                "fieldType":{
                  "not": {  "const":"timestamp" }
                }
              }
            },
            "then":{
              "properties":{
                "postOperations":{
                  "type":"array",
                  "enum": [1]
                }
              }
            }
          }
        ],
        "additionalProperties":false,
        "properties":{
          "label":{
            "$ref":"#/definitions/label"
          },
          "description":{
            "$ref":"#/definitions/description"
          },
          "hidden":{
            "$ref":"#/definitions/hidden"
          },
          "category":{
            "type":"string",
            "minLength":1
          },
          "sql":{
            "type":"string",
            "title":"The SQL expression of the dimension",
            "examples":[
              "concat(campaign_start_date, '-', campaign_name)"
            ]
          },
          "column":{
            "type":"string",
            "title":"The column of the dimension",
            "description":"The column must be present the the source table",
            "examples":[
              "campaign_name"
            ]
          },
          "pivotable":{
            "type":"boolean",
            "title":"If the dimension can used for pivoting",
            "default":true
          },
          "fieldType":{
            "$ref":"#/definitions/fieldType"
          },
          "postOperations":{
            "type": "array"
          },
          "reportOptions":{
            "$ref":"#/definitions/reportOptions"
          }
        }
      }
    }
  }
}

const b = {"name": "test", "from": {"database": "database", "schema": "schema"}}

var ajv = new Ajv({allErrors: true, verbose: true, jsonPointers: true }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(a);
var valid = validate(b);

let result = betterAjvErrors(a, b, validate.errors, {format: 'js'})
debugger
