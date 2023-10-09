window.addEventListener('DOMContentLoaded', () => {
    // Nút xem thêm thông tin sản phẩm
    $('#btn-readmore').click(function () {
        $('#product-description').css('max-height', '100%');
        $('.divreadmore').addClass('d-none');
    });


    // function tăng giảm số lượng sản phẩm
    function updateQuantity() {
        const quantityInput = $('#quantityInput')
        const quantityMinus = $('#quantityMinus')
        const quantityPlus = $('#quantityPlus')

        quantityMinus.click(() => {
            let quantity = parseInt(quantityInput.val());
            if (quantity > 1) {
                quantity--;
                quantityInput.val(quantity);
            }
        });
        quantityPlus.click(() => {
            let quantity = parseInt(quantityInput.val());
            if (quantity < 100) {
                quantity++;
                quantityInput.val(quantity);
            }
        });
        quantityInput.on('change', () => {
            let quantity = parseInt(quantityInput.val());
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
            } else if (quantity > 100) {
                quantity = 100;
            }
            quantityInput.val(quantity);
        });
    } updateQuantity();


    // function chọn loại đánh giá cho sản phẩm
    function chooseRatingforProduct() {
        const rating = $("#rating");
        const ratingText = $("#ratingText");


        rating.find("i").hover(function () {
            const starValue = $(this).data("star");
            rating.find("i").removeClass("active");
            rating.find(`i[data-star="${starValue}"]`).addClass("active");
            rating.find(`i[data-star="${starValue}"]`).prevAll().addClass("active");
            updateRatingText(starValue);
        });

        rating.mouseleave(function () {
            rating.find("i").removeClass("active");
            rating.find(`i[data-star="${currentRating}"]`).addClass("active");
            rating.find(`i[data-star="${currentRating}"]`).prevAll().addClass("active");
            updateRatingText(currentRating);
        });

        rating.find("i").click(function () {
            currentRating = $(this).data("star");
            updateRatingText(currentRating);
        });

        function updateRatingText(value) {
            let text = "";
            switch (value) {
                case 1:
                    text = "Tệ";
                    break;
                case 2:
                    text = "Tạm được";
                    break;
                case 3:
                    text = "Bình thường";
                    break;
                case 4:
                    text = "Hài lòng";
                    break;
                case 5:
                    text = "Tuyệt vời";
                    break;
                default:
                    text = "";
            }
            ratingText.text(text);
        }
    } chooseRatingforProduct();


    // Jquery Thêm đánh giá sản phẩm
    $('#btn-pdr_save').click(function () {
        var gender; if ($('#prd-male').is(':checked')) { gender = 'Nam'; } else { gender = 'Nữ'; };

        const data = {
            productId: $('.product-info').attr('prd'),
            userName: $('#pdr-username').val(),
            userEmail: $('#pdr-email').val(),
            gender: gender,
            rating: currentRating,
            description: $('#pdr-description').val(),
        }

        $.ajax({
            url: 'createProductReviews',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data.success) {
                    showSuccessToast('Gửi đánh giá sản phẩm thành công');
                    $('#modal-rating').modal('hide'); // ẩn modal
                    $('#pdr-username').val('');
                    $('#pdr-email').val('');
                    $('#pdr-description').val('');
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    });


});

let currentRating = 5; // biến rating mặt định


// Function thống kê đánh giá
function updateTotalRating() {
    // Lấy tất cả các phần tử chứa tổng số đánh giá và thanh progress-bar
    const ratingElements = document.querySelectorAll('.rating-progress');

    // Lấy tổng số đánh giá tổng cộng
    let totalRatings = 0;
    ratingElements.forEach(element => {
        const totalRatingElement = element.querySelector('.total-rating');
        const totalRating = parseInt(totalRatingElement.textContent);
        totalRatings += totalRating;
    });

    // Tính tỷ lệ và cập nhật progress-bar cho mỗi loại sao
    ratingElements.forEach(element => {
        const totalRatingElement = element.querySelector('.total-rating');
        const totalRating = parseInt(totalRatingElement.textContent);
        const stars = parseInt(element.querySelector('.pe-1').textContent);
        const progressBar = element.querySelector('.progress-bar');

        const percentage = (totalRating / totalRatings) * 100;

        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
    });
} updateTotalRating();


// Cập nhật đánh giá trung bình dựa trên thông tin từ progress bar
function updateAverageRating() {
    let averageRating = 0;
    let totalReviews = 0;

    const ratings = document.querySelectorAll('.rating-progress');
    let totalRatingCount = 0;
    let weightedRatingSum = 0;

    ratings.forEach(rating => {
        const ratingValue = parseInt(rating.querySelector('span').textContent);
        const totalRating = parseInt(rating.querySelector('.total-rating').textContent);

        weightedRatingSum += ratingValue * totalRating;
        totalRatingCount += totalRating;
    });

    averageRating = (totalRatingCount > 0) ? (weightedRatingSum / totalRatingCount).toFixed(1) + '/5' : '0/5';
    totalReviews = totalRatingCount;

    // Cập nhật giao diện đánh giá trung bình
    const averageRatingElement = document.getElementById('averageRating');
    const totalReviewsElement = document.getElementById('totalReviews');

    averageRatingElement.textContent = averageRating;
    totalReviewsElement.textContent = `${totalReviews} đánh giá`;

    // Tô sáng các biểu tượng sao
    const stars = document.querySelectorAll('.rating i');
    stars.forEach((star, index) => {
        if (index < Math.round(parseInt(averageRating))) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
} updateAverageRating();


// Hiển thị số đánh giá của người dùng trên sản phẩm
function showRatingForUser() {
    const ratingContainers = document.querySelectorAll(".userRating .rating");

    ratingContainers.forEach(function (container) {
        const ratingValue = parseInt(container.getAttribute("data-rating"));

        // Lặp qua tất cả các ngôi sao trong từng đánh giá và thêm lớp "highlight" vào số sao tương ứng
        const stars = container.querySelectorAll("i[pdr-star]");
        stars.forEach(function (star, index) {
            const starRating = parseInt(star.getAttribute("pdr-star"));
            if (starRating <= ratingValue) {
                star.classList.add("highlight");
            }
        });
    });
} showRatingForUser();



// Đăng ký helper để chuyển đổi biến handlebars từ %variable% thành {{variable}}
function convertPlaceHbs(template) {
    // Thay thế biểu thức %variable%
    template = template.replace(/%([a-zA-Z0-9.]+)%/g, "{{$1}}");
    // Thay thế biểu thức %#each%
    template = template.replace(/%#each ([a-zA-Z0-9.]+)%/g, "{{#each $1}}");
    template = template.replace(/%\/each%/g, "{{/each}}");
    // Thay thế biểu thức %if%
    template = template.replace(/%#if ([a-zA-Z0-9.]+)%/g, "{{#if $1}}");
    template = template.replace(/%#else%/g, "{{else}}");
    template = template.replace(/%\/if%/g, "{{/if}}");
    // Thay thế biểu thức %unless%
    template = template.replace(/%#unless ([a-zA-Z0-9.]+)%/g, "{{#unless $1}}");
    template = template.replace(/%\/unless%/g, "{{/unless}}");
    // Thay thế biểu thức %#each-in%
    template = template.replace(/%#each-in ([a-zA-Z0-9.]+)%/g, "{{#each-in $1}}");
    template = template.replace(/%\/each-in%/g, "{{/each-in}}");
    // Thay thế biểu thức %with%
    template = template.replace(/%with ([a-zA-Z0-9.]+)%/g, "{{#with $1}}");
    template = template.replace(/%\/with%/g, "{{/with}}");
    // Thay thế biểu thức %lookup%
    template = template.replace(/%lookup ([a-zA-Z0-9.]+) in ([a-zA-Z0-9.]+)%/g, "{{lookup $2 $1}}");
    // Thay thế biểu thức %log%
    template = template.replace(/%log ([a-zA-Z0-9.]+)%/g, "{{log $1}}");
    return template;
}


var offsetPage = 0;
var sizePage = 3;
// nút xem tiếp các đánh giá
function btnPdRevNext() {
    var productId = $('.product-info').attr('prd');
    offsetPage += sizePage;

    $.ajax({
        url: `loadMoreReviews?Id=${productId}&Offset=${offsetPage}`,
        method: 'GET',
        success: function (result) {
            var source = $('#template-productReviews').html(); // Nguồn dữ liệu
            var convertSource = convertPlaceHbs(source); // chuyển đổi sang biến handlebars
            var template = Handlebars.compile(convertSource); // biên dịch handlebars
            var data = template({ productReviews: result.data }); // Truyền biến
            $('#templateReviewsContent').html(data); // Đưa nội dung mới ra views
            showRatingForUser(); // gọi function để hiển thị số đánh giá của người dùng

            if (result.data.length < 3) {
                $('#btn-pdr_next').addClass('disabled')
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}
// nút xem lại các đánh giá
function btnPdRevPrev() {
    var productId = $('.product-info').attr('prd');
    offsetPage -= sizePage;

    $.ajax({
        url: `loadMoreReviews?Id=${productId}&Offset=${offsetPage}`,
        method: 'GET',
        success: function (result) {
            var source = $('#template-productReviews').html(); // Nguồn dữ liệu
            var convertSource = convertPlaceHbs(source); // chuyển đổi sang biến handlebars
            var template = Handlebars.compile(convertSource); // biên dịch handlebars
            var data = template({ productReviews: result.data }); // Truyền biến
            $('#templateReviewsContent').html(data); // Đưa nội dung mới ra views
            showRatingForUser(); // gọi function để hiển thị số đánh giá của người dùng

            if(offsetPage == 0){
                $('#btn-pdr_prev').addClass('disabled')
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}
