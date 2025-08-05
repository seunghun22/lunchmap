from flask import Flask, render_template, session, redirect, request
from routes.comments import comments_bp         # ✅ 댓글 Blueprint
from rating.routes import rating_bp             # ✅ 별점 Blueprint (이 줄 추가!)
from routes.auth import auth_bp
app = Flask(__name__)
app.secret_key = "nhd"

# ✅ Blueprint 등록
app.register_blueprint(comments_bp)
app.register_blueprint(rating_bp)               # ✅ 이 줄 추가!
app.register_blueprint(auth_bp)

@app.before_request
def require_login():
    if request.endpoint not in ('auth.login', 'auth.register', 'static') and not session.get("user_id"):
        return redirect("/login")

# ✅ 메인 페이지 라우트
@app.route("/")
def index():
    return render_template("index.html")

# ✅ 서버 실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
