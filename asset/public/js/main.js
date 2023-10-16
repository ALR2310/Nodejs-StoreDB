// Định dạng lại tiền tệ cho element
function formatToVND(elementSelector) {
    const elements = document.querySelectorAll(elementSelector);

    elements.forEach(element => {
        const priceText = element.textContent;
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')); // Chuyển đổi về số

        if (!isNaN(price)) {
            const formatter = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            });

            const formattedPrice = formatter.format(price);
            element.textContent = formattedPrice;
        }
    });
}
// Sử dụng hàm:
window.addEventListener('DOMContentLoaded', () => {
    formatToVND('.price');
})





