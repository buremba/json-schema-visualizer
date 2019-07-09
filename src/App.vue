<template>
  <div id="app" class="columns is-gapless" style="margin:0;padding:0">
    <textarea v-model.lazy="rawSchema" @change="changeInput($event.target.value)" placeholder="enter schema" class="column is-one-third" style="margin:0 20px;min-height:500px" />
    <json-schema v-if="schema != null" v-model="schema" class="column" style="padding-left:10px"/>
    <span v-else>
      <span v-if="error != null" style="color:red">
        Error parsing JSON: {{error}}
      </span>
      <pre v-else>
        try

        {
          "$id": "https://example.com/person.schema.json",
          "$schema": "http://json-schema.org/draft-07/schema#",
          "title": "Person",
          "type": "object",
          "properties": {
            "firstName": {
              "type": "string",
              "description": "The person's first name."
            },
            "lastName": {
              "type": "string",
              "description": "The person's last name."
            },
            "age": {
              "description": "Age in years which must be equal to or greater than zero.",
              "type": "integer",
              "minimum": 0
            }
          }
        }
      </pre>
    </span>
  </div>
</template>

<script>
import JsonSchema from './components/JsonSchema.vue'

const parseRawInput = (value) => {
  try {
    const schema = JSON.parse(value)
    const error = null
    localStorage.setItem('schema', value)
    return {schema, error}
  } catch (error) {
    return {error}
  }
}

export default {
  name: 'app',
  components: {
    JsonSchema
  },
  methods: {
    changeInput: function(value) {
      const {schema, error} = parseRawInput(value)
      this.schema = schema
      this.error = error
    },

  },
  data: function() {
    let rawSchema = localStorage.getItem('schema')
    const {schema, error} = parseRawInput(rawSchema)

    return {
      rawSchema: rawSchema || '',
      schema: schema,
      error: error,
    }
  }
}
</script>
