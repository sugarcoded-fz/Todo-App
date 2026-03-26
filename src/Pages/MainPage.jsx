import { useContext, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { context } from './context/context'
import { MdDeleteOutline } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { CiCalendar } from "react-icons/ci";
import { TbProgressCheck } from "react-icons/tb";
import './MainPage.css'
import ProgressTracker from '../Components/ProgressTracker';
import Calendarrr from '../Components/Calendarrr';




const MainPage = () => {
  const { selected, setSelected } = useContext(context);
  const { Todos, setTodos } = useContext(context);

  const [showCalendarDrawer, setShowCalendarDrawer] = useState(false);
  const [showTrackerDrawer, setShowTrackerDrawer] = useState(false);

  const [EditId, setEditId] = useState(null)
  const [progress, setprogress] = useState(0)
  const [showCompleted, setshowCompleted] = useState(false)
  const [Updated, setUpdated] = useState({
    title: "",
    stime: "",
    etime: ""
  })

  useEffect(() => {
    calculateProgress(Todos)
  })

  useEffect(() => {
    if (showCalendarDrawer || showTrackerDrawer) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
  }, [showCalendarDrawer, showTrackerDrawer]);





  const getDayName = (d) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    return days[new Date(d).getDay()];
  }

  const getMonthName = (d) => {
    const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "Sep", "Oct", "Nov", "Dec"];
    return months[new Date(d).getMonth()];
  }



  const fullDayDet = () => {
    let d;
    if (selected) {
      d = selected
    }
    else {
      d = new Date()
    }
    const formattedDate = `${d.getFullYear()},${d.getDate()} ${getMonthName(d)}`;
    const dayName = getDayName(d)
    const fullDay = <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem' }}><div style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{dayName}</div><div>{formattedDate}</div></div>
    return fullDay
  }


  const currentdate = () => {
    const current = new Date();
    const formattedDate = `${current.getFullYear()}-${current.getMonth() + 1
      }-${current.getDate()}`;
    return formattedDate;
  }


  const calculateProgress = (list) => {
    const completed = list.filter(t => t.isCompleted && ((selected && selected.toISOString().split("T")[0] === t.date) || (!selected && currentdate() === t.date))).length
    const total = list.filter(t => (selected && selected.toISOString().split("T")[0] === t.date) || (!selected && currentdate() === t.date)).length
    let p;
    if (total !== 0) {
      p = (completed / total) * 100
    }
    else {
      p = 0;
    }
    setprogress(p)
  }


  const handleDelete = (id) => {
    const newTodos = Todos.filter(items => {
      return id !== items.id
    })
    setTodos(newTodos)
  }

  const saveUpdate = (id) => {
    const updated = Todos.map(t =>
      t.id === id ? { ...t, ...Updated } : t
    )
    setTodos(updated)
    setEditId(null)
  }

  const handleCheckbox = (e) => {
    let id = e.target.name
    const updatedTodos = Todos.map(t =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    setTodos(updatedTodos)
    calculateProgress(updatedTodos)
  }

  const handleShow = () => {
    setshowCompleted(!showCompleted)
  }


  return (
    <>

      <div id='title'>
        <div id='logo'>iTask</div>
        <p id='logo-desc'> Manage your todos at one place</p>
      </div>


      <div id='content-box'>

        {showCalendarDrawer ? (
          <div className="overlay" onClick={() => setShowCalendarDrawer(false)}>
            <div className="drawer-content" onClick={e => e.stopPropagation()}>
              <Calendarrr />
            </div>
          </div>
        ) : (
          <div id='side-bar'>
            <Calendarrr />
          </div>
        )}


        <div id="mobile-controls" style={{ display: (showCalendarDrawer || showTrackerDrawer) ? 'none' : 'flex' }}>
          <button id="calendar-btn" onClick={() => setShowCalendarDrawer(true)}><CiCalendar color='white' strokeWidth={0.5} /></button>
          <button id="tracker-btn" onClick={() => setShowTrackerDrawer(true)}><TbProgressCheck color='white' strokeWidth={1.5} /></button>
        </div>

        <div id='main-content'>

          <div id='main-top'>
            <div>{fullDayDet()}</div>
            <NavLink to='/form'>
              <button id='add-btn'>Add a new Task</button>
            </NavLink>
          </div>

          <div id='main-title'>
            <div id='task-title'>Tasks</div>
            <div id='showCompletedBox'>
              <input type="checkbox" name="" id="showCompleted" onChange={handleShow} checked={showCompleted} />
              <label htmlFor="showCompleted">Show Completed</label>
            </div>
          </div>
          <div id='all-todos'>
            <div id='todo-box'>
              {
                Todos.map(t => {

                  return EditId === t.id ? (
                    ((selected && selected.toISOString().split("T")[0] === t.date) || (!selected && currentdate() === t.date)) && <div id='todos' key={t.id}>
                      <div id='todo-left'>
                        <input value={Updated.title} onChange={e => setUpdated({ ...Updated, title: e.target.value })} />
                      </div>
                      <div id='todo-right'>
                        <div id='todo-time'>
                          <input type="time" value={Updated.stime} onChange={e => setUpdated({ ...Updated, stime: e.target.value })} />
                          <div>-</div>
                          <input type="time" value={Updated.etime} onChange={e => setUpdated({ ...Updated, etime: e.target.value })} />
                        </div>
                        <div className='todo-buttons' >
                          <button onClick={() => saveUpdate(t.id)}><FaRegCheckCircle /></button>
                          <button onClick={() => setEditId(null)}><FaRegCircleXmark /></button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ((selected && selected.toISOString().split("T")[0] === t.date) || (!selected && currentdate() === t.date)) && !t.isCompleted && <div id='todos' key={t.id}>
                      <div id='todo-left'>
                        <div className="checkbox-wrapper">
                          <div className="round">
                            <input name={t.id} type="checkbox" id={`checkbox-${t.id}`} checked={t.isCompleted} onChange={handleCheckbox} />
                            <label htmlFor={`checkbox-${t.id}`}></label>
                          </div>
                        </div>
                        <div style={{ textDecoration: t.isCompleted ? "line-through" : "none" }}>{t.title}</div>
                      </div>
                      <div id='todo-right'>
                        <div id='todo-time'>{t.stime} - {t.etime}</div>
                        <div className='todo-buttons'>
                          <button onClick={() => handleDelete(t.id)}><MdDeleteOutline /></button>
                          <button onClick={() => {
                            setEditId(t.id)
                            setUpdated({
                              title: t.title,
                              stime: t.stime,
                              etime: t.etime
                            })
                          }}><FiEdit3 /></button>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            <div id="todo-box">
              {
                Todos.map(t => {
                  return (((selected && selected.toISOString().split("T")[0] === t.date) || (!selected && currentdate() === t.date)) && t.isCompleted && showCompleted && !EditId) && <div id='todos' key={t.id}>
                    <div id='todo-left'>
                      <div className="checkbox-wrapper">
                        <div className="round">
                          <input name={t.id} type="checkbox" id={`checkbox-${t.id}`} checked={t.isCompleted} onChange={handleCheckbox} />
                          <label htmlFor={`checkbox-${t.id}`}></label>
                        </div>
                      </div>
                      <div style={{ textDecoration: "line-through" }}>{t.title}</div>
                    </div>
                    <div id='todo-right'>
                      <div id='todo-time'>{t.stime} - {t.etime}</div>
                      <div className='todo-buttons'>
                        <button onClick={() => handleDelete(t.id)}><MdDeleteOutline /></button>
                      </div>
                    </div>
                  </div>
                })
              }
            </div>

          </div>


          <div className="todo-box">
            {
              Todos.filter(t => ((selected && selected.toISOString().split("T")[0] === t.date) || (!selected && currentdate() === t.date))).length === 0 && <div id='no-todo'>No task has been scheduled for this day.</div>
            }
          </div>


        </div>


        {showTrackerDrawer ? (
          <div className="overlay" onClick={() => setShowTrackerDrawer(false)}>
            <div className="drawer-content" onClick={e => e.stopPropagation()}>
              <ProgressTracker progress={progress} />
            </div>
          </div>
        ) : (
          <div id="tracker">
            <ProgressTracker progress={progress} />
          </div>
        )}
      </div>
    </>
  )
}

export default MainPage
