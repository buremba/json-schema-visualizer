<template>
    <div id="app" class="columns is-gapless" style="margin:0;padding:0">
      <iframe src="https://ghbtns.com/github-btn.html?user=buremba&repo=json-schema-visualizer&type=watch&count=true&size=large" style="position: fixed; right: 0; top: 10px;" frameborder="0" scrolling="0" width="170px" height="30px"></iframe>

        <textarea v-if="showEditor" v-model.lazy="rawSchema" @change="changeInput($event.target.value)" placeholder="enter schema"
                  class="column is-one-third" style="margin:0 20px;min-height:500px"/>
        <!--<json-schema v-if="schema != null" v-model="schema" class="column" style="padding-left:10px"/>-->
        <!--<span v-else>-->
          <!--<span v-if="error != null" style="color:red">-->
            <!--Error parsing JSON: {{error}}-->
          <!--</span>-->
          <!--<pre v-else>-->
            <!--try-->

            <!--{ "$ref": "/example-schema.json" }-->

            <!--or-->


            <!--{-->
              <!--"$id": "https://example.com/person.schema.json",-->
              <!--"$schema": "http://json-schema.org/draft-07/schema#",-->
              <!--"title": "Person",-->
              <!--"type": "object",-->
              <!--"properties": {-->
                <!--"firstName": {-->
                  <!--"type": "string",-->
                  <!--"description": "The person's first name."-->
                <!--},-->
                <!--"lastName": {-->
                  <!--"type": "string",-->
                  <!--"description": "The person's last name."-->
                <!--},-->
                <!--"age": {-->
                  <!--"description": "Age in years which must be equal to or greater than zero.",-->
                  <!--"type": "integer",-->
                  <!--"minimum": 0-->
                <!--}-->
              <!--}-->
            <!--}-->
          <!--</pre>-->
        <!--</span>-->

      <textarea v-model.lazy="data" @change="validateData" class="column"></textarea>
    </div>
</template>

<script>
  import JsonSchema from './components/JsonSchema.vue'
  import Ajv from 'ajv'

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
      changeInput: function (value) {
        if (value == '') {
          this.error = this.schema = null
        } else {
          const {schema, error} = parseRawInput(value)
          this.schema = schema
          this.error = error
        }
      },
      validateData: function() {
        var ajv = new Ajv({allErrors: true, verbose: true, jsonPointers: true }); // options can be passed, e.g. {allErrors: true}
        var validate = ajv.compile(JSON.parse(this.rawSchema));
        var valid = validate(JSON.parse(this.data));
        if (!valid) console.log(validate.errors);
      }
    },
    data: function () {
      let rawSchema = (window.location.hash != null ? decodeURIComponent(window.location.hash.substring(1)) : null) || localStorage.getItem('schema')
      const {schema, error} = parseRawInput(rawSchema)

      const urlParams = new URLSearchParams(window.location.search);
      const hideEditor = urlParams.get('hideEditor');
      
      return {
        rawSchema: rawSchema || '',
        schema: schema,
        showEditor: hideEditor == null,
        error: error,
        data: '{"name": "test", "from": {"database": "database", "schema": "schema"}}',
      }
    }
  }
</script>
