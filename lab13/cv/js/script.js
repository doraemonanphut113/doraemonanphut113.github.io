// 1. Hàm xử lý việc bật tắt giao diện chế độ tối, sáng
function toggleDarkMode() {
	const body = document.body;
	const toggleBtn = document.querySelector(".toggle-dark");
	
	// Bật hoặc tắt class dark trên thẻ body
	body.classList.toggle("dark");
	
	// Đổi icon của nút dựa trên trạng thái (có class dark hay không)
	toggleBtn.textContent = body.classList.contains("dark") ? "☀️" : "🌙";
	
	// Lưu lại trạng thái vào bộ nhớ trình duyệt để ghi nhứo cho lần sau
	localStorage.setItem("dark-mode", body.classList.contains("dark"));
}

// 2. Sự kiện chạy ngay sau khi toàn bộ HTML được tải xong
window.addEventListener("DOMContentLoaded", () => {
	// Kiểm tra xem trước đó có bật chế độ tối hay không?
	if (localStorage.getItem("dark-mode") === "true") {
		document.body.classList.add("dark");
		document.querySelector(".toggle-dark").textContent = "☀️";
	}
	
	// Lắng nghe sự kiện click trên nút chuyển đổi chế độ để gọi hàm toggleDarkMode
	document.querySelector(".toggle-dark").addEventListener("click", toggleDarkMode);
	
	// Kích hoạt hàm cài đặt hiệu ứng cuộn trang
	setupScrollAnimations();
});

// 3. Hàm xử lý giao diện CV ra file PDF
function exportPDF() {
	// Lấy phần tử HTML chứa nội dung cần xuất (bỏ qua các nút nằm ngoài div này)
	const element = document.getElementById("pdf-content");
	
	// Tùy chỉnh các thông số đề xuất PDF
	const opt = {
		margin : 0.5,
		filename: 'cv-nguyenvana.pdf',
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: {
			scale: 2, // Tăng độ phân giải của canvas
			useCORS: true // Cho phép tải các tài nguyên từ tên miền khác (nếu có)
		},
		jsPDF: { unit: 'in', format:'a4', orientation: 'portrait' } // Kích thước và chiều của giấy PDF (A4, Dọc)
	};
	
	// Gọi thư viện html2pdf để tiến hành xuất file
	html2pdf().set(opt).from(element).save();
}

// 4. Hàm thiết lập hiệu ứng hiển thị (fade in) khi cuộn chuột tới các mục
function setupScrollAnimations() {
	// Lấy tất cả các phần tử có class "card"
	const cards = document.querySelectorAll(".card");
	
	// Sử dụng IntersectionObserver để theo dõi khi nào các phần tử lọt vào tầm nhìn của người dùng
	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			// Nếu phần tử đang hiển thị trên màn hình
			if (entry.isIntersecting) {
				// Thêm class "visible" để CSS kích hoạt hiệu ứng mượt màn
				entry.target.classList.add("visible");
			}
		});
	}, {
		threshold: 0.1 // Cài đặt ngưỡng: Khi 10% phần tử xuất hiện thì kích hoạt
	});
	
	// Bắt đầu quan sát từng thẻ card
	cards.forEach(card => observer.observe(card));
}