function initph(mode) {
    if (mode === "TL") {
    } else {
        try {
            var ph_alert = document.getElementById('ph-alert');
            ph_alert.addEventListener('changestate', function(event) {
                var message = '';

                switch (event.state) {
                    case 'initial':
                        message = '<ons-icon icon="fa-refresh" class="white"></ons-icon>';
                        break;
                    case 'preaction':
                        message = '<ons-icon icon="fa-refresh" class="white"></ons-icon>';
                        break;
                    case 'action':
                        message = '<span class="fa fa-spin"><span class="fa fa-spin"><ons-icon icon="fa-refresh" class="white"></ons-icon></span></span>';
                        break;
                }

                ph_alert.innerHTML = message;
            });

            ph_alert.onAction = function(done) {
                console.log("reload");
                showAlert(done);
            };
        } catch (e) {
            console.log("ERROR_Pull_hook");
        }
    }
}

function init() {
    try {if (old_TL_ws) old_TL_ws.close();} catch (e) {console.log("no_ws");}
    //変数破棄
    now_TL = "local";
    last_load_TL = "";
    tmp_post_text = "";
    toot_new_id = "";
    toot_old_id = "";
    account_toot_old_id = "";
    account_page_id = "";
    alert_new_id = "";
    alert_old_id = "";
    more_status_id = "";
    more_acct_id = "";
    tmp_bbcode_id = "";
    tmp_bbcode_limit = "";
    tmp_bbcode_tootbutton = "";
    emoji_list = Array();
    emoji_num_a = Array();
    emoji_num = 0;
    account_page_acct = "";
    tmp_text_pre = "";
    tmp_post_reply = 0;
    tmp_post_visibility = "";
    follow_old_id = "";
    tmp_media_del_id = 0;
    tmp_media_del_obj = "";
    tag_old_id = "";
    tag_str = "";
    list_old_id = "";
    old_TL_ws = null;
    image_mode = "";
    home_auto_event = false;
    home_auto_tmp = "";
    home_auto_mode = true;
    home_auto_num = 0;
    doodle_old_color = null;
    doodle_mode = null;
    default_post_visibility = "";
    default_sensitive = false;
    init_d();
    hide('cannot-connect-sv');
    hide('cannot-connect-mastodon');
    hide('cannot-connect-internet');
    hide('cannot-connect-API');
    if (!localStorage || !fetch) {
        show("cannot-use-ls");
    } else {
        show('now_loading');

        if (localStorage.getItem('knzkapp_now_mastodon_token')) {

            if (getConfig(1, 'theme')) document.getElementById("theme_css").href = getConfig(1, 'theme');

            if (ons.platform.isIPhoneX()) { // for iPhone X
                let html_tag = document.documentElement;
                html_tag.setAttribute('onsflag-iphonex-portrait', '1');
                html_tag.setAttribute('onsflag-iphonex-landscape', '1');
                document.getElementById("css_toolbar_android").href = "css/iphonex.css";
            }

            if (ons.platform.isAndroid()) document.getElementById("css_toolbar_android").href = "css/toolbar-height.css";

            inst = localStorage.getItem('knzkapp_now_mastodon_domain');
            fetch("https://"+inst+"/api/v1/instance").then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    if (getConfig(1, "SendLog") === "1") window.FirebasePlugin.logEvent("Error/init_instance", response);
                    throw new Error();
                }
            }).then(function(json) {
                fetch("https://"+inst+"/api/v1/accounts/verify_credentials", {
                    headers: {'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')}
                }).then(function(response) {
                    if(response.ok) {
                        return response.json();
                    } else {
                        if (getConfig(1, "SendLog") === "1") window.FirebasePlugin.logEvent("Error/init_verify_credentials", response);
                        throw new Error();
                    }
                }).then(function(json) {
                    if (json.source) {
                        default_post_visibility = json.source.privacy;
                        default_sensitive = json.source.sensitive;
                    } else {
                        default_post_visibility = "public";
                    }
                    document.getElementById("toot_emoji_list_popover").innerHTML = "load";
                    document.getElementById("emoji_list_popover").innerHTML = "load";
                    if (inst === "knzk.me") {
                        toot_limit = 5000;
                    } else if (inst === "now.kibousoft.co.jp") {
                        toot_limit = 4096;
                    } else {
                        toot_limit = 500;
                    }

                    document.querySelector('#navigator').resetToPage('home.html');
                    initevent();
                    showTL("local", null, null, true, null);

                    setTimeout(function () {
                        if (inst !== "knzk.me" && inst !== "now.kibousoft.co.jp") {
                            $("#vote_new_time_simple").addClass("invisible");
                        }
                        document.getElementById("splitter-profile-bg").setAttribute('style', 'background-image: url(\''+json[getConfig(1, 'no_gif') ? "header_static" : "header"]+'\');');
                        if (!getConfig(1, 'no_icon')) document.getElementById("splitter-icon").src = json[getConfig(1, 'no_gif') ? "avatar_static" : "avatar"];
                        document.getElementById("splitter-profile-name").innerHTML = json.display_name;
                        document.getElementById("account_change-username").innerHTML = json.acct + "@" + inst;
                        if (json.locked === true)
                            $("#menu-followreq").removeClass("invisible");
                        else
                            $("#menu-followreq").addClass("invisible");

                        if (getConfig(1, 'menu-fav') == 1) $("#menu-fav-page").removeClass("invisible");
                        if (getConfig(1, 'swipe_menu') == 1) document.getElementById("splitter-menu").setAttribute('swipeable', '1');

                        var dial = getConfig(1, 'dial'), icon;
                        if (dial && dial != "change") {
                            $("#dial_main").removeClass("invisible");
                            if (dial === "toot") icon = "fa-pencil"; else if (dial === "alert") icon = "fa-bell"; if (dial === "reload") icon = "fa-refresh";
                            document.getElementById("dial-icon").className = "ons-icon fa "+icon;
                        } else if (dial) {
                            $("#dial_TL").removeClass("invisible");
                        }
                    }, 500);
                }).catch(function(error) {
                    console.log(error);
                    show('cannot-connect-API');
                    hide('now_loading');
                });
            }).catch(function (error) {
                show('cannot-connect-sv');
                Seterrorlog('error-log-sv', 'Connection Error: インスタンスが落ちているか通信環境が悪い可能性があります。');
                hide('now_loading');
            })
        } else {
            setTimeout(function () {
                document.querySelector('#navigator').resetToPage('login.html').then(function () {
                    if (!ons.isWebView()) $("#login_debug").removeClass("invisible");
                });
            }, 500);
        }
        hide('now_loading');
        if (getConfig(1, "SendLog") === "") {
            ons.notification.confirm('KnzkAppでは、エラー時に開発者が原因を特定しやすいようログを送信する機能が備わっています。詳しくは<a href="">こちら</a>をご覧ください。<br>エラー時にログを開発者へ送信してもよろしいですか？<br><a href="">プライバシーポリシー</a>', {title: 'KnzkAppへようこそ', buttonLabels: ["同意しない", "同意する"]}).then(function (e) {
                if (e === 1) {
                    setConfig(1, "SendLog", "1");
                } else {
                    setConfig(1, "SendLog", "0");
                }
            });
        }
    }
}

function initevent() {
    $(document).on('click', 'div.toot_content', function(event) {
        var obj = event.currentTarget, id = 0;
        var button = event.target.className;
        if (obj.className.indexOf("toot_content") !== -1 && button.indexOf("button") === -1 && button.indexOf("enquete") === -1) {
            id = obj.dataset.id;
            if (obj.className.indexOf("toot-small") === -1) {
                if (obj.dataset.dispmode !== "big") {
                    show_post(id);
                }
            } else {
                toot_col(id);
            }
        }
    });
    $(document).on('click', 'a', function(event) {
        var word = "";
        event.stopPropagation();
        event.preventDefault();
        var obj = event.target;
        var url = obj.getAttribute('href');
        if (!url) {
            obj = event.currentTarget;
            url = obj.getAttribute('href');
        }
        if (obj.className === "u-url mention") {
            word = url.split("/");
            show_account_name(word[word.length-1] + "@" + word[word.length-2]);
        } else if (obj.className === "mention hashtag") {
            word = url.split("/");
            tag_str = word[word.length-1];
            showTagTL(tag_str);
        } else {
            openURL(url);
        }
        return false;
    });

    document.addEventListener('postpush', function(event) {
        pageid = event.enterPage.id;
        if (event.enterPage.id === "home") {
            setTimeout(function () {
                document.getElementById("toot_limit_simple").innerHTML = toot_limit;
                $("#post_mode_simple").val(default_post_visibility);
                document.getElementById("post_mode_icon_simple").className = "ons-icon fa-fw fa fa-"+visibility_name(default_post_visibility);
            }, 500);
        } else {
            home_auto_event = false;
            last_load_TL = "";
        }

        if (event.enterPage.id === "config-page") {
            show('now_loading');
            setTimeout(function() {
                if (getConfig(1, 'dial')) document.getElementById("dial_"+getConfig(1, 'dial')).selected = true;
                if (getConfig(1, 'theme')) document.getElementById("theme_"+getConfig(1, 'theme')).selected = true;
                if (getConfig(1, 'url_open')) document.getElementById("url_"+getConfig(1, 'url_open')).selected = true;
                hide('now_loading');
                var conf = $("[id^='conf-']"), i = 0;
                while (conf[i]) {
                    if (parseInt(getConfig(1, conf[i].id.replace("conf-", "")))) conf[i].checked = true;
                    i++;
                }
            },500);
        }
        if (event.enterPage.id === "config_collapse-page") {
            show('now_loading');
            setTimeout(function() {
                var conf = $("[id^='conf-col-']"), i = 0;
                while (conf[i]) {
                    if (parseInt(getConfig(2, conf[i].id.replace("conf-col-", "")))) conf[i].checked = true;
                    i++;
                }
                hide('now_loading');
            },500);
        }
        if (event.enterPage.id === "login-page") {
            if (localStorage.getItem('knzkapp_now_mastodon_token')) {
                setTimeout(function () {
                    document.getElementById("login_left").innerHTML = "<ons-toolbar-button onclick=\"BackTab()\" class=\"toolbar-button\">\n" +
                        "                    <ons-icon icon=\"fa-chevron-left\" class=\"ons-icon fa-chevron-left fa\"></ons-icon>\n" +
                        "                    戻る\n" +
                        "                </ons-toolbar-button>";
                    initph("alert");
                }, 200);
            }
        }
        if (event.enterPage.id === "toot-page") {
            var emoji = document.getElementById("toot_emoji_list_popover"), i = 0, reshtml = "";
            if (emoji.dataset.isload === "no" && !getConfig(1, 'no_custom_emoji')) {
                document.getElementById("toot-limit").innerHTML = toot_limit;
                fetch("https://"+inst+"/api/v1/custom_emojis", {
                    headers: {'content-type': 'application/json'},
                    method: 'GET',
                }).then(function(response) {
                    if(response.ok) {
                        return response.json();
                    } else {
                        sendLog("Error/event_toot_emoji", response);
                        //カスタム絵文字非対応インスタンス
                        $("#toot_emoji_bt").addClass("invisible");
                    }
                }).then(function(json) {
                    if (json) {
                        var emoji_mode = getConfig(1, 'no_gif') ? "static_url" : "url";

                        while (json[i]) {
                            reshtml += "<ons-button modifier=\"quiet\" onclick='add_emoji_simple(\""+json[i]["shortcode"]+"\", true)'><img draggable=\"false\" class=\"emojione\" src=\""+json[i][emoji_mode]+"\"></ons-button>\n";
                            i++;
                        }
                        emoji.innerHTML = reshtml;
                        emoji.dataset.isload = "yes";
                    }
                });
            }
        }

        if (document.getElementById("post_reply")) {
            if (!tmp_post_visibility) tmp_post_visibility = default_post_visibility;
            document.getElementById("post_mode_icon").className = "ons-icon fa fa-fw fa-"+visibility_name(default_post_visibility);
            tmp_post_visibility = null;

            if (tmp_post_reply) {
                document.getElementById("post_reply").value = tmp_post_reply; //投稿ID
                document.getElementById("post_reply_box").className = "reply-box"; //返信のダイアログ表示
                document.getElementById("post_reply_acct").innerHTML = tmp_text_pre; //返信先
                document.getElementById("post_mode").value = tmp_post_visibility; //投稿モード
                tmp_post_reply = null;
            }
        }
        if (document.getElementById("toot_textarea") && tmp_text_pre) {
            document.getElementById("toot_textarea").value = tmp_text_pre;
            tmp_text_pre = null;
        }
    });

    document.addEventListener('postpop', function(event) {
        pageid = event.enterPage.id;
        if (event.enterPage.id === "home") {
            home_auto_event = true;
            home_autoevent();
            document.getElementById("toot_limit_simple").innerHTML = toot_limit;
        } else {
            home_auto_event = false;
        }
    });

    document.addEventListener("resume", function() {
        if (pageid === "home" && !home_auto_event) {
            showTL(null,null,null,true);
        }
    }, false);

    var carousel = document.addEventListener('postchange', function(event) {
        var home_cr = {0:"ローカル",1:"ホーム",2:"メディア(ローカル)",3:"メディア(連合)",4:"連合"};
        var TL_name = {0:"local",1:"home",2:"local_media",3:"public_media",4:"public"};
        document.getElementById('home_title').innerHTML = home_cr[event.activeIndex];
        now_TL = TL_name[event.activeIndex];
        showTL(null,null,null,true);
    });

    $(document).on('click', 'ons-carousel', function(event) {
        if ($("#navigator").attr("page") === "home.html") {
            simple_close();
        }
    });

    document.addEventListener('swipeleft', function(event) {
        TL_next();
    });

    document.addEventListener('swiperight', function(event) {
        TL_prev();
    });
}

function home_autoevent() {
    setTimeout(function () {
        if (home_auto_event) {
            var h = $("#"+now_TL+"_item").scrollTop();
            home_auto_mode = h <= 100;
            if (home_auto_tmp !== "" && home_auto_mode) {
                document.getElementById(now_TL+"_main").innerHTML = home_auto_tmp + document.getElementById(now_TL+"_main").innerHTML;
                home_auto_tmp = "";
                home_auto_num = 0;
                setTLheadcolor(0);
            }

            try {
                var mr = $(".more_load_bt_"+now_TL).offset().top - window.innerHeight;
                if (mr < -10) {
                    showTL(null,null,document.getElementsByClassName("more_load_bt_"+now_TL)[0]);
                }
            } catch (e) {
                console.log(e);
            }
            home_autoevent();
        }
    }, 1000);
}

var button = "", quiet = "", light = "";
function init_d() {
    button = "button";
    quiet = button + " button--quiet";
    light = button + " button--light";
    ons.disableAutoStyling();
    if (localStorage.getItem('knzkapp_conf_mastodon') != undefined) {
        if (getConfig(1, 'spin') == 1 || getConfig(1, 'gpu') != 1) {
            var css = "";
            if (getConfig(1, 'spin') == 1) {
                css += ".fa-spin {-webkit-animation: none;  animation: none;}";
            }
            if (getConfig(1, 'gpu') != 1) {
                css += ".toot, ons-carousel, ons-carousel-item {transform: translate3d(0, 0, 0);}";
            }

            var node = document.createElement("style");
            node.type = "text/css";
            node.appendChild(document.createTextNode(css));
            var heads = document.getElementsByTagName("head");
            heads[0].appendChild(node);
        }
    }
}
init_d();
ons.ready(function() {
    ConfigSetup();
    init();
});

// https://press.monaca.io/atsushi/248
function handleOpenURL(url) {
    setTimeout(function() {
        var strValue = url;
        strValue = strValue.replace('knzkapp://','');
        var mode = strValue.split("/");
        if (mode[0] === "login") {
            var token_get = mode[1].replace('token','');
            var token = getParam(token_get)["code"];
            login_callback(token);
        }
    }, 100);
}