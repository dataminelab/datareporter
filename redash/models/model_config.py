from typing import List, Union

from redash.plywood.objects.data_cube import DataCube

from .base import Column, db, gfk_type, key_type, primary_key
from .changes import ChangeTrackingMixin  # noqa
from .mixins import TimestampMixin
from .models import Model
from .users import User


@gfk_type
class ModelConfig(ChangeTrackingMixin, TimestampMixin, db.Model):
    MAX_CONTENT_LENGTH = 20_000

    id = primary_key("ModelConfig")
    user_id = Column(key_type("User"), db.ForeignKey("users.id"))
    user = db.relationship(User)
    content = Column(db.String(length=MAX_CONTENT_LENGTH))
    model = db.relationship("Model", back_populates="config")
    model_id = Column(db.Integer, db.ForeignKey("models.id"))

    version = Column(db.Integer)

    __tablename__ = "model_configs"
    __mapper_args__ = {"version_id_col": version}

    @classmethod
    def get_by_id(cls, _id):
        return cls.query.filter(cls.id == _id).one()

    @classmethod
    def get_model_config(cls, model_id) -> Union[None, "ModelConfig"]:
        model: Model = Model.get_by_id(model_id)
        if not model:
            return None
        models: list[Model] = Model.query.filter(Model.data_source_id == model.data_source_id).all()
        data_cubes: List[DataCube] = [d for d in [DataCube(m).data_cube for m in models] if d is not None]
        cluster_names: set[str] = set([cube["clusterName"] for cube in data_cubes if "clusterName" in cube])  # native is a special case, doesn't need a cluster object
        clusters: list[dict] = [{"name": c, "type": c} for c in cluster_names if c != "native"]  # native is a special case, doesn't need a cluster object
        return {
            "dataCubes": [DataCube(model).data_cube],
            "clusters": clusters,
            "customization": {},
            "timekeeper": {}
        }  # type: ignore
