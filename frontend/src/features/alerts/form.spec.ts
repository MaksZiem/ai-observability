import { describe, expect, it } from "vitest";
import {
  EMPTY_ALERT_VALUES,
  validateAlertForm,
  type AlertFormValues,
} from "@/features/alerts/form";

function values(overrides: Partial<AlertFormValues>): AlertFormValues {
  return {
    ...EMPTY_ALERT_VALUES,
    name: "Payment errors",
    threshold: "5",
    ...overrides,
  };
}

describe("validateAlertForm", () => {
  it("converts an error-rate percentage to a ratio", () => {
    const { payload } = validateAlertForm(values({ metric: "error_rate" }));

    expect(payload?.threshold).toBe(0.05);
  });

  it("keeps latency thresholds in milliseconds", () => {
    const { payload } = validateAlertForm(
      values({ metric: "p95_latency", threshold: "1000" }),
    );

    expect(payload?.threshold).toBe(1000);
  });

  it("omits empty optional fields", () => {
    const { payload } = validateAlertForm(values({}));

    expect(payload).toMatchObject({
      service: undefined,
      webhookUrl: undefined,
    });
  });

  it.each([
    [{ name: "" }, "nameRequired"],
    [{ metric: "cpu" }, "choicesRequired"],
    [{ threshold: "" }, "threshold"],
    [{ threshold: "-1" }, "threshold"],
    [{ threshold: "abc" }, "threshold"],
    [{ windowMinutes: "0" }, "window"],
    [{ windowMinutes: "1441" }, "window"],
    [{ windowMinutes: "2.5" }, "window"],
  ])("rejects %o", (overrides, error) => {
    expect(validateAlertForm(values(overrides))).toEqual({
      payload: null,
      error,
    });
  });
});
