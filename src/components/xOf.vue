<template>
    <div style="background: rgba(238,238,238,0.25); margin: 5px 0;">
        <div style="background: rgb(238, 238, 238); padding:4px; font-weight:bold">{{type.substring(0, 3) + ' of'}} these rules must be conformed:</div>
        <div class="inner" v-for="(schema, idx) in value" :key="idx">
           <json-schema :value="schema" :level="level" :max-level="maxLevel" />
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
      level: Number,
      maxLevel: Number,
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
