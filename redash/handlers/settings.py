from flask import request

from redash.handlers.base import BaseResource
from redash.models import Organization, db
from redash.permissions import require_admin
from redash.settings.organization import settings as org_settings

# Keys that contain secrets — mask on GET, never return in plaintext
_SECRET_SETTINGS_KEYS = frozenset([
    "ai_openai_api_key",
    "ai_gemini_api_key",
    "ai_anthropic_api_key",
])


def _mask_secret(value):
    """Show only last 4 characters of a secret, or empty string if not set."""
    if not value:
        return ""
    return "••••" + value[-4:]


def get_settings_with_defaults(defaults, org):
    values = org.settings.get("settings", {})
    settings = {}

    for setting, default_value in defaults.items():
        current_value = values.get(setting)
        if current_value is None and default_value is None:
            continue

        if current_value is None:
            settings[setting] = default_value
        else:
            settings[setting] = current_value

    settings["auth_google_apps_domains"] = org.google_apps_domains

    return settings


def _mask_secrets(settings_dict):
    """Mask secret values before returning to client."""
    result = dict(settings_dict)
    for key in _SECRET_SETTINGS_KEYS:
        if key in result:
            result[key] = _mask_secret(result[key])
    return result


class OrganizationSettings(BaseResource):
    @require_admin
    def get(self):
        settings = get_settings_with_defaults(org_settings, self.current_org)

        return {"settings": _mask_secrets(settings)}

    @require_admin
    def post(self):
        new_values = request.json

        if self.current_org.settings.get("settings") is None:
            self.current_org.settings["settings"] = {}

        previous_values = {}
        for k, v in new_values.items():
            if k == "auth_google_apps_domains":
                previous_values[k] = self.current_org.google_apps_domains
                self.current_org.settings[Organization.SETTING_GOOGLE_APPS_DOMAINS] = v
            elif k in _SECRET_SETTINGS_KEYS and v and v.startswith("••••"):
                # Client sent back a masked value — skip, don't overwrite with mask
                continue
            else:
                previous_values[k] = self.current_org.get_setting(k, raise_on_missing=False)
                self.current_org.set_setting(k, v)

        db.session.add(self.current_org)
        db.session.commit()

        self.record_event(
            {
                "action": "edit",
                "object_id": self.current_org.id,
                "object_type": "settings",
                "new_values": {k: "***" if k in _SECRET_SETTINGS_KEYS else v for k, v in new_values.items()},
                "previous_values": {k: "***" if k in _SECRET_SETTINGS_KEYS else v for k, v in previous_values.items()},
            }
        )

        settings = get_settings_with_defaults(org_settings, self.current_org)

        return {"settings": _mask_secrets(settings)}
