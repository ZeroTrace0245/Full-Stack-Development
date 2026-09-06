import { useLayoutEffect, useRef } from 'react'
import styles from './TaskForm.module.css'

// Persist a small formatting vocabulary, never arbitrary pasted HTML.
function cleanHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const copy = node => {
    if (node.nodeType === 3) return document.createTextNode(node.textContent)
    if (node.nodeType !== 1 || ['SCRIPT', 'STYLE', 'IFRAME'].includes(node.tagName)) return document.createTextNode('')
    const target = ['B', 'STRONG', 'I', 'EM', 'UL', 'OL', 'LI', 'P', 'DIV', 'BR'].includes(node.tagName) ? document.createElement(node.tagName) : document.createDocumentFragment()
    node.childNodes.forEach(child => target.appendChild(copy(child)))
    return target
  }
  const container = document.createElement('div')
  doc.body.childNodes.forEach(node => container.appendChild(copy(node)))
  return container.innerHTML
}

export default function TaskDescription({ initialHtml, initialText, onChange, disabled }) {
  const editor = useRef(null)
  useLayoutEffect(() => {
    if (initialHtml) editor.current.innerHTML = cleanHtml(initialHtml)
    else editor.current.textContent = initialText || ''
  }, [initialHtml, initialText])
  const publish = () => onChange(editor.current.innerText, cleanHtml(editor.current.innerHTML))
  const insert = node => {
    const selection = window.getSelection()
    if (!selection.rangeCount || !editor.current.contains(selection.anchorNode)) { editor.current.focus(); return }
    const range = selection.getRangeAt(0)
    if (!editor.current.contains(range.commonAncestorContainer)) return
    if (node.nodeType === 3) range.deleteContents()
    else if (!range.collapsed) node.appendChild(range.extractContents())
    else node.textContent = node.tagName === 'UL' ? '' : 'text'
    if (node.tagName === 'UL') { const li = document.createElement('li'); while (node.firstChild) li.appendChild(node.firstChild); if (!li.textContent) li.textContent = 'List item'; node.appendChild(li) }
    range.insertNode(node)
    range.selectNodeContents(node)
    selection.removeAllRanges(); selection.addRange(range)
    publish()
  }
  return <div className={styles.editor}>
    <div className={styles.formatTools} role="toolbar" aria-label="Description formatting">{[['strong', 'Bold'], ['em', 'Italic'], ['ul', 'Bullet list']].map(([tag,label]) => <button type="button" key={tag} onMouseDown={event=>event.preventDefault()} onClick={()=>insert(document.createElement(tag))}>{label}</button>)}</div>
    <div ref={editor} contentEditable={!disabled} suppressContentEditableWarning role="textbox" aria-disabled={disabled} aria-multiline="true" aria-label="Description" className={styles.richText} onInput={publish} onPaste={event=>{event.preventDefault();insert(document.createTextNode(event.clipboardData.getData('text/plain')))}}/>
  </div>
}
