import React from "react";
import PropTypes from "prop-types";
import Alert from "antd/lib/alert";
import Button from "antd/lib/button";
import Checkbox from "antd/lib/checkbox";
import Form from "antd/lib/form";
import InputNumber from "antd/lib/input-number";
import Modal from "antd/lib/modal";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import { clientConfig } from "@/services/auth";
import CodeBlock from "@/components/CodeBlock";
import "./EmbedReportDialog.less";

class EmbedReportDialog extends React.Component {
  static propTypes = {
    dialog: DialogPropType.isRequired,
    report: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    visualization: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  };

  state = {
    enableChangeIframeSize: false,
    iframeWidth: 720,
    iframeHeight: 391,
  };

  constructor(props) {
    super(props);
    const { report, visualization } = props;
    const visualizationId = visualization && visualization.id;
    const params = report.getParameters().toUrlParams();

    this.embedUrl = `${clientConfig.basePath}embed/report/${report.id}${visualizationId ? `/visualization/${visualizationId}` : ""
      }${params ? `?${params}` : ""}`;

    if (window.snapshotUrlBuilder) {
      this.snapshotUrl = window.snapshotUrlBuilder(report, visualization);
    }
  }

  render() {
    const { report, dialog } = this.props;
    const { enableChangeIframeSize, iframeWidth, iframeHeight } = this.state;

    return (
      <Modal
        {...dialog.props}
        className="embed-report-dialog"
        title="Embed Report"
        footer={<Button onClick={dialog.dismiss}>Close</Button>}>
        <React.Fragment>
          {!report.is_safe && (
            <Alert
              message="This report has text parameters. Ensure parameter values are controlled when sharing this embed URL."
              type="warning"
              data-test="EmbedErrorAlert"
              className="m-b-20"
            />
          )}
          <h5 className="m-t-0">Public URL</h5>
          <div className="m-b-30">
            <CodeBlock data-test="EmbedIframe" copyable>
              {this.embedUrl}
            </CodeBlock>
          </div>
          <h5 className="m-t-0">IFrame Embed</h5>
          <div>
            <CodeBlock copyable>
              {`<iframe src="${this.embedUrl}" width="${iframeWidth}" height="${iframeHeight}"></iframe>`}
            </CodeBlock>
            <Form className="m-t-10" layout="inline">
              <Form.Item>
                <Checkbox
                  checked={enableChangeIframeSize}
                  onChange={e =>
                    this.setState({
                      enableChangeIframeSize: e.target.checked,
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Width">
                <InputNumber
                  className="size-input"
                  value={iframeWidth}
                  onChange={value => this.setState({ iframeWidth: value })}
                  size="small"
                  disabled={!enableChangeIframeSize}
                />
              </Form.Item>
              <Form.Item label="Height">
                <InputNumber
                  className="size-input"
                  value={iframeHeight}
                  onChange={value => this.setState({ iframeHeight: value })}
                  size="small"
                  disabled={!enableChangeIframeSize}
                />
              </Form.Item>
            </Form>
          </div>
          {this.snapshotUrl && (
            <React.Fragment>
              <h5>Image Embed</h5>
              <CodeBlock copyable>{this.snapshotUrl}</CodeBlock>
            </React.Fragment>
          )}
        </React.Fragment>
      </Modal>
    );
  }
}

EmbedReportDialog.defaultProps = {
  visualization: null,
};

export default wrapDialog(EmbedReportDialog);
