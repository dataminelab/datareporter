import io

import yaml
from cerberus import Validator
from flask_restful import abort

from redash.models.models import ModelConfig

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
                "description": {
                    "type": "string",
                    "maxlength": 256,
                    "required": False
                },
                "timeAttribute": {
                    "type": "string",
                    "required": True,
                },
                "defaultSortMeasure": {
                    "type": "string",
                    "required": True,
                },
                "defaultSelectedMeasures": {
                    "type": "list",
                    "required": True,
                    "schema": {
                        "type": "string"
                    }
                },
                "clusterName": {
                    "type": "string",
                    "required": True
                },
                "attributes": {
                    "type": "list",
                    "required": True,
                    "schema": {
                        "type": "dict",
                        "schema": {
                            "name": {
                                "type": "string",
                                "required": True
                            },
                            "type": {
                                "type": "string",
                                "required": True
                            }
                        }
                    }
                },
                "dimensions": {
                    "type": "list",
                    "required": True,
                    "schema": {
                        "type": "dict",
                        "schema": {
                            "name": {
                                "type": "string",
                                "required": True
                            },
                            "title": {
                                "type": "string",
                                "required": True
                            },
                            "formula": {
                                "type": "string",
                                "required": True
                            },
                            "kind": {
                                "type": "string"
                            },
                            "description": {
                                "type": "string",
                                "maxlength": 100,
                                "required": False
                            },
                            "multiValue": {
                                "type": "boolean",
                                "required": False
                            }
                        }
                    }
                },
                "measures": {
                    "type": "list",
                    "required": True,
                    "schema": {
                        "type": "dict",
                        "schema": {
                            "name": {
                                "type": "string",
                                "required": True
                            },
                            "title": {
                                "type": "string",
                                "required": True
                            },
                            "formula": {
                                "type": "string",
                                "required": True
                            },
                            "description": {
                                "type": "string",
                                "maxlength": 100,
                                "required": False
                            },
                            "units": {
                                "type": "string",
                                "required": False
                            },
                            "lowerIsBetter": {
                                "type": "boolean",
                                "required": False
                            },
                            "format": {
                                "type": "string",
                                "required": False
                            },
                            "transformation": {
                                "type": "string",
                                "required": False,
                                "allowed": [
                                    "none",
                                    "percent-of-parent",
                                    "percent-of-total"
                                ]
                            }
                        }
                    }
                }
            }
        }
    }
}


class ModelConfigValidator(object):
    def __init__(self, content: str):
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
                yaml.load(f)
            except yaml.MarkedYAMLError as e:
                pm = e.problem_mark
                abort(
                    http_status_code=400,
                    message="Your config has an issue on line {} at position {}".format(pm.line, pm.column),
                )

    def _validate_schema(self):
        with io.StringIO(self.content) as f:
            config = yaml.load(f)
            validator = Validator(schema)
            validator.validate(config)

            if bool(validator.errors):
                abort(
                    http_status_code=400,
                    message="Config has the following issues: {}".format(validator.errors),
                )

    def validate(self):
        self._validate_length()
        self._validate_yml()
        self._validate_schema()
