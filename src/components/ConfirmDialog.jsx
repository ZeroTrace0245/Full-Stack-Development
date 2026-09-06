import { useRef, useState } from 'react'
import Modal from './Modal'
import styles from './ConfirmDialog.module.css'

function Confirmation({ title, message, taskName, confirmText, cancelText, onConfirm, onCancel, isDangerous, itemLabel = 'task' }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const cancel = () => { if (!pending.current) onCancel() }
  const confirm = async () => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    try { await onConfirm() }
    catch (err) { setError(err.error || err.message || 'Could not complete this action. Please try again.') }
    finally { pending.current = false; setBusy(false) }
  }
  return <Modal isOpen title={title} onClose={cancel} compact>
    <div className={styles.confirmation} aria-busy={busy}>
      <div className={styles.body}>
        <div className={styles.icon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg></div>
        <div className={styles.copy}><h3>{isDangerous ? `Delete this ${itemLabel}?` : 'Confirm your action'}</h3><p>{message}</p></div>
        {taskName && <div className={styles.task}><small>Selected {itemLabel}</small><strong>{taskName}</strong></div>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
      <footer className={styles.actions}>
        <span>{isDangerous ? 'This action cannot be undone.' : 'Review your selection before continuing.'}</span>
        <div><button autoFocus type="button" disabled={busy} onClick={cancel}>{cancelText}</button><button type="button" disabled={busy} className={isDangerous ? styles.danger : styles.primary} onClick={confirm}>{busy ? (isDangerous ? 'Deleting…' : 'Working…') : confirmText}</button></div>
      </footer>
    </div>
  </Modal>
}
export default function ConfirmDialog({ isOpen, confirmText = 'Confirm', cancelText = 'Cancel', ...props }) {
  return isOpen ? <Confirmation {...props} confirmText={confirmText} cancelText={cancelText}/> : null
}
