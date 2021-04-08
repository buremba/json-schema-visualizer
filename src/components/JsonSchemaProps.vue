<template>
    <span>
        <span v-if="showType" class="tag default type">is
          <i v-if="Array.isArray(value.type)">{{ value.type.join(' or ') }}</i>
          <i v-else>{{ value.type }}</i>
        </span>
        <p v-if="value.enum">
            <template v-if="Array.isArray(value.enum)">
              <template v-if="value.enum.length > 0">
                <b>must be one of </b>
                <span v-for="(item, idx) in value.enum" :key="idx" class="tag default">
                    {{JSON.stringify(item)}}
                </span>
              </template>
              <template v-else-if="value.enum != null">
                is {{value.enum}}
              </template>
              <template v-else>
                is empty array
              </template>
            </template>
            <template v-else-if="value.const">
                equals {{value.const}}
            </template>
            <template v-else>
                (not supported) : {{value}}
            </template>
        </p>
        <span v-if="value.const">
            equals <i>{{value.const}}</i>
        </span>
        <span v-if="value.required && value.type != 'object'">
            <span class="name required-tag" v-for="item in value.required" :key="item">{{ item }}</span> is required
        </span>
        <x-of v-if="value.allOf && value.allOf.length > 0" :value="value.allOf" :level="level" :max-level="maxLevel" type="allOf"/>
        <x-of v-if="value.anyOf && value.anyOf.length > 0" :value="value.anyOf" :level="level" :max-level="maxLevel" type="anyOf"/>
        <x-of v-if="value.oneOf && value.oneOf.length > 0" :value="value.oneOf" :level="level" :max-level="maxLevel" type="oneOf"/>
    </span>
</template>

<script>
  import xOf from './xOf'

  const ignoredTypes = ['object', 'array']
  export default {
    name: 'JsonSchemaProps',
    props: {
      value: Object,
      maxLevel: Number,
      level: Number
    },
    components: {
      xOf
    },
    computed: {
      showType: function() {
        if(this.value.type === 'string') {
          return !(this.value.enum != null && this.value.const != null)
        }
        return this.value.type != null && ignoredTypes.indexOf(this.value.type) == -1
      }
    }
  }
</script>
