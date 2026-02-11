import { computed } from 'vue'
import { useSourceControlsStore } from '@/stores/sourceControls'
import he from 'he'

export function useHighlight() {
    const sourceControlsStore = useSourceControlsStore()

    const highlightKeywords = computed(() => {
        const keywords = new Set()
        const query = sourceControlsStore.query
        const rawQuery = sourceControlsStore.rawQuery

        // FlyQL parsing
        if (query) {
            // Matches key=value, key="value", key='value'
            // Supports =, :, !=, ~, !~ operators
            // Value can be quoted or unquoted (until space or closing parenthesis)
            const regex = /(?:^|[\s(])[\w.]+\s*(?:=|:|!=|~|!~)\s*(?:"([^"]+)"|'([^']+)'|([^\s()]+))/gi
            let match
            while ((match = regex.exec(query)) !== null) {
                let val = match[1] || match[2] || match[3]
                if (val) {
                    // Remove wildcards for highlighting
                    val = val.replace(/^\*|\*$/g, '')
                    if (val) keywords.add(val)
                }
            }
        }

        // RAW Query parsing
        if (rawQuery) {
            // Matches key like '%value%'
            const regex = /(?:^|[\s(])[\w.]+\s+like\s+'%([^']+)%'/gi
            let match
            while ((match = regex.exec(rawQuery)) !== null) {
                if (match[1]) keywords.add(match[1])
            }
        }
        
        return Array.from(keywords).filter(k => k.length > 0)
    })

    const getHighlightedValue = (value) => {
        if (value === undefined || value === null || value === '') return '&dash;'
        
        if (typeof value === 'object') {
            value = JSON.stringify(value, null, 2)
        } else {
            value = String(value)
        }

        // Escape HTML first to prevent XSS and to match what pre would display
        value = he.encode(value)

        const keywords = highlightKeywords.value
        if (keywords.length === 0) return value

        // Sort keywords by length descending to match longest first
        // Escape keywords for RegExp and encode them to match encoded value
        const patternParts = keywords
            .sort((a, b) => b.length - a.length)
            .map(k => {
                // We need to match the keyword in the ENCODED string.
                // So we encode the keyword first.
                // e.g. if keyword is "&", encoded is "&amp;"
                // We want to match "&amp;" in the text.
                const encoded = he.encode(k)
                return encoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            })

        if (patternParts.length === 0) return value

        const regex = new RegExp(`(${patternParts.join('|')})`, 'gi')
        
        return value.replace(regex, '<span class="bg-orange-300 dark:bg-orange-700 dark:text-white">$1</span>')
    }

    return {
        highlightKeywords,
        getHighlightedValue
    }
}
