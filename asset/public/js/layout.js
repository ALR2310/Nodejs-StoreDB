// Đặt navbar thành fixed khi cuộn
window.addEventListener('scroll', function () {
    var navcategory = document.getElementById('navcategory');
    var navcategoryheight = navcategory.clientHeight;
    //lấy chiều cao hiện tại của trang
    var scrollY = this.window.scrollY;

    if (scrollY >= navcategoryheight) {
        navcategory.classList.add('fixed-nav');
    } else {
        navcategory.classList.remove('fixed-nav');
    }
})

// function mở các tab đăng ký/đăng nhập trên modal
function openTabsLoginRegisterModal() {
    var myTabs = new bootstrap.Tab(document.getElementById("login-tab"));
    myTabs.show();

    document.querySelectorAll(".nav-link").forEach(function (tab) {
        tab.addEventListener("click", function (event) {
            event.preventDefault();
            var tabId = this.getAttribute("href");
            var tabContent = document.querySelector(tabId);

            // Ẩn/tab hiển thị các nội dung
            document.querySelectorAll(".tab-pane").forEach(function (content) {
                content.classList.remove("show", "active");
            });

            // Hiển thị nội dung của tab được chọn
            tabContent.classList.add("show", "active");

            // Nếu chuyển lại tab đăng nhập, hiển thị nội dung và tab đăng nhập
            if (tabId === "#login") {
                myTabs = new bootstrap.Tab(document.getElementById("login-tab"));
                myTabs.show();
            }
        });
    });
} openTabsLoginRegisterModal();

// funcion xoá cookie
function xoaCookie(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Làm mới (refresh) trang web
    window.location.reload();
}
// function kiểm tra cookie
function kiemTraCookie(cookieName) {
    // Lấy danh sách tất cả các cookies và chuyển nó thành một mảng các cặp key-value
    const cookies = document.cookie.split(';').map(cookie => cookie.trim().split('='));

    // Kiểm tra xem cookieName có trong danh sách cookies không
    for (const [name, value] of cookies) {
        if (name === cookieName) {
            return true; // Cookie tồn tại
        }
    }
    return false; // Cookie không tồn tại
}

// Sử dụng hàm kiemTraCookie để kiểm tra cookie authToken
const coookieTonTai = kiemTraCookie('authToken');

if (coookieTonTai) {
    document.querySelector('.userInfor').classList.remove('d-none');
    document.querySelector('.userLogin').classList.add('d-none');
} else {
    document.querySelector('.userInfor').classList.add('d-none');
    document.querySelector('.userLogin').classList.remove('d-none');
}

// Đăng xuất tài khoản/xoá cookie
document.getElementById('btnLogout').addEventListener('click', () => {
    xoaCookie('authToken');
    window.location.href = '/';
});

// function ẩn hiện cho input password
function togglePasswordVisibility(button, inputId) {
    const input = document.getElementById(inputId);
    const iconShow = '<i class="fa-sharp fa-solid fa-eye"></i>'
    const iconHide = '<i class="fa-sharp fa-solid fa-eye-slash"></i>'
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = iconShow;
    } else {
        input.type = 'password';
        button.innerHTML = iconHide;
    }
}

//function clearvailidate
function clearRegisterValid() {
    $('#registerEmail, #registerUserName, #registerPassword, #confirmPassword').on('change', function () {
        $(this).removeClass('is-invalid');
    });
} clearRegisterValid();
$('#registerPassword').on('blur', function () {
    checkRegisterPassword();
});
$('#confirmPassword').on('blur', function () {
    checkRegisterPassword();
})
//function checkpassword
function checkRegisterPassword() {
    var password = $('#registerPassword');
    var confirmPassword = $('#confirmPassword');
    if (password.val() == '') {
        password.addClass('is-invalid');
        $('#err-regPwd').text('Vui lòng nhập mật khẩu');
    }
    if (password.val().length < 8) {
        password.addClass('is-invalid');
        $('#err-regPwd').text('Mật khẩu chứa ít nhất 8 ký tự');
    }
    if (confirmPassword.val() == '' || confirmPassword.val() != password.val()) {
        confirmPassword.addClass('is-invalid');
    }
}
//function checkvalidate
function checkRegisterVaild() {
    var email = $('#registerEmail');
    var userName = $('#registerUserName');
    var password = $('#registerPassword');
    var confirmPassword = $('#confirmPassword');

    if (email.val() == '') {
        email.addClass('is-invalid');
        $('#err-regEmail').text('Vui lòng nhập địa chỉ Email');
    }
    if (userName.val() == '') {
        userName.addClass('is-invalid');
        $('#err-regUserName').text('Vui lòng nhập tên đăng nhập');
    }
    if (password.val() == '') {
        password.addClass('is-invalid');
        $('#err-regPwd').text('Vui lòng nhập mật khẩu');
    }
    if (password.val().length < 8) {
        password.addClass('is-invalid');
        $('#err-regPwd').text('Mật khẩu chứa ít nhất 8 ký tự');
    }
    if (confirmPassword.val() == '' || confirmPassword.val() != password.val()) {
        confirmPassword.addClass('is-invalid');
    }
    // Trả về false nếu bất kỳ điều kiện nào không đúng, ngược lại trả về true
    return !(email.val() == '' || userName.val() == '' || password.val() == '' || password.val().length < 8 || confirmPassword.val() == '' || confirmPassword.val() != password.val());
}

// jquery gửi form đăng ký
$('#btnRegister').click(function () {
    if (checkRegisterVaild()) {
        const data = {
            email: $('#registerEmail').val(),
            username: $('#registerUserName').val(),
            password: $('#registerPassword').val(),
        }
        $.ajax({
            url: '/dang-ky',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            success: function (result) {
                if (result.userNameExist) {
                    $('#registerUserName').addClass('is-invalid');
                    $('#err-regUserName').text('Tên đăng nhập đã tồn tại');
                } else {
                    $('#registerUserName').removeClass('is-invalid');
                }

                if (result.emailExist) {
                    $('#registerEmail').addClass('is-invalid');
                    $('#err-regEmail').text('Địa chỉ email đã tồn tại');
                } else {
                    $('#registerEmail').removeClass('is-invalid');
                }

                if (result.register) {
                    showSuccessToast('Đăng ký tài khoản thành công');
                    //Đóng modal đăng nhập/đăng ký
                    $('#loginRegisterModal').modal('hide');
                    // Mở modal xác nhận email
                    $('#verifyEmailModal').modal('show');
                    // đặt địa chỉ Email
                    $('#emailVerify').text(data.email);
                } else {
                    showErrorToast('Đăng ký tài khoản thất bại');
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
});

// jquery gửi form đăng nhập
$('#btnLogin').click(function () {
    const data = {
        email: $('#loginEmail').val(),
        password: $('#loginPassword').val(),
        remember: $('#rememberMe').is(":checked"),
    }

    $.ajax({
        url: '/dang-nhap',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        success: function (result) {
            if (result.loginResult == false) {
                $('#login-msg').removeClass('d-none');
            } else {
                $('#login-msg').addClass('d-none');
                $('#loginRegisterModal').modal('hide');
                showSuccessToast('Đăng nhập thành công');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});

// Btn đăng nhập bằng google
$('#loginGoogle').click(function () {
    const width = 530;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const popup = window.open(
        '/dang-nhap/google',  // Đường dẫn đến trang đăng nhập bằng Google
        'google-login-popup',
        `width=${width},height=${height},left=${left},top=${top}`
    );

    if (window.focus) {
        popup.focus();
    }

    return false;
});

// Btn đăng nhập bằng facebook
$('#loginFacebook').click(function () {
    const width = 750;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const popup = window.open(
        '/dang-nhap/facebook',  // Đường dẫn đến trang đăng nhập bằng Google
        'google-login-popup',
        `width=${width},height=${height},left=${left},top=${top}`
    );

    if (window.focus) {
        popup.focus();
    }

    return false;
});

// btn xác thực email
$('#btnVerify').click(function () {
    const data = {
        verifyCode: $('#verifyCode').val(),
    }

    $.ajax({
        url: '/dang-ky/verifyEmail',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        success: function (result) {
            if (result.verifyEmail) {
                $('#verifyEmailModal').modal('hide'); // Đóng modal xác thực
                showSuccessToast('Xác thực email thành công'); // hiển thị thông báo
                $('#loginRegisterModal').modal('show'); // Mở modal đăng nhập
                // Mở tab đăng nhập
                $("#login-tab").tab("show");
                // Điền sẵn thông tin đăng nhập
                $('#loginEmail').val($('#registerUserName').val());
                $('#loginPassword').val($('#registerPassword').val());
            } else {
                showErrorToast('Xac thực email thất bại');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});
$('#btnVerify1').click(function () {
    const data = {
        verifyCode: $('#verifyCode').val(),
    }
    $.ajax({
        url: '/dang-ky/verifyEmail',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        success: function (result) {
            if (result.verifyEmail) {
                $('#verifyEmailModal').modal('hide'); // Đóng modal xác thực
                showSuccessToast('Xác thực email thành công'); // hiển thị thông báo
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showErrorToast('Xac thực email thất bại');
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
});

// Kiểm tra trạng thái tài khoản
function checkUserStatus() {
    $.ajax({
        url: '/checkuserstatus',
        type: 'GET',
        success: function (result) {
            if (result.status == false) {
                $('#verifyEmailModal').modal('show'); // hiển thị modal xác nhận đăng ký
                $('#err-verifyCode').html(`Vui lòng xác thực tài khoản của bạn để tiếp tục sử dụng ứng dụng. Bấm gửi mã xác thực để gửi mã đến Email <span id="emailVerify"class="text-danger">${result.email}
                </span> của bạn.`);

                $('#link-resend').text(`Gửi mã xác thực`);
                $('#btnVerify').addClass('d-none');
                $('#btnVerify1').removeClass('d-none');
                $('#btnVerifyLogout').removeClass('d-none');
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}; checkUserStatus();

// btn gửi lại mã xác thực
$('#link-resend').click(function (event) {
    event.preventDefault();

    $('#link-resend').addClass('d-none');
    $('#resendCountdown').removeClass('d-none');

    var seconds = 60;
    $('#countdown').text(seconds);

    var countdownInterval = setInterval(function () {
        seconds--;
        $('#countdown').text(seconds);

        if (seconds <= 0) {
            clearInterval(countdownInterval);
            $('#link-resend').removeClass('d-none');
            $('#resendCountdown').addClass('d-none');
        }
    }, 1000);

    const data = {
        email: $('#emailVerify').text()
    }

    $.ajax({
        url: 'dang-ky/sendVerifyCode',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json',
        success: function (result) {
            if (result.sendVerifyCode) {
                showSuccessToast('Gửi lại mã xác thực thành công')
            } else {
                showErrorToast('Gửi lại mã xác thực thất bại')
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
});

// nút đăng xuất
$('#btnVerifyLogout').click(function () {
    xoaCookie('authToken');
    window.location.href = '/';
});

// Gọi sự kiện đăng ký bằng phím enter trên các input
$('#registerEmail, #registerUserName, #registerPassword, #confirmPassword').on('keyup', function (e) {
    if (e.key === 'Enter') {
        $('#btnRegister').click();
    }
});
// Gọi sự kiện đăng nhập bằng phím enter trên các input
$('#loginEmail, #loginPassword').on('keyup', function (e) {
    if (e.key === 'Enter') {
        $('#btnLogin').click();
    }
});