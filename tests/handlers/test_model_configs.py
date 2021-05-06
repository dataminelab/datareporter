from tests import BaseTestCase
from redash.models import db


class TestModelsConfigCreateResource(BaseTestCase):

    def test_user_without_model_permission(self):
        group1 = self.factory.create_group(
            org=self.factory.create_org(), permissions=[""]
        )
        db.session.flush()
        user = self.factory.create_user(
            group_ids=[group1.id]
        )
        db.session.flush()

        response = self.make_request(
            "post",
            "/api/models/1/config",
            data={"content": "dataCube: 12"},
            user=user
        )

        self.assertEqual(403, response.status_code)

    def test_content_length_greater_than_20000(self):
        attributes = "\n".join(
            ["                    - key: {}\n                    value: {}".format(key, key) for key in range(680)])
        content = """dataCubes:
                    - name: wikiticker
                      title: Wikiticker
                      defaultSortMeasure: deltaByTen
                      clusterName: wiki
                      timeAttribute: time
                      defaultSelectedMeasures:
                        - deltaByTen
                      attributes:
                          {}
                          """.format(attributes)

        group = self.factory.create_group(permissions=["edit_model_config"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models/100/config",
            data={"content": content},
            user=user
        )

        self.assertEqual(400, response.status_code)
        self.assertEqual('Maximum content length is 20000, actual 42335', response.json['message'])

    def test_not_valid_content(self):
        group = self.factory.create_group(permissions=["edit_model_config"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        response = self.make_request(
            "post",
            "/api/models/100/config",
            data={"content": "dataCube: 12\n key: 1"},
            user=user
        )

        self.assertEqual(400, response.status_code)
        self.assertEqual('Your config has an issue on line 1 at position 4', response.json['message'])

    def test_not_existing_model(self):
        group = self.factory.create_group(permissions=["edit_model_config"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        db.session.commit()

        content = \
            '''dataCubes:
  - name: wikiticker
    title: Wikiticker
    defaultSortMeasure: deltaByTen
    clusterName: wiki
    timeAttribute: time
    defaultSelectedMeasures:
      - deltaByTen
    attributes:
      - name: deltaByTen
        type: number
    dimensions:
      - name: regionName
        title: Region Name
        formula: $regionName
    measures:
      - name: deltaByTen
        title: Delta By Ten
        formula: $main.sum($deltaByTen)
'''

        response = self.make_request(
            "post",
            "/api/models/100/config",
            data={"content": content},
            user=user
        )

        self.assertEqual(404, response.status_code)

    def test_model_without_config(self):
        group = self.factory.create_group(permissions=["edit_model_config"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        model = self.factory.create_model(user=user)
        db.session.commit()

        content = \
            '''dataCubes:
  - name: wikiticker
    title: Wikiticker
    defaultSortMeasure: deltaByTen
    clusterName: wiki
    timeAttribute: time
    defaultSelectedMeasures:
      - deltaByTen
    attributes:
      - name: deltaByTen
        type: number
    dimensions:
      - name: regionName
        title: Region Name
        formula: $regionName
    measures:
      - name: deltaByTen
        title: Delta By Ten
        formula: $main.sum($deltaByTen)
'''

        response = self.make_request(
            "post",
            "/api/models/{}/config".format(model.id),
            data={"content": content},
            user=user
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(content, response.json['content'])

    def test_model_with_config(self):
        group = self.factory.create_group(permissions=["edit_model_config"])
        db.session.commit()
        user = self.factory.create_admin(group_ids=[group.id])
        model = self.factory.create_model(user=user)
        config = self.factory.create_model_config(model=model)
        db.session.commit()

        content = \
            '''dataCubes:
  - name: wikiticker
    title: Wikiticker
    defaultSortMeasure: deltaByTen
    clusterName: wiki
    timeAttribute: time
    defaultSelectedMeasures:
      - deltaByTen
    attributes:
      - name: deltaByTen
        type: number
    dimensions:
      - name: regionName
        title: Region Name
        formula: $regionName
    measures:
      - name: deltaByTen
        title: Delta By Ten
        formula: $main.sum($deltaByTen)
'''

        response = self.make_request(
            "post",
            "/api/models/{}/config".format(model.id),
            data={"content": content},
            user=user
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(content, response.json['content'])
