
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

    // Jquery thực hiện thêm sản phẩm
    $('#btnSave').click(function () {
        const data = {
            productName: $('#productName').val(),
            price: $('#price').val(),
            image: $('#image').val(),
            category: $('#category').val(),
            quantity: $('#quantity').val(),
            description: $('#editor').html(),
        }

        $.ajax({
            url: '/nguoi-dung/them-san-pham',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data.success) {
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
        })
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


