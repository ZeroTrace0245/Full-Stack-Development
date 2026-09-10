import { useEffect } from 'react'
import socketService from '../services/socketService'

export function useMessageDeletion(onDelete) {
  useEffect(() => {
    const local = event => onDelete(event.detail.id)
    const remote = event => onDelete(event.id)
    window.addEventListener('novasync:message-deleted', local)
    socketService.on('message:deleted', remote)
    return () => { window.removeEventListener('novasync:message-deleted', local); socketService.off('message:deleted', remote) }
  }, [onDelete])
}
