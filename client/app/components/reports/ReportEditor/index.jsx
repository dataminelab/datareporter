import React, { useEffect, useMemo, useState, useCallback, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { AceEditor, snippetsModule, updateSchemaCompleter } from "./ace";
import { SchemaItemType } from "@/components/reports/SchemaBrowser";
import resizeObserver from "@/services/resizeObserver";
import ReportSnippet from "@/services/report-snippet";

import ReportEditorControls from "./ReportEditorControls";
import "./index.less";

const editorProps = { $blockScrolling: Infinity };

const ReportEditor = React.forwardRef(function(
  { className, syntax, value, autocompleteEnabled, schema, onChange, onSelectionChange, ...props },
  ref
) {
  const [container, setContainer] = useState(null);
  const [editorRef, setEditorRef] = useState(null);

  // For some reason, value for AceEditor should be managed in this way - otherwise it goes berserk when selecting text
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = useCallback(
    str => {
      setCurrentValue(str);
      onChange(str);
    },
    [onChange]
  );

  const editorOptions = useMemo(
    () => ({
      behavioursEnabled: true,
      enableSnippets: true,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: autocompleteEnabled,
      autoScrollEditorIntoView: true,
    }),
    [autocompleteEnabled]
  );

  useEffect(() => {
    if (editorRef) {
      const editorId = editorRef.editor.id;
      updateSchemaCompleter(editorId, schema);
      return () => {
        updateSchemaCompleter(editorId, null);
      };
    }
  }, [schema, editorRef]);

  useEffect(() => {
    function resize() {
      if (editorRef) {
        editorRef.editor.resize();
      }
    }

    if (container) {
      resize();
      const unwatch = resizeObserver(container, resize);
      return unwatch;
    }
  }, [container, editorRef]);

  const handleSelectionChange = useCallback(
    selection => {
      const rawSelectedReportText = editorRef.editor.session.doc.getTextRange(selection.getRange());
      const selectedReportText = rawSelectedReportText.length > 1 ? rawSelectedReportText : null;
      onSelectionChange(selectedReportText);
    },
    [editorRef, onSelectionChange]
  );

  const initEditor = useCallback(editor => {
    // Release Cmd/Ctrl+L to the browser
    editor.commands.bindKey({ win: "Ctrl+L", mac: "Cmd+L" }, null);

    // Release Cmd/Ctrl+Shift+F for format report action
    editor.commands.bindKey({ win: "Ctrl+Shift+F", mac: "Cmd+Shift+F" }, null);

    // Release Ctrl+P for open new parameter dialog
    editor.commands.bindKey({ win: "Ctrl+P", mac: null }, null);
    // Lineup only mac
    editor.commands.bindKey({ win: null, mac: "Ctrl+P" }, "golineup");

    // Reset Completer in case dot is pressed
    editor.commands.on("afterExec", e => {
      if (e.command.name === "insertstring" && e.args === "." && editor.completer) {
        editor.completer.showPopup(editor);
      }
    });

    ReportSnippet.query().then(snippets => {
      const snippetManager = snippetsModule.snippetManager;
      const m = {
        snippetText: "",
      };
      m.snippets = snippetManager.parseSnippetFile(m.snippetText);
      snippets.forEach(snippet => {
        m.snippets.push(snippet.getSnippet());
      });
      snippetManager.register(m.snippets || [], m.scope);
    });

    editor.focus();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      paste: text => {
        if (editorRef) {
          const { editor } = editorRef;
          editor.session.doc.replace(editor.selection.getRange(), text);
          const range = editor.selection.getRange();
          onChange(editor.session.getValue());
          editor.selection.setRange(range);
        }
      },
      focus: () => {
        if (editorRef) {
          editorRef.editor.focus();
        }
      },
    }),
    [editorRef, onChange]
  );

  return (
    <div className={cx("report-editor-container", className)} {...props} ref={setContainer}>
      <AceEditor
        ref={setEditorRef}
        theme="textmate"
        mode={syntax || "sql"}
        value={currentValue}
        editorProps={editorProps}
        width="100%"
        height="100%"
        setOptions={editorOptions}
        showPrintMargin={false}
        wrapEnabled={false}
        onLoad={initEditor}
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
});

ReportEditor.propTypes = {
  className: PropTypes.string,
  syntax: PropTypes.string,
  value: PropTypes.string,
  autocompleteEnabled: PropTypes.bool,
  schema: PropTypes.arrayOf(SchemaItemType),
  onChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
};

ReportEditor.defaultProps = {
  className: null,
  syntax: null,
  value: null,
  autocompleteEnabled: true,
  schema: [],
  onChange: () => {},
  onSelectionChange: () => {},
};

ReportEditor.Controls = ReportEditorControls;

export default ReportEditor;
