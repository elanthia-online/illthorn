"use strict"
const { expect, test } = require("@jest/globals")
const LimitedList = require("../src/util/limited-list")

let startList = ["a", "b"]

test("Construction", () => {
  let list = LimitedList.of(startList, { limit: 3 })
  expect(list.length).toBe(startList.length)
  expect(list.members).toEqual(startList)

  let secondList = new LimitedList()
  expect(secondList.limit).toBe(100)

  expect(LimitedList.of().members).toEqual([])
})

test("Size and length", () => {
  let list = LimitedList.of(startList)
  expect(list.size).toBe(list.length)
})

test("pushing elements to the list", () => {
  let list = LimitedList.of(startList, { limit: 4 })
  let updatedList = list.lpush("c", "d")
  expect(updatedList.members).toEqual(["c", "d", "a", "b"])
  list.lpush("d", "c")
  expect(list.members).toEqual(["d", "c", "c", "d"])
})

test("filtering list", () => {
  let testEntries = [1, 2, 3, 4]
  let list = LimitedList.of(testEntries)
  expect(
    list.filter((cmd) => {
      return cmd % 2 == 0
    })
  ).toEqual([2, 4])
})

test("head test", () => {
  let headList = LimitedList.of(["a", "b"])
  expect(headList.head()).toBe("a")
})

test("toJSON", () => {
  let list = LimitedList.of(startList)
  expect(list.toJSON()).toBe(startList)
})
