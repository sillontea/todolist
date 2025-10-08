from flask import Flask, jsonify, make_response, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

## 임시 데이터 저장소
# todos = []
# # 조회
# @app.route("/api/todos", methods=["GET"])
# def get_todos():
#     response = make_response(jsonify(todos))
#     response.headers["Cache-Control"] = "no-store"
#     return response

# # 추가 
# @app.route("/api/todos", methods=["POST"])
# def add_todo():
#     data = request.get_json()  # JSON 요청 파싱
#     new_todo = {
#         "id": len(todos) + 1,
#         "task": data["task"]
#     }
#     todos.append(new_todo)
#     return jsonify(new_todo), 201  # 새 todo 객체 반환

# # 삭제
# @app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
# def delete_todo(todo_id):
#     global todos
#     todos = [t for t in todos if t["id"] != todo_id]
#     return jsonify({"message": "Todo deleted!"}), 200

import os
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todos.db"
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'todos.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# DB 모델 정의
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    date = db.Column(db.String(10), nullable=False)  # "YYYY-MM-DD" 형식

    def to_dict(self):
        return {"id": self.id, "task": self.task, "completed": self.completed, "date": self.date}

@app.route("/api/todos", methods=["GET"])
def get_todos():
    date = request.args.get("date")
    if date:
        todos = Todo.query.filter_by(date=date).all()
    else:
        todos = Todo.query.all()
    return jsonify([t.to_dict() for t in todos])


@app.route("/api/todos/progress", methods=["GET"])
def progress_todo():
    date = request.args.get("date")
    todos_n = Todo.query.filter_by(date=date).count() if date else 0
    completed_n = Todo.query.filter_by(date=date, completed=True).count() if date else 0
    progress = round(completed_n / todos_n * 100, 1) if todos_n > 0 else 0
    return jsonify({"progress": progress})


@app.route("/api/todos", methods=["POST"])
def add_todo():
    data = request.get_json()
    new_todo = Todo(
        task=data["task"],
        completed=data.get("completed", False),
        date=data["date"]  # 클라이언트에서 날짜 정보 받아옴
    )
    db.session.add(new_todo)
    db.session.commit()
    return jsonify(new_todo.to_dict())

@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):

    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return "", 204


@app.route("/api/todos/<int:todo_id>", methods=["PATCH"])
def update_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    data = request.get_json()
    if "completed" in data:
        todo.completed = data["completed"]
    db.session.commit()
    return jsonify(todo.to_dict())


if __name__ == "__main__":
    # DB 초기화(모델 정의 우선되어야 함)
    with app.app_context():
        db.create_all()

    app.run(debug=True)