import io

import yaml
from cerberus import Validator
from flask_restful import abort

from redash.models.model_config import ModelConfig

schema = {
    "dataCubes": {
        "type": "list",
        "required": True,
        "schema": {
            "type": "dict",
            "schema": {
                "name": {
                    "type": "string",
                    "maxlength": 100,
                    "required": True,
                },
                "title": {
                    "type": "string",
                    "maxlength": 120,
                    "required": True,
                },
                "description": {"type": "string", "maxlength": 256, "required": False},
                "timeAttribute": {
                    "type": "string",
                    "required": True,
                },
                "defaultSortMeasure": {
                    "type": "string",
                    "required": True,
                },
                "defaultSelectedMeasures": {"type": "list", "required": True, "schema": {"type": "string"}},
                "clusterName": {"type": "string", "required": True},
                "attributes": {
                    "type": "list",
                    "required": True,
                    "schema": {
                        "type": "dict",
                        "schema": {
                            "name": {"type": "string", "required": True},
                            "type": {"type": "string", "required": True},
                            "nativeType": {"type": "string", "required": False},
                        },
                    },
                },
                "dimensions": {
                    "type": "list",
                    "required": True,
                    "schema": {
                        "type": "dict",
                        "schema": {
                            "name": {"type": "string", "required": True},
                            "title": {"type": "string", "required": True},
                            "formula": {"type": "string", "required": True},
                            "kind": {"type": "string"},
                            "description": {"type": "string", "maxlength": 100, "required": False},
                            "multiValue": {"type": "boolean", "required": False},
                        },
                    },
                },
                "measures": {
                    "type": "list",
                    "required": True,
                    "schema": {
                        "type": "dict",
                        "schema": {
                            "name": {"type": "string", "required": True},
                            "title": {"type": "string", "required": True},
                            "formula": {"type": "string", "required": True},
                            "description": {"type": "string", "maxlength": 100, "required": False},
                            "units": {"type": "string", "required": False},
                            "lowerIsBetter": {"type": "boolean", "required": False},
                            "format": {"type": "string", "required": False},
                            "transformation": {
                                "type": "string",
                                "required": False,
                                "allowed": ["none", "percent-of-parent", "percent-of-total"],
                            },
                        },
                    },
                },
            },
        },
    }
}


class ModelConfigValidator:
    def __init__(self, content: str):
        self._set_content(content)

    def _set_content(self, content: str):
        if not isinstance(content, str):
            abort(
                http_status_code=400,
                message=f"Expected type string got {type(content)}",
            )

        self.content = content

    def _validate_length(self):
        length = len(self.content)
        if length > ModelConfig.MAX_CONTENT_LENGTH:
            abort(
                http_status_code=400,
                message="Maximum content length is {}, actual {}".format(ModelConfig.MAX_CONTENT_LENGTH, length),
            )

    def _validate_yml(self):
        with io.StringIO(self.content) as f:
            try:
                yaml.load(f, Loader=yaml.FullLoader)
            except yaml.MarkedYAMLError as e:
                pm = e.problem_mark
                abort(
                    http_status_code=400,
                    message="Your config has an issue on line {} at position {}".format(pm.line, pm.column),
                )

    def _format_cerberus_errors(self, errors, path=None):
        """
        Recursively format Cerberus errors into user-friendly messages.
        """
        if path is None:
            path = []
        messages = []
        if isinstance(errors, dict):
            for key, value in errors.items():
                if isinstance(key, int):
                    new_path = path + [f"[{key}]"]
                else:
                    new_path = path + [str(key)]
                messages.extend(self._format_cerberus_errors(value, new_path))
        elif isinstance(errors, list):
            for item in errors:
                if isinstance(item, dict):
                    messages.extend(self._format_cerberus_errors(item, path))
                else:
                    # item is a string error message
                    location = ".".join(path)
                    messages.append(f"At '{location}': {item}")
        else:
            location = ".".join(path)
            messages.append(f"At '{location}': {errors}")
        return messages

    def _validate_schema(self):
        with io.StringIO(self.content) as f:
            config = yaml.load(f, Loader=yaml.FullLoader)
            validator = Validator(schema)
            validator.validate(config)

            if bool(validator.errors):
                # Format errors for user-friendly output
                error_messages = self._format_cerberus_errors(validator.errors)
                abort(
                    http_status_code=400,
                    message="Config has the following issues:\n" + "\n".join(error_messages),
                )

    def _validate_values(self):
        # Extract important values from each dataCube and check attributes
        with io.StringIO(self.content) as f:
            config = yaml.load(f, Loader=yaml.FullLoader)
            data_cubes = config.get("dataCubes", [])
            timeAttributes = []
            clusterNames = []
            defaultSortMeasures = []
            defaultSelectedMeasures = []
            for idx, cube in enumerate(data_cubes):
                time_attr = cube.get("timeAttribute")
                cluster_name = cube.get("clusterName")
                default_sort_measure = cube.get("defaultSortMeasure")
                default_selected_measures = cube.get("defaultSelectedMeasures", [])

                # Throw if any required variable is missing or empty
                missing_vars = []
                if not time_attr:
                    missing_vars.append("timeAttribute")
                if not cluster_name:
                    missing_vars.append("clusterName")
                if not default_sort_measure:
                    missing_vars.append("defaultSortMeasure")
                if (
                    not default_selected_measures
                    or not isinstance(default_selected_measures, list)
                    or not all(default_selected_measures)
                ):
                    missing_vars.append("defaultSelectedMeasures")
                if missing_vars:
                    abort(
                        http_status_code=400,
                        message=f"Config error: dataCube at index {idx} missing required value(s): {', '.join(missing_vars)}",
                    )

                timeAttributes.append(time_attr)
                clusterNames.append(cluster_name)
                defaultSortMeasures.append(default_sort_measure)
                defaultSelectedMeasures.append(default_selected_measures)

                # Check attributes for these values
                attribute_names = [attr.get("name") for attr in cube.get("attributes", [])]
                missing = []
                if time_attr and time_attr not in attribute_names:
                    missing.append(f"timeAttribute '{time_attr}' not found in attributes")
                if default_sort_measure and default_sort_measure not in attribute_names:
                    missing.append(f"defaultSortMeasure '{default_sort_measure}' not found in attributes")
                for measure in default_selected_measures:
                    if measure and measure not in attribute_names:
                        missing.append(f"defaultSelectedMeasure '{measure}' not found in attributes")
                if missing:
                    abort(
                        http_status_code=400,
                        message="Config attribute check failed: " + ", ".join(missing),
                    )

    def validate(self):
        self._validate_length()
        self._validate_yml()
        self._validate_schema()
        self._validate_values()
