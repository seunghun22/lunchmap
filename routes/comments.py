# routes/comments.py

from flask import Blueprint, request, jsonify, session
import sqlite3
from datetime import datetime

comments_bp = Blueprint("comments", __name__)

DB_PATH = "db/comments.db"

# 댓글 조회
@comments_bp.route("/get_comments", methods=["GET"])
def get_comments():
    place = request.args.get("place")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, content, nickname, timestamp FROM comments WHERE place = ? ORDER BY timestamp DESC", (place,))
    rows = c.fetchall()
    conn.close()

    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "content": row[1],
            "nickname": row[2],
            "timestamp": row[3],
            "canDelete": session.get("user_id") == row[2]
        })

    return jsonify(result)


# 댓글 등록 (로그인 기반)
@comments_bp.route("/add_comment", methods=["POST"])
def add_comment():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "로그인이 필요합니다."}), 401

    data = request.get_json()
    place = data.get("place")
    content = data.get("content")
    nickname = session["user_id"]

    if not place or not content:
        return jsonify({"status": "error", "message": "모든 필드를 입력해주세요."}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO comments (place, content, nickname, timestamp) VALUES (?, ?, ?, ?)",
        (place, content, nickname, datetime.utcnow())
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


# 댓글 삭제 (작성자 본인만 가능)
@comments_bp.route("/delete_comment", methods=["POST"])
def delete_comment():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "로그인이 필요합니다."}), 401

    data = request.get_json()
    comment_id = data.get("id")
    user_id = session["user_id"]

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT nickname FROM comments WHERE id = ?", (comment_id,))
    row = c.fetchone()

    if row is None:
        conn.close()
        return jsonify({"status": "error", "message": "댓글을 찾을 수 없습니다."}), 404

    if row[0] != user_id:
        conn.close()
        return jsonify({"status": "error", "message": "삭제 권한이 없습니다."}), 403

    c.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
    conn.commit()
    conn.close()

    return jsonify({"status": "success"})
