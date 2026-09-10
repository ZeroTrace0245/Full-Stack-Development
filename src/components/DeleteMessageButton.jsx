import { useState } from 'react'
import apiClient from '../api/client'
import ConfirmDialog from './ConfirmDialog'

export default function DeleteMessageButton({ message }) {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Delete message">Delete</button>
    <ConfirmDialog isOpen={open} title="Delete message" itemLabel="message" taskName={message.content}
      message="This message will be removed from the conversation for everyone. Saved decision records are kept separately."
      confirmText="Delete message" isDangerous onCancel={() => setOpen(false)} onConfirm={async () => {
        const id = String(message.id || message._id)
        try { await apiClient.deleteMessage(id) } catch (error) { if (error.error !== 'Message not found') throw error }
        setOpen(false)
        window.dispatchEvent(new CustomEvent('novasync:message-deleted', { detail: { id } }))
      }}/>
  </>
}
