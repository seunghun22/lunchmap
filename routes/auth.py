from flask import Blueprint, request, session, redirect, url_for, render_template
import sqlite3

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")

    username = request.form.get("username")
    password = request.form.get("password")

    conn = sqlite3.connect("db/comments.db")
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password))
    user = c.fetchone()
    conn.close()

    if user:
        session["user_id"] = username
        return redirect(url_for("dashboard"))  # 로그인 후 대시보드로 이동
    else:
        return "로그인 실패: 아이디 또는 비밀번호가 틀렸습니다.", 401

@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))  # 보통 로그아웃 후 로그인 페이지로

@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        return render_template("register.html")

    username = request.form.get("username")
    password = request.form.get("password")

    conn = sqlite3.connect("db/comments.db")
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return "이미 존재하는 사용자입니다.", 400

    conn.close()
    return redirect(url_for("auth.login"))
