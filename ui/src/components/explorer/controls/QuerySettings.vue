<template>
    <Button icon="pi pi-search" class="mr-2" label="Query setup" text size="small" @click="toggleSettings" />
    <Popover ref="dropdown" :pt="{ content: { class: 'p-0' } }">
        <div class="flex w-full">
            <div class="flex flex-col">
                <DataRow name="Enable raw query editor" class="pl-3 pr-2">
                    <ToggleSwitch
                        v-model="enableRawQueryEditor"
                        @change="onEnableRawQueryEditorChange"
                        :readonly="!source.isRawQueryAllowed()"
                        v-tooltip="enableRawQueryEditorTooltip"
                        class="mt-2"
                    />
                </DataRow>
                <DataRow name="Max lines per row" class="pl-3 pr-2 pt-2">
                    <InputNumber
                        v-model="maxLines"
                        :min="0"
                        :max="100"
                        showButtons
                        buttonLayout="horizontal"
                        :step="1"
                        fluid
                        class="w-full mt-2"
                        @update:modelValue="onMaxLinesChange"
                    />
                    <div class="text-xs text-neutral-500 mt-1">Set 0 for unlimited lines</div>
                </DataRow>
            </div>
        </div>
    </Popover>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import { Popover, Button, ToggleSwitch, InputNumber } from 'primevue'

import DataRow from '@/components/common/DataRow.vue'
import { useSourceControlsStore } from '@/stores/sourceControls'

const props = defineProps(['source', 'enableRawQueryEditorInitial'])
const emit = defineEmits(['enableRawQueryEditorChange'])
const sourceControlsStore = useSourceControlsStore()

const dropdown = ref()
const enableRawQueryEditor = ref(props.enableRawQueryEditorInitial)
const maxLines = ref(sourceControlsStore.maxLines)

watch(() => props.enableRawQueryEditorInitial, (newValue) => {
    enableRawQueryEditor.value = newValue
})

watch(() => sourceControlsStore.maxLines, (newValue) => {
    maxLines.value = newValue
})

const onMaxLinesChange = (value) => {
    sourceControlsStore.setMaxLines(value)
}


const enableRawQueryEditorTooltip = computed(() => {
    if (!props.source.isRawQueryAllowed()) {
        return { value: 'Insufficient permissions or source does not support raw queries', showDelay: 300 }
    }
})

const onEnableRawQueryEditorChange = () => {
    emit('enableRawQueryEditorChange', enableRawQueryEditor.value)
}

const toggleSettings = (event) => {
    dropdown.value.toggle(event)
}
</script>
