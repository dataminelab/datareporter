import { createParameter } from "..";

describe("QueryBasedDropdownParameter", () => {
  let param;
  let multiValuesOptions = null;

  beforeEach(() => {
    const paramOptions = {
      name: "param",
      title: "Param",
      type: "query",
      queryId: 1,
      multiValuesOptions,
    };
    param = createParameter(paramOptions);
  });

  describe("normalizeValue", () => {
    test("returns the value when the input in the enum options", () => {
      const normalizedValue = param.normalizeValue("value2");
      expect(normalizedValue).toBe("value2");
    });

    describe("Empty values", () => {
      test("normalizes null as null", () => {
        expect(param.normalizeValue(null)).toBeNull();
      });

      test("normalizes undefined as null", () => {
        expect(param.normalizeValue(undefined)).toBeNull();
      });

      test("normalizes [] as [] for multi-value", () => {
        // Simulate multiValuesOptions enabled
        param.multiValuesOptions = { prefix: '"', suffix: '"', separator: "," };
        expect(param.normalizeValue([])).toEqual([]);
      });

      test("normalizes [] as null for single-value", () => {
        // Simulate multiValuesOptions disabled
        param.multiValuesOptions = null;
        expect(param.normalizeValue([])).toBeNull();
      });
    });
  });

  describe("Multi-valued", () => {
    beforeAll(() => {
      multiValuesOptions = { prefix: '"', suffix: '"', separator: "," };
    });

    describe("normalizeValue", () => {
      test("returns an array with the input when input is not an array", () => {
        const normalizedValue = param.normalizeValue("value");
        expect(normalizedValue).toEqual(["value"]);
      });
    });

    describe("getExecutionValue", () => {
      test("joins values when joinListValues is truthy", () => {
        param.setValue(["value1", "value3"]);
        const executionValue = param.getExecutionValue({
          joinListValues: true,
        });
        expect(executionValue).toBe('"value1","value3"');
      });
    });
  });
});
