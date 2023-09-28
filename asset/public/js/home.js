// function giới hạn văn bản hiển thị 
function limitText(element, limit) {
    var text = element.innerText;
    if (text.length > limit) {
        element.innerText = text.slice(0, limit) + '...';
    }
}
var productnames = document.querySelectorAll('.product-name');
productnames.forEach((productname) => {
    limitText(productname, 60);
})


//function thanh slider
const sliderImages = document.querySelectorAll(".slider-content img");
const status_bars = document.querySelectorAll(".status_bar");
let currentIndex = 0;
let interval;

status_bars[0].classList.add('active');

function showSilderImage(index) {
    var sliderContent = document.querySelector(".slider-content");

    sliderContent.style.transform = `translateX(-${index * 100}%)`; // Di chuyển slider
    currentIndex = index; // Cập nhật chỉ số hiện tại
    updateStatusBars(); // Cập nhật trạng thái của các dấu gạch
}

function nextSliderImage() {
    currentIndex = (currentIndex + 1) % sliderImages.length;
    showSilderImage(currentIndex);
}

function prevSliderImage() {
    currentIndex = (currentIndex - 1 + sliderImages.length) % sliderImages.length;
    showSilderImage(currentIndex);
}

function updateStatusBars() {
    status_bars.forEach((bar, index) => {
        if (index === currentIndex) {
            bar.classList.add("active");
        } else {
            bar.classList.remove("active");
        }
    });
}

status_bars.forEach((bar, index) => {
    bar.addEventListener("click", () => {
        showSilderImage(index);
    });
});

function startInterval() {
    interval = setInterval(nextSliderImage, 3000); // 3000 milliseconds (3 giây)
}
startInterval(); // Bắt đầu tự động chuyển đổi khi trang web được tải

// Dừng tự động chuyển đổi khi người dùng tương tác
function stopInterval() {
    clearInterval(interval);
}


