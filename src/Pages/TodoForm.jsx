import React from 'react'
import { useState, useContext, useEffect } from 'react'
import { context } from './context/context'
import { v4 as uuidv4 } from 'uuid'
import './TodoForm.css'

const TodoForm = () => {
  const { Todos, setTodos } = useContext(context)
  const [Todo, setTodo] = useState({
    id: "0",
    title: "",
    stime: "",
    date: "",
    etime: "",
    isCompleted: false,
  })

  const isOverlapping = (ExistingTodos, newTodo) => {
    return ExistingTodos.some(t => {
      if (t.date !== newTodo.date) {
        return false;
      }
      const start1 = t.stime;
      const end1 = t.etime;
      const start2 = newTodo.stime;
      const end2 = newTodo.etime;
      return (start1 < end2 && start2 < end1);
    })
  }

  const isTitleOverlap = (ExistingTodos, newTodo) => {
    if (!ExistingTodos) return false;

    return ExistingTodos.some(t =>
      t.date === newTodo.date && t.title === newTodo.title
    );
  };


  const handleChange = (e) => {
    setTodo({ ...Todo, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Object.values(Todo).some(value => value === "") || Todo.title.trim() === "") {
      alert("Fill all fields..")
      return
    }
    if (Todo.stime >= Todo.etime) {
      alert("Start time cannot be greater than or equal to end time.")
      return
    }
    if (isOverlapping(Todos, Todo)) {
      alert("This time overlaps with another task on the same day!");
      return;
    }
    if (isTitleOverlap(Todos, Todo)) {
      alert("This task already exist on same day!");
      return;
    }
    const newTodo = {
      ...Todo,
      id: uuidv4()
    }
    setTodos([...Todos, newTodo])
    setTodo({
      id: "0",
      title: "",
      date: "",
      stime: "",
      etime: "",
      isCompleted: false
    })
  }

  return (
    <div className='todo-form'>
      <div className='content-box'>
        <form action="" onSubmit={handleSubmit}>
          <h2>Add Task</h2>
          <div className='input-field'>
            <span>Label</span>
            <input type="text" name='title' value={Todo.title} onChange={handleChange} />
          </div>
          <div className='input-field'>
            <span>Date</span>
            <input type="date" name='date' value={Todo.date} onChange={handleChange} />
          </div>
          <div className='time-box'>
            <div className='input-field'>
              <span>Start</span>
              <input type="time" name='stime' value={Todo.stime} onChange={handleChange} />
            </div>
            <div className='input-field'>
              <span>End</span>
              <input type="time" name='etime' value={Todo.etime} onChange={handleChange} />
            </div>
          </div>

          <input type="submit" value="Create task" id='submitbtn' disabled={Todo.title.length < 3} />
        </form>
        <div className='side-bar'></div>
      </div>
    </div>
  )
}

export default TodoForm
