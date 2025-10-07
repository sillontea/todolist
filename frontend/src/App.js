import React, { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [date, setDate] = useState(new Date());

  // 날짜를 YYYY-MM-DD 형식으로 표시
  const formatDate = (d) => d.toLocaleDateString();

  // 날짜 이동 함수
  const changeDate = (days) => {
    setDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  // 날짜 변경 시 해당 날짜의 목록 불러오기
  useEffect(() => {
    fetch(`/api/todos?date=${date.toISOString().slice(0,10)}`)
      .then(res => res.json())
      .then(data => setTodos(data));
  }, [date]);

   // 할 일 추가
  const addTodo = () => {
    fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: newTask })
    })
      .then(res => res.json())
      .then(data => {
        setTodos([...todos, data]); // 새 항목 추가
        setNewTask(""); // 입력창 초기화
      });
  };

 // 할 일 삭제
  const deleteTodo = (id) => {
    fetch(`/api/todos/${id}`, {
      method: "DELETE"
    }).then(() => {
      setTodos(todos.filter(todo => todo.id !== id));
    });
  };

  // 완료 상태 토글
  const toggleCompleted = (id, completed) => {
    fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed })
    })
      .then(res => res.json())
      .then(updated => {
        setTodos(todos.map(todo => todo.id === id ? updated : todo));
      });
  };

  return (
    <>
      {/* 입력창 + 추가 버튼 */}
      <div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
        <button onClick={() => changeDate(-1)} style={{ fontSize: "24px", background: "none", border: "none", cursor: "pointer" }}>&#9664;</button>
        <h1 style={{ margin: "0 16px" }}>{formatDate(date)}</h1>
        <button onClick={() => changeDate(1)} style={{ fontSize: "24px", background: "none", border: "none", cursor: "pointer" }}>&#9654;</button>
      </div>

      {/* 입력과 목록 사이 구분선 */}
      <div style={{ margin: "24px 0 24px 0" }}>
        <hr style={{ width: "70%", marginLeft: 0, border: "none", borderTop: "2px solid #ccc" }} />
      </div>

      {/* 목록 영역: 체크박스 + 목록 + 삭제 버튼 */}
      <div>
        <h3>할 일 목록</h3>
                
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="할 일을 입력하세요"
          style={{ marginLeft: "16px", marginRight: "10px" }}
        />
        <button onClick={addTodo} style={{ marginBottom: "10px" }}>추가</button>
        
        <ul style={{ listStyle: "none", paddingLeft: "8px" }}>
          {todos.map(todo => (
            <li key={todo.id} style={{ marginBottom: "8px" }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleCompleted(todo.id, todo.completed)}
                style={{ marginRight: "10px" }}
              />
              <span style={{ textDecoration: todo.completed ? "line-through" : "none", marginRight: "10px" }}>
                {todo.task}
              </span>
              <button onClick={() => deleteTodo(todo.id)}>삭제</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;