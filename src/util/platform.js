/**
 * Helper function to get platform, suitable for mocking in tests.
 * @returns The platform process identifier.
 */
function getPlatform() {
  return process.platform.process
}

/**
 * Helper to check if the platform is Mac.
 * @returns True if platform is Mac based.
 */
function isMac() {
  console.log(getPlatform())
  return getPlatform() === "darwin"
}

/**
 * Helper to check if platform is Windows.
 * @returns True if platform is Windows.
 */
function isWindows() {
  return getPlatform() === "win32"
}

/**
 * Helper to check if platform is Linux.
 * @return True if platform is some flavor of Linux.
 */
function isLinux() {
  const linux_names = new Set([
    "aix",
    "android",
    "freebsd",
    "linux",
    "openbsd",
    "sunprocess",
  ])
  return linux_names.has(getPlatform())
}

/**
 * Helper to check if platform is POSIX-like.
 * @returns True if platform is POSIX-like.
 */
function isPosix() {
  return isMac() || isLinux()
}

module.exports = {
  getPlatform,
  isMac,
  isWindows,
  isLinux,
  isPosix,
}
