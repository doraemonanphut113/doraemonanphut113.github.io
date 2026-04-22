// Đoạn này nằm trong Navbar menu, giúp kíc hoạt nút menu trên điện thoại
document.addEventListener('DOMContentLoaded', () => {
  // Tìm tất cả các nút bấm menu có class là navbar-burger
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Thêm sự kiện click cho từng nút
  $navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {

      // Tìm menu tương ứng với nút bấm đó
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Bật hoặc tắt class "is-active" (bật hiện ra hoặc tắt hiện ra)
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');
    });
  });
});