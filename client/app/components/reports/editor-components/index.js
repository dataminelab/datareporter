import SchemaBrowser from "@/components/reports/SchemaBrowser";
import ReportEditor from "@/components/reports/ReportEditor";
import DatabricksSchemaBrowser from "./databricks/DatabricksSchemaBrowser";

import { registerEditorComponent, getEditorComponents, ReportEditorComponents } from "./editorComponents";

// default
registerEditorComponent(ReportEditorComponents.SCHEMA_BROWSER, SchemaBrowser);
registerEditorComponent(ReportEditorComponents.QUERY_EDITOR, ReportEditor);

// databricks
registerEditorComponent(ReportEditorComponents.SCHEMA_BROWSER, DatabricksSchemaBrowser, ["databricks"]);

export { getEditorComponents };
