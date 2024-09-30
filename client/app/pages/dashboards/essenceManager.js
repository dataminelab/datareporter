export function EssenceManager() {
    let essenceList = [];
    let widgetList = [];

    return {
        getEssence: (id) => {
            const modelIndex = widgetList.lastIndexOf(id);
            if (modelIndex === -1) return null;
            return essenceList[modelIndex];
        },
        setEssence: (id, essence) => {
            const modelIndex = widgetList.lastIndexOf(id);
            if (modelIndex === -1) {
                essenceList = [...essenceList, essence];
                widgetList = [...widgetList, id];
            } else {
                essenceList[modelIndex] = essence;
            }
        },
        getEssenceList: () => essenceList,
        getWidgetList: () => widgetList,
    };
}