Add-Type -AssemblyName System.Drawing

$icoPath = "D:\Escritorio\SICIC-INSAI-V2.0\frontend\public\icon2.ico"
$destPng = "D:\Escritorio\SICIC-INSAI-V2.0\frontend\public\icon2-master.png"

# Un archivo .ico de Windows contiene múltiples imágenes (16x16 hasta 256x256).
# Extraemos el frame más grande leyendo directamente los frames de la estructura ICO o usando System.Drawing.
$ico = New-Object System.Drawing.Icon($icoPath, 256, 256)
$bmp = $ico.ToBitmap()

Write-Output ("Icon Width: " + $bmp.Width + " Height: " + $bmp.Height)
$bmp.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$ico.Dispose()
Write-Output "Successfully extracted icon2 to icon2-master.png"

