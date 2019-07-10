<template>
    <span>
        <div v-if="value.description != null" class="description">{{value.description}}</div>
        <p v-if="value.enum">
            <template v-if="value.enum.length > 0">
                <b>must be one of </b>
                <span v-for="(item, idx) in value.enum" :key="idx" class="tag default"
                      style="margin-right:4px">
                    {{JSON.stringify(item)}}
                </span>
                </template>
            <template v-else-if="value.const">
                equals {{value.const}}
            </template>
            <template v-else>
                is empty array
            </template>
        </p>
        <span v-if="value.const">
            equals <i>{{value.const}}</i>
        </span>
        <x-of v-if="value.allOf && value.allOf.length > 0" :value="value.allOf" :level="level" type="allOf"/>
        <x-of v-if="value.anyOf && value.anyOf.length > 0" :value="value.anyOf" :level="level" type="anyOf"/>
        <x-of v-if="value.oneOf && value.oneOf.length > 0" :value="value.oneOf" :level="level" type="oneOf"/>
    </span>
</template>

<script>
  import xOf from './xOf'

  export default {
    name: 'JsonSchemaProps',
    props: {
      value: Object,
      level: Number
    },
    components: {
      xOf
    }
  }
</script>