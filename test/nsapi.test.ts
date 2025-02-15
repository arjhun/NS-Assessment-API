import { expect, test } from "vitest"
import { getCrowdScore } from "../src/nsapi"

// I exported this function just to make some test, 
// IRL I would test only public interfaces or exported utility functions

test("getCrowdScore returns 3 for LOW crowd forecast", () => {
  expect(getCrowdScore("LOW")).toBe(3)
})

test("getCrowdScore returns 2 for MEDIUM crowd forecast", () => {
  expect(getCrowdScore("MEDIUM")).toBe(2)
})

test("getCrowdScore returns 1 for HIGH crowd forecast", () => {
  expect(getCrowdScore("HIGH")).toBe(1)
})

test("getCrowdScore returns 0 for undefined crowd forecast", () => {
  expect(getCrowdScore(undefined)).toBe(0)
})

test("getCrowdScore returns 0 for unknown crowd forecast", () => {
  expect(getCrowdScore("UNKNOWN")).toBe(0)
})
