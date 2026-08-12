Add-Type -AssemblyName System.Drawing

function New-Icon {
  param(
    [int]$Size,
    [string]$OutPath,
    [double]$Inset = 0.0
  )
  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

  $bgDark = [System.Drawing.Color]::FromArgb(255, 10, 8, 5)
  $g.Clear($bgDark)

  $c = $Size / 2.0
  $pad = $Inset * $Size

  # mystic halo
  $glow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 74, 44, 94))
  $g.FillEllipse($glow, $c - $Size*0.44, $c - $Size*0.44, $Size*0.88, $Size*0.88)

  $goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 212, 175, 55), [math]::Max(2, $Size*0.018))
  $lightPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 244, 228, 166), [math]::Max(2, $Size*0.02))

  # sacred ring
  $ringW = ($Size - 2*$pad) * 0.94
  $g.DrawEllipse($goldPen, $c - $ringW/2, $c - $ringW/2, $ringW, $ringW)

  # star of david
  $r = ($Size - 2*$pad) * 0.30
  $pts = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  for ($i = 0; $i -lt 6; $i++) {
    $ang = (-90 + $i*60) * [math]::PI / 180.0
    $px = $c + $r * [math]::Cos($ang)
    $py = $c + $r * [math]::Sin($ang)
    $pts.Add((New-Object System.Drawing.PointF($px, $py)))
  }
  $t1 = [System.Drawing.PointF[]]@($pts[0], $pts[2], $pts[4])
  $t2 = [System.Drawing.PointF[]]@($pts[1], $pts[3], $pts[5])
  $g.DrawPolygon($lightPen, $t1)
  $g.DrawPolygon($lightPen, $t2)

  $g.Dispose()
  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output ("wrote " + $OutPath)
}

$dir = Join-Path $PSScriptRoot "icons"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

New-Icon -Size 192 -OutPath (Join-Path $dir "icon-192.png") -Inset 0.02
New-Icon -Size 512 -OutPath (Join-Path $dir "icon-512.png") -Inset 0.02
New-Icon -Size 512 -OutPath (Join-Path $dir "icon-maskable-512.png") -Inset 0.22
