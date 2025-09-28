import React, { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");

  // 처음 렌더링 시 목록 불러오기
  useEffect(() => {
    fetch("/api/todos")
      .then(res => res.json())
      .then(data => setTodos(data));
  }, []);

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


 return (
    <div>
      <h1>할 일 목록</h1>

      {/* 입력창 + 추가 버튼 */}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="할 일을 입력하세요"
      />
      <button onClick={addTodo}>추가</button>

      {/* 목록 + 삭제 버튼 */}
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.task}
            <button onClick={() => deleteTodo(todo.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}


export default App;