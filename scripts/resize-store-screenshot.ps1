param(
  [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $RepositoryRoot 'assets/store/screenshots/source/01-ranking-2x.png'
$targetPath = Join-Path $RepositoryRoot 'assets/store/screenshots/01-ranking.png'
$source = [System.Drawing.Image]::FromFile($sourcePath)

try {
  if ($source.Width -ne 2560 -or $source.Height -ne 1600) {
    throw "Expected a 2560x1600 source screenshot, got $($source.Width)x$($source.Height)."
  }

  $target = [System.Drawing.Bitmap]::new(1280, 800)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($target)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($source, 0, 0, 1280, 800)
    } finally {
      $graphics.Dispose()
    }
    $target.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $target.Dispose()
  }
} finally {
  $source.Dispose()
}
