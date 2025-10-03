from flask import request
from flask_restful import abort

from redash import models
from redash.handlers.base import BaseResource, get_object_or_404
from redash.permissions import require_admin, require_permission


class GroupListResource(BaseResource):
    @require_admin
    def post(self):
        name = request.json.get("name")
        if not name:
            abort(400, message="Name is required.")
        group = models.Group(name=name, org=self.current_org)
        models.db.session.add(group)
        models.db.session.commit()

        self.record_event({"action": "create", "object_id": group.id, "object_type": "group"})

        return group.to_dict()

    def get(self):
        if self.current_user.has_permission("admin"):
            groups = models.Group.all(self.current_org)
        else:
            groups = models.Group.query.filter(models.Group.id.in_(self.current_user.group_ids))

        self.record_event({"action": "list", "object_id": "groups", "object_type": "group"})

        return [g.to_dict() for g in groups]


def extract_permissions_string(permissions):
    if permissions is None:
        permissions = models.Group.DEFAULT_PERMISSIONS
    else:
        permissions = permissions.split(",")
        permissions = [p.strip() for p in permissions]
    return permissions


class GroupPermissionResource(BaseResource):
    @require_admin
    def put(self, group_id):
        group = models.Group.get_by_id_and_org(group_id, self.current_org)

        if group.type == models.Group.BUILTIN_GROUP:
            abort(400, message="Can't modify built-in groups.")

        permissions = request.json.get("permissions")
        if not permissions:
            abort(400, message="Permissions are required.")

        permissions = extract_permissions_string(permissions)
        group.permissions = permissions
        models.db.session.add(group)
        models.db.session.commit()
        self.record_event({"action": "change_permissions", "object_id": group.id, "object_type": "group"})

        return {"permissions": group.permissions}

    @require_admin
    def get(self, group_id):
        if group_id == "all":
            if not self.current_user.has_permission("admin"):
                abort(403, message="You do not have permission to view all groups.")
            groups = models.Group.all(self.current_org)
            unique_permissions = set()
            for g in groups:
                unique_permissions.update(g.permissions)
            return list(unique_permissions)
        group = models.Group.get_by_id_and_org(group_id, self.current_org)

        if not group:
            abort(404, message="Group not found.")

        if not (self.current_user.has_permission("admin") or int(group_id) in self.current_user.group_ids):
            abort(403)

        self.record_event({"action": "view", "object_id": group_id, "object_type": "group"})

        return {i: p for i, p in enumerate(group.permissions)}

    @require_admin
    def post(self, group_id: int):
        """This method adds a permission to a group.

        Args:
            group_id (int): The ID of the group to modify.

        Returns:
            dict: The updated permissions for the group.
        """
        group = models.Group.get_by_id_and_org(group_id, self.current_org)

        if group.type == models.Group.BUILTIN_GROUP:
            abort(400, message="Can't modify built-in groups.")

        permission = request.json.get("permission")
        if not permission:
            abort(400, message="Permission is required.")

        permission = permission.strip()
        permission_added = group.add_permission(permission)
        if not permission_added:
            abort(400, message=f"Permission '{permission}' already exists in the group.")

        self.record_event({"action": "add_permissions", "object_id": group.id, "object_type": "group"})
        return {i: p for i, p in enumerate(group.permissions)}

    @require_admin
    def delete(self, group_id: int):
        group = models.Group.get_by_id_and_org(group_id, self.current_org)

        if group.type == models.Group.BUILTIN_GROUP:
            abort(400, message="Can't modify built-in groups.")

        permission = request.json.get("permission")
        if not permission:
            abort(400, message="Permission is required.")

        permission = permission.strip()
        if permission not in group.permissions:
            abort(404, message="Permission not found.")

        group.remove_permission(permission)
        models.db.session.add(group)
        models.db.session.commit()
        self.record_event({"action": "delete_permissions", "object_id": group.id, "object_type": "group"})
        return {i: p for i, p in enumerate(group.permissions)}


class GroupResource(BaseResource):
    @require_admin
    def post(self, group_id):
        group = models.Group.get_by_id_and_org(group_id, self.current_org)

        if group.type == models.Group.BUILTIN_GROUP:
            abort(400, message="Can't modify built-in groups.")

        name = request.json.get("name")
        if not name:
            abort(400, message="Name is required.")
        group.name = name.strip()

        models.db.session.add(group)
        models.db.session.commit()

        self.record_event({"action": "edit", "object_id": group.id, "object_type": "group"})

        return group.to_dict()

    def get(self, group_id):
        if not (self.current_user.has_permission("admin") or int(group_id) in self.current_user.group_ids):
            abort(403)

        group = models.Group.get_by_id_and_org(group_id, self.current_org)

        self.record_event({"action": "view", "object_id": group_id, "object_type": "group"})

        return group.to_dict()

    @require_admin
    def delete(self, group_id):
        group = models.Group.get_by_id_and_org(group_id, self.current_org)
        if group.type == models.Group.BUILTIN_GROUP:
            abort(400, message="Can't delete built-in groups.")

        members = models.Group.members(group_id)
        for member in members:
            member.group_ids.remove(int(group_id))
            models.db.session.add(member)

        models.db.session.delete(group)
        models.db.session.commit()


class GroupMemberListResource(BaseResource):
    @require_admin
    def post(self, group_id):
        user_id = request.json.get("user_id")
        if not user_id:
            abort(400, message="User ID is required.")
        user = models.User.get_by_id_and_org(user_id, self.current_org)
        group = models.Group.get_by_id_and_org(group_id, self.current_org)
        user.group_ids.append(group.id)
        models.db.session.commit()

        self.record_event(
            {
                "action": "add_member",
                "object_id": group.id,
                "object_type": "group",
                "member_id": user.id,
            }
        )
        return user.to_dict()

    @require_permission("list_users")
    def get(self, group_id):
        if not (self.current_user.has_permission("admin") or int(group_id) in self.current_user.group_ids):
            abort(403)

        members = models.Group.members(group_id)
        return [m.to_dict() for m in members]


class GroupMemberResource(BaseResource):
    @require_admin
    def delete(self, group_id, user_id):
        user = models.User.get_by_id_and_org(user_id, self.current_org)
        user.group_ids.remove(int(group_id))
        models.db.session.commit()

        self.record_event(
            {
                "action": "remove_member",
                "object_id": group_id,
                "object_type": "group",
                "member_id": user.id,
            }
        )


def serialize_data_source_with_group(data_source, data_source_group):
    d = data_source.to_dict()
    d["view_only"] = data_source_group.view_only
    return d


class GroupDataSourceListResource(BaseResource):
    @require_admin
    def post(self, group_id):
        data_source_id = request.json.get("data_source_id")
        if not data_source_id:
            abort(400, message="Data source ID is required.")
        data_source = models.DataSource.get_by_id_and_org(data_source_id, self.current_org)
        group = models.Group.get_by_id_and_org(group_id, self.current_org)

        data_source_group = data_source.add_group(group)
        models.db.session.commit()

        self.record_event(
            {
                "action": "add_data_source",
                "object_id": group_id,
                "object_type": "group",
                "member_id": data_source.id,
            }
        )

        return serialize_data_source_with_group(data_source, data_source_group)

    @require_admin
    def get(self, group_id):
        group = get_object_or_404(models.Group.get_by_id_and_org, group_id, self.current_org)

        # TOOD: move to models
        data_sources = models.DataSource.query.join(models.DataSourceGroup).filter(
            models.DataSourceGroup.group == group
        )

        self.record_event({"action": "list", "object_id": group_id, "object_type": "group"})

        return [ds.to_dict(with_permissions_for=group) for ds in data_sources]


class GroupDataSourceResource(BaseResource):
    @require_admin
    def post(self, group_id, data_source_id):
        data_source = models.DataSource.get_by_id_and_org(data_source_id, self.current_org)
        group = models.Group.get_by_id_and_org(group_id, self.current_org)
        view_only = request.json.get("view_only")
        if view_only is None:
            abort(400, message="View only flag is required.")

        data_source_group = data_source.update_group_permission(group, view_only)
        models.db.session.commit()

        self.record_event(
            {
                "action": "change_data_source_permission",
                "object_id": group_id,
                "object_type": "group",
                "member_id": data_source.id,
                "view_only": view_only,
            }
        )

        return serialize_data_source_with_group(data_source, data_source_group)

    @require_admin
    def delete(self, group_id, data_source_id):
        data_source = models.DataSource.get_by_id_and_org(data_source_id, self.current_org)
        group = models.Group.get_by_id_and_org(group_id, self.current_org)

        data_source.remove_group(group)
        models.db.session.commit()

        self.record_event(
            {
                "action": "remove_data_source",
                "object_id": group_id,
                "object_type": "group",
                "member_id": data_source.id,
            }
        )
