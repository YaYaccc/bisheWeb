<%@ page contentType="text/html; charset=UTF-8" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="icon" href="favicon.ico">
    <link rel="icon" href="/image/favicon.png">
    <link rel="stylesheet" type="text/css" href="./css/site.css">
    <title>协作化办公管理系统</title>
    <style type="text/css">
        .app{
          text-align: center;
          line-height: 1.6;
        }
        .app-show{
          visibility: visible;
        }
        .main-box{
          display: inline-block;
          text-align: center;
          width:750px;
          margin-top:100px;
          font-size:30px;

        }
        .logo-image{
            width:250px;
        }
        li{
            list-style: none;
            margin-top:8px;
        }
    </style>
  </head>
  <body>
    <div class="app" id="app" >
        <div class="main-box">
            <div style="text-align:center;">
                        <img src="/image/logo.png" class="logo-image">
             </div>
            <div style="margin-top:30px;color:#999;font-weight: bold">${errorMsg}</div>
        </div>

    </div>

  <script type="text/javascript">
    </script>
  </body>
</html>
