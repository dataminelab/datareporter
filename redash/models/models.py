from sqlalchemy import and_, func, or_, text  # noqa: F401
from sqlalchemy.orm import load_only  # noqa: F401

from redash.models import Favorite  # noqa: F401
from redash.utils import generate_token  # noqa: F401

from ..services.expression import ExpressionBase64Parser  # noqa: F401
from . import DataSource
from .base import Column, db, gfk_type, key_type, primary_key
from .changes import Change, ChangeTrackingMixin  # noqa
from .mixins import TimestampMixin
from .types import MutableList  # noqa: F401
from .users import User


@gfk_type
class Model(ChangeTrackingMixin, TimestampMixin, db.Model):
    id = primary_key("Model")
    name = Column(db.String(length=255))
    data_source_id = Column(key_type("DataSource"), db.ForeignKey("data_sources.id"))
    data_source = db.relationship(DataSource, backref="models")
    user_id = Column(key_type("User"), db.ForeignKey("users.id"))
    user = db.relationship(User)
    version = Column(db.Integer)
    table = Column(db.String(length=255), nullable=True)
    query_id = Column(key_type("Query"), db.ForeignKey("queries.id"), nullable=True)
    query_rel = db.relationship("Query", backref="models")
    config = db.relationship("ModelConfig", back_populates="model", uselist=False)

    reports = db.relationship("Report", back_populates="model")

    __tablename__ = "models"
    __mapper_args__ = {"version_id_col": version}

    def __str__(self):
        return "{}".format(self.name)

    @classmethod
    def get_by_id(cls, _id):
        return cls.query.filter(cls.id == _id).one()

    @classmethod
    def get_by_data_source(cls, data_source_id):
        return cls.query.filter(cls.data_source_id == data_source_id)

    @classmethod
    def get_by_user(cls, user):
        return cls.query.filter(cls.user_id == user.id)

    @classmethod
    def get_by_user_and_data_source(cls, user, data_source_id):
        return cls.query.filter(cls.user_id == user.id, cls.data_source_id == data_source_id)

    @classmethod
    def get_by_id_and_user(cls, _id, user):
        return cls.query.filter(cls.id == _id, cls.user_id == user.id).one()

    @classmethod
    def get_by_group_ids(self, user):
        return self.query.join(User).filter(and_(User.org_id == user.org.id, User.group_ids.overlap(user.group_ids)))

    @classmethod
    def get_one_by_group_ids(self, user):
        return self.get_by_group_ids(user).one()
