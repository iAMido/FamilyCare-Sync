# generate-icons.ps1
# Run from the project root to regenerate all app icons.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\generate-icons.ps1

Add-Type -AssemblyName System.Drawing

function New-AppIcon {
    param([int]$Size, [string]$OutPath)

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode    = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Sage-green rounded-square background
    $bgBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 107, 158, 122))
    $radius  = [int]($Size * 0.22)
    $rect    = [System.Drawing.RectangleF]::new(0, 0, $Size, $Size)
    $path    = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($rect.X,              $rect.Y,              $radius*2, $radius*2, 180, 90)
    $path.AddArc($rect.Right-$radius*2,$rect.Y,              $radius*2, $radius*2, 270, 90)
    $path.AddArc($rect.Right-$radius*2,$rect.Bottom-$radius*2,$radius*2,$radius*2, 0,   90)
    $path.AddArc($rect.X,              $rect.Bottom-$radius*2,$radius*2,$radius*2, 90,  90)
    $path.CloseFigure()
    $g.FillPath($bgBrush, $path)

    # White heart
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $cx = $Size / 2.0
    $cy = $Size / 2.0 - ($Size * 0.04)
    $hw = $Size * 0.30
    $heartPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $lobeR = $hw * 0.52
    $heartPath.AddEllipse($cx - $hw, $cy - $lobeR * 0.9, $lobeR * 2, $lobeR * 2)
    $heartPath.AddEllipse($cx,       $cy - $lobeR * 0.9, $lobeR * 2, $lobeR * 2)
    $pts = @(
        [System.Drawing.PointF]::new($cx - $hw, $cy + $lobeR * 0.3),
        [System.Drawing.PointF]::new($cx,       $cy + $hw * 1.05),
        [System.Drawing.PointF]::new($cx + $hw, $cy + $lobeR * 0.3)
    )
    $heartPath.AddPolygon($pts)
    $g.FillPath($whiteBrush, $heartPath)

    # Small sage dot inside heart
    $sageBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(180, 107, 158, 122))
    $dotR = $Size * 0.055
    $g.FillEllipse($sageBrush, $cx - $dotR, $cy + $dotR * 0.1, $dotR * 2, $dotR * 2)

    $g.Dispose()
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "  ✓ $OutPath"
}

$root = Split-Path $PSScriptRoot -Parent
Write-Host "Generating icons in $root\assets ..."
New-AppIcon -Size 512 -OutPath "$root\assets\icon-512.png"
New-AppIcon -Size 192 -OutPath "$root\assets\icon-192.png"
New-AppIcon -Size 180 -OutPath "$root\assets\apple-touch-icon.png"
New-AppIcon -Size 32  -OutPath "$root\assets\favicon-32.png"

# Overwrite the Expo icon.png and favicon.png
Copy-Item "$root\assets\icon-512.png"  "$root\assets\icon.png"    -Force
Copy-Item "$root\assets\favicon-32.png" "$root\assets\favicon.png" -Force

# Copy into web/ so they're accessible to the dev server
Copy-Item "$root\assets\apple-touch-icon.png" "$root\web\apple-touch-icon.png" -Force
Copy-Item "$root\assets\icon-192.png"          "$root\web\icon-192.png"         -Force
Copy-Item "$root\assets\icon-512.png"          "$root\web\icon-512.png"         -Force

Write-Host "Done. Run 'npx expo export --platform web' then 'npx firebase deploy --only hosting'."
