<template>
    <div v-if="isJsonString">
        <pre 
            style="white-space: pre-wrap; word-wrap: break-all; word-break: break-all" 
            v-html="formattedJson"
        ></pre>
    </div>
    <div v-else>
        <pre
            style="white-space: pre-wrap; word-wrap: break-all; word-break: break-all"
            v-html="highlightedValue"
        ></pre>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHighlight } from '@/composables/useHighlight.js'

const props = defineProps({
    value: {
        required: true
    }
})

const { getHighlightedValue } = useHighlight()

const isJsonString = computed(() => {
    if (typeof props.value !== 'string') return false
    try {
        const parsed = JSON.parse(props.value)
        return typeof parsed === 'object' && parsed !== null
    } catch (e) {
        return false
    }
})

const formattedJson = computed(() => {
    if (!isJsonString.value) return ''
    const parsed = JSON.parse(props.value)
    return getHighlightedValue(parsed)
})

const highlightedValue = computed(() => {
    return getHighlightedValue(props.value)
})
</script>
