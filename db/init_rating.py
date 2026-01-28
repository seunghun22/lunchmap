import sqlite3

conn = sqlite3.connect("db/rating.db")
c = conn.cursor()

# 테이블 생성 (정상 버전)
c.execute("""
CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    place TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (place, user_id, date)
)
""")

conn.commit()
conn.close()
print("별점 DB 초기화 완료")
