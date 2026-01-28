from flask import Flask, render_template, session, redirect, request, url_for, send_from_directory
from routes.comments import comments_bp        # 댓글 Blueprint
from rating.routes import rating_bp            # 별점 Blueprint
from routes.auth import auth_bp                # 로그인/회원가입 Blueprint
import os

app = Flask(__name__)

# ✅ SECRET_KEY는 코드에 하드코딩하지 말고 환경변수로 받기
# 예) export FLASK_SECRET_KEY="랜덤긴문자열"
secret = os.environ.get("FLASK_SECRET_KEY")
if not secret:
    raise RuntimeError("FLASK_SECRET_KEY 환경변수가 없습니다. (예: export FLASK_SECRET_KEY='...')")

app.secret_key = secret

# Blueprint 등록
app.register_blueprint(comments_bp)
app.register_blueprint(rating_bp)
app.register_blueprint(auth_bp)

# ----- 파비콘: /favicon.ico 요청 처리 (404 방지) -----
@app.route('/favicon.ico')
def favicon():
    img_dir = os.path.join(app.root_path, 'static', 'img')

    # favicon.ico가 있으면 우선 제공, 없으면 1.png를 파비콘으로 반환
    ico_path = os.path.join(img_dir, 'favicon.ico')
    if os.path.exists(ico_path):
        return send_from_directory(img_dir, 'favicon.ico', mimetype='image/x-icon')

    # fallback: 1.png
    return send_from_directory(img_dir, '1.png', mimetype='image/png')

# 로그인 여부 확인
@app.before_request
def require_login():
    # favicon 엔드포인트도 예외로 허용
    allow_routes = ('auth.login', 'auth.register', 'static', 'favicon')
    if request.endpoint not in allow_routes and not session.get("user_id"):
        return redirect("/login")

# 루트('/') 요청 시 /login로 리디렉션
@app.route("/")
def index():
    return redirect("/login")

# 로그인 후 대시보드
@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

# 점심추천 기능
@app.route("/lunch")
def lunch():
    print("대시보드 경로:", url_for('dashboard'))
    return render_template("index.html", dashboard_url=url_for('dashboard'))

# 게임 선택 페이지
@app.route("/game")
def game():
    return render_template("game/game.html")

# 2048 게임
@app.route("/game/2048")
def game_2048():
    return render_template("game/2048.html")

# 총알 피하기 게임
@app.route("/game/gun")
def game_gun():
    return render_template("game/gun.html")

# 반응속도 테스트
@app.route("/game/reaction")
def game_reaction():
    return render_template("game/reaction.html")

# 1분 타자 연습
@app.route("/game/typing")
def game_typing():
    return render_template("game/typing.html")

# 상식 퀴즈
@app.route("/game/quiz")
def game_quiz():
    return render_template("game/knowledge.html")

# 눈 휴식 20-20-20
@app.route("/wellness/eyes")
def eye_exercise():
    return render_template("game/eye_exercise.html")

# 3분 데스크 스트레칭
@app.route("/wellness/stretch")
def stretch_desk():
    return render_template("game/stretch_desk.html")

# 1분 박스 브리딩
@app.route("/wellness/breathe")
def breathe_box():
    return render_template("game/breathe_box.html")

# 오목
@app.route("/game/omok")
def game_omok():
    return render_template("game/omok.html")


# 서버 실행
if __name__ == "__main__":
    # debug=True면 에러 페이지/리로더 때문에 운영에서 위험할 수 있음.
    # 개발용이면 OK
    app.run(host="0.0.0.0", port=5000, debug=True)
