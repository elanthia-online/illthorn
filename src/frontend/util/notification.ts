export function showNotification (opts : NotificationOptions & {title: string}) {
  new Notification(opts.title, opts)
}
