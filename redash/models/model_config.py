from typing import List

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
    def get_model_config(cls, model_id):
        model: Model = Model.get_by_id(model_id)
        if not model:
            return False
        models: list[Model] = Model.query.filter(Model.data_source_id == model.data_source_id).all()
        data_cubes: List[DataCube.data_cube] = []
        table_names: list[str] = []
        cluster_names: set[str] = set()

        for model in models:
            cube = DataCube(model).data_cube
            if cube is None:
                continue
            if cube["name"] not in table_names:
                table_names.append(cube["name"])
                data_cubes.append(cube)
                # Collect cluster names from data cubes
                if "clusterName" in cube:
                    cluster_names.add(cube["clusterName"])

        # Build cluster objects from collected cluster names
        clusters = []
        for cluster_name in cluster_names:
            if cluster_name != "native":  # native is a special case, doesn't need a cluster object
                clusters.append({"name": cluster_name, "type": cluster_name})

        return {"dataCubes": data_cubes, "clusters": clusters, "customization": {}, "timekeeper": {}}
