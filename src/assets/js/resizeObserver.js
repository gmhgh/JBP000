import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

export const useResizeObserver = () => {
    const resizeRef = ref();
    const resizeState = reactive({
        dimensions: {}
    });

    const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
            // console.log('被监听元素content的宽高及位置',entry.contentRect)

            resizeState.dimensions = entry.contentRect;
        });
    });

    onMounted(() => {
        // set initial dimensions right before observing: Element.getBoundingClientRect()
        resizeState.dimensions = resizeRef.value.getBoundingClientRect();
        observer.observe(resizeRef.value);
    });

    onBeforeUnmount(() => {
        observer.unobserve(resizeRef.value);
    });

    return { resizeState, resizeRef };
};

export default useResizeObserver;