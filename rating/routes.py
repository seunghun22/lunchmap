# routes/ratings.py
from flask import Blueprint, request, jsonify, session
import sqlite3
import datetime

rating_bp = Blueprint("rating", __name__)
DB_PATH = "db/rating.db"

@rating_bp.route("/add_rating", methods=["POST"])
def add_rating():
    if 'user_id' not in session:
        return jsonify({"status": "error", "message": "로그인이 필요합니다."}), 403

    data = request.get_json()
    place = data.get("place")
    rating = data.get("rating")
    user_id = session['user_id']
    today = datetime.date.today().isoformat()  # YYYY-MM-DD

    if not place or not rating:
        return jsonify({"status": "error", "message": "잘못된 요청"}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("""
            INSERT INTO ratings (place, rating, user_id, date)
            VALUES (?, ?, ?, ?)
        """, (place, rating, user_id, today))
        conn.commit()
        return jsonify({"status": "success"})
    except sqlite3.IntegrityError:
        return jsonify({"status": "error", "message": "오늘은 이미 별점을 주셨습니다."})
    finally:
        conn.close()

@rating_bp.route("/get_rating", methods=["GET"])
def get_rating():
    place = request.args.get("place")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT AVG(rating) FROM ratings WHERE place = ?", (place,))
    row = c.fetchone()
    conn.close()

    average = round(row[0], 1) if row[0] is not None else None
    return jsonify({"average": average})