// 口令，由输入框赋值，不在网络传播
var globalPwd = '';
var globalKey = '';
var iv = CryptoJS.enc.Utf8.parse('1234567812345678');

$(function () {

    var route = 1;

    let isExtensionExist = typeof (webExtensionWallet) !== "undefined";
    if (!isExtensionExist) {
        $("#wallter").show();
        return;
    }


    $("#btnGO").click(() => {
        route = 1;
        if (isEmpty(globalPwd)) {
            route = 2;
            $("#keyModal").modal();
        } else {
            $("#tweetModal").modal();
        }
    });

    $("#btnTweetOk").click(() => {
        var tweet = $("#tweetText").val();
        if (isEmpty(tweet)) {
            $("#txtMsg").text("记录不能为空!");
            $("#msgModal").modal();
        } else {
            $("#confirmModal").modal();
        }
    });

    // 存入记录
    $("#putTweetBtn").click(() => {
        var tweet = $("#tweetText").val();
        save(tweet);
        $("#tweetText").val("");
        $("#confirmModal").modal('hide');
        $("#tweetModal").modal('hide');

    });


    // 口令
    $("#btnInputKey").click(() => {
        route = 1;
        if (!isEmpty(globalPwd)) {
            $("#txtKey").val(globalPwd);
        }
        $("#keyModal").modal();
    });


    $("#btnKeyOK").click(() => {
        var key = $("#txtKey").val();
        key = $.trim(key);
        if (isEmpty(key)) {
            $("#txtMsg").text("口令不能为空!");
            $("#msgModal").modal();
            return;
        }
        globalPwd = key;
        globalKey = CryptoJS.enc.Utf8.parse(CryptoJS.MD5(key).toString());
        $("#txtKey").val('');
        $("#keyModal").modal("hide");
        load();
        if (route == 2) {
            $("#tweetModal").modal();
        }

    });

});


function save(text) {
    var tweet = {};
    tweet.text = text;
    tweet.sdate = "刚刚";
    var html = template('tpl', tweet);
    $("#timeline").prepend(html);
    let api = new HoleContractApi();
    let scr = getAES(text);
    api.add(scr);
}


function load() {
    let api = new HoleContractApi();
    api.get(resp => {
        if (resp.result) {
            let tweets = JSON.parse(resp.result);
            if (tweets.length > 0) {
                tweets.sort((a, b) => a.date < b.date ? -1 : 1);
                let alt = 0;
                for (const tweet of tweets) {
                    try {
                        tweet.sdate = formatDate(tweet.date);
                        tweet.alt = alt;
                        alt = alt + 1;
                        tweet.text = getDAes(tweet.text);
                        var tpl = document.getElementById('tpl').innerHTML;
                        var html = template('tpl', tweet);
                        $("#timeline").prepend(html);
                    } catch (err) {
                        try {
                            tweet.text = "未解密.";
                            var tpl = document.getElementById('tpl').innerHTML;
                            var html = template('tpl', tweet);
                            $("#timeline").prepend(html);
                        } catch (err) { }
                    }
                }
            }
        }
    });
}


function getAES(data) { //加密        
    var encrypted = CryptoJS.AES.encrypt(data, globalKey,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }); //密文                                 
    var encrypted1 = CryptoJS.enc.Utf8.parse(encrypted.toString());
    return encrypted;
}

function getDAes(data) {//解密      
    console.log(data);
    var decrypted = CryptoJS.AES.decrypt(data, globalKey,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return decrypted.toString(CryptoJS.enc.Utf8);
}



function formatDate(unixstamp) {
    let now = new Date(+unixstamp);
    var year = now.getFullYear(),
        month = now.getMonth() + 1,
        date = now.getDate(),
        hour = now.getHours(),
        minute = now.getMinutes(),
        second = now.getSeconds();
    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}



function isEmpty(obj) {
    if (typeof obj == "undefined" || obj == null || obj == "") {
        return true;
    } else {
        return false;
    }
}