from . import TimestampMixin, ChangeTrackingMixin, User, DataSource
from .base import db, primary_key, Column, key_type, gfk_type


@gfk_type
class Model(ChangeTrackingMixin, TimestampMixin, db.Model):
    id = primary_key("Model")
    name = Column(db.String(length=255))
    data_source_id = Column(key_type("DataSource"), db.ForeignKey("data_sources.id"))
    data_source = db.relationship(DataSource, backref="models")
    user_id = Column(key_type("User"), db.ForeignKey("users.id"))
    user = db.relationship(User)
    version = Column(db.Integer)

    __tablename__ = "models"
    __mapper_args__ = {"version_id_col": version}

    def __str__(self):
        return "{}".format(self.name)

    @classmethod
    def get_by_id(cls, _id):
        return cls.query.filter(cls.id == _id).one()

    @classmethod
    def get_by_user(cls, user):
        return cls.query.filter(cls.user_id == user.id)

    @classmethod
    def get_by_id_and_user(cls, _id, user):
        return cls.query.filter(cls.id == _id, cls.user_id == user.id).one()
