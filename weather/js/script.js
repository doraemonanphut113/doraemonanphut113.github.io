// Đợi cho đến khi toàn bộ HTML được tải xong mới chạy Javascript
$(document).ready(function() {
	
	// Đối tượng UI dùng để quản lý việc ẩn hiện các thành phần giao diện
	const UI = {
		loading: {
			show: () => $('#loading').show(),
			hide: () => $('#loading').hide()
		},
		error: {
			// Hiển thị lỗi bằng cách gán text và thêm class 'show' để CSS xử lý
			show: (message) => $('#error-message').text(message).addClass('show'),
			hide: () => $('#error-message').removeClass('show')
		},
		weather: {
			show: () => $('#weather-info').show(),
			hide: () => $('#weather-info').hide()
		}
	};
	
	// Đối tượng API cấu hình các đường dẫn và tham số để gọi dữ liệu từ máy chủ
	const API = {
		weather: {
			url: 'https://api.open-meteo.com/v1/forecast',
			params: {
				current: 'temperature_2m,wind_speed_10m',
				hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m'
			}
		},
		geocoding: {
			url: 'https://nominatim.openstreetmap.org/reverse',
			params: {
				format: 'json',
				'accept-language': 'vi'
			}
		}
	};
	
	// Đối tượng chứa các hàm định dạng thời gian chuẩn Việt Nam 
	const formatTime = {
		// Định dạng thời gian hiện tại: giờ, phút, ngày, tháng, năm
		current: (timeString) => new Date(timeString).toLocaleString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		}),
		// Định dạng thời gian cho dự báo (chỉ lấy giờ và phút)
		hourly: (timeString) => new Date(timeString).toLocaleTimeString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit'
		})
	};
	
	// Khởi tạo giao diện mặc định: Ẩn thông tin thời tiết và lỗi
	UI.weather.hide();
	UI.error.hide();
	
	//Kiểm tra xem trình duyệt có hỗ trợ lấy vị trí GPS hay không
	if (!navigator.geolocation) {
        UI.error.show('Trình duyệt của bạn không hỗ trợ Geolocation');
        return; // Dừng thực thi nếu không hỗ trợ
    }

    // Nếu hỗ trợ, bắt đầu hiển thị vòng quay loading và gọi hàm lấy vị trí
    UI.loading.show();
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);

    // Hàm xử lý khi lấy vị trí thành công
    function handleSuccess(position) {
        // Lấy vĩ độ và kinh độ từ object position
        const { latitude, longitude } = position.coords;
        updateCoordinates(latitude, longitude); // Cập nhật tọa độ lên màn hình

        // Sử dụng Promise.all để gọi đồng thời 2 API: lấy thời tiết và lấy địa chỉ
        Promise.all([
            fetchWeatherData(latitude, longitude),
            fetchLocationData(latitude, longitude)
        ]).catch(error => UI.error.show(error.message)) // Nếu có lỗi ở 1 trong 2 API, hiển thị lỗi
          .finally(() => UI.loading.hide()); // Luôn luôn ẩn loading sau khi xong mọi việc (dù lỗi hay thành công)
    }

    // Hàm gọi API lấy dữ liệu thời tiết bằng jQuery AJAX
    function fetchWeatherData(lat, lon) {
        return $.ajax({
            url: API.weather.url,
            // Gộp các tham số mặc định và tọa độ vĩ/kinh vào request
            data: { ...API.weather.params, latitude: lat, longitude: lon },
            success: updateWeatherUI, // Nếu thành công thì gọi hàm cập nhật giao diện
            error: () => { throw new Error('Không thể lấy thông tin thời tiết'); }
        });
    }

    // Hàm gọi API lấy tên địa chỉ (dịch từ tọa độ) bằng jQuery AJAX
    function fetchLocationData(lat, lon) {
        return $.ajax({
            url: API.geocoding.url,
            data: { ...API.geocoding.params, lat, lon },
            // Nếu thành công, gán chuỗi địa chỉ hiển thị vào thẻ có id address-text
            success: data => $('#address-text').text(data.display_name),
            error: () => { throw new Error('Không thể lấy thông tin địa điểm'); }
        });
    }

    // Hàm tổng hợp cập nhật toàn bộ giao diện thời tiết sau khi API trả dữ liệu về
    function updateWeatherUI(weatherData) {
        // Định dạng lại chuỗi thời gian hiện tại
        const currentTime = formatTime.current(weatherData.current.time);
        
        // Tìm vị trí (index) của giờ hiện tại trong mảng dữ liệu hourly để bắt đầu hiển thị dự báo từ giờ đó
        const currentHourIndex = weatherData.hourly.time.indexOf(weatherData.current.time);

        // Cập nhật giao diện khối "thời tiết hiện tại"
        updateCurrentWeather(weatherData, currentTime);
        
        // Cập nhật giao diện khối "dự báo theo giờ"
        updateHourlyForecast(weatherData, currentHourIndex);

        // Hiển thị vùng thông tin thời tiết lên
        UI.weather.show();
    }

    // Hàm hiển thị tọa độ Vĩ độ - Kinh độ lên màn hình
    function updateCoordinates(lat, lon) {
        $('#latitude').text(lat);
        $('#longitude').text(lon);
    }

    // Hàm điền các thông số thời tiết hiện tại vào HTML
    function updateCurrentWeather(data, time) {
        $('#current-time').text(time);
        // Gắn giá trị đi kèm với đơn vị của nó (VD: 32 °C)
        $('#temperature').text(`${data.current.temperature_2m} ${data.current_units.temperature_2m}`);
        $('#wind-speed').text(`${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m}`);
        $('#timezone').text(data.timezone);
        $('#elevation').text(`${data.elevation} m`);
    }

    // Hàm xử lý việc render danh sách dự báo thời tiết trong 24 giờ tiếp theo
    function updateHourlyForecast(data, startIndex) {
        const hourlyList = $('#hourly-list').empty(); // Làm sạch danh sách cũ trước khi thêm mới
        
        // Lấy dữ liệu cho 24 giờ tới (hoặc cho đến hết mảng dữ liệu)
        const endIndex = Math.min(startIndex + 24, data.hourly.time.length);

        // Chạy vòng lặp từ giờ hiện tại cho đến 24 giờ sau
        for (let i = startIndex; i < endIndex; i++) {
            const time = formatTime.hourly(data.hourly.time[i]);
            const temperature = data.hourly.temperature_2m[i];
            const humidity = data.hourly.relative_humidity_2m[i];
            const windSpeed = data.hourly.wind_speed_10m[i];

            // Kiểm tra xem dữ liệu có bị thiếu không (tránh lỗi null/undefined)
            if (temperature !== undefined 
                && humidity !== undefined 
                && windSpeed !== undefined) {
                // Tạo thẻ HTML chứa thông tin thời tiết 1 giờ cụ thể và nhúng vào danh sách
                hourlyList.append(
                    createHourlyWeatherCard(
                        time, temperature, humidity, windSpeed, data.hourly_units
                    )
                );
            }
        }
    }

    // Hàm tạo chuỗi HTML cho 1 dòng dự báo thời tiết (gồm thời gian, nhiệt độ, độ ẩm, tốc độ gió)
    function createHourlyWeatherCard(time, temp, humidity, wind, units) {
        return `
            <div class="hourly-item">
                <div class="time">${time}</div>
                <div class="temp">${temp}${units.temperature_2m}</div>
                <div class="humidity">${humidity}${units.relative_humidity_2m}</div>
                <div class="wind">${wind}${units.wind_speed_10m}</div>
            </div>
        `;
    }

    // Hàm xử lý lỗi khi lấy vị trí GPS thất bại
    function handleError(error) {
        UI.loading.hide(); // Ẩn loading
        // Định nghĩa các câu thông báo lỗi bằng tiếng Việt tương ứng với mã lỗi GPS
        const errorMessages = {
            1: "Người dùng từ chối cung cấp vị trí.",
            2: "Thông tin vị trí không khả dụng.",
            3: "Yêu cầu vị trí đã hết thời gian chờ.",
            default: "Đã xảy ra lỗi không xác định."
        };
        // Hiển thị lỗi ra UI
        UI.error.show(errorMessages[error.code] || errorMessages.default);
    }
});