<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>第七频率 — 引擎入口</title>
<script>
(function redirectToUnifiedEngine(){
  const url = new URL(window.location.href);
  const chapter = url.searchParams.get('chapter') || '1';
  window.location.replace('game.jsp?chapter=' + encodeURIComponent(chapter));
})();
</script>
</head>
<body>
<p>统一引擎已合并，正在进入游戏……</p>
<p><a href="game.jsp?chapter=1">如果没有自动跳转，点击这里继续。</a></p>
</body>
</html>
