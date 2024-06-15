from flask import g, redirect, render_template, request, url_for
from flask_login import login_user
from redash import settings
from redash.authentication.org_resolving import current_org
from redash.handlers.base import routes
from redash.models import Group, Organization, User, db
from redash.tasks.general import subscribe
from wtforms import BooleanField, Form, PasswordField, StringField, validators
from wtforms.fields.html5 import EmailField
import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError

class SetupForm(Form):
    name = StringField("Name", validators=[validators.InputRequired()])
    email = EmailField("Email Address", validators=[validators.Email()])
    password = PasswordField("Password", validators=[validators.Length(6)])
    org_name = StringField("Organization Name", validators=[validators.InputRequired()])
    security_notifications = BooleanField()
    newsletter = BooleanField()


def create_org(org_name, user_name, email, password):
    default_org = Organization(name=org_name, slug="default", settings={})
    admin_group = Group(
        name="admin",
        permissions=["admin", "super_admin"],
        org=default_org,
        type=Group.BUILTIN_GROUP,
    )
    default_group = Group(
        name="default",
        permissions=Group.DEFAULT_PERMISSIONS,
        org=default_org,
        type=Group.BUILTIN_GROUP,
    )

    db.session.add_all([default_org, admin_group, default_group])
    db.session.commit()

    user = User(
        org=default_org,
        name=user_name,
        email=email,
        group_ids=[admin_group.id, default_group.id],
    )
    user.hash_password(password)

    db.session.add(user)
    db.session.commit()

    return default_org, user


def add_member_mailchimp(email, name, org_name):
    list_id = settings.MAILCHIMP_LIST_ID
    try:
        client = MailchimpMarketing.Client()
        client.set_config({
            "api_key": settings.MAILCHIMP_API_KEY,
            "server": settings.MAILCHIMP_SERVER
        })
        client.lists.add_list_member(list_id, {"email_address": email, "merge_fields": {"FNAME": name, "ONAME": org_name}, "status": "subscribed"})
    except ApiClientError as error:
        if error.status_code == 400:
            print("Already subscribed")
        else:
            raise Exception("Error: {}".format(error.text))


@routes.route("/setup", methods=["GET", "POST"])
def setup():
    if current_org != None or settings.MULTI_ORG:
        return redirect("/")

    form = SetupForm(request.form)
    form.newsletter.data = True
    form.security_notifications.data = True

    if request.method == "POST" and form.validate():
        default_org, user = create_org(
            form.org_name.data, form.name.data, form.email.data, form.password.data
        )

        g.org = default_org
        login_user(user)

        # signup to newsletter if needed
        if form.newsletter.data or form.security_notifications:
            add_member_mailchimp(form.email.data, form.name.data, form.org_name.data)

        return redirect(url_for("redash.index", org_slug=None))

    return render_template("setup.html", form=form)
