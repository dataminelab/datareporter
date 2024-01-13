import { replace } from "lodash";
import React from "react";
import { axios } from "@/services/axios";
import PropTypes from "prop-types";
import Switch from "antd/lib/switch";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import Alert from "antd/lib/alert";
import notification from "@/services/notification";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import InputWithCopy from "@/components/InputWithCopy";
import HelpTrigger from "@/components/HelpTrigger";

const API_SHARE_URL = "api/reports/{id}/share"; 

class ShareDashboardDialog extends React.Component {
  static propTypes = {
    report: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    hasOnlySafeQueries: PropTypes.bool.isRequired,
    dialog: DialogPropType.isRequired,
  };

  formItemProps = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    style: { marginBottom: 7 },
  };

  constructor(props) {
    super(props);
    const { report } = this.props;

    this.state = {
      saving: false,
    };

    this.apiUrl = replace(API_SHARE_URL, "{id}", report.id);
    this.enabled = this.props.hasOnlySafeQueries || report.publicAccessEnabled;
  }

  static get headerContent() {
    return (
      <React.Fragment>
        Share Report
        <div className="modal-header-desc">
          Allow public access to this report with a secret address. <HelpTrigger type="SHARE_DASHBOARD" />
        </div>
      </React.Fragment>
    );
  }

  enableAccess = () => {
    const { report } = this.props;
    this.setState({ saving: true });

    axios
      .post(this.apiUrl)
      .then(data => {
        report.publicAccessEnabled = true;
        report.public_url = data.public_url;
      })
      .catch(() => {
        notification.error("Failed to turn on sharing for this report");
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  disableAccess = () => {
    const { report } = this.props;
    this.setState({ saving: true });

    axios
      .delete(this.apiUrl)
      .then(() => {
        report.publicAccessEnabled = false;
        delete report.public_url;
      })
      .catch(() => {
        notification.error("Failed to turn off sharing for this report");
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  onChange = checked => {
    if (checked) {
      this.enableAccess();
    } else {
      this.disableAccess();
    }
  };

  render() {
    const { dialog, report } = this.props;

    return (
      <Modal {...dialog.props} title={this.constructor.headerContent} footer={null}>
        <Form layout="horizontal">
          {!this.props.hasOnlySafeQueries && (
            <Form.Item>
              <Alert
                message="For your security, sharing is currently not supported for dashboards containing queries with text parameters. Consider changing the text parameters in your query to a different type."
                type="error"
              />
            </Form.Item>
          )}
          <Form.Item label="Allow public access" {...this.formItemProps}>
            <Switch
              checked={report.publicAccessEnabled}
              onChange={this.onChange}
              loading={this.state.saving}
              disabled={!this.enabled}
              data-test="PublicAccessEnabled"
            />
          </Form.Item>
          {report.public_url && (
            <Form.Item label="Secret address" {...this.formItemProps}>
              <InputWithCopy value={report.public_url} data-test="SecretAddress" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
}

export default wrapDialog(ShareDashboardDialog);
