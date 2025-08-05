document.addEventListener("DOMContentLoaded", function () {
  const commentBox = document.getElementById("comment-box");
  const commentTitle = document.getElementById("comment-title");
  const commentList = document.getElementById("comment-list");
  const commentInput = document.getElementById("comment-input");
  const commentSubmit = document.getElementById("comment-submit");

  // 외부에서 접근 가능하도록 선언
  window.selectedPlace = null;

  // ✅ 댓글 보기
  window.showComments = function (placeName) {
    window.selectedPlace = placeName;

    // 1️⃣ 댓글 먼저 불러오기
    fetch(`/get_comments?place=${encodeURIComponent(placeName)}`)
      .then(res => res.json())
      .then(data => {
        commentTitle.innerText = `${placeName}에 대한 댓글`;
        commentList.innerHTML = data.map(c => `
          <div class="comment">
            <p><strong>${c.nickname}</strong> (${new Date(new Date(c.timestamp).getTime() + 9 * 60 * 60 * 1000).toLocaleString()})</p>
            <p>${c.content}</p>
            ${c.canDelete ? `<button onclick="deleteComment(${c.id})">삭제</button>` : ''}
            <hr>
          </div>
        `).join("");
        commentInput.value = "";

        // 2️⃣ 별점 초기화 + 평균 별점 다시 불러오기
        if (typeof updateStarUI === "function") updateStarUI(0);
        if (typeof loadAverageRating === "function") loadAverageRating(placeName);

        // 3️⃣ UI 표시 + 스크롤
        commentBox.style.display = "block";
        commentBox.scrollIntoView({ behavior: "smooth" });
      });
  };

  // ✅ 댓글 등록 (로그인 기반)
  commentSubmit.addEventListener("click", () => {
    const content = commentInput.value.trim();
    if (!content || !window.selectedPlace) return;

    fetch("/add_comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place: window.selectedPlace, content })
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "error" && res.message === "로그인이 필요합니다.") {
          alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
          window.location.href = "/login";
          return;
        }

        if (res.status === "success") {
          showComments(window.selectedPlace);
        } else {
          alert(res.message || "댓글 등록 실패");
        }
      })
      .catch(err => {
        alert("서버 오류가 발생했습니다.");
        console.error(err);
      });
  });

  // ✅ 댓글 삭제 (로그인 기반)
  window.deleteComment = function (commentId) {
    fetch("/delete_comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: commentId })
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "error" && res.message === "로그인이 필요합니다.") {
          alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
          window.location.href = "/login";
          return;
        }

        if (res.status === "success") {
          alert("댓글이 삭제되었습니다.");
          showComments(window.selectedPlace);
        } else {
          alert(res.message || "삭제 실패");
        }
      })
      .catch(err => {
        alert("서버 오류가 발생했습니다.");
        console.error(err);
      });
  };
});
