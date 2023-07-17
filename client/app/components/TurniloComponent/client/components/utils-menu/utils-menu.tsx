import * as React from "react";
import { Fn } from "../../../common/utils/general/general";
import { exportOptions } from "../../config/constants";
import { dateFromFilter, download, FileFormat, makeFileName } from "../../utils/download/download";
import { DataSetWithTabOptions } from "../../views/cube-view/cube-view";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
  
export interface UtilsMenuProps {
  onClose: Fn;
  openRawDataModal: Fn;
  downloadCSV: Fn;
  getDownloadableDataset?: () => DataSetWithTabOptions;
  essence: Essence;
  timekeeper: Timekeeper;
}

export const UtilsMenu: React.SFC<UtilsMenuProps> = ({ 
  onClose, 
  openRawDataModal,
  essence,
  timekeeper,
  getDownloadableDataset }) => {
  
  function onExport(fileFormat: FileFormat) {
    const dataSetWithTabOptions = getDownloadableDataset();
    if (!dataSetWithTabOptions.dataset) return;
  
    const { dataCube } = essence;
    const effectiveFilter = essence.getEffectiveFilter(timekeeper);
  
    const fileName = makeFileName(dataCube.name, dateFromFilter(effectiveFilter));
    download(dataSetWithTabOptions, fileFormat, fileName);
    onClose();
  }
    
  function exportItems() {
    return exportOptions.map(({ label, fileFormat }) => 
      <li key={`export-${fileFormat}`} id={`export-data-${fileFormat}`} onClick={() => onExport(fileFormat)}>
        {label}
      </li>
    );
  }
  
  function displayRawData() {
    openRawDataModal();
    onClose();
  }

  return (<>
    <button onClick={displayRawData} id="raw-data-button">displayRawData</button>;
    {exportItems()}
  </>);
};
