<template>
    <span v-if="schema.not != null">
        not
    <json-schema :value="schema.not" :level="level"/>
        </span>
    <div v-else class="json-schema-view" :class="{collapsed: isCollapsed}">
        <!-- Primitive -->
        <span v-if="isPrimitive">
            <a class="title" @click="isCollapsed = !isCollapsed" :class="{clickable : hasDetails}">
                <span class="toggle-handle" :class="{collapsed: isCollapsed}" v-if="hasDetails"></span>
                <span v-else>
                     <span v-if="schema.const">
                        equals <i>{{schema.const}}</i>
                    </span>
                </span>
                {{schema.title}}
            </a>
            <span class="tag default example" v-if="schema.examples != null && schema.examples.length > 0">example: {{schema.examples[0]}}</span>
            <span class="tag default default" v-if="schema.default != null">default: {{schema.default}}</span>
            <span class="tag default format" v-if="schema.format">({{schema.format}})</span>
            <span class="tag default minimum" v-if="schema.minimum">minimum:{{schema.minimum}}</span>
            <span class="tag default exclusiveMinimum" v-if="schema.exclusiveMinimum">(ex)minimum:{{schema.exclusiveMinimum}}</span>
            <span class="tag default maximum" v-if="schema.maximum">maximum:{{schema.maximum}}</span>
            <span class="tag default exclusiveMaximum" v-if="schema.exclusiveMaximum">(ex)maximum:{{schema.exclusiveMaximum}}</span>
            <span class="tag default minLength" v-if="schema.minLength">minimum length:{{schema.minLength}}</span>
            <span class="tag default maxLength" v-if="schema.maxLength">maximum length:{{schema.maxLength}}</span>
            <json-schema-props v-if="hasDetails && !isCollapsed" :value="schema" :level="level"/>
        </span>


        <!-- Array -->
        <div v-if="isArray" class="array">
            <a class="title" @click="isCollapsed = !isCollapsed">
                {{schema.title}} <span class="opening bracket">[</span>
                <json-schema v-if="schema.items != null" :value="schema.items"
                             :level="level + 1"></json-schema>
                <span class="closing bracket" v-if="isCollapsed">]</span>
            </a>
            <span v-if="schema.minItems || schema.maxItems" title="tag items range">({{schema.minItems || 0}}..{{schema.maxItems || '∞'}})</span>
            <span class="tag unique" title="uniqueItems" v-if="schema.uniqueItems">♦</span>

            <json-schema-props v-if="!isCollapsed" :value="schema" :level="level"/>
            <span class="closing bracket" v-if="!isCollapsed">]</span>
        </div>

        <!-- Object -->
        <div v-if="!isPrimitive && !isArray" class="object">
            <a class="title" @click="isCollapsed = !isCollapsed"><span
                    class="toggle-handle"></span>{{schema.title}}
                <span class="opening brace">{</span>
                <span class="closing brace" v-if="isCollapsed">}</span>
            </a>

            <div class="description">{{schema.description}}</div>
            <div class="property" v-for="(property, propertyName) in schema.properties" :key="propertyName">
                    <span class="name">
                                        <component v-if="property.type != null" :is="`${property.type}-icon`"
                                                   class="property-type" :aria-label="property.type"
                                                   :title="property.type"/>
                        {{propertyName}}
                         <span class="required" v-if="isRequired(property, propertyName)">*</span>
                        :

                                   </span>
                <json-schema :value="property" :level="level + 1"></json-schema>
            </div>

            <div class="property" v-if="typeof schema.additionalProperties === 'object' && !isCollapsed">
                <span class="name">
                    <component v-if="schema.additionalProperties.type != null"
                               :is="`${schema.additionalProperties.type}-icon`" class="property-type"
                               :aria-label="schema.additionalProperties.type"
                               :title="schema.additionalProperties.type"/>
                    exampleKey:
                </span>
                <json-schema :value="schema.additionalProperties" :level="level + 1" />

            </div>

            <json-schema-props v-if="schema && !isCollapsed" :value="schema" :level="level"/>
            <span class="closeing brace" v-if="!isCollapsed">}</span>
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

  export default {
    name: 'json-schema',
    props: {
      value: {type: Object, required: true},
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
        isCollapsed: this.level > 3
      }
    },
    computed: {
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
      hasDetails: function () {
        return this.schema.description != null
          || this.schema.enum != null
          || this.schema.allOf != null
          || this.schema.anyOf != null
          || this.schema.oneOf != null
      }
    },
    created: async function () {
      this.schema = await $RefParser.dereference(this.value)
    },
    methods: {
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
    $bold-color: #333;
    $required: #F00;

    .json-schema-view {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
        font-family: Consolas,monaco,monospace;
        font-size: 0;
        display: table-cell;

        span.tag {
            padding: 2px 4px;
            border-radius: 2px;
            font-size: .8em;
            line-height: 16px;

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

        .description {
            color: gray;
            font-style: italic;
        }

        .title {
            &.clickable {
                cursor: pointer;
            }

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
            color: blue;
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
            .description {
                display: none;
            }

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
