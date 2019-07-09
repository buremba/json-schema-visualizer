<template>
    <div style="background: rgba(238,238,238,0.25); padding: 0 4px; margin: 5px 0;">
        <div style="background: rgb(238, 238, 238); padding:4px; font-weight:bold">{{type.substring(0, 3) + ' of'}} these rules must be conformed:</div>
        <div class="inner" v-for="(schema, idx) in value" :key="idx">
            <json-schema :value="schema" />
            <div class="columns is-gapless" v-if="schema.if" style="border-bottom:1px solid #ddd;margin-bottom:10px;padding-bottom:10px">
                <div class="column">if <json-schema :value="schema.if" /> </div>
                <div v-if="schema.then" class="column">then <json-schema :value="schema.then" /></div>
                <div v-if="schema.else" class="column">else <json-schema :value="schema.else" /></div>
            </div>
            <span v-if="schema.required">
                <span class="name required-tag" v-for="item in schema.required" :key="item">{{item}}</span> is required
            </span>
        </div>
    </div>
</template>

<script>
  import JsonSchema from './JsonSchema'

  export default {
    name: 'xOf',
    components: {
      JsonSchema
    },
    props: {
      type: String,
      value: Array,
      level: Number
    }
  }
</script>

<style lang="scss">
    .required-tag {
        &:after {
            color:black;
            content: ' and ';
        }

        &:last-child {
            &:after {
                content: ''
            }
        }
    }
</style>