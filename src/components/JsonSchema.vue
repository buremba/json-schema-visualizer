<template>
    <span v-if="schema.not != null">
        not <json-schema :value="schema.not" :level="level" :max-level="maxLevel"/>
    </span>
  <div v-else class="json-schema-view" :class="{collapsed: isCollapsed}">
    <!-- Primitive -->
    <span v-if="isPrimitive">
            <a class="title">
                <span v-if="isCollapsible" @click="toggleCollapse" class="toggle-handle"
                      :class="{collapsed: isCollapsed}"></span>
                {{ schema.title }}
                    <span v-if="schema.description" class="hint--right hint hint--large"
                          :aria-label="schema.description">ⓘ</span>
            </a>
            <span class="tag default example"
                  v-if="schema.examples != null && schema.examples.length > 0">example: {{ schema.examples[0] }}</span>
            <span class="tag default default" v-if="schema.default != null">default: {{ schema.default }}</span>
            <span class="tag default format" v-if="schema.format">({{ schema.format }})</span>
            <span class="tag default minimum" v-if="schema.minimum">minimum:{{ schema.minimum }}</span>
            <span class="tag default exclusiveMinimum"
                  v-if="schema.exclusiveMinimum">(ex)minimum:{{ schema.exclusiveMinimum }}</span>
            <span class="tag default maximum" v-if="schema.maximum">maximum:{{ schema.maximum }}</span>
            <span class="tag default exclusiveMaximum"
                  v-if="schema.exclusiveMaximum">(ex)maximum:{{ schema.exclusiveMaximum }}</span>
            <span class="tag default minLength" v-if="schema.minLength">minimum length:{{ schema.minLength }}</span>
            <span class="tag default maxLength" v-if="schema.maxLength">maximum length:{{ schema.maxLength }}</span>
            <json-schema-props :value="schema" :level="currentLevel" :max-level="maxLevel"/>
        </span>


    <!-- Array -->
    <div v-if="isArray" class="array">
      <a class="title">
        <span v-if="isCollapsible" @click="toggleCollapse" class="toggle-handle"
              :class="{collapsed: isCollapsed}"></span>
        {{ schema.title }} <span v-if="schema.description" class="hint--right hint hint--large"
                                 :aria-label="schema.description">ⓘ</span>
        <span class="opening bracket">[</span>
        <json-schema v-if="schema.items != null" :value="schema.items" :level="level + 1" :max-level="maxLevel"/>
        <span class="closing bracket" v-if="isCollapsed">]</span>
      </a>
      <span v-if="schema.minItems || schema.maxItems"
            title="tag items range">({{ schema.minItems || 0 }}..{{ schema.maxItems || '∞' }})</span>
      <span class="tag unique" hint--top aria-label="The items must be unique" v-if="schema.uniqueItems">♦</span>

      <json-schema-props v-if="!isCollapsed" :value="schema" :level="currentLevel" :max-level="maxLevel"/>
      <span class="closing bracket" v-if="!isCollapsed">]</span>
    </div>

    <!-- Object -->
    <div v-if="isObject" class="object">
      <a class="title"><span
          v-if="isCollapsible"
          @click="toggleCollapse"
          class="toggle-handle" :class="{collapsed: isCollapsed}"></span>
        {{ schema.title }} <span v-if="schema.description" class="hint--right hint hint--large"
                                 :aria-label="schema.description">ⓘ</span>
        <span class="opening brace">{</span>
        <span class="tag default" style="margin-left:5px"
              v-if="isCollapsed && getParentExample != null">{{ getParentExample }}</span>
        <span v-else-if="isCollapsed" class="collapsible-indicator"/>
        <span class="closing brace" v-if="isCollapsed">}</span>
      </a>

      <span class="tag default" style="margin-left:5px" v-if="!isCollapsed && getParentExample != null"><i>example:</i> {{
          getParentExample
        }}</span>
      <div class="property" v-for="(property, propertyName) in schema.properties" :key="propertyName">
                    <span class="name">
                                        <component v-if="property.type != 'null' && typeof(property.type) === 'string'"
                                                   :is="`${property.type}-icon`"
                                                   class="property-type" :aria-label="property.type"
                                                   :title="property.type"/>
                        {{ propertyName }}
                         <span class="required" v-if="isRequired(property, propertyName)">*</span>
                        :

                                   </span>
        <json-schema :value="property" :level="level + 1" :max-level="maxLevel"/>
      </div>

      <div class="property" v-if="typeof schema.additionalProperties === 'object' && !isCollapsed">
                <span class="name">
                    <component
                        v-if="schema.additionalProperties.type != 'null' && typeof(schema.additionalProperties.type) === 'string' "
                        :is="`${schema.additionalProperties.type}-icon`" class="property-type"
                        :aria-label="schema.additionalProperties.type"
                        :title="schema.additionalProperties.type"/>
                                        {{
                    (schema.examples != null && schema.examples.length) > 0 ? Object.keys(schema.examples[0])[0] : 'exampleKey'
                  }} :
                </span>
        <json-schema :value="schema.additionalProperties" :level="level + 1" :max-level="maxLevel"/>

      </div>

      <json-schema-props v-if="schema && !isCollapsed" :value="schema" :level="currentLevel" :max-level="maxLevel"/>
      <span class="closeing brace" v-if="!isCollapsed">}</span>
    </div>

    <div class="columns is-gapless" v-if="schema.if && !isCollapsed"
         style="border-bottom:1px solid #ddd;margin-bottom:10px;padding-bottom:10px">
      <div class="column">if
        <json-schema :value="schema.if" :level="level + 1" :max-level="maxLevel"/>
      </div>
      <div v-if="schema.then" class="column">then
        <json-schema :value="schema.then" :level="level + 1" :max-level="maxLevel"/>
      </div>
      <div v-if="schema.else" class="column">else
        <json-schema :value="schema.else" :level="level + 1" :max-level="maxLevel"/>
      </div>
    </div>
  </div>
</template>

<script>
import stringIcon from '@/assets/types/string.svg'
import arrayIcon from '@/assets/types/array.svg'
import numberIcon from '@/assets/types/number.svg'
import integerIcon from '@/assets/types/number.svg'
import booleanIcon from '@/assets/types/boolean.svg'
import objectIcon from '@/assets/types/object.svg'
import $RefParser from 'json-schema-ref-parser'

const primitiveArrayCollapsibleProps = ['allOf', 'anyOf', 'oneOf']

export default {
  name: 'json-schema',
  props: {
    value: {type: Object, required: true},
    maxLevel: {type: Number, required: true},
    level: {type: Number, default: 1}
  },
  components: {
    'json-schema-props': () => import('./JsonSchemaProps'),
    stringIcon, arrayIcon, numberIcon, objectIcon, booleanIcon, integerIcon
  },
  data: function () {
    return {
      loading: false,
      schema: false,
      isCollapsed: true,
      currentLevel: this.level
    }
  },
  computed: {
    isCollapsible: function () {
      if (this.isPrimitive) {
        return primitiveArrayCollapsibleProps.some(prop => this.schema[prop] != null && this.schema[prop].length > 0)
      }

      if (this.isArray) {
        // ignore `schema.type` and `schema.items`
        return this.schema.items != null && Object.keys(this.schema).length > 2
      }

      if (this.isObject) {
        // ignore `schema.type`
        return Object.keys(this.schema).length > 1
      }

      return true
    },
    getParentExample: function () {
      let schema = this.$parent.schema
      if (this.$parent != null && schema != null && schema.examples != null && schema.examples.length > 0) {
        let example = schema.examples[0]
        let key = Object.keys(example)[0]
        return JSON.stringify(key) + ' : ' + JSON.stringify(example[key])
      }
      return null
    },
    isPrimitive: function () {
      return this.schema &&
          !this.schema.properties &&
          !this.schema.items &&
          this.schema.type !== 'array' &&
          this.schema.type !== 'object'
    },
    isArray: function () {
      return this.schema && this.schema.type === 'array'
    },
    isObject: function () {
      return !this.isPrimitive && !this.isArray
    },
  },
  created: async function () {
    if (this.level === 1) {
      this.schema = await $RefParser.dereference(this.value, {resolve: {http: {withCredentials: false}}})
    } else {
      this.schema = this.value
    }
    this.isCollapsed = this.level > this.maxLevel
  },
  methods: {
    toggleCollapse: function () {
      this.isCollapsed = !this.isCollapsed
      this.currentLevel = 0
    },
    isRequired: function (property, name) {
      const parent = this.$parent.schema

      if (parent && Array.isArray(parent.required) && name != null) {
        return parent.required.includes(name)
      }

      return false
    }
  }
}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/_all';
@import '~bulma/sass/grid/columns';

$indent: 7px;
$font-size: 14px;
$bold-color: #929292;
$required: #F00;

.json-schema-view {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
  font-size: 0;
  display: table-cell;

  .hint {
    font-size: 12px;
    font-weight: bold;
    margin-right: 4px
  }

  span.collapsible-indicator {
    background: #707d84;
    width: 4px;
    height: 4px;
    border-radius: 4px;
    display: inline-block;
    vertical-align: middle;
    margin: 0 2px;
  }

  span.tag {
    padding: 2px 4px;
    border-radius: 2px;
    font-size: 10px;
    color: #707d84;
    line-height: 16px;
    margin: 0 2px;

    &.default {
      border: 1px solid #CDDAE1;

      &.plain {
        background: inherit;
        border: 1px solid #02AFDE;
        color: inherit;
      }
    }

    &.primary {
      background: #02AFDE;
      color: #fff;

      &.plain {
        background: inherit;
        border: 1px solid #02AFDE;
        color: inherit;
      }
    }

    &.secondary {
      background: #FACC14;
      color: #fff;
    }

    &.third {
      background: #2FC25B;
      color: #fff;
    }

    &.gray {
      padding: 1px 3px;
      border: 1px solid #00000029;
      color: #00000063;
    }

    &.error {
      background: #cc0000;
      color: #fff;
    }

    &.success {
      background: #2FC25B;
      color: #fff;
    }
  }

  .property-type {
    height: 10px;
    vertical-align: middle
  }

  > * {
    font-size: $font-size;
  }


  .toggle-handle {
    cursor: pointer;
    margin: auto .3em;
    font-size: 10px;
    display: inline-block;
    transform-origin: 50% 40%;
    transition: transform 150ms ease-in;

    &:after {
      content: "▼";
    }

    &, &:hover {
      text-decoration: none;
      color: $bold-color;
    }
  }

  .title {
    &, &:hover {
      text-decoration: none;
      color: $bold-color;
    }
  }

  .property {
    font-size: 0;
    display: table-row;

    > * {
      font-size: $font-size;
      padding: .2em;
    }

  }

  .name {
    color: #333;
    white-space: nowrap;
  }

  .type {
    color: green;
  }

  .required {
    color: $required;
  }

  .inner {
    margin-left: $indent;
  }

  &.collapsed {
    .property {
      display: none;
    }

    .closeing.brace {
      display: inline-block;
    }

    .toggle-handle {
      transform: rotate(-90deg);
    }
  }
}

</style>
