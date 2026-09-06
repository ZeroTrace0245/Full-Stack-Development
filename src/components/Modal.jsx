import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

export default function Modal({ isOpen, onClose, title, children, compact = false, solid = false }) {
  const dialog = useRef(null)
  const titleId = useId()
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current.showModal()
    return () => { document.body.style.overflow = overflow; previous?.focus() }
  }, [isOpen])
  if (!isOpen) return null
  return createPortal(<dialog ref={dialog} className={`${styles.modal} ${compact ? styles.compact : ''} ${solid ? styles.solid : ''}`} aria-labelledby={titleId} onCancel={event=>{event.preventDefault();close.current()}} onClick={event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close.current()}}}>
    <header className={styles.header}><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog">×</button></header>
    <div className={styles.content}>{children}</div>
  </dialog>,document.body)
}
