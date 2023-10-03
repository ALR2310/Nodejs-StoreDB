
// hàm hiển thị các input chỉnh sửa
window.addEventListener('DOMContentLoaded', () => {
    // Function chuyển đổi đống mở form edit trên user
    function toggleInputField() {
        const editButton = $('#editButton');
        const saveButton = $('#saveButton');
        const closeButton = $('#closeButton');
        const elementsToToggle = [
            { label: $('#lblPhoneNumber'), input: $('#tblPhoneNumber') },
            { label: $('#lblGender'), input: $('#genderSelect') },
            { label: $('#lblDateofbirth'), input: $('#tblDateofbirth') },
            { label: $('#lblAddress'), input: $('#tblAddress') }
        ];
        editButton.on('click', () => {
            elementsToToggle.forEach(element => {
                element.label.css('display', 'none');
                element.input.css('display', 'block');
            });
            toggleButton(true);
        });
        saveButton.on('click', closeInput);
        closeButton.on('click', closeInput);
        function closeInput() {
            elementsToToggle.forEach(element => {
                element.label.css('display', 'block');
                element.input.css('display', 'none');
            });
            toggleButton(false);
        }
        function toggleButton(showBtn = true) {
            editButton.css('display', showBtn ? 'none' : 'block');
            saveButton.css('display', showBtn ? 'block' : 'none');
            closeButton.css('display', showBtn ? 'block' : 'none');
        }
    } toggleInputField();

    // Code đặt css focus cho thẻ div tagInput
    $('#tagInput').on('focus', function () {
        $('.tag-input').addClass('tag-input-focus');
    });
    $('#tagInput').on('blur', function () {
        $('.tag-input').removeClass('tag-input-focus');
    });

    // Code thêm các tags vào thẻ div tagInput
    function addtagsearchinput() {
        const tagsContainer = document.querySelector('.tags');
        const tagInput = document.querySelector('#tagInput');

        tagInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && tagInput.value.trim() !== '') {
                const tag = document.createElement('div');
                tag.className = 'tag';
                tag.textContent = tagInput.value;
                const closeButton = document.createElement('span');
                closeButton.className = 'close-button';
                closeButton.innerHTML = '&#10006;';
                closeButton.addEventListener('click', function () {
                    tagsContainer.removeChild(tag);
                });
                tag.appendChild(closeButton);
                tagsContainer.appendChild(tag);
                tagInput.value = '';
            }
        });
    } addtagsearchinput();

    function clearErrorMsgInput() {
        $('#productName').on('change', function () {
            if ($('#productName').hasClass('is-invalid')) {
                $('#productName').removeClass('is-invalid');
            }
        });
        $('#price').on('change', function () {
            if ($('#price').hasClass('is-invalid')) {
                $('#price').removeClass('is-invalid');
            }
        });
        $('#image').on('change', function () {
            if ($('#image').hasClass('is-invalid')) {
                $('#image').removeClass('is-invalid');
            }
        });
        $('#quantity').on('change', function () {
            if ($('#quantity').hasClass('is-invalid')) {
                $('#quantity').removeClass('is-invalid');
            }
        });
        $('#editor').on('change', function () {
            if ($('#editor').hasClass('is-invalid')) {
                $('#editor').removeClass('is-invalid');
            }
        });
    } clearErrorMsgInput();


    // Jquery thực hiện thêm sản phẩm
    $('#btnSave').click(function () {

        if ($('#productName').val() == '') {
            $('#productName').addClass('is-invalid');
        }
        if ($('#price').val() == '') {
            $('#price').addClass('is-invalid');
        }
        if ($('#image').prop('files').length == 0) {
            $('#image').addClass('is-invalid');
        }
        if ($('#quantity').val() == '') {
            $('#quantity').addClass('is-invalid');
        }
        if ($('#editor').html() == '<p><br data-cke-filler="true"></p>') {
            $('#editor').addClass('is-invalid');
        }

        if ($('#productName').val() != '' && $('#price').val() != '' &&
            $('#image').prop('files').length != 0 && $('#quantity').val() != '' && $('#editor').html() != '<p><br data-cke-filler="true"></p>') {

            // Xử lý tải lên hình ảnh sản phẩm
            const files = document.querySelector('#image').files;
            const formData = new FormData();

            for (const file of files) {
                formData.append('file', file);
            };
            $.ajax({
                url: '/upload/image',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (res) {
                    const data = {
                        productName: $('#productName').val(),
                        price: $('#price').val(),
                        image: res.uploadedFilePath, //lấy đường dẫn hình ảnh
                        category: $('#category').val(),
                        quantity: $('#quantity').val(),
                        description: $('#editor').html(),
                    }
                    // xử lý gửi dữ liệu về api để tải lên sản phẩm
                    $.ajax({
                        url: '/nguoi-dung/them-san-pham',
                        method: 'POST',
                        data: JSON.stringify(data),
                        contentType: 'application/json',
                        dataType: 'json',
                        success: function (result) {
                            if (result.success) {
                                showSuccessToast('Thêm sản phẩm thành công');
                                $('#modal-addProduct').modal('hide'); // ẩn modal

                                // Đặt lại nội dung trong các input
                                $('#productName').val('');
                                $('#price').val('');
                                $('#image').val('');
                                $('#category').val('1');
                                $('#quantity').val('1');
                                // Đặt lại nội dung trong ckeditor
                                if (editor) {
                                    editor.setData(initialContent);
                                }
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });
                },
                error: function (error) {
                    console.log(error);
                }
            });



        }
    });


});


document.querySelector('.view-more-btn button').addEventListener('click', function () {
    document.querySelector('.product-show-more').classList.toggle('active');
    document.querySelector('.view-more-btn button').textContent = 'Ẩn bớt sản phẩm';
});


// // Sử dụng jQuery để lấy nội dung của các thẻ tag (loại bỏ dấu "X")
// var tagsArray = [];

// $('.tags .tag').each(function () {
//     var tagText = $(this).contents().filter(function () {
//         return this.nodeType === Node.TEXT_NODE;
//     }).text().trim(); // Lấy nội dung văn bản và loại bỏ khoảng trắng thừa
//     tagsArray.push(tagText);
// });

// // tagsArray bây giờ chứa chỉ nội dung của các thẻ tag
// console.log(tagsArray);


