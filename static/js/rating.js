document.addEventListener("DOMContentLoaded", function () {
  const ratingStars = document.getElementById("rating-stars");
  const ratingSubmit = document.getElementById("rating-submit");
  const averageRating = document.getElementById("average-rating");

  // 외부에서 접근 가능하도록 window로 등록
  window.selectedRating = 0;

  // ⭐ 별 클릭 이벤트
  ratingStars.addEventListener("click", function (e) {
    if (e.target.tagName === "SPAN") {
      window.selectedRating = parseInt(e.target.dataset.value);
      updateStarUI(window.selectedRating);
    }
  });

  // ⭐ UI 업데이트 함수
  window.updateStarUI = function (rating) {
    const stars = ratingStars.querySelectorAll("span");
    stars.forEach((star, index) => {
      star.textContent = index < rating ? "★" : "☆";
    });
  };

  // ⭐ 평균 별점 불러오기 함수
  window.loadAverageRating = function (placeName) {
    averageRating.innerText = "⭐ 평균 별점 불러오는 중...";
    fetch(`/get_rating?place=${encodeURIComponent(placeName)}`)
      .then(res => res.json())
      .then(data => {
        averageRating.innerText = data.average
          ? `⭐ 평균 별점: ${data.average.toFixed(1)} / 5`
          : "⭐ 평균 별점: - / 5";
      });
  };

  // ⭐ 별점 등록 버튼
  ratingSubmit.addEventListener("click", () => {
    if (!window.selectedPlace || window.selectedRating === 0) {
      alert("별점을 선택해주세요!");
      return;
    }

    fetch("/add_rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place: window.selectedPlace, rating: window.selectedRating })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "error" && data.message === "로그인이 필요합니다.") {
          alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
          window.location.href = "/login";
          return;
        }

        if (data.status === "success") {
          loadAverageRating(window.selectedPlace);
          alert("별점이 등록되었습니다!");
        } else {
          alert(data.message || "별점 등록에 실패했습니다.");
        }
      })
      .catch(err => {
        alert("서버 오류가 발생했습니다.");
        console.error(err);
      });
  });

  // 👉 외부에서 직접 호출할 때 사용할 함수
  window.showRating = function (placeName) {
    window.selectedPlace = placeName;
    window.selectedRating = 0;
    updateStarUI(0);
    loadAverageRating(placeName);

    const commentBox = document.getElementById("comment-box");
    commentBox.style.display = "block";
    commentBox.scrollIntoView({ behavior: "smooth" });
  };
});
