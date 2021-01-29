const { test, expect } = require("@jest/globals")
const time = require("../src/util/time")

test("0s formats correctly", () => {
  expect(time.format(0)).toBe("00m 00s")
})

test("-1s formats correctly", () => {
  expect(time.format(-1)).toBe("-00m 01s")
})

test("90 minutes formats to include hours", () => {
  expect(time.format(60 * 90)).toBe("1h 30m 00s")
})

test("1.5 days formats to include days as well", () => {
  expect(time.format(60 * 60 * 24 * 1.5)).toBe("1d 12h 00m 00s")
})

test("500 days doesn't produce years", () => {
  expect(time.format(60 * 60 * 24 * 500)).toBe("500d 00m 00s")
})
