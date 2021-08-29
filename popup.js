function renderCookie(content) {
    document.getElementById('cookie').innerHTML = content;
}
document.getElementById("refresh").style.visibility = "hidden";

function saveBearer() {
    const key = "adal.idtoken";
    chrome.tabs.getSelected(null, (tab) => {
        console.log(tab.url);
        chrome.tabs.executeScript(tab.id, { code: `localStorage['${key}']` }, (results) => {
            token = "Bearer " + results;
            localStorage.setItem("token", token);
        });

    });
};



function getcookie() {

    function getCookies() {
        chrome.cookies.get({ "url": "https://ctsv.hust.edu.vn", "name": "TokenCode" }, function(cookie) {
            var token;

            if (cookie == null) {
                saveBearer();
                token = localStorage.getItem("token");
                console.log("Cookie not found, try to get bearer cookies");
            } else {
                token = cookie.value;
            }

            if (token == null) {
                renderCookie("<h1>Bạn phải đăng nhập vào ctsv.hust.edu.vn trước khi sử dụng</h1>");
                return;
            };


            console.log("Token : " + token);
            console.log("Start trying to send request");
            chrome.cookies.get({ "url": "https://ctsv.hust.edu.vn", "name": "UserName" }, function(cookie) {

                var un = cookie.value;

                renderCookie("<h1><b>MaxDRL PMT đang chạy, chỉ chút xíu thoy là có kết quả</b></h1></br>" + "<img src=\"load.gif\" alt=\"Loading\">");

                var xhttp = new XMLHttpRequest();

                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        var myArr = JSON.parse(this.responseText);
                        process(myArr);
                    }
                };

                // xhttp.open("POST", "https://api.maxdrl.ictsv.net/AutomationMarkAPI.php?token=" + token + "&username=" + un, true);
                // xhttp.open("POST", "http://127.0.0.1/AutomationMark/AutomationMarkAPI.php?token=&username=", true);
                xhttp.open("POST", "https://hust-api.herokuapp.com/hust/?cookies=" + token + "&mssv=" + un + "&semester=2020-2", true);
                xhttp.send();
                console.log("Da gui xong, dang cham");

                function process(arr) {
                    if (arr.RespCode == 0) {
                        renderCookie("<h3>MaxDRL đã chấm điểm tự động thành công! Điểm của bạn là " + arr.Mark + "</h3>");
                        document.getElementById("refresh").style.visibility = "visible";
                    } else if (arr.RespCode == 104) {
                        renderCookie("<h3>Phiên đăng nhập đã hết hạn</h3>");
                    } else if (arr.RespCode == 102) {
                        renderCookie("<h3>Dữ liệu nhập vào có vẻ trống. Hãy thử đăng nhập lại bằng tài khoản</h3>");
                    } else if (arr.RespCode == 101) {
                        renderCookie("<h3>Có lỗi xảy ra khi chấm điểm</h3>");
                    } else if (arr.RespCode == 103) {
                        renderCookie("<h3>Không đầy đủ các tiêu chí. Các tiêu chí bị thiếu: " + arr.lack + "</h3>");
                    } else {
                        renderCookie("<h3>Không xác định được mã lỗi</h3>");
                    }
                }
            });

        });
    }
    saveBearer();
    getCookies();
    document.getElementById("submitbutton").style.display = "none";
}

function reloadMainTab() {
    chrome.tabs.reload();
}

document.getElementById('submitbutton').addEventListener('click', () => {
    getcookie();
});

document.getElementById("refresh").addEventListener('click', reloadMainTab);

saveBearer();

// document.addEventListener("DOMContentLoaded", function(){ getcookie(); });