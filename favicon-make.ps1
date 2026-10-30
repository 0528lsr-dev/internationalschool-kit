# 파비콘 비트맵 만들기 — 각 저장소의 favicon.svg 를 Edge 로 그려 favicon.ico(32)·favicon-192.png·apple-touch-icon.png(180) 을 만든다.
# 실행: powershell -NoProfile -ExecutionPolicy Bypass -File favicon-make.ps1 [repo ...]   (run.js 로 favicon.svg 를 먼저 만든 뒤)
param([string[]]$Repos = @('example'))
Add-Type -AssemblyName System.Drawing
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$tmp = Join-Path $env:TEMP "favicon-make"; New-Item -ItemType Directory -Force $tmp | Out-Null
$ud = Join-Path $tmp "profile"

function Resize($src, $size, $out) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'; $g.PixelOffsetMode = 'HighQuality'; $g.CompositingQuality = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($src, 0, 0, $size, $size); $g.Dispose()
  return $bmp
}

foreach ($r in $Repos) {
  $dir = Join-Path (Join-Path $PSScriptRoot '출력') $r
  $svg = Join-Path $dir "favicon.svg"
  if (-not (Test-Path $svg)) { Write-Host "$r : favicon.svg 없음"; continue }
  # 512px 로 그린다 (Edge 창 최소 폭 때문에 창은 600, 아이콘은 왼쪽 위 512 칸)
  $html = "<!doctype html><meta charset='utf-8'><body style='margin:0;background:transparent'><img src='file:///$($svg -replace '\\','/')' style='display:block;width:512px;height:512px'></body>"
  $page = Join-Path $tmp "$r.html"; [IO.File]::WriteAllText($page, $html, [Text.UTF8Encoding]::new($false))
  $shot = Join-Path $tmp "$r.png"
  Start-Process -FilePath $edge -ArgumentList @("--headless=new","--disable-gpu","--hide-scrollbars","--default-background-color=00000000","--window-size=600,600","--user-data-dir=$ud","--screenshot=$shot",([Uri]$page).AbsoluteUri) -Wait -WindowStyle Hidden
  $full = [System.Drawing.Bitmap]::FromFile($shot)
  $crop = $full.Clone((New-Object System.Drawing.Rectangle 0, 0, 512, 512), $full.PixelFormat)
  $full.Dispose()
  (Resize $crop 192 $null).Save((Join-Path $dir "favicon-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  (Resize $crop 180 $null).Save((Join-Path $dir "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  # ICO: 32px PNG 를 ICO 컨테이너에 넣는다(윈도우 Vista+ 와 모든 브라우저가 PNG 압축 ICO 를 읽는다)
  $b32 = Resize $crop 32 $null
  $ms = New-Object IO.MemoryStream; $b32.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); $png = $ms.ToArray(); $ms.Dispose()
  $ico = New-Object IO.MemoryStream; $w = New-Object IO.BinaryWriter $ico
  $w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]1)              # ICONDIR
  $w.Write([Byte]32); $w.Write([Byte]32); $w.Write([Byte]0); $w.Write([Byte]0)  # 폭·높이·팔레트·예약
  $w.Write([UInt16]1); $w.Write([UInt16]32); $w.Write([UInt32]$png.Length); $w.Write([UInt32]22)  # planes·bpp·크기·오프셋
  $w.Write($png); $w.Flush()
  [IO.File]::WriteAllBytes((Join-Path $dir "favicon.ico"), $ico.ToArray()); $w.Dispose()
  $crop.Dispose(); $b32.Dispose()
  Write-Host ("{0,-12} favicon.ico {1}B · favicon-192.png · apple-touch-icon.png" -f $r, (Get-Item (Join-Path $dir "favicon.ico")).Length)
}
