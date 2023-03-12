export type InlineTagName =
  | "a"
  | "b"
  | "d"
  | "stream"
  | ":text"

export type MetadataTagName =
  | "dialogData"
  | "compDef"
  | "component"

export type TagName = 
  | InlineTagName
  | MetadataTagName