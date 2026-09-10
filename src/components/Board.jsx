import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import BoardTools from './BoardTools'
import { matchesQuickFilter } from '../utils/taskTools'
import BoardTimeline from './BoardTimeline'
import Column from './Column'; import TaskCard from './TaskCard'; import { useBoard } from '../context/BoardContext'; import { useAuth } from '../context/AuthContext'; import styles from './Board.module.css'
import { usePreference, readPreference, writePreference } from '../utils/preferences'
const isDone = title => /done|complete|deployed|production/i.test(title)
const scoreTask = task => ({ High:50, Medium:30, Low:10 }[task.priority]||20)+(task.dueDate?Math.max(0,30-Math.ceil((new Date(task.dueDate)-new Date())/86400000)*3):0)+(task.relationship==='blocks'?20:0)
export default function Board({ onCreateTask, onDeleteTask, onEditTask }) {
 const { board, handleMoveTask }=useBoard(), { user }=useAuth(); const [activeTask,setActiveTask]=useState(null),[query,setQuery]=usePreference(`board-query-${user?.id}`, ''),[priority,setPriority]=usePreference(`board-priority-${user?.id}`, 'All'),[assignee,setAssignee]=usePreference(`board-assignee-${user?.id}`, 'All'),[focusOpen,setFocusOpen]=useState(false),[collapsed,setCollapsed]=usePreference(`board-collapsed-${user?.id}`, []),[view,setView]=useState(() => sessionStorage.getItem('novasync-board-view') === 'timeline' ? 'timeline' : 'kanban')
 const [quick, setQuick] = usePreference(`board-quick-${user?.id}`, 'all')
 const searchRef = useRef(null), boardRef = useRef(null)
 const [sort, setSort] = usePreference(`board-sort-${user?.id}`, 'manual')
 useEffect(() => {
   const key = `board-scroll-${user?.id}`
   const root = boardRef.current
   const saved = readPreference(key, {})
   const frame = requestAnimationFrame(() => {
     window.scrollTo(0, saved.window || 0)
     root?.querySelectorAll('[data-scroll-key]').forEach(el => { el.scrollTop = saved[el.dataset.scrollKey] || 0 })
   })
   const remember = () => {
     const positions = { window: window.scrollY }
     root?.querySelectorAll('[data-scroll-key]').forEach(el => { positions[el.dataset.scrollKey] = el.scrollTop })
     writePreference(key, positions)
   }
   const shortcut = event => {
     if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !document.querySelector('dialog[open]') && !event.target.closest('input,textarea,select,[contenteditable="true"]')) {
       event.preventDefault(); searchRef.current?.focus()
     }
   }
   window.addEventListener('scroll', remember, true)
   document.addEventListener('keydown', shortcut)
   return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', remember, true); document.removeEventListener('keydown', shortcut) }
 }, [user?.id])
 const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates})); const allTasks=board.columns.flatMap(column=>column.tasks.map(task=>({...task,columnTitle:column.title}))); const assignees=[...new Set(allTasks.map(t=>t.assignee).filter(Boolean))]
 const focusTasks=useMemo(()=>allTasks.filter(t=>!isDone(t.columnTitle)&&(!t.assignee||t.assignee===user?.username)).sort((a,b)=>scoreTask(b)-scoreTask(a)).slice(0,3),[allTasks,user?.username]); const visibleColumns=board.columns.map(column=>({...column,tasks:column.tasks.filter(task=>(!query||`${task.title} ${task.description} ${task.assignee || ''} ${task.id} ${(task.labels||[]).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()))&&(priority==='All'||task.priority===priority)&&(assignee==='All'||task.assignee===assignee)&&matchesQuickFilter(task,quick,user,isDone(column.title))).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):sort==='priority'?({High:0,Medium:1,Low:2}[a.priority]??3)-({High:0,Medium:1,Low:2}[b.priority]??3):sort==='due'?(a.dueDate||'9999').localeCompare(b.dueDate||'9999'):0)}))
 const moveAcross=({active,over})=>{if(!over||active.id===over.id||active.data.current?.type!=='Task')return;const sourceId=active.data.current.columnId,destId=over.data.current?.type==='Task'?over.data.current.columnId:over.data.current?.type==='Column'?over.id:null;if(!destId||sourceId===destId)return;const source=board.columns.find(c=>c.id===sourceId),dest=board.columns.find(c=>c.id===destId);handleMoveTask(active.id,sourceId,destId,source.tasks.findIndex(t=>t.id===active.id),over.data.current?.type==='Task'?dest.tasks.findIndex(t=>t.id===over.id):dest.tasks.length,user?.username)}
 const end=({active,over})=>{setActiveTask(null);if(!over||active.id===over.id||active.data.current?.type!=='Task'||over.data.current?.type!=='Task')return;const sourceId=active.data.current.columnId,destId=over.data.current.columnId;if(sourceId===destId){const col=board.columns.find(c=>c.id===sourceId);handleMoveTask(active.id,sourceId,destId,col.tasks.findIndex(t=>t.id===active.id),col.tasks.findIndex(t=>t.id===over.id),user?.username)}}
 return <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={({active})=>active.data.current?.type==='Task'&&setActiveTask(active.data.current.task)} onDragOver={moveAcross} onDragEnd={end} onDragCancel={()=>setActiveTask(null)}><div ref={boardRef} className={styles.board}>
  <div className={styles.boardHeader}><div><span className={styles.eyebrow}>SPRINT WORKSPACE</span><h1>{board.title}</h1><p>{allTasks.length} tasks · {allTasks.filter(t=>isDone(t.columnTitle)).length} completed</p></div><div className={styles.headerActions}><div className={styles.viewSwitcher} role="group" aria-label="Board view"><button type="button" aria-pressed={view==='kanban'} onClick={()=>{setView('kanban');sessionStorage.setItem('novasync-board-view','kanban')}}>Kanban</button><button type="button" aria-pressed={view==='timeline'} onClick={()=>{setView('timeline');sessionStorage.setItem('novasync-board-view','timeline')}}>Timeline</button></div><button aria-pressed={focusOpen} className={styles.focusBtn} onClick={()=>setFocusOpen(!focusOpen)}>◎ Focus mode</button><button className={styles.primaryBtn} onClick={()=>onCreateTask(board.columns[0])}>＋ New task</button></div></div>
  <div className={styles.toolbar}><label className={styles.search}>⌕<input ref={searchRef} type="search" aria-keyshortcuts="/" aria-label="Search tasks and labels" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks, people, labels… (/)" />{query&&<button type="button" aria-label="Clear search" onClick={()=>{setQuery('');searchRef.current?.focus()}}>×</button>}</label><select aria-label="Filter by priority" value={priority} onChange={e=>setPriority(e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select><select aria-label="Filter by assignee" value={assignee} onChange={e=>setAssignee(e.target.value)}><option>All</option>{assignees.map(name=><option key={name}>{name}</option>)}</select><select aria-label="Sort tasks" value={sort} onChange={e=>setSort(e.target.value)}><option value="manual">Board order</option><option value="title">Title</option><option value="priority">Priority</option><option value="due">Due date</option></select><button onClick={()=>{setQuery('');setPriority('All');setAssignee('All');setQuick('all')}}>Clear filters</button></div>
  <div className={styles.toolbar} role="group" aria-label="Quick task filters">{[['all','All tasks'],['mine','Assigned to me'],['overdue','Overdue'],['today','Due today']].map(([value,label])=><button key={value} aria-pressed={quick===value} onClick={()=>setQuick(value)}>{label}</button>)}</div>
  <BoardTools visibleTasks={visibleColumns.flatMap(column=>column.tasks)}/>
  <p role="status">{visibleColumns.reduce((sum,column)=>sum+column.tasks.length,0)} of {allTasks.length} tasks shown{visibleColumns.every(column=>!column.tasks.length)&&allTasks.length>0?' — No matches. Try another search or clear the filters.':''}</p>
  {focusOpen&&<section className={styles.focusPanel}><div><span>PERSONAL FOCUS</span><h2>Your next best move</h2><p>Ranked by urgency, priority and blockers.</p></div><div className={styles.focusList}>{focusTasks.length?focusTasks.map((task,index)=><button key={task.id} onClick={()=>onEditTask(task,board.columns.find(c=>c.id===task.columnId))}><b>{index+1}</b><span><strong>{task.title}</strong><small>{task.priority} priority · {task.estimate||0}h</small></span><i>{scoreTask(task)}</i></button>):<p>You’re all caught up.</p>}</div></section>}
  {view==='timeline' ? <BoardTimeline columns={visibleColumns} user={user} onEditTask={onEditTask}/> : <div className={styles.columns}>{visibleColumns.map(col=><Column filtered={Boolean(query || priority!=='All' || assignee!=='All')} key={col.id} column={col} collapsed={collapsed.includes(col.id)} onToggle={()=>setCollapsed(items=>items.includes(col.id)?items.filter(id=>id!==col.id):[...items,col.id])} onCreateTask={onCreateTask} onDeleteTask={onDeleteTask} onEditTask={onEditTask}/>)}</div>}
 </div><DragOverlay>{activeTask?<TaskCard task={activeTask}/>:null}</DragOverlay></DndContext>
}
