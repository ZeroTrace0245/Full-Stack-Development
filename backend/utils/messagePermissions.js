export function canDeleteMessage(message, user) {
  return String(message.sender?.id || message.sender?._id || message.sender) === String(user.userId)
    || (message.kind === 'team' && user.role === 'Admin')
}
