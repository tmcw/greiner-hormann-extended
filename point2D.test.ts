import { test, expect } from "vitest";
import { point2D } from "./point2D.ts";

test("point2D", () => {
  expect(point2D).toBeTruthy();
  expect(new point2D(2, 24)).toHaveProperty("x", 2);
});
