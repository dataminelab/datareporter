import React from "react";
import renderer from "react-test-renderer";
import Group from "@/services/group";
import ReadOnlyModelConfig from "./ReadOnlyModelConfig";

beforeEach(() => {
  Group.query = jest.fn().mockResolvedValue([]);
});

test("renders correctly", () => {
  const user = {
    id: 2,
    name: "John Doe",
    email: "john@doe.com",
    groupIds: [],
    profileImageUrl: "http://www.images.com/llama.jpg",
  };

  const component = renderer.create(<ReadOnlyModelConfig user={user} />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
