import { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { context } from "./context/context";
import { MdDeleteOutline } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { CiCalendar } from "react-icons/ci";
import { TbProgressCheck } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import axios from "../utils/api";

import "./MainPage.css";
import ProgressTracker from "../Components/ProgressTracker";
import Calendarrr from "../Components/Calendarrr";
import { useNavigate } from "react-router-dom";



const MainPage = () => {
  const { selected, setSelected, Todos, setTodos } = useContext(context);

  const [showCalendarDrawer, setShowCalendarDrawer] = useState(false);
  const [showTrackerDrawer, setShowTrackerDrawer] = useState(false);
  const [EditId, setEditId] = useState(null);
  const [progress, setprogress] = useState(0);
  const [showCompleted, setshowCompleted] = useState(false);

  const [Updated, setUpdated] = useState({
    title: "",
    stime: "",
    etime: "",
  });


  /* ---------------- UTILS ---------------- */

  const formatDate = (d) => {
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  }

  const getActiveDate = () => {
    return selected ? formatDate(selected) : formatDate(new Date());

  }

  const isSameDay = (t) => {
    return t.date === getActiveDate();
  }

  const getDayName = (d) => {
    return ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"][new Date(d).getDay()];
  }

  const getMonthName = (d) => {
    return [
      "Jan", "Feb", "March", "April", "May", "June",
      "July", "August", "Sep", "Oct", "Nov", "Dec",
    ][new Date(d).getMonth()];
  }

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    calculateProgress(Todos);
  }, [Todos, selected]);

  useEffect(() => {
    document.body.classList.toggle(
      "drawer-open",
      showCalendarDrawer || showTrackerDrawer
    );
  }, [showCalendarDrawer, showTrackerDrawer]);

  useEffect(() => {
    const date = getActiveDate();

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      return;
    }

    axios.get(`/todos?date=${date}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(res => {
      const fixed = res.data.map(t => ({
        ...t,
        id: t._id
      }));
      setTodos(fixed);
    });
  }, [selected]);

  /* ---------------- LOGIC ---------------- */

  const calculateProgress = (list) => {
    const todays = list.filter(isSameDay);
    const completed = todays.filter((t) => t.isCompleted).length;

    setprogress(todays.length ? (completed / todays.length) * 100 : 0);
  };


  const handleDelete = async (id) => {
    const accessToken = localStorage.getItem("accessToken");

    await axios.delete(`/todos/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    setTodos(Todos.filter((t) => t.id !== id));
  };


  const saveUpdate = async (id) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await axios.put(`/todos/${id}`, Updated, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const updatedTodos = Todos.map(t =>
        t.id === id ? { ...res.data, id: res.data._id } : t
      );

      setTodos(updatedTodos);
      setEditId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating task");
    }
  };


  const handleCheckbox = async (e) => {
    const id = e.target.name;

    const todo = Todos.find(t => t.id === id);

    const accessToken = localStorage.getItem("accessToken");
    const res = await axios.patch(
      `/todos/${id}`,
      { isCompleted: !todo.isCompleted },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const updatedTodos = Todos.map(t =>
      t.id === id ? { ...res.data, id: res.data._id } : t
    );

    setTodos(updatedTodos);
  };

  const handleShow = () => setshowCompleted(!showCompleted);

  const fullDayDet = () => {
    const d = selected || new Date();

    return (
      <div className="full-day">
        <div className="day-name">{getDayName(d)}</div>
        <div className="date-text">
          {d.getFullYear()},{d.getDate()} {getMonthName(d)}
        </div>
      </div>
    );
  };

  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  /* ---------------- FILTERED TODOS ---------------- */

  const todaysTodos = Todos.filter(isSameDay);
  const activeTodos = todaysTodos.filter((t) => !t.isCompleted);
  const completedTodos = todaysTodos.filter((t) => t.isCompleted);

  /* ---------------- UI ---------------- */

  return (
    <>
      <div id="title">
        <div>
          <div id="logo">iTask</div>
          <p id="logo-desc">Manage your todos at one place</p>
        </div>

        <div id="navigations">
          {!accessToken ? (
            <>
              <button id="login-btn" onClick={() => navigate("/login")}>Login</button>
              <button id="register-btn" onClick={() => navigate("/register")}>Register</button>
            </>
          ) : (
            <>
              <button id="profile-btn" onClick={() => navigate("/profile")}>
                <CgProfile />
              </button>
            </>
          )}
        </div>
      </div>

      <div id="content-box">

        {/* Calendar */}
        {showCalendarDrawer ? (
          <div className="overlay" onClick={() => setShowCalendarDrawer(false)}>
            <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
              <Calendarrr />
            </div>
          </div>
        ) : (
          <div id="side-bar">
            <Calendarrr />
          </div>
        )}

        {/* Mobile buttons */}
        <div
          id="mobile-controls"
        >
          <button id="calendar-btn"
            onClick={() => {
              setShowCalendarDrawer(true);
              setShowTrackerDrawer(false);
            }}>
            <CiCalendar color="white" strokeWidth={0.5} size={20} />
          </button>
          <button id="tracker-btn"
            onClick={() => {
              setShowTrackerDrawer(true);
              setShowCalendarDrawer(false);
            }}>
            <TbProgressCheck color="white" strokeWidth={1.5} size={20} />
          </button>
        </div>

        {/* Main */}
        <div id="main-content">

          <div id="main-top">
            <div>{fullDayDet()}</div>
            <NavLink to="/form">
              <button id="add-btn">Add a new Task</button>
            </NavLink>
          </div>

          <div id="main-title">
            <div id="task-title">Tasks</div>
            <div id="showCompletedBox">
              <input
                type="checkbox"
                id="showCompleted"
                onChange={handleShow}
                checked={showCompleted}
              />
              <label htmlFor="showCompleted">Show Completed</label>
            </div>
          </div>

          <div id="all-todos">

            {/* Active Todos */}
            <div id="todo-box">
              {activeTodos.map((t) =>
                EditId === t.id ? (
                  <div id="todos" key={t.id}>
                    <div id="todo-left">
                      <input
                        value={Updated.title}
                        onChange={(e) =>
                          setUpdated({ ...Updated, title: e.target.value })
                        }
                      />
                    </div>

                    <div id="todo-right">
                      <div id="todo-time">
                        <input
                          type="time"
                          value={Updated.stime}
                          onChange={(e) =>
                            setUpdated({ ...Updated, stime: e.target.value })
                          }
                        />
                        <div>-</div>
                        <input
                          type="time"
                          value={Updated.etime}
                          onChange={(e) =>
                            setUpdated({ ...Updated, etime: e.target.value })
                          }
                        />
                      </div>

                      <div className="todo-buttons">
                        <button
                          onClick={() => saveUpdate(t.id)}
                          disabled={
                            Updated.title.length < 3 ||
                            !Updated.stime ||
                            !Updated.etime ||
                            Updated.stime >= Updated.etime
                          }
                        >
                          <FaRegCheckCircle />
                        </button>
                        <button onClick={() => setEditId(null)}>
                          <FaRegCircleXmark />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div id="todos" key={t.id}>
                    <div id="todo-left">
                      <div className="checkbox-wrapper">
                        <div className="round">
                          <input
                            name={t.id}
                            type="checkbox"
                            id={`checkbox-${t.id}`}
                            checked={t.isCompleted}
                            onChange={handleCheckbox}
                          />
                          <label htmlFor={`checkbox-${t.id}`}></label>
                        </div>
                      </div>

                      <div
                        style={{
                          textDecoration: t.isCompleted
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {t.title}
                      </div>
                    </div>

                    <div id="todo-right">
                      <div id="todo-time">
                        {t.stime} - {t.etime}
                      </div>

                      <div className="todo-buttons">
                        <button onClick={() => handleDelete(t.id)}>
                          <MdDeleteOutline />
                        </button>

                        <button
                          onClick={() => {
                            setEditId(t.id);
                            setUpdated(t);
                          }}
                        >
                          <FiEdit3 />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Completed Todos */}
            <div id="todo-box">
              {showCompleted &&
                completedTodos.map((t) => (
                  <div id="todos" key={t.id}>
                    <div id="todo-left">
                      <div className="checkbox-wrapper">
                        <div className="round">
                          <input
                            name={t.id}
                            type="checkbox"
                            id={`checkbox-${t.id}`}
                            checked={t.isCompleted}
                            onChange={handleCheckbox}
                          />
                          <label htmlFor={`checkbox-${t.id}`}></label>
                        </div>
                      </div>

                      <div style={{ textDecoration: "line-through" }}>
                        {t.title}
                      </div>
                    </div>

                    <div id="todo-right">
                      <div id="todo-time">
                        {t.stime} - {t.etime}
                      </div>

                      <div className="todo-buttons">
                        <button onClick={() => handleDelete(t.id)}>
                          <MdDeleteOutline />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>

          {/* Empty */}
          {todaysTodos.length === 0 && (
            <div id="no-todo">
              No task has been scheduled for this day.
            </div>
          )}
        </div>

        {/* Tracker */}
        {showTrackerDrawer ? (
          <div className="overlay"
            onClick={() => setShowTrackerDrawer(false)}>
            <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
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
  );
};

export default MainPage;