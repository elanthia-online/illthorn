type HTMLOpts = 
  { id?: string
  ; classes? : string[] | string
  }

export function div ({id, classes} : HTMLOpts) {
  const d = document.createElement("div")
  if (classes) {
    if (typeof classes == "string") classes = classes.split(" ")
    d.classList.add(...classes)
  }
  id && (d.id = id)
  return d
}