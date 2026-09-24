param(
  [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

Add-Type -AssemblyName System.Drawing

$storeAssets = Join-Path $RepositoryRoot 'assets/store'
$publicIcons = Join-Path $RepositoryRoot 'public/icons'
$masterPath = Join-Path $storeAssets 'icon-master.png'
$master = [System.Drawing.Image]::FromFile($masterPath)

function New-Canvas([int]$Width, [int]$Height) {
  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Save-Icon([int]$Size, [int]$Inset, [string]$Path) {
  $canvas = New-Canvas $Size $Size
  $side = $Size - 2 * $Inset
  $canvas.Graphics.DrawImage($master, $Inset, $Inset, $side, $side)
  $canvas.Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

try {
  New-Item -ItemType Directory -Path $publicIcons -Force | Out-Null
  Save-Icon 16 1 (Join-Path $publicIcons 'icon-16.png')
  Save-Icon 48 4 (Join-Path $publicIcons 'icon-48.png')
  Save-Icon 128 16 (Join-Path $publicIcons 'icon-128.png')
  Save-Icon 300 12 (Join-Path $storeAssets 'edge-logo-300.png')

  $canvas = New-Canvas 440 280
  $rect = [System.Drawing.RectangleF]::new(0, 0, 440, 280)
  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    [System.Drawing.ColorTranslator]::FromHtml('#0b315e'),
    [System.Drawing.ColorTranslator]::FromHtml('#0e618f'),
    30
  )
  $canvas.Graphics.FillRectangle($background, $rect)
  $canvas.Graphics.DrawImage($master, 254, 48, 160, 160)
  $fontTitle = [System.Drawing.Font]::new('Arial', 25, [System.Drawing.FontStyle]::Bold)
  $fontSubtitle = [System.Drawing.Font]::new('Arial', 17)
  $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $ice = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#c7f0ff'))
  $canvas.Graphics.DrawString('Sleep Tool', $fontTitle, $white, 25, 85)
  $canvas.Graphics.DrawString('Extension Suite', $fontSubtitle, $ice, 27, 133)
  $canvas.Bitmap.Save((Join-Path $storeAssets 'promo-small-440x280.png'), [System.Drawing.Imaging.ImageFormat]::Png)
  $ice.Dispose()
  $white.Dispose()
  $fontSubtitle.Dispose()
  $fontTitle.Dispose()
  $background.Dispose()
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
} finally {
  $master.Dispose()
}
