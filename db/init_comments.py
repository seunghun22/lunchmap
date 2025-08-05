# db/init_db.py

import sqlite3

conn = sqlite3.connect("db/comments.db")
c = conn.cursor()

# ✅ 댓글 테이블만
c.execute("""
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    place TEXT NOT NULL,
    content TEXT NOT NULL,
    nickname TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("✅ 댓글 DB 초기화 완료")
