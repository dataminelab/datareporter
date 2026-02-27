import React from "react";
import Form from "antd/lib/form";
import Input from "antd/lib/input";
import Select from "antd/lib/select";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Skeleton from "antd/lib/skeleton";
import DynamicComponent from "@/components/DynamicComponent";
import {
  SettingsEditorPropTypes,
  SettingsEditorDefaultProps,
} from "../prop-types";

const AI_PROVIDERS = [
  { id: "", label: "Auto-detect (first configured)" },
  { id: "openai", label: "OpenAI" },
  { id: "gemini", label: "Google Gemini" },
  { id: "anthropic", label: "Anthropic Claude" },
  { id: "ollama", label: "Ollama (Self-hosted)" },
];

const DEFAULT_MODELS = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.5-flash",
  anthropic: "claude-sonnet-4-20250514",
  ollama: "deepseek-r1:7b",
};

export default function AISettings(props) {
  const { values, onChange, loading } = props;

  const selectedProvider = values.ai_default_provider || "";
  const modelPlaceholder = selectedProvider
    ? DEFAULT_MODELS[selectedProvider] || "model name"
    : "auto (provider default)";

  return (
    <DynamicComponent name="OrganizationSettings.AISettings" {...props}>
      <Form.Item label="AI Query Settings">
        {loading ? (
          <Skeleton title={false} paragraph={{ width: [300, 300], rows: 2 }} active />
        ) : (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <label htmlFor="ai_default_provider">Default Provider</label>
                <Select
                  id="ai_default_provider"
                  value={selectedProvider}
                  onChange={(val) => onChange({ ai_default_provider: val })}
                  style={{ width: "100%" }}
                >
                  {AI_PROVIDERS.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={12}>
                <label htmlFor="ai_default_model">Default Model</label>
                <Input
                  id="ai_default_model"
                  value={values.ai_default_model || ""}
                  placeholder={modelPlaceholder}
                  onChange={(e) => onChange({ ai_default_model: e.target.value })}
                />
              </Col>
            </Row>

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>API Keys</h4>

            <Row gutter={16} style={{ marginBottom: 8 }}>
              <Col span={12}>
                <label htmlFor="ai_openai_api_key">OpenAI API Key</label>
                <Input.Password
                  id="ai_openai_api_key"
                  value={values.ai_openai_api_key || ""}
                  placeholder="sk-..."
                  onChange={(e) => onChange({ ai_openai_api_key: e.target.value })}
                />
              </Col>
              <Col span={12}>
                <label htmlFor="ai_gemini_api_key">Google Gemini API Key</label>
                <Input.Password
                  id="ai_gemini_api_key"
                  value={values.ai_gemini_api_key || ""}
                  placeholder="AIza..."
                  onChange={(e) => onChange({ ai_gemini_api_key: e.target.value })}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 8 }}>
              <Col span={12}>
                <label htmlFor="ai_anthropic_api_key">Anthropic API Key</label>
                <Input.Password
                  id="ai_anthropic_api_key"
                  value={values.ai_anthropic_api_key || ""}
                  placeholder="sk-ant-..."
                  onChange={(e) => onChange({ ai_anthropic_api_key: e.target.value })}
                />
              </Col>
              <Col span={12}>
                <label htmlFor="ai_ollama_url">Ollama URL</label>
                <Input
                  id="ai_ollama_url"
                  value={values.ai_ollama_url || ""}
                  placeholder="http://ollama:11434"
                  onChange={(e) => onChange({ ai_ollama_url: e.target.value })}
                />
              </Col>
            </Row>

            <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
              API keys set here override environment variables. Leave blank to use env var defaults.
            </p>
          </>
        )}
      </Form.Item>
    </DynamicComponent>
  );
}

AISettings.propTypes = SettingsEditorPropTypes;

AISettings.defaultProps = SettingsEditorDefaultProps;
