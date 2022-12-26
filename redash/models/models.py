from . import TimestampMixin, ChangeTrackingMixin, User, DataSource
from .base import db, primary_key, Column, key_type, gfk_type
from sqlalchemy import and_, or_
from ..services.expression import ExpressionBase64Parser
from redash.models import Favorite


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
        return cls.query.filter(cls.data_source_id == data_source_id).all()

    @classmethod
    def get_by_user(cls, user):
        return cls.query.filter(cls.user_id == user.id)

    @classmethod
    def get_by_user_and_data_source(cls, user, data_source_id):
        return cls.query.filter(cls.user_id == user.id, cls.data_source_id == data_source_id)

    @classmethod
    def get_by_id_and_user(cls, _id, user):
        return cls.query.filter(cls.id == _id, cls.user_id == user.id).one()


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


class Report(ChangeTrackingMixin, TimestampMixin, db.Model):
    id = primary_key("Report")
    name = Column(db.String(length=255))
    user_id = Column(key_type("User"), db.ForeignKey("users.id"))
    user = db.relationship(User)
    expression = db.Column(db.JSON())
    model_id = Column(db.Integer, db.ForeignKey("models.id"))
    model = db.relationship("Model", back_populates="reports")

    color_1 = Column(db.String(length=32))
    color_2 = Column(db.String(length=32))

    version = Column(db.Integer)

    __tablename__ = "reports"
    __mapper_args__ = {"version_id_col": version}

    @classmethod
    def get_by_id(cls, _id):
        return cls.query.filter(cls.id == _id).one()

    @classmethod
    def get_by_user(cls, user):
        return cls.query.filter(cls.user_id == user.id)

    @classmethod
    def get_by_user_and_id(cls, user: User, _id: int):
        return cls.query.filter(and_(cls.user_id == user.id, cls.id == _id)).one()

    @property
    def hash(self):
        return ExpressionBase64Parser.parse_dict_to_base64(self.expression)

    def __str__(self):
        return self.name

    @classmethod
    def all(self, org, groups_ids, user_id):
        return self.query.filter(
            or_(
                self.user_id == user_id,
                and_(
                    # self.user.has(org=org)
                ),
            )
        )

    @classmethod
    def search(self, org, groups_ids, user_id, search_term):
        return self.all(org, groups_ids, user_id).filter(
            self.name.ilike("%{}%".format(search_term))
        )

    @classmethod
    def favorites(self, user, base_query=None):
        if base_query is None:
            base_query = self.all(user.org, user.group_ids, user.id)
        return base_query.join(
            (
                Favorite,
                and_(
                    Favorite.object_type == "Report",
                    Favorite.object_id == Report.id,
                ),
            )
        ).filter(Favorite.user_id == user.id)

    @classmethod
    def is_favorite(cls, user, object):
        return cls.query.filter(cls.object == object, cls.user_id == user).count() > 0
