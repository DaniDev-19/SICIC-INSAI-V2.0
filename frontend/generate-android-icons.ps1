Add-Type -AssemblyName System.Drawing

$sourcePath = "D:\Escritorio\SICIC-INSAI-V2.0\frontend\public\icon2-master.png"
$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

$densities = @(
    @{ Name = "mipmap-mdpi"; Size = 48; FgSize = 108 },
    @{ Name = "mipmap-hdpi"; Size = 72; FgSize = 162 },
    @{ Name = "mipmap-xhdpi"; Size = 96; FgSize = 216 },
    @{ Name = "mipmap-xxhdpi"; Size = 144; FgSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192; FgSize = 432 }
)

function Resize-Image($src, $w, $h, $dest) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $w, $h)
    $g.Dispose()
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

function Create-Foreground($src, $targetSize, $dest) {
    $bmp = New-Object System.Drawing.Bitmap $targetSize, $targetSize
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Adaptive icon safe area: 72% of total canvas to fit prominently and cleanly
    $iconSize = [int]($targetSize * 0.72)
    $offset = [int](($targetSize - $iconSize) / 2)
    $g.DrawImage($src, $offset, $offset, $iconSize, $iconSize)
    $g.Dispose()
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$baseRes = "D:\Escritorio\SICIC-INSAI-V2.0\frontend\android\app\src\main\res"

foreach ($d in $densities) {
    $targetDir = Join-Path $baseRes $d.Name
    if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force }
    
    Resize-Image $sourceImg $d.Size $d.Size (Join-Path $targetDir "ic_launcher.png")
    Resize-Image $sourceImg $d.Size $d.Size (Join-Path $targetDir "ic_launcher_round.png")
    Create-Foreground $sourceImg $d.FgSize (Join-Path $targetDir "ic_launcher_foreground.png")
    Write-Output ("Generated icons for: " + $d.Name)
}

# Also update frontend public icons for PWA
Resize-Image $sourceImg 192 192 "D:\Escritorio\SICIC-INSAI-V2.0\frontend\public\icon-192.png"
Resize-Image $sourceImg 512 512 "D:\Escritorio\SICIC-INSAI-V2.0\frontend\public\icon-512.png"

$sourceImg.Dispose()
Write-Output "All icons successfully created using icon2.ico!"

