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


// Mở form login/register
const formLoginOpenBtn = document.querySelector("#form-open"),
    modal_login = document.querySelector(".modal-login_form"),
    formContainer = document.querySelector(".login-form_container"),
    formLoginCloseBtn = document.querySelector(".form_close"),
    signupBtn = document.querySelector("#signup"),
    loginBtn = document.querySelector("#login"),
    pwShowHide = document.querySelectorAll(".pw_hide");

formLoginOpenBtn.addEventListener("click", function () {
    modal_login.classList.add("show");
    modal_login.style.zIndex = "100";
});
formLoginCloseBtn.addEventListener("click", function () {
    modal_login.classList.remove("show");
    setTimeout(() => {
        modal_login.style.zIndex = "-1";
    }, 500);

});

pwShowHide.forEach((icon) => {
    icon.addEventListener("click", () => {
        let getPwInput = icon.parentElement.querySelector("input");
        if (getPwInput.type === "password") {
            getPwInput.type = "text";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        } else {
            getPwInput.type = "password";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        }
    });
});

signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.add("active");
});
loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.remove("active");
});


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
});

// Function kiểm tra mật khẩu
function validateRegister() {
    //check validateinputfield
    if ($('#tblEmail').val() == '') {
        $('#emailErr').css('display', 'block');
        $('#emailErr').text('Email không được để trống');
    } else {
        $('#emailErr').css('display', 'none');
    }
    if ($('#tblUsername').val() == '') {
        $('#usernameErr').css('display', 'block');
        $('#usernameErr').text('Tên đăng nhập không được để trống');
    } else {
        $('#usernameErr').css('display', 'none');
    }
    if ($('#tblPassword').val() == '') {
        $('#passwordErr').css('display', 'block');
        $('#passwordErr').text('Mật khẩu không được để trống');
    } else {
        $('#passwordErr').css('display', 'none');
    }
    if ($('#tblConfirmPassword').val() == '') {
        $('#confirmpasswordErr').css('display', 'block');
        $('#confirmpasswordErr').text('Xác nhận mật khẩu không được để trống');
    } else {
        $('#confirmpasswordErr').css('display', 'none');
    }
    if ($('#tblPassword').val().length < 8) {
        $('#passwordErr').text('Mật khẩu phải có ít nhất 8 ký tự');
        $('#passwordErr').css('display', 'block');
    } else {
        $('#passwordErr').css('display', 'none');
        if ($('#tblPassword').val() != $('#tblConfirmPassword').val()) {
            $('#confirmpasswordErr').text('Mật khẩu xác nhận không trùng nhau');
            $('#confirmpasswordErr').css('display', 'block');
        } else {
            $('#confirmpasswordErr').text('');
            $('#confirmpasswordErr').css('display', 'none');
        }
    }

    if ($('#tblEmail').val() != '' && $('#tblUsername').val() != '' &&
        $('#tblPassword').val() != '' && $('#tblConfirmPassword').val() != '' &&
        $('tblConfirmPassword').val() == $('tblPassword').val() && $('#tblPassword').val().length >= 8) {
        return true;
    } else {
        return false;
    }
}

//Btn đăng nhập
$('#btnLogin').click(function () {
    var data = {
        email: $('#tblEmail1').val(),
        password: $('#tblPassword1').val(),
        remember: $('#remember').is(":checked"),
    }

    $.ajax({
        url: '/dang-nhap',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (result) {
            if (result.loginResult == false) {
                $('#loginErr').text('Tên đăng nhập hoặc mật khẩu không chính xác');
                $('#loginErr').css('display', 'block');
            } else {
                $('#loginErr').css('display', 'none');
                showSuccessToast('Đăng nhập thành công');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);

            }

        },
        error: function (err) {
            console.log(err);
        }
    });
});

// Btn đăng ký
$('#btnRegister').click(function () {
    var data = {
        email: $('#tblEmail').val(),
        username: $('#tblUsername').val(),
        password: $('#tblPassword').val(),
    }
    validateRegister();
    if (validateRegister() == true) {
        $.ajax({
            url: '/dang-ky',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                if (result.emailExist) {
                    $('#emailErr').css('display', 'block');
                    $('#emailErr').text('Email đã tồn tại');
                } else if (result.userNameExist) {
                    $('#usernameErr').css('display', 'block');
                    $('#usernameErr').text('Tên đăng nhập đã tồn tại');
                } else {
                    $('#emailErr').css('display', 'none');
                    $('#usernameErr').css('display', 'none');
                }

                if (result.register) {
                    showSuccessToast('Đăng ký tài khoản thành công');
                    formContainer.classList.remove("active"); // Mở form đăng nhập
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


