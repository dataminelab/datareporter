import { useState } from "react";

export function useEssence() {
    const [essenceList, setEssenceList] = useState([]);
    const [widgetList, setWidgetList] = useState([]);

    const getEssence = (id) => {
        const modelIndex = widgetList.lastIndexOf(id);
        if (modelIndex === -1) return null;
        return essenceList[modelIndex];
    };

    const setEssence = (id, essence) => {
        const modelIndex = widgetList.lastIndexOf(id);
        if (modelIndex === -1) {
            setEssenceList([...essenceList, essence]);
            setWidgetList([...widgetList, id]);
        } else {
            const updatedEssenceList = [...essenceList];
            updatedEssenceList[modelIndex] = essence;
            setEssenceList(updatedEssenceList);
        }
    };

    return { essenceList, widgetList, getEssence, setEssence };
}

