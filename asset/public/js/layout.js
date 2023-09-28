window.addEventListener('scroll', function(){
    
    // Đặt navbar thành fixed khi cuộn
    var navcategory = document.getElementById('navcategory');
    var navcategoryheight = navcategory.clientHeight;
    //lấy chiều cao hiện tại của trang
    var scrollY = this.window.scrollY; 

    if(scrollY >= navcategoryheight) {
        navcategory.classList.add('fixed-nav');
    } else {
        navcategory.classList.remove('fixed-nav');
    }


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
})