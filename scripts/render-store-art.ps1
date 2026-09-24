param(
  [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

Add-Type -AssemblyName System.Drawing

function New-Canvas([int]$Width, [int]$Height) {
  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-RoundedPath([float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = 2 * $Radius
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Add-Chart([System.Drawing.Graphics]$Graphics, [float]$Scale, [float]$OffsetX, [float]$OffsetY) {
  $base = [System.Drawing.ColorTranslator]::FromHtml('#c8f0ed')
  $middle = [System.Drawing.ColorTranslator]::FromHtml('#85d8c9')
  $top = [System.Drawing.ColorTranslator]::FromHtml('#f6d979')
  $pen = [System.Drawing.Pen]::new($base, 5 * $Scale)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $Graphics.DrawLine($pen, $OffsetX + 35 * $Scale, $OffsetY + 88 * $Scale, $OffsetX + 93 * $Scale, $OffsetY + 88 * $Scale)
  $pen.Dispose()
  $bars = @(
    @{ X = 39; Y = 66; Height = 20; Color = $base },
    @{ X = 58; Y = 52; Height = 34; Color = $middle },
    @{ X = 77; Y = 37; Height = 49; Color = $top }
  )
  foreach ($bar in $bars) {
    $brush = [System.Drawing.SolidBrush]::new($bar.Color)
    $path = New-RoundedPath ($OffsetX + $bar.X * $Scale) ($OffsetY + $bar.Y * $Scale) (12 * $Scale) ($bar.Height * $Scale) (3 * $Scale)
    $Graphics.FillPath($brush, $path)
    $path.Dispose()
    $brush.Dispose()
  }
}

function Save-Icon([int]$Size, [string]$Path) {
  $canvas = New-Canvas $Size $Size
  $scale = $Size / 128.0
  $rect = [System.Drawing.RectangleF]::new(16 * $scale, 16 * $scale, 96 * $scale, 96 * $scale)
  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, [System.Drawing.ColorTranslator]::FromHtml('#0d4167'), [System.Drawing.ColorTranslator]::FromHtml('#176b87'), 45)
  $shape = New-RoundedPath (16 * $scale) (16 * $scale) (96 * $scale) (96 * $scale) (23 * $scale)
  $canvas.Graphics.FillPath($background, $shape)
  Add-Chart $canvas.Graphics $scale 0 0
  $canvas.Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $shape.Dispose()
  $background.Dispose()
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

$publicIcons = Join-Path $RepositoryRoot 'public/icons'
$storeAssets = Join-Path $RepositoryRoot 'assets/store'
New-Item -ItemType Directory -Path $publicIcons -Force | Out-Null
Save-Icon 16 (Join-Path $publicIcons 'icon-16.png')
Save-Icon 48 (Join-Path $publicIcons 'icon-48.png')
Save-Icon 128 (Join-Path $publicIcons 'icon-128.png')
Save-Icon 300 (Join-Path $storeAssets 'edge-logo-300.png')

$canvas = New-Canvas 440 280
$rect = [System.Drawing.RectangleF]::new(0, 0, 440, 280)
$background = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, [System.Drawing.ColorTranslator]::FromHtml('#0d4167'), [System.Drawing.ColorTranslator]::FromHtml('#176b87'), 45)
$canvas.Graphics.FillRectangle($background, $rect)
$fontTitle = [System.Drawing.Font]::new('Arial', 25, [System.Drawing.FontStyle]::Bold)
$fontSubtitle = [System.Drawing.Font]::new('Arial', 18)
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$mint = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#c8f0ed'))
$canvas.Graphics.DrawString('Sleep Tool Ranking', $fontTitle, $white, 31, 39)
$canvas.Graphics.DrawString('Extension Suite', $fontSubtitle, $mint, 32, 82)
Add-Chart $canvas.Graphics 2.5 129 1
$canvas.Bitmap.Save((Join-Path $storeAssets 'promo-small-440x280.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$mint.Dispose()
$white.Dispose()
$fontSubtitle.Dispose()
$fontTitle.Dispose()
$background.Dispose()
$canvas.Graphics.Dispose()
$canvas.Bitmap.Dispose()
