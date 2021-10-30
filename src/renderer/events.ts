export enum IllthornEvent {
  /**
   * when a new session is created
   */
  SESSION_NEW = "session/new",
  /**
   * when a command submitted that should be forwarded to the game socket
   */
  SUBMIT_GAME_COMMAND = "command/game",
  /**
   * when a command prefixed with `:` is issued that should be handled by illthorn
   */
  SUBMIT_ILLTHORN_COMMAND = "command/illthorn",
  /**
   * when a prompt is encountered in the feed
   */
  PROMPT_UPDATE = "prompt/update"
}